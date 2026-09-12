# 扩展性

添加一个设置只触及一个资源和一个列表。下次按 Play 它就在菜单里了。只有当值必须*做*某件事时才需要代码，即便如此
通常也只是一行。

## 添加一个设置

**捷径：**编辑器的 **Settings Profile** 页面 (*Tools → WaggleBum → WagSettings → Editor*)，**添加设置**。在对话框里选一个
类型，输入键 — 输入时即被检查 — 设置默认值，滑块的话再设范围，按 **创建**。资源在配置旁创建并追加到配置中。
完成；按 Play。

![已输入键的添加设置对话框及其将创建的资源](../Images/add-setting-dialog.png)

**手动：**

**1. 创建资源。** *Assets → Create → WaggleBum → WagSettings →* 你需要的类型：

| 类型 | 菜单中的控件 | 重要字段 |
|---|---|---|
| Float Setting | 滑块 | **Key**、**Default**、**Minimum**、**Maximum** |
| Int Setting | 整数滑块 | **Key**、**Default**、**Minimum**、**Maximum** |
| Bool Setting | 开关 | **Key**、**Default** |
| Enum Setting | 你列出的 **Options** 的下拉 | **Key**、**Default** (索引)、**Options** |
| String Setting | 文本框 | **Key**、**Default** |

![Assets → Create → WaggleBum → WagSettings 菜单](../Images/create-setting-menu.png)

键是 `category.name`：点之前的部分是**页签**，之后的部分成为**标签**。`gameplay.difficulty` 以 "Difficulty" 落在
Gameplay 页签；`gameplay.cameraShake` 显示为 "Camera Shake"。没有点的键落在 General 下。

> 键就是存储键。发行后更改它会让每个玩家保存的值变成孤儿，所以把它当作永久的。键不能包含 `"` `\` `{` `}` `,` `:`
> 或控制字符。

**2. 把它加入 `SettingsProfile`。** 把资源放进配置的列表 — 初始设置在 `Assets/WagSettings/Resources` 生成的那个，
或你自己的。列表中的顺序就是菜单中的顺序。以后重新运行初始设置会保留你手动添加的一切；它只替换它自己写的条目。

![Inspector 中带有设置列表的 SettingsProfile](../Images/profile-inspector.png)

**3. 按 Play。** 在 UI Toolkit 菜单中，那一行就在那里：正确的页签、正确的控件、正确的标签，并且 Apply / Revert /
Reset、搜索、脏标记和持久化都已为它工作。

**在 uGUI 菜单中**，行是手动放置的，所以添加一行：在预制体中复制一个现有的行
(`Sample Scenes/Quick Start/Prefabs/WagSettingsMenu (uGUI).prefab` 每种类型各有一个)，放进正确的分类面板，并设置
绑定器的 **Key**。这就是两个框架之间的全部区别 — 见[快速入门](GettingStarted.md)。

### 读取它

只要有 `WagSettingsManager` 在运行，从任何地方：

```csharp
int difficulty = WagSettings.Get<int>("gameplay.difficulty");                 // the pending value
WagSettings.Definition<int>("gameplay.difficulty").Changed += value => { };   // Set, Revert, Reset
```

对于大多数玩法设置，这就是全部代码：在需要的地方读取它，或者响应事件。本页的其余部分是给必须驱动 Unity 本身的值
准备的。

### 检查器在你输入时检查键

否则格式错误的键只会在设置首次*被使用*时失败 — 常常是在另一个场景、另一天，离犯错的地方很远。检查器立即报告：

| | 报告为 | 例子 |
|---|---|---|
| 无法使用 | **Error** | 空、禁止的字符、首尾空白 |
| 能用但不合惯例 | **Warning** | 没有分类前缀、`Audio.Master` 的大小写、点之间的空段 |

![Inspector 标出设置资源上格式错误的键](../Images/inspector-key-check.png)

Warning 是建议，不是障碍 — 没有分类的键仍然能用，只是落在 "General" 下。

### 查看当前值

不在播放时，检查器只显示编写的字段，因为当前值是运行时状态，并且有意从不保存进资源 — 玩家的选择属于他们的
存档数据，而不是你发行的文件。

进入播放模式，检查器显示实时值、是否有未应用的更改，以及恢复或重置它的按钮。游戏明明以 `0.25` 运行而 Default
仍显示 `0.8` 的资源是在正确工作。

## 编写应用器

应用器按计划把值变成 Unity 中的效果 — 玩家拖动时实时，或仅在他们按 Apply 时。它知道 `UnityEngine`；核心不知道。
从 `SettingApplierBase` 派生并提供两样东西：你跟踪哪些设置，以及如何推送它们。

```csharp
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Audio;
using WaggleBum.WagSettings;

