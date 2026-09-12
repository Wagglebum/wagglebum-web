# WagSettings 速查表

一頁。其餘全在[文件](index.md)裡。

## 從零到選單

**Tools → WaggleBum → WagSettings → Setup**，勾選分類，按 **Generate**。你會得到設定資源、一個裝著它們的
`SettingsProfile`，以及一個已公開 Master、Music 與 SFX 的 `AudioMixer`，全部位於 `Assets/WagSettings/Resources/`
下。重新執行是安全的：它只建立缺少的內容，絕不覆寫你編輯過的資源。

然後，在你的選單場景中：

| UI Toolkit | uGUI |
|---|---|
| 一個 **UI Document**，在其上加入 **Settings Menu (UI Toolkit)**。指定設定檔、`WagSettingsMenu.uxml`、`WagSettingsMenu.uss`；把 Panel Settings 的主題設為 `WagSettingsUI.tss`。 | 複製 `Sample Scenes/Quick Start/Prefabs/WagSettingsMenu (uGUI).prefab`，指向你的設定檔。 |

按 Play。設定檔在 Resources 中，所以啟動時會建立一個 **WagSettings Manager**，選單顯示它的設定檔。要選擇管理器所在的
位置 — 並給套用器一個家 — 請自己把 *WaggleBum → WagSettings → WagSettings Manager* 加入場景。

## 鍵

`category.name`。點之前的部分是索引標籤；之後的部分成為標籤。

```
audio.master   audio.music   audio.sfx   audio.master.mute
display.width  display.height  display.refreshRate  display.windowMode  display.vsync
graphics.qualityTier  graphics.gamma  graphics.renderScale  graphics.bloom  graphics.ambientOcclusion  graphics.motionBlur
accessibility.uiScale  accessibility.colorblindPreset  accessibility.reduceMotion  accessibility.subtitleScale  accessibility.subtitleBackground
controls.rebinds  controls.sensitivity  controls.invertY
```

這些是初始設定產生的、也是每個套用器預設繫結的鍵。用 **Assets → Create → WaggleBum → WagSettings → …** 加入你自己
的，然後把資源加入設定檔。

## 在程式碼中讀寫

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

只要有 `WagSettingsManager` 在執行 — 你放置的那個，或者因為設定檔在 Resources 資料夾裡而在啟動時建立的那個 —
這些都能用。一個都沒有時，每次呼叫都會擲回並說明要加入什麼。想要比門面更多的功能時，`WagSettings.Registry`
就是登錄表本身。

## 套用器

套用器把值變成 Unity 中的效果。把元件加入 **WagSettings Manager 之下**並指定它驅動的對象 — 管理器啟動時會連接
其下的一切。無需寫任何程式碼。

| 套用器 | 驅動 | 套用時機 |
|---|---|---|
| Audio Mixer Applier | 指定 `AudioMixer` 上公開的參數 | 即時 |
| Resolution Applier | `Screen` 解析度、視窗模式、VSync | Apply 時 |
| Quality Applier | 畫質等級、Gamma、渲染縮放、後製效果開關 | 即時 |
| Accessibility Applier | UI 縮放、色盲矩陣、減少動態效果、字幕 — 以事件與著色器全域變數形式 | 即時 |
| Rebind Applier | `InputActionAsset` 的繫結覆寫 *(Input System)* | 即時 |

`Attach` 對登錄表中不存在的鍵擲回。把套用器上的鍵留空即略過。必須放在別處的套用器：
`WagSettings.Manager.Attach(applier)`。

## 繫結器 (uGUI)

把繫結器放到控制項上並設定它的鍵。它會在父層中找到選單。

| 控制項 | 繫結器 |
|---|---|
| `Slider` | Slider Setting Binder |
| `Toggle` | Toggle Setting Binder |
| `Dropdown` | Dropdown Setting Binder — 選項來自 `EnumSetting`，`display.resolution` 則來自顯示器 |
| `InputField` | Input Field Setting Binder |
| `Button` | Settings Command Button — Apply、Revert 或 Reset |
| `InputField` | Settings Search Binder |

UI Toolkit 不需要這些：列由設定檔自動建立。

## 東西在哪裡

| | |
|---|---|
| 產生的資源 | `Assets/WagSettings/Resources/` |
| 範例 | `WaggleBum/WagSettings/Sample Scenes/Quick Start/` — 每個 UI 框架一個場景 |
| uGUI 選單預製物件 | `…/Quick Start/Prefabs/WagSettingsMenu (uGUI).prefab` |
| 選單樣式 | `Runtime/UI/UIToolkit/WagSettingsMenu.uss` 以及 `WagSettingsUI.tss` 中的變數 |
| 初始設定 | Tools → WaggleBum → WagSettings → Setup |
| 管理器 | *WaggleBum → WagSettings → WagSettings Manager*，或啟動時從 Resources 建立 |

## 何時擲回

大聲且有意：繫結到設定檔中沒有的鍵的繫結器、繫結到登錄表中沒有的鍵的套用器、未公開的混音器參數、設定檔中的空
槽。每一個都會指出鍵名。一個悄悄什麼都不做的控制項，比一個說明原因的失敗更糟。
