# 术语表

| 术语 | 含义 |
|---|---|
| **设置 (Setting)** | 玩家可以改变的一个值：主音量、窗口模式、UI 缩放。在项目中是 `SettingAsset`；在运行时是 `ISettingDefinition`。 |
| **键 (Key)** | 设置的稳定存储名称，形如 `category.name` — `audio.master`。前缀是页签，其余是标签。一旦发行即为永久。 |
| **配置 (Profile)** | 一个 `SettingsProfile` 资源：游戏公开的设置列表（按菜单顺序），以及持久化它们的存储。默认的那个位于 Resources 文件夹。 |
| **注册表 (Registry)** | 一个 `SettingsRegistry`：从存储加载的配置设置，带有待定值、脏状态跟踪和 Apply / Revert / Reset 命令。 |
| **管理器 (Manager)** | `WagSettingsManager` 场景组件，拥有注册表，连接其下的应用器，并支撑静态 API。每个游戏一个。 |
| **静态 API (Static API)** | `WagSettings.Get / Set / Apply` 等 — 通过管理器从任何脚本一行读写设置的方式。 |
| **待定值 (Pending value)** | 玩家已选择但尚未应用的值。即定义上的 `Value`。 |
| **已应用基线 (Applied baseline)** | 由 Apply 提交或从存储加载的最后一个值。 |
| **脏 (Dirty)** | 待定值与基线不同的设置。Apply 和 Revert 据此启用自己。 |
| **Apply** | 把每个待定值一次性提交到存储。Apply 按钮和 `WagSettings.Apply()` 所做的事。 |
| **Revert** | 丢弃每个待定值，恢复基线。 |
| **Reset** | 把每个设置恢复为编写的默认值，在应用前保持待定。 |
| **存储 (Store)** | 一个 `ISettingsStore`：值持久化的地方。默认 `PlayerPrefsStore`；安装了 WagSave 时为 `WagSaveStore`。写入会缓冲；`Flush` 提交。 |
| **应用器 (Applier)** | 把值变成 Unity 效果 — 混音器音量、屏幕分辨率、画质等级 — 的 `SettingApplierBase` 组件。位于管理器之下。 |
| **应用模式 (Apply mode)** | 应用器是每次变化都动作 (Immediate)，还是只在注册表提交时动作 (OnApply)。 |
| **绑定器 (Binder)** | UI 控件绑定的对象：UI Toolkit 中是定义之上的 `ISettingBinder`；uGUI 中是控件上的 `…SettingBinder` 组件。 |
| **分类 (Category)** | 设置所在的页签，由键的前缀决定。运行时为 `SettingsMenuCategory`。 |
| **菜单 (Menu)** | `WagSettingsMenu` (UI Toolkit) 或 `WagSettingsMenuUGUI`，都是 `ISettingsMenu`。它们借用管理器的注册表。 |
| **初始设置 (Setup)** | 扫描项目并把设置、配置和混音器生成到 `Assets/WagSettings/Resources` 的编辑器页面。 |
| **清单 (Manifest)** | 初始设置对其写入内容及其指纹的记录，使重新运行只创建缺失的内容，绝不覆盖你编辑过的。 |
| **显示模式 (Display mode)** | 宽度、高度和刷新率。分辨率下拉列出显示器支持的模式。 |
| **区域 (Locale)** | 语言代码 — `en`、`es`、`ja`、`ko`、`zh-CN`、`zh-TW`。菜单的由游戏选择；编辑器的在其 Help 页面选择。 |
