# 詞彙表

| 術語 | 含義 |
|---|---|
| **設定 (Setting)** | 玩家可以改變的一個值：主音量、視窗模式、UI 縮放。在專案中是 `SettingAsset`；在執行階段是 `ISettingDefinition`。 |
| **鍵 (Key)** | 設定的穩定儲存名稱，形如 `category.name` — `audio.master`。前綴是索引標籤，其餘是標籤。一旦發行即為永久。 |
| **設定檔 (Profile)** | 一個 `SettingsProfile` 資源：遊戲公開的設定清單（依選單順序），以及持久化它們的儲存區。預設的那個位於 Resources 資料夾。 |
| **登錄表 (Registry)** | 一個 `SettingsRegistry`：從儲存區載入的設定檔設定，帶有待套用值、變更追蹤與 Apply / Revert / Reset 命令。 |
| **管理器 (Manager)** | `WagSettingsManager` 場景元件，擁有登錄表，連接其下的套用器，並支撐靜態 API。每個遊戲一個。 |
| **靜態 API (Static API)** | `WagSettings.Get / Set / Apply` 等 — 透過管理器從任何指令碼一行讀寫設定的方式。 |
| **待套用值 (Pending value)** | 玩家已選擇但尚未套用的值。即定義上的 `Value`。 |
| **已套用基準 (Applied baseline)** | 由 Apply 提交或從儲存區載入的最後一個值。 |
| **已變更 (Dirty)** | 待套用值與基準不同的設定。Apply 與 Revert 據此啟用自己。 |
| **Apply** | 把每個待套用值一次提交到儲存區。Apply 按鈕與 `WagSettings.Apply()` 所做的事。 |
| **Revert** | 捨棄每個待套用值，恢復基準。 |
| **Reset** | 把每項設定恢復為撰寫的預設值，在套用前保持待套用。 |
| **儲存區 (Store)** | 一個 `ISettingsStore`：值持久化的地方。預設為 `PlayerPrefsStore`；安裝了 WagSave 時為 `WagSaveStore`。寫入會緩衝；`Flush` 提交。 |
| **套用器 (Applier)** | 把值變成 Unity 效果 — 混音器音量、螢幕解析度、畫質等級 — 的 `SettingApplierBase` 元件。位於管理器之下。 |
| **套用模式 (Apply mode)** | 套用器是每次變化都動作 (Immediate)，還是只在登錄表提交時動作 (OnApply)。 |
| **繫結器 (Binder)** | UI 控制項繫結的對象：UI Toolkit 中是定義之上的 `ISettingBinder`；uGUI 中是控制項上的 `…SettingBinder` 元件。 |
| **分類 (Category)** | 設定所在的索引標籤，由鍵的前綴決定。執行階段為 `SettingsMenuCategory`。 |
| **選單 (Menu)** | `WagSettingsMenu` (UI Toolkit) 或 `WagSettingsMenuUGUI`，都是 `ISettingsMenu`。它們借用管理器的登錄表。 |
| **初始設定 (Setup)** | 掃描專案並把設定、設定檔與混音器產生到 `Assets/WagSettings/Resources` 的編輯器頁面。 |
| **資訊清單 (Manifest)** | 初始設定對其寫入內容及其指紋的記錄，使重新執行只建立缺少的內容，絕不覆寫你編輯過的。 |
| **顯示模式 (Display mode)** | 寬度、高度與更新率。解析度下拉清單列出顯示器支援的模式。 |
| **地區 (Locale)** | 語言代碼 — `en`、`es`、`ja`、`ko`、`zh-CN`、`zh-TW`。選單的由遊戲選擇；編輯器的在其 Help 頁面選擇。 |
