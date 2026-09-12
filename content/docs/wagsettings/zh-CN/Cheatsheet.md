# WagSettings 速查表

一页。其余全在[文档](index.md)里。

## 从零到菜单

**Tools → WaggleBum → WagSettings → Setup**，勾选分类，按 **Generate**。你会得到设置资源、一个装着它们的
`SettingsProfile`，以及一个已公开 Master、Music 和 SFX 的 `AudioMixer`，全部位于 `Assets/WagSettings/Resources/`
下。重新运行是安全的：它只创建缺失的内容，绝不覆盖你编辑过的资源。

然后，在你的菜单场景中：

| UI Toolkit | uGUI |
|---|---|
| 一个 **UI Document**，在其上添加 **Settings Menu (UI Toolkit)**。指定配置、`WagSettingsMenu.uxml`、`WagSettingsMenu.uss`；把 Panel Settings 的主题设为 `WagSettingsUI.tss`。 | 复制 `Sample Scenes/Quick Start/Prefabs/WagSettingsMenu (uGUI).prefab`，指向你的配置。 |

按 Play。配置在 Resources 中，所以启动时会创建一个 **WagSettings Manager**，菜单显示它的配置。要选择管理器所在的
位置 — 并给应用器一个家 — 请自己把 *WaggleBum → WagSettings → WagSettings Manager* 添加到场景。

## 键

`category.name`。点之前的部分是页签；之后的部分成为标签。

```
audio.master   audio.music   audio.sfx   audio.master.mute
display.width  display.height  display.refreshRate  display.windowMode  display.vsync
graphics.qualityTier  graphics.gamma  graphics.renderScale  graphics.bloom  graphics.ambientOcclusion  graphics.motionBlur
accessibility.uiScale  accessibility.colorblindPreset  accessibility.reduceMotion  accessibility.subtitleScale  accessibility.subtitleBackground
controls.rebinds  controls.sensitivity  controls.invertY
```

这些是初始设置生成的、也是每个应用器默认绑定的键。用 **Assets → Create → WaggleBum → WagSettings → …** 添加你自己
的，然后把资源加入配置。

## 在代码中读写

```csharp
using WaggleBum.WagSettings;

float master = WagSettings.Get<float>("audio.master");
WagSettings.Set("audio.master", 0.8f);                       // pending - the game does not change yet
WagSettings.Definition<float>("audio.master").Changed += value => { };

WagSettings.IsDirty;        // anything pending?
WagSettings.Apply();        // write every pending value to the store, in one batch
WagSettings.Revert();       // throw pending values away
WagSettings.ResetAll();     // authored defaults, pending until applied
```

只要有 `WagSettingsManager` 在运行 — 你放置的那个，或者因为配置在 Resources 文件夹里而在启动时创建的那个 —
这些都能用。一个都没有时，每次调用都会抛出并说明要添加什么。想要比门面更多的功能时，`WagSettings.Registry`
就是注册表本身。

## 应用器

应用器把值变成 Unity 中的效果。把组件添加到 **WagSettings Manager 之下**并指定它驱动的对象 — 管理器启动时会
连接其下的一切。无需写任何代码。

| 应用器 | 驱动 | 应用时机 |
|---|---|---|
| Audio Mixer Applier | 指定 `AudioMixer` 上公开的参数 | 实时 |
| Resolution Applier | `Screen` 分辨率、窗口模式、VSync | Apply 时 |
| Quality Applier | 画质等级、伽马、渲染缩放、后期效果开关 | 实时 |
| Accessibility Applier | UI 缩放、色盲矩阵、减少动态效果、字幕 — 以事件和着色器全局变量形式 | 实时 |
| Rebind Applier | `InputActionAsset` 的绑定覆盖 *(Input System)* | 实时 |

`Attach` 对注册表中不存在的键抛出。把应用器上的键留空即跳过。必须放在别处的应用器：
`WagSettings.Manager.Attach(applier)`。

## 绑定器 (uGUI)

把绑定器放到控件上并设置它的键。它会在父级中找到菜单。

| 控件 | 绑定器 |
|---|---|
| `Slider` | Slider Setting Binder |
| `Toggle` | Toggle Setting Binder |
| `Dropdown` | Dropdown Setting Binder — 选项来自 `EnumSetting`，`display.resolution` 则来自显示器 |
| `InputField` | Input Field Setting Binder |
| `Button` | Settings Command Button — Apply、Revert 或 Reset |
| `InputField` | Settings Search Binder |

UI Toolkit 不需要这些：行由配置自动构建。

## 东西在哪里

| | |
|---|---|
| 生成的资源 | `Assets/WagSettings/Resources/` |
| 示例 | `WaggleBum/WagSettings/Sample Scenes/Quick Start/` — 每个 UI 框架一个场景 |
| uGUI 菜单预制体 | `…/Quick Start/Prefabs/WagSettingsMenu (uGUI).prefab` |
| 菜单样式 | `Runtime/UI/UIToolkit/WagSettingsMenu.uss` 以及 `WagSettingsUI.tss` 中的变量 |
| 初始设置 | Tools → WaggleBum → WagSettings → Setup |
| 管理器 | *WaggleBum → WagSettings → WagSettings Manager*，或启动时从 Resources 创建 |

## 何时抛出

大声且有意：绑定到配置中没有的键的绑定器、绑定到注册表中没有的键的应用器、未公开的混音器参数、配置中的空槽。
每一个都会指出键名。一个悄悄什么都不做的控件，比一个说明原因的失败更糟。
