# WagSettings 文件

WagSettings 是適用於 Unity 2022 LTS 及更新版本的設定與選項選單系統。它在一套簡潔的執行階段 API 之後提供音訊、顯示、
圖形、控制重新繫結與無障礙設定，並附有單一畫面的初始設定，可為你產生可用的選單。

![編輯器視窗的 Summary 頁面：側欄、頁面、文件面板](../Images/editor-window-summary.png)

## 從這裡開始

- [速查表](Cheatsheet.md) — 一頁囊括全部。
- [快速入門](GettingStarted.md) — 安裝套件並讓設定選單跑起來。
- [編輯器視窗](EditorWindow.md) — 導覽列、頁面、文件窗格、語言。
- [初始設定](Setup.md) — Setup 頁面及其產生的內容。
- [Quick Start 範例](GettingStarted.md) — 每個 UI 框架一個場景，位於 `Sample Scenes/Quick Start`；快速入門會帶你走一遍。

## 參考

- [API](API.md) — 執行階段 API 全貌。
- [持久化](Persistence.md) — 設定如何儲存，以及安裝 WagSave 後會啟用什麼。
- [擴充性](Extensibility.md) — 加入你自己的設定與套用器。
- [在地化](Localization.md) — 選單用玩家的語言，編輯器用你的語言。
- [詞彙表](Glossary.md) — 本文件中使用的術語。

## 設定分類

- [音訊](Settings/Audio.md)
- [顯示](Settings/Display.md)
- [圖形](Settings/Graphics.md)
- [無障礙](Settings/Accessibility.md)
- [控制](Settings/Controls.md)

其他語言：[English](../index.md) · [Español](../es/index.md) · [日本語](../ja/index.md) · [한국어](../ko/index.md) · [简体中文](../zh-CN/index.md)

本套件為預先發布版本；已完成的內容見 [CHANGELOG.md](../../CHANGELOG.md)。

## 架構一覽

WagSettings 由五層組成，相依性嚴格向下。UI 從不碰持久化，持久化也對 UI 一無所知。

| 層 | 資料夾 | 職責 |
|---|---|---|
| 5 | `Runtime/UI/` | 繫結到登錄表、不擁有任何東西的 UI Toolkit 與 uGUI 檢視 |
| 4 | `Runtime/Appliers/` | 把設定值變成 Unity 中的效果 |
| 3 | `Runtime/Core/` | `SettingDefinition<T>`、`SettingsRegistry`、`ISettingsStore`、`Guard` — 不含 `UnityEngine` |
| — | `WagSettings.cs`、`WagSettingsManager.cs` | 靜態 API 與擁有登錄表的場景元件 |
| 3 | `Runtime/Definitions/` | ScriptableObject 設定資源與 `SettingsProfile` |
| 2 | `Runtime/Persistence/` | `ISettingsStore` 實作與儲存區工廠 |
| — | `WagSave/` | 選用的 WagSave 儲存區，僅在安裝了 WagSave 時編譯 |

加入一項設定就是加入一個 `SettingDefinition` 資源和一個套用器。其他什麼都不用改。
