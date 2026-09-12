# 持久化

WagSettings 通过一个小接口 `ISettingsStore` 保存。开箱即用时它使用 `PlayerPrefsStore`，在每个 Unity 项目中都能
工作，无需依赖。安装 [WagSave](https://www.wagglebum.com)，持久化会自行升级 — 带版本、云同步、加密、多配置 —
无需接线。

## 保存如何工作

玩家拖动滑块时什么都不写入。设置持有一个**待定**值；只有当注册表应用时存储才会得知：

```csharp
master.Set(0.5f);      // nothing touches disk
registry.Apply();      // writes dirty settings, then Flush() — once
```

`Apply()` 只写入真正脏的设置，并**恰好一次**调用 `Flush()`。一个有四十个设置的菜单只花一次提交，这使得基于磁盘
或网络的存储切实可行。

`Revert()` 丢弃待定值而完全不触及存储。这让取消按钮诚实，而不是第二次写入。

### 缓冲，但不是不可见

`Save` 和 `Delete` 缓冲到 `Flush` 为止，但 `Has` 和 `Load` 读取的是叠在已提交状态之上的那些缓冲写入 — 调用者
总能看到自己的写入。`Flush` 改变的是**持久性**，不是可见性。

```csharp
store.Save("audio.master", 0.5f);
store.Load("audio.master", 0f);   // 0.5 — your own write
// another store instance still reads the old value until Flush()
```

## 选择存储

`SettingsProfile` 记录它想要哪个后端，`SettingsStoreFactory` 解析它：

| `StoreKind` | 结果 |
|---|---|
| `Automatic` *(默认)* | 安装了 WagSave 时为 WagSave，否则为 PlayerPrefs |
| `PlayerPrefs` | 始终为 PlayerPrefs，即使安装了 WagSave |

```csharp
ISettingsStore store = SettingsStoreFactory.Create(profile.StoreKind);
using SettingsRegistry registry = profile.CreateRegistry(store);
```

不带参数的 `SettingsStoreFactory.Create()` 返回一个 `PlayerPrefsStore`。这个默认值就是 WagSettings 无需任何设置
即可工作的原因。

## PlayerPrefsStore

默认存储。简单、同步、随处可用。

**支持的类型。** PlayerPrefs 本身只保存 `int`、`float` 和 `string`，所以这个存储支持这些，外加映射到 `int` 的
`bool` 和枚举：

| 设置类型 | 存储为 |
|---|---|
| `bool` | `int` — `0` 或 `1` |
| `int` | `int` |
| `float` | `float` |
| `string` | `string` — null 值存为空，因为 PlayerPrefs 没有 null |
| 枚举 / `EnumSetting` | `int` — 底层值 |

其他任何类型都在 **`Save` 调用时**抛出 `NotSupportedException`，而不是在刷新时悄悄失败，所以失败指向引起它的代码。
先用 `PlayerPrefsStore.IsSupportedType(type)` 检查。

**键命名空间。** 每个键都带前缀写入，默认为 `WagSettings.`，所以名为 `audio.master` 的设置存为
`WagSettings.audio.master`，永远不会与你游戏自己的 PlayerPrefs 条目冲突。

```csharp
var store = new PlayerPrefsStore("MyGame.Settings.");
```

> 发行后更改前缀会让之前保存的每个值变成孤儿，与更改键完全一样。

**它不提供的。** 没有版本控制或迁移、没有云同步、没有加密、没有配置，并且 PlayerPrefs 以明文存储 — Windows 上
在注册表，macOS 上在 plist — 所以玩家可以轻易编辑。对于设置来说这通常没问题。如果不行，那正是 WagSave 的用武
之地。

## 安装 WagSave 后启用的功能

安装 `com.wagglebum.wagsave`，WagSettings 通过 `WAGGLEBUM_WAGSAVE_PRESENT` 定义符号在编译时检测到它。
`WagSettings.WagSave` 程序集 — 没有 WagSave 时 Unity 完全跳过它 — 在启动时向 `SettingsStoreFactory` 注册一个
WagSave 存储。设为 `Automatic` 的配置无需你改动任何代码就会使用它。

![报告已检测到 WagSave 的 Persistence 检查](../Images/summary-wagsave-detected.png)

| | PlayerPrefs | WagSave |
|---|---|---|
| 无依赖即可工作 | ✅ | — |
| 升级时的版本控制与迁移 | ❌ | ✅ |
| 跨设备云同步 | ❌ | ✅ |
| 加密与签名 | ❌ | ✅ |
| 多配置 | ❌ | ✅ |
| 格式选择 (二进制 / JSON / 文本) | ❌ | ✅ |
| 基元之外的类型 | ❌ | ✅ |

### 它如何接入

无需打开任何开关。`WagSettings.WagSave` 是一个**只有**在安装了 `com.wagglebum.wagsave` 时 Unity 才编译的程序集，
所以它的引导代码得以运行这件事本身就是检测 — 没有版本检查、没有反射、没有设置。安装 WagSave，持久化自行升级；
移除它，程序集连同注册一起消失，留下 PlayerPrefs 默认值。

设为 `PlayerPrefs` 的配置仍然得到 PlayerPrefs。显式选择存储是本包不会推翻的决定。

### 关于 WagSave 存储需要知道的

**设置存放在它们自己的 WagSave 组中**，默认为 `WagSettings`，所以它们与你游戏的存档数据保持可分离，并可在
WagSave 自己的工具中查看。

**写入是批量的。** WagSave 的运行时 API 在每次 `Save` 调用时提交，所以这个存储缓冲并只在 `Flush` 时写入 — 注册表
每次 Apply 调用一次，且只针对脏设置。一个玩家改了两项的四十设置菜单只花两次写入而不是四十次。有一个测试恰好
断言这一点。

**删除写入 null。** WagSave 的公开运行时 API 没有移除，所以删除的键存为 null，读回时视为不存在。从调用者的角度
结果相同，并且让 WagSettings 远离 WagSave 的内部。

**以另一种类型存储的值仍然可读。** 以前是 `int` 现在是 `float` 的设置会转换而不是失败。真正无法读取的值回退到
默认值并发出警告 — 玩家失去的是一个设置，而不是启动的能力。

## 编写你自己的存储

实现 `ISettingsStore` 并注册它：

```csharp
SettingsStoreFactory.RegisterProvider(() => new MyStore());
```

在任何东西构建注册表之前注册 — `[RuntimeInitializeOnLoadMethod]` 是通常的位置。最后一次注册胜出，
`ClearProvider()` 恢复 PlayerPrefs 默认值，返回 null 的提供者会抛出而不是悄悄回退，因为悄悄停止持久化的设置比
一次响亮的失败更糟。

唯一重要的契约：**`Save` 和 `Delete` 缓冲，`Flush` 提交。** 每次写入都提交的存储会把一次 Apply 变成四十次往返。

完整的演练见[扩展性](Extensibility.md)。
