# API

WagSettings 核心模型。本页的一切都位于 `WaggleBum.WagSettings` 命名空间中，并且除 ScriptableObject 资源类型外
不依赖 `UnityEngine` — 模型是纯 C#，因此可以直接单元测试，以后也可以抽出。

## 静态 API

大多数游戏代码只需一行，就是它：

```csharp
using WaggleBum.WagSettings;

float master = WagSettings.Get<float>("audio.master");
WagSettings.Set("audio.master", 0.8f);                 // pending
WagSettings.Apply();                                    // committed and saved, in one batch
WagSettings.Definition<float>("audio.master").Changed += value => { };
```

| 成员 | 作用 |
|---|---|
| `Get<T>(key)` | 待定值 |
| `Set<T>(key, value)` | 设置待定值；变了返回 `true` |
| `Definition<T>(key)` | 键背后的 `ISettingDefinition<T>`，用于其 `Changed` 事件 |
| `Apply()` / `Revert()` / `ResetAll()` | 注册表的命令 |
| `IsDirty` | 有待定的吗？ |
| `Registry` | 注册表本身，用于以上之外的一切 |
| `Manager` / `IsReady` | 运行中的 `WagSettingsManager`，或是否存在一个 |

每次调用都解析到活动的 **`WagSettingsManager`**。没有管理器运行时，`Get` 和其他方法**抛出**，并指出两种修复
方式 — 它们从不返回一个安静的默认值，因为一个"能用"却什么都不保存的设置菜单正是它要防止的失败。不想抛出时用
`IsReady` 检查。

### `WagSettingsManager`

注册表的唯一拥有者。把 **WaggleBum → WagSettings → WagSettings Manager** 添加到场景并指定配置，或者不指定，它会
使用 Resources 文件夹中的默认配置。它：

- 从配置惰性构建注册表，所以在 `Awake` 中打开的菜单得到同一个；
- 在 `Start` 中**连接其下的每个 `SettingApplierBase`**，无需写代码；
- 把注册表交给任何打开的菜单 — 有管理器运行时菜单不会自建；
- 默认跨场景加载持久存在，第二个管理器会发出警告并移除自己。

`Attach(applier)` 用于放在别处的应用器；自行断开。

### `WagSettingsBootstrapper`

如果场景没有管理器而某个 `SettingsProfile` 在 Resources 文件夹中，第一个场景加载后会创建一个 — 所以保存的设置
在第一帧之前应用，静态 API 无需放置任何东西即可工作。初始设置正是出于这个原因生成到
`Assets/WagSettings/Resources`。Resources 中没有配置就什么都不会发生。那里有多个配置时，在你想要的那个上勾选
**Is Default**；都没标记时发出警告并取第一个。

`WagSettings.Reset()` 清除静态状态并在每个播放会话之前运行，所以不带域重载的 Enter Play Mode 不会把上一个会话
的管理器交给新会话。测试在 setup 中调用它。

## 它的形状

```
SettingsProfile  (asset)  ── CreateRegistry(store) ──▶  SettingsRegistry
      │                                                       │
      └─ SettingAsset ─┐                          holds       ▼
                       └──────────────────────▶  ISettingDefinition ──▶ ISettingsStore
                                                       ▲
                             SettingDefinition<T> (plain C#, does the work)
```

一个设置携带三个值，它们之间的差异就是整个模型：

| | 含义 |
|---|---|
| `DefaultValue` | 编写的默认值。`ResetToDefault()` 恢复它。 |
| `Value` | **待定**值 — 用户此刻调到的值。 |
| *已应用基线* | 由 `Apply()` 提交或从存储加载的最后一个值。 |

`IsDirty` 就是 `Value != baseline`。这就是让 Apply 按钮亮起、让取消按钮生效、让批量提交一次写入的东西。

## `SettingDefinition<T>`

纯 C# 设置。用键和默认值构造。

```csharp
var master = new SettingDefinition<float>("audio.master", 0.8f);

master.Changed += volume => mixer.SetFloat("MasterVolume", AudioVolume.LinearToDecibels(volume));
master.Set(0.5f);          // raises Changed, IsDirty becomes true
```

| 成员 | 说明 |
|---|---|
| `Key`、`DefaultValue`、`ValueType` | 不可变的身份。 |
| `Value` / `Set(T)` | `Set` 返回值是否变动。写入相同的值是空操作且不触发任何事件，所以应用器永远不会被无谓唤醒。 |
| `Changed` | `SettingChangedHandler<T>` — 带类型，供应用器和 UI 使用。 |
| `ValueChanged` | 无类型的 `Action`，注册表用它跟踪脏状态。 |
| `IsDirty` | 待定值与已应用基线不同。 |
| `Apply()` | 把待定值采纳为基线。 |
| `Revert()` | 恢复基线。值变动时触发 `Changed`。 |
| `ResetToDefault()` | 恢复编写的默认值。设置保持**脏**状态，所以重置仍可取消。 |
| `LoadFrom(store)` / `SaveTo(store)` | 读/写单个值。`SaveTo` **不**刷新。 |

