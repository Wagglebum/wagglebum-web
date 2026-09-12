# WagSettings 文档

WagSettings 是面向 Unity 2022 LTS 及更高版本的设置与选项菜单系统。它在一套简洁的运行时 API 之后提供音频、显示、
图形、控制重绑定和无障碍设置，并带有一个单屏设置页，可为你生成可用的菜单。

![编辑器窗口的 Summary 页面：侧栏、页面、文档面板](../Images/editor-window-summary.png)

## 从这里开始

- [速查表](Cheatsheet.md) — 一页囊括全部。
- [快速入门](GettingStarted.md) — 安装包并让设置菜单运行起来。
- [编辑器窗口](EditorWindow.md) — 导航栏、页面、文档面板、语言。
- [初始设置](Setup.md) — Setup 页面及其生成的内容。
- [Quick Start 示例](GettingStarted.md) — 每个 UI 框架一个场景，位于 `Sample Scenes/Quick Start`；快速入门会带你走一遍。

## 参考

- [API](API.md) — 运行时 API 全貌。
- [持久化](Persistence.md) — 设置如何保存，以及安装 WagSave 后会启用什么。
- [扩展性](Extensibility.md) — 添加你自己的设置和应用器。
- [本地化](Localization.md) — 菜单用玩家的语言，编辑器用你的语言。
- [术语表](Glossary.md) — 本文档中使用的术语。

## 设置分类

- [音频](Settings/Audio.md)
- [显示](Settings/Display.md)
- [图形](Settings/Graphics.md)
- [无障碍](Settings/Accessibility.md)
- [控制](Settings/Controls.md)

其他语言：[English](../index.md) · [Español](../es/index.md) · [日本語](../ja/index.md) · [한국어](../ko/index.md) · [繁體中文](../zh-TW/index.md)

本包为预发布版本；已完成的内容见 [CHANGELOG.md](../../CHANGELOG.md)。

## 架构一览

WagSettings 由五层组成，依赖严格向下。UI 从不触及持久化，持久化也对 UI 一无所知。

| 层 | 文件夹 | 职责 |
|---|---|---|
| 5 | `Runtime/UI/` | 绑定到注册表、不拥有任何东西的 UI Toolkit 与 uGUI 视图 |
| 4 | `Runtime/Appliers/` | 把设置值变成 Unity 中的效果 |
| 3 | `Runtime/Core/` | `SettingDefinition<T>`、`SettingsRegistry`、`ISettingsStore`、`Guard` — 不含 `UnityEngine` |
| — | `WagSettings.cs`、`WagSettingsManager.cs` | 静态 API 与拥有注册表的场景组件 |
| 3 | `Runtime/Definitions/` | ScriptableObject 设置资源与 `SettingsProfile` |
| 2 | `Runtime/Persistence/` | `ISettingsStore` 实现与存储工厂 |
| — | `WagSave/` | 可选的 WagSave 存储，仅在安装了 WagSave 时编译 |

添加一个设置就是添加一个 `SettingDefinition` 资源和一个应用器。其他什么都不用改。
