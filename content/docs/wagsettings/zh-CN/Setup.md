# 初始设置

初始设置一口气把项目从一无所有带到生成好的设置配置。

**Tools → WaggleBum → WagSettings → Setup** — [编辑器窗口](EditorWindow.md)的 Setup 页面。选择、预览和 Generate
都在上面；项目有什么，以及之后还剩什么需要手动完成，在旁边的 **Summary** 页面。本页两者都讲。

## 一个屏幕，而不是一串步骤

选择少到可以一眼看全，每一项都有从项目实际情况派生的默认值，预览随着它们的变化而更新。这意味着**选择的后果在你
做出选择时就可见**，而不是几次点击之后。

![Setup 页面：分类、菜单与持久化选择、预览与 Generate](../Images/editor-window-setup.png)

它也是为**重新打开**而设计的。生成是幂等的，所以三个月后回来添加一个分类是常态，而不是重来。向导意味着一次性；
这是一个你会回来的面板。

一切也是同时报告的。分步流程给你看第一个问题，把第二个藏到第一个解决之后；一个屏幕负担得起列出生成被拒绝的
每一个原因。

## 项目 — Summary 页面

Summary 先看项目实际有什么，并说明每项发现对你即将生成的设置意味着什么。

![带有警告及其 Package Manager 按钮的 Project 区块](../Images/summary-project-checks.png)

| 检查 | 报告内容 |
|---|---|
| Unity 版本 | 编辑器是否为 2022.3 或更新 |
| 渲染管线 | Built-in、URP、HDRP 或自定义 — 以及由此可用的图形设置 |
| UI 框架 | UI Toolkit 和 uGUI 是否可用 |
| Input System | 控制重绑定是否可用 |
| TextMeshPro | uGUI 菜单能否使用 TMP 文本 |
| 持久化 | 是否安装了 WagSave，或者设置将使用 PlayerPrefs |

### 严重程度经过仔细选择

WagSettings 独立运行，所以**项目的几乎任何情况都不能真正阻止初始设置**。缺一个包只是少一个功能，而不是没有菜单。

- **Pass** — 无需操作。
- **Warning** — 缺了某样东西，但初始设置继续。没有 Input System 就没有重绑定；其他一切照常。
- **Blocker** — 将无物可生成。只有两种情况符合：编辑器早于 2022.3，以及 UI Toolkit 和 uGUI 都没有，这样就完全没有
  办法构建菜单。

**Warning 从不禁用 Generate。** 把可选包标为阻碍会训练你忽略这个区域，而那正是真正的阻碍被漏掉的时候。

没有 WagSave 是 **pass**，不是缺陷 — 靠 PlayerPrefs 独立运行就是设计。以后安装它，设置会自行升级，这里无需改动。

### 一键修复

可修复的发现带有一个通过 Package Manager 安装包的按钮。安装完成后屏幕重新扫描，因为只有新包的程序集存在之后
检查才有意义。

阻碍总是提供一条前进的路 — 没有修复的阻碍就是死胡同，并且有一个测试断言 UI 框架阻碍会提供其安装。Summary 页面
显示安装进度。

**重新扫描刷新的是项目有什么，而不是你决定了什么。** 安装一个包再重新扫描，不会悄悄撤销你的选择。

## 要生成的设置

每个分类成为一组设置资源和菜单中的一个页签。所有分类默认开启，除了没有 Input System 时的 Controls — 生成一个
无法工作的重绑定区域比不生成更糟。

| 分类 | 设置 |
|---|---|
| Audio | 主音量、音乐和音效音量、静音 |
| Display | 宽度、高度、刷新率、窗口模式、VSync |
| Graphics | 画质等级、伽马、泛光、环境光遮蔽、运动模糊 |
| Accessibility | UI 缩放、色盲预设、减少动态效果、字幕缩放和背景 |
| Controls | 重绑定、灵敏度、Y 轴反转 |

每个分类的行显示它添加多少设置，所以结果的规模在生成前而非生成后就可见。