相等性使用 `EqualityComparer<T>.Default`，除非你向构造函数传入比较器 — 对希望使用容差而非精确相等的 `float`
设置很有用。

### `ISettingDefinition<T>`

`SettingDefinition<T>` 和 ScriptableObject 资源类型都实现 `ISettingDefinition<T>`，它携带 `Value`、`Set`、
`DefaultValue` 和 `Changed`。把 UI 和应用器绑定到**这个接口**而不是具体类，这样设置无论是作为资源编写还是在
代码中构建都表现一致 — `SettingsRegistry.Get<T>` 正是因此返回它。

## `SettingsRegistry`

所有设置集中一处，绑定到一个存储。这是 UI 绑定的对象。

```csharp
using var registry = new SettingsRegistry(store);
registry.Register(master);

registry.IsDirty;          // false — Register loaded the persisted value
master.Set(0.5f);
registry.IsDirty;          // true
registry.Apply();          // writes dirty settings, flushes once
```

| 成员 | 说明 |
|---|---|
| `Register(definition)` | 添加设置**并加载其持久化的值**，所以新注册表是干净的。重复键时抛出。 |
| `Unregister(key)` / `Clear()` | 移除设置并断开注册表的订阅。 |
| `Get<T>(key)` | 带类型查找，返回 `ISettingDefinition<T>`。不存在时抛 `KeyNotFoundException`，类型不匹配时抛 `InvalidCastException`。 |
| `TryGet` / `Contains` | 不抛出的查找。 |
| `Definitions` | 按注册顺序的已注册设置 — UI 呈现它们的顺序。 |
| `IsDirty` | 任一设置有未应用的更改时为 true。 |
| `DirtyStateChanged` | 只在 clean↔dirty **转换**时触发，而非每次按键。 |
| `Load()` | 从存储重新读取一切，丢弃待定编辑。 |
| `Apply()` | 写入脏设置，`Flush()` **一次**，把它们采纳为基线。返回写入了多少个。干净的设置永远不会被重写。 |
| `Revert()` | 丢弃待定编辑。 |
| `ResetAll()` | 恢复每个默认值，注册表保持脏状态。 |
| `Dispose()` | 断开每个订阅。 |

> 注册表订阅它持有的每个设置。当拥有它的场景或配置消失时 **Dispose 它**（或调用 `Clear()`），否则那些订阅会通过
> 设置资源让它一直存活。

### 批处理

`Apply()` 是唯一调用 `Flush()` 的东西，并且最多调用一次。这很重要，因为真实的存储可能访问磁盘或网络 — 有四十个
设置的菜单仍然只花一次提交。

## 绑定层

UI 绑定到视图模型，而不是直接绑定到注册表。UI Toolkit 和 uGUI 菜单都经过同一个，所以它们不会分道扬镳 — 而且
整个菜单无需实例化控件即可测试。

### 标签与分类

设置携带 `DisplayName` 和 `Category`。两者都不必编写：它们从键派生，所以菜单永远不会显示原始键。

| 键 | 派生标签 | 派生分类 |
|---|---|---|
| `audio.master` | Master | Audio |
| `display.windowMode` | Window Mode | Display |
| `accessibility.reduce_motion` | Reduce Motion | Accessibility |
| `simple` | Simple | General |

在资源上编写任一项都会覆盖派生值。派生是回退，不是策略 — 任何面向玩家的内容最终都应该编写并本地化。

### `ISettingBinder`

视图眼中的一个设置：`DisplayName`、`Category`、`IsDirty`、`BoxedValue`、一个 `Changed` 事件，以及可用性。

```csharp
var binder = (SettingBinding<float>)category.Settings[0];
binder.Set(0.5f);            // goes through the registry-tracked setting
```

**编辑经过注册表跟踪的设置，绝不绕过它直接进入存储。** 直接写存储的视图会让 Apply 按钮对待定内容撒谎。

**可用性**是当前硬件无法满足的设置的呈现方式：

```csharp
binder.SetAvailability(
    applier.SupportsFeature(GraphicsFeature.RenderScale),
    "Render scale needs the Universal Render Pipeline.");
```

不可用的绑定器忽略写入而不是抛出，所以尚未灰显控件的视图不会让菜单崩溃。灰显控件并显示 `UnavailableReason` —
**不要隐藏它**，否则玩家会四处寻找一个他们读到过的选项。

