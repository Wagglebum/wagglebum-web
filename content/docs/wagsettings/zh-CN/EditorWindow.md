# 编辑器窗口

**Tools → WaggleBum → WagSettings → Editor**

一个窗口，与 WagSave 的形状相同，两者都有的开发者只需学一种布局。

```
┌────────────────────┬──────────────────────────────────────────────┐
│ [logo] WagSettings │ Setup                                 [Docs] │
│────────────────────│──────────────────────────────────────────────│
│ ▸ Summary          │  the page                     │ its docs,    │
│   Setup            │                               │ in your      │
│   Settings Profile │                               │ language     │
│   Debugger         │                               │              │
│   Help             │                               │              │
│ v0.9.0             │                               │              │
└────────────────────┴───────────────────────────────┴──────────────┘
```

![编辑器窗口的 Summary 页面：侧栏、页面、文档面板](../Images/editor-window-summary.png)

- 左侧的**导航栏**列出页面。你上次所在的页面就是你打开时看到的页面。
- 右侧的**文档面板**解释你正在看的页面。拖动它变宽或变窄，或用标题栏的 **Docs** 关掉它；两者都会被记住。
- **Summary** 是状态：项目有什么，初始设置要生成的内容是否已经就位，还有什么需要手动完成。它上面的任何内容都不会
  改变项目。
- **Setup** 是选择：生成什么、预览、Generate。*Tools → WaggleBum → WagSettings → Setup* 在此页面打开编辑器，所以你
  原有的每个链接仍然有效。生成后会跳到 Summary。
- **Settings Profile** 是"添加你自己的设置"所在之处：哪个配置是默认的、其中每个设置及其键、类型、默认值和范围、重新排序和
  移除，以及**添加设置**——一个在配置旁创建新设置资源的对话框，键在你输入时即被检查。见[扩展性](Extensibility.md)。
- **Debugger** 在播放模式下实时显示：每个设置的待定值、Apply / Revert / Reset，以及管理器连接了哪些应用器。它每秒
  轮询四次，只在有变化时重绘。
- **Help** 有版本、速查表、两个 Quick Start 场景，以及编辑器的语言。

![列出配置中每个设置的 Settings Profile 页面](../Images/settings-profile-page.png)

![播放模式下的 Debugger，待定值以粗体显示](../Images/debugger-play-mode.png)

## 首次运行

完全没有 `SettingsProfile` 的项目看到的是单个屏幕而非导航栏：徽标、一句话，以及 **Run Setup**。一栏关于尚不存在的
设置的页面只会是噪音。

## 语言

编辑器遵循在 Help 页面选择的语言。在选择之前，它遵循 WagSave 所设置的语言，因此两者都安装时只需选一次。缺少翻译的
地方显示英文 — 尚未翻译的字符串以英文出现，绝不会是空白或键。

![打开了编辑器语言下拉框的 Help 页面](../Images/help-language.png)

## 给好奇的人

每个页面是一个 `EditorContent`；导航栏是 `EditorPages`；窗口记住的内容是 `IEditorPreferences` 接缝之上的
`EditorWindowState`；页面的文档是 `EditorDocs`，它依次尝试 `<Page>.<locale>.md`、`.en.md`、`.md`；字符串来自
`Editor/Localization/<locale>.json` 之上的 `WagSettingsL10n`。所有这些都是带测试的普通类。窗口本身是唯一必须
用眼睛看的东西。