## 菜单与持久化

| 选择 | 默认 | 影响 |
|---|---|---|
| UI 框架 | 可用时为 UI Toolkit，否则为 uGUI | 完成步骤告诉你添加哪个菜单组件 |
| 持久化 | Automatic | 写入生成的配置 |
| 音频混音器 | 从模板创建 | 是否生成混音器 — 仅在勾选 Audio 时显示 |

`Automatic` 在安装了 WagSave 时解析为 WagSave，否则为 PlayerPrefs，所以这里通常无需选择。`PlayerPrefs` 即使在有
WagSave 的项目中也强制使用简单存储。

### 音频混音器

音量滑块需要一个带公开参数的 `AudioMixer` 来驱动，而公开参数正是人们遗漏的步骤。所以初始设置附带一个**混音器
模板** — Master、Music 和 SFX 组，公开了 `MasterVolume`、`MusicVolume` 和 `SfxVolume` — 并把它克隆到生成文件夹中，
名为 `WagSettingsMixer.mixer`。

模板、生成的音频设置和 `AudioMixerApplier` 的默认总线被写成一致的，并有一个测试把它们绑在一起。添加一个
Audio Mixer Applier，指定生成的混音器，每条默认总线都能找到它的设置和参数，无需手动输入任何东西。

**Use an existing mixer** 什么都不写。混音器是你的；在上面公开 `MasterVolume`、`MusicVolume` 和 `SfxVolume`，或者
把应用器的总线改名为它已经公开的参数。选了这项却没有挑选混音器，是 Generate 拒绝的情况之一。

克隆体像其他每个生成的资源一样被跟踪：重新运行会跳过它，你在混音器窗口中的编辑会被保留，后续包版本中更新的模板
会显示为更新 — 且只应用到你没动过的克隆体上。

`AudioMixer` 没有公开的创建 API，所以这是克隆而不是构建。模板编写一次并提交；包只是复制它。

## 什么被拒绝，以及为什么

只要下列任一情况成立，Generate 就被禁用，并且**每一个**未满足的原因都列在按钮上方：

- **UI 框架** — 未安装包却选择 uGUI。菜单打不开。
- **分类** — 什么都没选，或在没有 Input System 时选了 Controls。
- **音频混音器** — "使用现有混音器"却没有选择一个。
- **项目** — 一个阻碍，意味着根本无物可生成。

持久化从不拒绝：`Automatic` 已经回退到 PlayerPrefs。

当预览说无事可做，因为每个资源都已是最新时，Generate 也被禁用。

## 预览与生成

**在你确切看到会发生什么之前，什么都不会写入。** 预览列出每个资源以及它会得到什么，并随你改变选择而更新：

```
Into Assets/WagSettings/Resources

Create   Assets/WagSettings/Resources/AudioMaster.asset
Update   Assets/WagSettings/Resources/WagSettingsProfile.asset
Skip     Assets/WagSettings/Resources/AudioMusic.asset  (already up to date)
Keep     Assets/WagSettings/Resources/AudioSfx.asset  (edited since it was generated)
```

![列出 Generate 将创建、更新和保留内容的预览](../Images/setup-preview-plan.png)

Generate 按钮旁的一行摘要始终可见，所以详情可以一直折叠，直到你想看。

### 重新运行是安全的

初始设置保存一份**生成清单**，记录它产生的每个资源和所写内容的指纹。这让它能区分三种情况：

| 情况 | 结果 |
|---|---|
| 资源不存在 | **Create** |
| 初始设置创建了它且无人动过 | 设置变了则 **Update**，否则 **Skip** |
| 初始设置创建了它且之后被编辑过 | **Keep** — 原样保留 |
| 那个路径上已有别的东西 | **Keep** — 不是初始设置该覆盖的 |

所以添加一个分类后再次生成，只会创建新资源。**手动调整过的生成默认值绝不会被丢弃。** 删除一个生成的资源，
初始设置会提议再做一个。

### 如果生成失败

