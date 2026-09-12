# 快速入门

> **预发布。** 运行时、应用器、两种菜单、编辑器、初始设置、Quick Start 示例和本地化都已就位。CI 与商店准备工作
> 尚待完成。见 [CHANGELOG.md](../../CHANGELOG.md)。

## 要求

- Unity **2022.3** (2022 LTS) 或更新版本。
- 无必需的包依赖。

可选，且自动检测：

- **WagSave** (`com.wagglebum.wagsave`) — 把持久化升级为带版本、云同步、加密、多配置的存档。安装后 WagSettings
  自动使用。
- **Input System** (`com.unity.inputsystem`) — 控制重绑定所必需。
- **uGUI** (`com.unity.ugui`) — 基于组件的菜单；每个 2022 LTS 模板都自带。

## 安装

### 从 tarball 或 Asset Store

导入包，或通过 **Window → Package Manager → + → Add package from tarball…** 添加。

### 从本地检出

把下面这段添加到项目的 `Packages/manifest.json`，指向 `WaggleBum/WagSettings` 文件夹：

```json
{
  "dependencies": {
    "com.wagglebum.wagsettings": "file:../../wagsettings-unity/WaggleBum/WagSettings"
  }
}
```

## 验证安装

包导入后，Unity 会编译它，WagSettings 为**当前构建目标**发布脚本定义符号 `WAGGLEBUM_WAGSETTINGS`。每次域重载都会
重新发布，所以切换平台会自动把它加到新选择的目标上。用两种方式确认安装：

1. **Package Manager** — WagSettings 出现在包列表中，版本为 0.9.0。
2. **脚本定义符号** — 打开 **Edit → Project Settings → Player → Other Settings → Scripting Define Symbols**；
   `WAGGLEBUM_WAGSETTINGS` 在列表中。

![Tools → WaggleBum → WagSettings 菜单](../Images/tools-menu.png)

这个定义符号也是其他资源在不硬依赖 WagSettings 的情况下检测它的方式：

```csharp
#if WAGGLEBUM_WAGSETTINGS
    // WagSettings is installed.
#endif
```

## 先试试：Quick Start

看到一切运转起来的最快方式是随包的示例。它正是初始设置生成的内容，外加一个围绕它的场景，每个 UI 框架各有一个：

```
WaggleBum/WagSettings/Sample Scenes/Quick Start/
├── Quick Start (UI Toolkit).unity
├── Quick Start (uGUI).unity
├── Settings/            23 setting assets, the profile, and the mixer setup cloned
├── Prefabs/             WagSettingsMenu (uGUI).prefab - the uGUI menu, ready to copy
├── QuickStartActions    a starter Input Actions asset with Jump, Interact and Fire
└── Scripts/             QuickStartDemo, and QuickStartControls when the Input System is installed
```

![运行中的 Quick Start 场景，设置菜单已打开](../Images/quick-start-scene.png)

打开任一场景并按 Play。然后：

1. **把 Music 拖低。** Music 总线上的 220 Hz 音调实时跟随；勾选 **Master Mute**，它和 SFX 的提示音都会静音。这就是
   `AudioMixerApplier` 以分贝为单位向生成的混音器写入公开参数。
2. **改变 Window Mode 或分辨率，然后按 Apply。** 角落的 HUD 报告屏幕实际在做什么。在 Apply 之前什么都不会变 —
   显示设置在提交时应用，因为输入到一半的分辨率不应该调整你的窗口大小。
3. **勾选 Reduce Motion。** 立方体停止旋转。**拖动 UI Scale。** 菜单和 HUD 都会变大。
4. **按空格。** HUD 记下一次跳跃。按 **Rebind Jump**，再按任意键，然后 Apply — HUD 会指出新的控制键，并且在你停止并
   重新开始 Play 之后它仍然在。(仅限 Input System。)
5. **在搜索框中输入。** 不匹配的页签和行消失；清空后它们回来。
6. **按 Reset to Defaults，再按 Revert。** 在应用之前，Reset 是可取消的。

停止 Play，再按 Play：你应用过的一切都还在。这就是 `PlayerPrefsStore`，或者在安装了 WagSave 时是 `WagSaveStore`。

示例中没有接线代码。Quick Start 对象上的 **WagSettings Manager** 拥有注册表并连接其下的应用器；两种菜单都借用该
注册表。`QuickStartDemo.cs` 像游戏脚本那样读回设置 — `WagSettings.Get<float>("audio.master")` — 其中其余的一切
只是为了让设置的效果在演示中一目了然。

## 使用 API

```csharp
using WaggleBum.WagSettings;

float master = WagSettings.Get<float>("audio.master");
WagSettings.Set("audio.master", 0.8f);   // pending
WagSettings.Apply();                      // committed and saved, in one batch
```

这会解析到运行中的 **`WagSettingsManager`** — 拥有注册表并连接其下每个应用器的组件。初始设置把配置放在
`Assets/WagSettings/Resources`，所以启动时会创建一个管理器，场景中无需放置任何东西；自己添加一个即可选择它所在
的位置。没有管理器运行时，调用会抛出并说明要添加什么。

[速查表](Cheatsheet.md)用一页囊括其余内容；[API](API.md) 包含全部，包括给需要比门面更多功能的代码使用的底层
注册表。

## 放入一个设置菜单

通往可用菜单的最快路线，无需代码：

1. 创建你的设置 (**Assets → Create → WaggleBum → WagSettings**) 并把它们加入一个 `SettingsProfile`。
2. 创建一个 **UI Document** GameObject (*GameObject → UI Toolkit → UI Document*)。
3. 在其上添加 **WaggleBum → WagSettings → Settings Menu (UI Toolkit)**。
4. 把 `WaggleBum/WagSettings/Runtime/UI/UIToolkit/` 中的 `WagSettingsMenu.uxml` 和 `WagSettingsMenu.uss` 指定为
   外壳和样式。