public sealed class MusicVolumeApplier : SettingApplierBase
{
    [SerializeField] private AudioMixer _mixer = null!;

    private ISettingDefinition<float> _music = null!;

    protected override void ResolveSettings(SettingsRegistry registry, IList<ISettingDefinition> tracked)
    {
        _music = Require<float>(registry, "audio.music");
        tracked.Add(_music);
    }

    public override void ApplyCurrentValues()
    {
        _mixer.SetFloat("MusicVolume", AudioVolume.LinearToDecibels(_music.Value));
    }
}
```

把组件放在 **WagSettings Manager 之下**。管理器启动时连接其下的一切；无需调用任何东西。(必须放在别处的应用器：
`WagSettings.Manager.Attach(applier)`，并自行断开。)

基类处理手写应用器容易出错的两件事：

1. **每个 `+=` 都有匹配的 `-=`。** 设置是 ScriptableObject，所以它们比你的场景活得久。一个从不释放的订阅会让组件、
   它的 GameObject 以及它们引用的一切跨场景加载存活。`Attach`/`Detach` 和 Unity 的 `OnEnable`/`OnDisable` 已为你
   接好。
2. **持久化的值在连接时应用。** 只响应 `Changed` 的应用器会让游戏一直运行在场景中编写的值上，直到玩家下次触碰
   设置 — 一个直到有人重新加载场景才暴露的 bug。

第三条规则仍然由你负责：**永远不要从应用器写入存储。** 应用器读取；注册表在 `Apply()` 中写入，一次。

`Require` 对注册表中不存在的键抛出并指出键名。这是有意的：一个悄悄什么都不驱动的滑块看起来像坏掉的游戏而不是
坏掉的配置。

### Immediate 还是 OnApply

每个应用器上的 `Apply Mode` 字段决定它何时动作：

| 模式 | 触发于 | 用于 |
|---|---|---|
| `Immediate` *(默认)* | 被跟踪设置的每次变化 | 玩家拖动时就应该听到或看到的廉价变化 — 音量、UI 缩放 |
| `OnApply` | 注册表通过 `Apply()` 或 `Load()` 提交 | 任何昂贵或有干扰的东西 — 分辨率、画质等级、窗口模式 |

`OnApply` 就是阻止分辨率设置在下拉滚动时反复折腾窗口的东西。它监听 `SettingsRegistry.Committed`，该事件在写入了
内容的 `Apply()` 之后和 `Load()` 之后触发 — 两种情况下已提交的值都真正变了。

注意 `ApplyCurrentValues()` 重新应用应用器跟踪的**全部**设置，而不只是变化的那个。对于单个应用器拥有的少数几个
设置，这比按设置路由回调更便宜，并且让该方法保持为直白的"把当前状态推进 Unity"。

## 添加新的设置*类型*

只有内置类型无法表达的值才需要。

```csharp
[CreateAssetMenu(fileName = "New Vector2Setting", menuName = "WaggleBum/WagSettings/Vector2 Setting")]
public sealed class Vector2Setting : TypedSettingAsset<Vector2>
{
}
```

这就是全部实现 — `TypedSettingAsset<T>` 提供键、默认值、值、变化事件和脏状态跟踪。该类型必须能被 Unity 序列化，
并且你使用的存储必须能持久化它 (`PlayerPrefsStore` 处理基元类型；见[持久化](Persistence.md))。

对于固定的选项列表，优先用 `EnumSetting` 而不是新类型 — 它存储索引加显示名，并且已经能与下拉 UI 配合。

## 编写存储

实现 `ISettingsStore` 以持久化到别处 — 存档文件、后端、测试替身。

```csharp
public sealed class MyStore : ISettingsStore
{
    public bool Has(string key)                  { ... }
    public T    Load<T>(string key, T fallback)  { ... }
    public void Save<T>(string key, T value)     { /* buffer, do not commit */ }
    public void Flush()                          { /* commit the whole batch */ }
    public void Delete(string key)               { /* buffer */ }
}
```

唯一重要的契约：**`Save` 和 `Delete` 缓冲，`Flush` 提交。** 注册表写入每个脏设置然后恰好刷新一次，所以每次写入
都提交的存储会把一次 Apply 变成四十次往返。

对你写的任何存储做往返测试 — set、save、flush、reload、assert — 与 `Tests/EditMode` 中的测试形状相同。