生成作为一个 `AssetDatabase` 事务运行。如果中途抛出异常，该次运行创建的每个资源都会在错误浮现前被删除 — 半生成的
项目比没有更糟。事务在 `finally` 中关闭，所以失败不会让资源数据库在本会话余下时间里保持暂停。

创建的资源注册到 `Undo`，所以 <kbd>Ctrl</kbd>+<kbd>Z</kbd> 有效。

### 生成文件夹为何是 Resources 文件夹

`Assets/WagSettings/Resources` 不是命名巧合。Resources 文件夹中的 `SettingsProfile` 正是 `WagSettingsBootstrapper`
在启动时寻找的东西，所以运行过初始设置的项目无需在任何场景放置任何东西，就能得到一个运行中的 `WagSettingsManager`
— 以及可用的静态 API。生成的配置带有 **Is Default** 标记，所以当另一个配置共享该文件夹时它会胜出。生成清单是
编辑器的记账，被标记为不随构建发布。

### 运行之后

编辑器跳到 **Summary**，显示写入了什么，并附有前往生成的配置、生成文件夹、Quick Start 场景和速查表的按钮。
需要手动完成的步骤在该页面的文档面板中，随时回来都在。回到 Setup 调整并再次生成。

![生成后的 Summary 页面及其快捷按钮](../Images/summary-after-generate.png)

## 尚未生成的内容

初始设置生成**设置资源、装着它们的配置，以及音频混音器**。它还不会创建 InputActionAsset 或应用视觉样式预设，
所以不显示相关控件。`StyleRule` 规则、`WiringRule` 的输入动作那一半以及它们的模型字段已经存在，等待生成支持它们。

目前请手动接线输入动作；见[控制](Settings/Controls.md)。

## 如何进入 Setup

| 路径 | 时机 |
|---|---|
| **Tools → WaggleBum → WagSettings → Setup** | 任何时候 — 在 Setup 页面打开编辑器 |
| 编辑器导航栏中的 **Setup** 页面 | 编辑器打开时 |
| Scene 视图叠加层 | 从 Scene 视图的叠加层菜单启用 "WagSettings" |
| 自动，仅一次 | 安装后编辑器首次加载时 |

### 关于自动打开

初始设置**只**自荐一次，之后再也不会。每次域重载都重新打开窗口的资源会被卸载，所以答案在它出现的那一刻就被
记住 — 立即关掉也算已被提议过。

该标记按包版本存储，所以大版本升级可能再自我介绍一次。如果无法确定版本，它根本不会自动打开，因为无法记录的
版本意味着每次重载都要问。

Scene 视图叠加层**默认隐藏**。永久驻扎在别人 Scene 视图上的包是越界的；它就在叠加层菜单里，留给想要它的人。

## 它是怎么组成的

这些页面是同一个 `SetupSession` 之上的外壳，共享该会话，所以在 Summary 和 Setup 之间切换既不丢扫描也不丢选择。
项目有什么是 `EnvironmentDetector`，你选了什么是 `SetupModel`，能否生成是 `ISetupRule` 列表之上的
`SetupValidation`，会写入什么是 `SettingsGenerator` — 全是不依赖编辑器窗口的普通类，所以每条规则都能直接测试。

规则回答 `IsSatisfied(model, out reason)`。它不拥有任何 UI，这就是为什么让 Generate 按钮灰显的同一个条件在测试中
是两行断言。

检测通过 `IEnvironmentProbe` 读取原始事实，这就是为什么"不支持的编辑器上没有 Input System 的 HDRP"这样的场景是
两行测试而不是一整个项目。每个可选包都通过按名称查找类型而非引用它来发现：在这里引用 URP 或 Input System 意味着
初始设置恰恰在它要帮助的项目中编译失败。

Setup 页面把重建控件与刷新由此派生的内容分开：会话在 `Changed` 之外单独触发 `Scanned`，所以勾选一个框永远不会
重建正在被勾选的那个框 — 设置菜单曾因重建每一行而在拖动中丢失焦点，这个教训学得很痛。