### `SettingsMenuModel`

```csharp
using var model = new SettingsMenuModel(registry, SettingBinderFactory.CreateAll(registry), ownsBinders: true);

model.SearchText = "volume";
foreach (SettingsMenuCategory category in model.Categories)
{
    foreach (ISettingBinder setting in category.Settings) { /* build a row */ }
}
```

| 成员 | 说明 |
|---|---|
| `Categories` | 匹配的分类，按**编写**顺序而非字母顺序 — 配置顺序是设计选择。空的被丢弃。 |
| `SearchText` | 不区分大小写地匹配标签、分类或键。每次真正的变化触发一次 `Changed`。 |
| `CanApply` / `CanRevert` | 有任何脏设置时为 true。 |
| `CanReset` | 只有当某项与编写的默认值不同时为 true — 什么都不做的 Reset 不应引人点击。 |
| `Apply()` / `Revert()` / `ResetAll()` | 直通注册表；`Apply` 返回写入了多少个。 |
| `Changed` | 任何值、可用性、搜索或脏状态的变化。 |

`SettingBinderFactory` 为整个注册表构建带类型的绑定器，直接匹配常见值类型，对自定义类型回退到反射 — 所以添加
设置类型不意味着编辑一个 switch。

> 在 IL2CPP 上，反射路径要求泛型实例化在构建时就已存在。包内的 `link.xml` 会保住 `SettingBinding<T>` 的构造函数
> 不被裁剪，但对于你自己的值类型，`SettingBinding<YourType>` 还必须出现在你代码的某处——一个字段即可——AOT 编译器
> 才会生成它。四种内置值类型无需任何处理。

> 菜单关闭时 Dispose 模型。它订阅注册表和每个绑定器；`ownsBinders: true` 会连同绑定器一起 Dispose。

## `ISettingsStore`

持久化接缝。`PlayerPrefsStore` 是默认，安装了 WagSave 时 `WagSaveStore` 接管；见[持久化](Persistence.md)。

```csharp
public interface ISettingsStore
{
    bool Has(string key);
    T    Load<T>(string key, T fallback);
    void Save<T>(string key, T value);   // buffered
    void Flush();                        // commits the batch
    void Delete(string key);             // buffered
}
```

`Save` 和 `Delete` 缓冲；只有 `Flush` 提交。

## 设置资源

ScriptableObject 包装器，让设置可以作为资源编写和引用。每个都委托给内部的 `SettingDefinition<T>` — 资源是编写
界面，定义做实际工作。

`BoolSetting` · `IntSetting` · `FloatSetting` · `StringSetting` · `EnumSetting`

从 **Assets → Create → WaggleBum → WagSettings** 创建它们。每个资源都需要一个 **Key** — 空键在设置被使用时立即
抛出。

`EnumSetting` 存储的是编写的选项名列表中被选中的**索引**，而不是 C# 枚举，所以一种资源类型服务于每个下拉
（窗口模式、色盲预设、画质等级），UI 无需反射即可得到显示名。

## `SettingsProfile`

把游戏公开的设置分组，并记录哪个存储持久化它们。

```csharp
using SettingsRegistry registry = profile.CreateRegistry(store);
```

`CreateRegistry` 按编写顺序注册每个设置。**列表中的空槽会抛出**而不是被跳过 — 运行时悄悄从菜单中丢掉一个设置
比一次响亮的失败更糟。

`StoreKind` 是 `Automatic`（安装了 WagSave 时为 WagSave，否则为 PlayerPrefs）或 `PlayerPrefs`。
`SettingsStoreFactory` 解析它。`IsDefault` 标记当多个配置共享一个 Resources 文件夹时管理器使用的那个。

## `Guard` 与错误

每个公开入口都通过 `Guard` 验证，每个 WagSettings 错误都遵循一个契约：**create → log → throw**。

```csharp
Guard.AgainstNull(store, nameof(store));
Guard.AgainstNullOrEmpty(value, nameof(value));
Guard.AgainstInvalidKey(key, nameof(key));
Guard.AgainstNumberNotInRange(value, 0, 10, nameof(value));
```

有效的键非空、非空白，且不含 `"` `\` `{` `}` `,` `:` 和控制字符。允许点，并且点是约定的分组分隔符：
`audio.master`、`display.window_mode`。

订阅 `WagSettingsLog.ErrorLogged` 以观察失败 — 它在异常抛出**之前**立即触发，所以即使上游有人捕获了它，你也能
看到错误。

```csharp
WagSettingsLog.ErrorLogged += exception => Debug.LogException(exception);
```