5. 在 UI Document 的 **Panel Settings** 上，把主题设为同一文件夹中的 `WagSettingsUI.tss`。
6. 确保有一个 **WagSettings Manager** 在运行 — 带着你的配置放在场景中，或者因为配置在 Resources 文件夹中而在
   启动时创建。菜单显示管理器的配置；只有在没有管理器时才在菜单本身上指定配置。

![播放模式下的 UI Toolkit 设置菜单](../Images/menu-uitoolkit.png)

按 Play。你得到每个分类一个页签、每个设置一行、一个搜索框，以及只在有事可做时才启用的 Apply / Revert / Reset
按钮。

### 你得到什么

- **每个分类一个页签**，按设置在配置中出现的顺序 — 那个顺序是设计选择，所以不会按字母重新排序。
- **每个设置对应正确的控件**：bool 用开关，`EnumSetting` 用下拉，带范围的 `FloatSetting` 或 `IntSetting` 用滑块，
  其他用文本框 — 以及**一个分辨率下拉**，列出显示器支持的模式，代替 `display.width`、`display.height` 和
  `display.refreshRate`。
- **手柄与键盘导航。** 上下在行之间移动，左右切换页签，焦点从第一行开始而不是无处可寻。有可见的焦点环，因为没有
  指针的玩家没有别的办法知道自己在哪。
- 行及其页签上的**脏标记**，所以你没在看的页签中的更改仍然可见。
- **不可用的设置保持可见**，灰显并带有解释原因的工具提示 — 隐藏它们会让玩家四处寻找一个他们读到过的选项。

### 改样式

外观位于 `WagSettingsMenu.uss` 和 `WagSettingsUI.tss` 中的主题变量：

```css
:root {
    --wag-surface: rgb(28, 30, 34);
    --wag-text: rgb(236, 238, 242);
    --wag-accent: rgb(74, 144, 226);
    --wag-focus: rgb(255, 196, 61);
}
```

在你自己的主题中覆盖它们，菜单随之改变，无需编辑包。

## 改走 uGUI 路线

如果你的项目用的是 uGUI 而非 UI Toolkit，同一个模型驱动一个基于组件的菜单。uGUI 层位于它自己的程序集中，Unity
只在安装了 `com.unity.ugui` 时才编译它，所以只用 UI Toolkit 的项目永远不会背上它。

![播放模式下的 uGUI 设置菜单](../Images/menu-ugui.png)

**从预制体开始。** `Sample Scenes/Quick Start/Prefabs/WagSettingsMenu (uGUI).prefab` 是为生成的配置准备的完整
菜单 — 带搜索的标题栏、页签条、每个分类一个滚动页面且每个设置一行，以及三个命令按钮 — 完全由标准 uGUI 控件
构建，所以改样式就是普通的 uGUI 工作。复制它，指向你的配置，删除或添加行。若要从头构建：

1. 把 **Settings Menu (uGUI)** 放在菜单 Canvas 的根上。有管理器运行时它显示管理器的配置；只有在没有管理器时才在
   菜单上指定。
2. 在每个控件上添加匹配的绑定器并设置它的 **Key**：

| 控件 | 组件 |
|---|---|
| `Slider` | Slider Setting Binder |
| `Toggle` | Toggle Setting Binder |
| `Dropdown` | Dropdown Setting Binder |
| `InputField` | Input Field Setting Binder |

3. 对于 Apply / Revert / Reset，在每个 `Button` 上放 **Settings Command Button** 并选择它的命令。当命令无事可做时
   它们会自行灰显。
4. 对于搜索，在一个 `InputField` 上放 **Settings Search Binder**。
5. 对于页签，在每个页面上放带分类名的 **Settings Category Panel**，并在页签条上放 **Settings Category Selector**，
   附一个用作模板的按钮。

绑定器在父级中找到菜单，所以除了键之外无需手动接线。指向配置中不存在的键的绑定器会**抛出** — 一个悄悄什么都
不做的控件比一次响亮的失败更糟。

每个绑定器有一个可选的 **Row** — 同时容纳其标签和控件的对象。分类面板会随着搜索过滤设置而显示和隐藏行；
Row 留空时，被隐藏的是控件自己的对象。

下拉从 `EnumSetting` 获取选项，滑块从设置获取范围，所以两者都不会携带可能与资源脱节的第二份副本。

### 标签

绑定器可选地用设置的显示名填充一个 `Text`。在 2022 LTS 中 TextMeshPro 是独立的包，所以本包不依赖它；请自行设置
TMP 标签，或者不指定标签而在预制体中编写文字。

### 改用代码

```csharp
ISettingsStore store = SettingsStoreFactory.Create(profile.StoreKind);
using SettingsRegistry registry = profile.CreateRegistry(store);

var model = new SettingsMenuModel(registry, SettingBinderFactory.CreateAll(registry), ownsBinders: true);
using var view = new SettingsMenuView(shellUxml, model, ownsModel: true);

document.rootVisualElement.Add(view.Root);
view.FocusFirstRow();
```

`SettingsMenuView` 是普通类而非组件，所以可以在没有 UIDocument 的情况下构建和检查 — 菜单就是这样测试的。

## 运行测试

本包附带 EditMode 和 PlayMode 测试程序集。把包放进 Unity 项目后，打开 **Window → General → Test Runner** 并运行
`WagSettings.Tests.EditMode` 套件。
