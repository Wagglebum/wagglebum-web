# 編輯器視窗

**Tools → WaggleBum → WagSettings → Editor**

一個視窗，與 WagSave 的形狀相同，兩者都有的開發者只需學一種配置。

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

![編輯器視窗的 Summary 頁面：側欄、頁面、文件面板](../Images/editor-window-summary.png)

- 左側的**導覽列**列出頁面。你上次所在的頁面就是你開啟時看到的頁面。
- 右側的**文件窗格**說明你正在看的頁面。拖曳它變寬或變窄，或用標題列的 **Docs** 關掉它；兩者都會被記住。
- **Summary** 是狀態：專案有什麼，初始設定要產生的內容是否已經就位，還有什麼需要手動完成。它上面的任何內容都不會
  改變專案。
- **Setup** 是選擇：產生什麼、預覽、Generate。*Tools → WaggleBum → WagSettings → Setup* 在此頁面開啟編輯器，所以你
  原有的每個連結仍然有效。產生後會跳到 Summary。
- **Settings Profile** 是「加入你自己的設定」所在之處：哪個設定檔是預設的、其中每項設定及其鍵、類型、預設值與範圍、重新排序
  與移除，以及**新增設定**——一個在設定檔旁建立新設定資源的對話方塊，鍵在你輸入時即被檢查。見[擴充性](Extensibility.md)。
- **Debugger** 在播放模式下即時顯示：每項設定的待套用值、Apply / Revert / Reset，以及管理器連接了哪些套用器。它每秒
  輪詢四次，只在有變化時重繪。
- **Help** 有版本、速查表、兩個 Quick Start 場景，以及編輯器的語言。

![列出設定檔中每項設定的 Settings Profile 頁面](../Images/settings-profile-page.png)

![播放模式下的 Debugger，待套用值以粗體顯示](../Images/debugger-play-mode.png)

## 首次執行

完全沒有 `SettingsProfile` 的專案看到的是單一畫面而非導覽列：標誌、一句話，以及 **Run Setup**。一欄關於尚不存在的
設定的頁面只會是雜訊。

## 語言

編輯器遵循在 Help 頁面選擇的語言。在選擇之前，它遵循 WagSave 所設定的語言，因此兩者都安裝時只需選一次。缺少翻譯的
地方顯示英文 — 尚未翻譯的字串以英文出現，絕不會是空白或鍵。

![開啟了編輯器語言下拉選單的 Help 頁面](../Images/help-language.png)

## 給好奇的人

每個頁面是一個 `EditorContent`；導覽列是 `EditorPages`；視窗記住的內容是 `IEditorPreferences` 接縫之上的
`EditorWindowState`；頁面的文件是 `EditorDocs`，它依序嘗試 `<Page>.<locale>.md`、`.en.md`、`.md`；字串來自
`Editor/Localization/<locale>.json` 之上的 `WagSettingsL10n`。所有這些都是帶測試的普通類別。視窗本身是唯一必須用
眼睛看的東西。
