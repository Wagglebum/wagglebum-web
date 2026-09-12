# 快速入門

> **預先發布。** 執行階段、套用器、兩種選單、編輯器、初始設定、Quick Start 範例與在地化都已就位。CI 與商店準備工作
> 尚待完成。見 [CHANGELOG.md](../../CHANGELOG.md)。

## 需求

- Unity **2022.3** (2022 LTS) 或更新版本。
- 無必要的套件相依性。

選用，且自動偵測：

- **WagSave** (`com.wagglebum.wagsave`) — 把持久化升級為帶版本、雲端同步、加密、多設定檔的存檔。安裝後 WagSettings
  自動使用。
- **Input System** (`com.unity.inputsystem`) — 控制重新繫結所必需。
- **uGUI** (`com.unity.ugui`) — 基於元件的選單；每個 2022 LTS 範本都自帶。

## 安裝

### 從 tarball 或 Asset Store

匯入套件，或透過 **Window → Package Manager → + → Add package from tarball…** 加入。

### 從本機檢出

把下面這段加入專案的 `Packages/manifest.json`，指向 `WaggleBum/WagSettings` 資料夾：

```json
{
  "dependencies": {
    "com.wagglebum.wagsettings": "file:../../wagsettings-unity/WaggleBum/WagSettings"
  }
}
```

## 驗證安裝

套件匯入後，Unity 會編譯它，WagSettings 為**目前建置目標**發布指令碼定義符號 `WAGGLEBUM_WAGSETTINGS`。每次網域重新
載入都會重新發布，所以切換平台會自動把它加到新選擇的目標上。用兩種方式確認安裝：

1. **Package Manager** — WagSettings 出現在套件清單中，版本為 0.9.0。
2. **指令碼定義符號** — 開啟 **Edit → Project Settings → Player → Other Settings → Scripting Define Symbols**；
   `WAGGLEBUM_WAGSETTINGS` 在清單中。

![Tools → WaggleBum → WagSettings 選單](../Images/tools-menu.png)

這個定義符號也是其他資源在不硬相依 WagSettings 的情況下偵測它的方式：

```csharp
#if WAGGLEBUM_WAGSETTINGS
    // WagSettings is installed.
#endif
```

## 先試試：Quick Start

看到一切運轉起來的最快方式是隨套件的範例。它正是初始設定畫面產生的內容，外加一個圍繞它的場景，每個 UI 框架各有
一個：

```
WaggleBum/WagSettings/Sample Scenes/Quick Start/
├── Quick Start (UI Toolkit).unity
├── Quick Start (uGUI).unity
├── Settings/            23 setting assets, the profile, and the mixer setup cloned
├── Prefabs/             WagSettingsMenu (uGUI).prefab - the uGUI menu, ready to copy
├── QuickStartActions    a starter Input Actions asset with Jump, Interact and Fire
└── Scripts/             QuickStartDemo, and QuickStartControls when the Input System is installed
```

![執行中的 Quick Start 場景，設定選單已開啟](../Images/quick-start-scene.png)

開啟任一場景並按 Play。然後：

1. **把 Music 拖低。** Music 匯流排上的 220 Hz 音調即時跟隨；勾選 **Master Mute**，它和 SFX 的提示音都會靜音。這就是
   `AudioMixerApplier` 以分貝為單位向產生的混音器寫入公開參數。
2. **改變 Window Mode 或解析度，然後按 Apply。** 角落的 HUD 回報螢幕實際在做什麼。在 Apply 之前什麼都不會變 —
   顯示設定在提交時套用，因為輸入到一半的解析度不應該調整你的視窗大小。
3. **勾選 Reduce Motion。** 立方體停止旋轉。**拖曳 UI Scale。** 選單和 HUD 都會變大。
4. **按空白鍵。** HUD 記下一次跳躍。按 **Rebind Jump**，再按任意鍵，然後 Apply — HUD 會指出新的控制鍵，並且在你停止並
   重新開始 Play 之後它仍然在。(僅限 Input System。)
5. **在搜尋框中輸入。** 不符合的索引標籤與列消失；清空後它們回來。
6. **按 Reset to Defaults，再按 Revert。** 在套用之前，Reset 是可取消的。

停止 Play，再按 Play：你套用過的一切都還在。這就是 `PlayerPrefsStore`，或者在安裝了 WagSave 時是 `WagSaveStore`。

範例中沒有接線程式碼。Quick Start 物件上的 **WagSettings Manager** 擁有登錄表並連接其下的套用器；兩種選單都借用該
登錄表。`QuickStartDemo.cs` 像遊戲指令碼那樣讀回設定 — `WagSettings.Get<float>("audio.master")` — 其中其餘的一切
只是為了讓設定的效果在展示中一目了然。

## 使用 API

```csharp
using WaggleBum.WagSettings;

float master = WagSettings.Get<float>("audio.master");
WagSettings.Set("audio.master", 0.8f);   // pending
WagSettings.Apply();                      // committed and saved, in one batch
```

這會解析到執行中的 **`WagSettingsManager`** — 擁有登錄表並連接其下每個套用器的元件。初始設定把設定檔放在
`Assets/WagSettings/Resources`，所以啟動時會建立一個管理器，場景中無需放置任何東西；自己加入一個即可選擇它所在
的位置。沒有管理器執行時，呼叫會擲回並說明要加入什麼。

[速查表](Cheatsheet.md)用一頁囊括其餘內容；[API](API.md) 包含全部，包括給需要比門面更多功能的程式碼使用的底層
登錄表。

## 放入一個設定選單

通往可用選單的最快路線，無需程式碼：

1. 建立你的設定 (**Assets → Create → WaggleBum → WagSettings**) 並把它們加入一個 `SettingsProfile`。
2. 建立一個 **UI Document** GameObject (*GameObject → UI Toolkit → UI Document*)。
3. 在其上加入 **WaggleBum → WagSettings → Settings Menu (UI Toolkit)**。
4. 把 `WaggleBum/WagSettings/Runtime/UI/UIToolkit/` 中的 `WagSettingsMenu.uxml` 與 `WagSettingsMenu.uss` 指定為
   外殼與樣式。
5. 在 UI Document 的 **Panel Settings** 上，把主題設為同一資料夾中的 `WagSettingsUI.tss`。
6. 確保有一個 **WagSettings Manager** 在執行 — 帶著你的設定檔放在場景中，或者因為設定檔在 Resources 資料夾中而在
   啟動時建立。選單顯示管理器的設定檔；只有在沒有管理器時才在選單本身上指定設定檔。

![播放模式下的 UI Toolkit 設定選單](../Images/menu-uitoolkit.png)

按 Play。你得到每個分類一個索引標籤、每項設定一列、一個搜尋欄位，以及只在有事可做時才啟用的 Apply / Revert / Reset
按鈕。

### 你得到什麼

- **每個分類一個索引標籤**，依設定在設定檔中出現的順序 — 那個順序是設計選擇，所以不會按字母重新排序。
- **每項設定對應正確的控制項**：bool 用開關，`EnumSetting` 用下拉清單，帶範圍的 `FloatSetting` 或 `IntSetting` 用
  滑桿，其他用文字欄位 — 以及**一個解析度下拉清單**，列出顯示器支援的模式，代替 `display.width`、`display.height`
  與 `display.refreshRate`。
- **搖桿與鍵盤導覽。** 上下在列之間移動，左右切換索引標籤，焦點從第一列開始而不是無處可尋。有可見的焦點環，因為
  沒有指標的玩家沒有別的辦法知道自己在哪。
- 列及其索引標籤上的**變更標記**，所以你沒在看的索引標籤中的更改仍然可見。
- **無法使用的設定保持可見**，灰階顯示並帶有解釋原因的工具提示 — 隱藏它們會讓玩家四處尋找一個他們讀到過的選項。

### 改樣式

外觀位於 `WagSettingsMenu.uss` 與 `WagSettingsUI.tss` 中的主題變數：

```css
:root {
    --wag-surface: rgb(28, 30, 34);
    --wag-text: rgb(236, 238, 242);
    --wag-accent: rgb(74, 144, 226);
    --wag-focus: rgb(255, 196, 61);
}
```

在你自己的主題中覆寫它們，選單隨之改變，無需編輯套件。

## 改走 uGUI 路線

如果你的專案用的是 uGUI 而非 UI Toolkit，同一個模型驅動一個基於元件的選單。uGUI 層位於它自己的組件中，Unity 只在
安裝了 `com.unity.ugui` 時才編譯它，所以只用 UI Toolkit 的專案永遠不會背上它。

![播放模式下的 uGUI 設定選單](../Images/menu-ugui.png)

**從預製物件開始。** `Sample Scenes/Quick Start/Prefabs/WagSettingsMenu (uGUI).prefab` 是為產生的設定檔準備的完整
選單 — 帶搜尋的標題列、索引標籤列、每個分類一個捲動頁面且每項設定一列，以及三個命令按鈕 — 完全由標準 uGUI 控制項
建立，所以改樣式就是普通的 uGUI 工作。複製它，指向你的設定檔，刪除或加入列。若要從頭建立：

1. 把 **Settings Menu (uGUI)** 放在選單 Canvas 的根上。有管理器執行時它顯示管理器的設定檔；只有在沒有管理器時才在
   選單上指定。
2. 在每個控制項上加入相符的繫結器並設定它的 **Key**：

| 控制項 | 元件 |
|---|---|
| `Slider` | Slider Setting Binder |
| `Toggle` | Toggle Setting Binder |
| `Dropdown` | Dropdown Setting Binder |
| `InputField` | Input Field Setting Binder |

3. 對於 Apply / Revert / Reset，在每個 `Button` 上放 **Settings Command Button** 並選擇它的命令。當命令無事可做時
   它們會自行灰階顯示。
4. 對於搜尋，在一個 `InputField` 上放 **Settings Search Binder**。
5. 對於索引標籤，在每個頁面上放帶分類名的 **Settings Category Panel**，並在索引標籤列上放
   **Settings Category Selector**，附一個用作範本的按鈕。

繫結器在父層中找到選單，所以除了鍵之外無需手動接線。指向設定檔中不存在的鍵的繫結器會**擲回** — 一個悄悄什麼都
不做的控制項比一次響亮的失敗更糟。

每個繫結器有一個選用的 **Row** — 同時容納其標籤與控制項的物件。分類面板會隨著搜尋篩選設定而顯示與隱藏列；Row
留空時，被隱藏的是控制項自己的物件。

下拉清單從 `EnumSetting` 取得選項，滑桿從設定取得範圍，所以兩者都不會攜帶可能與資源脫節的第二份副本。

### 標籤

繫結器可選地用設定的顯示名稱填入一個 `Text`。在 2022 LTS 中 TextMeshPro 是獨立的套件，所以本套件不相依它；請自行
設定 TMP 標籤，或者不指定標籤而在預製物件中撰寫文字。

### 改用程式碼

```csharp
ISettingsStore store = SettingsStoreFactory.Create(profile.StoreKind);
using SettingsRegistry registry = profile.CreateRegistry(store);

var model = new SettingsMenuModel(registry, SettingBinderFactory.CreateAll(registry), ownsBinders: true);
using var view = new SettingsMenuView(shellUxml, model, ownsModel: true);

document.rootVisualElement.Add(view.Root);
view.FocusFirstRow();
```

`SettingsMenuView` 是普通類別而非元件，所以可以在沒有 UIDocument 的情況下建立與檢查 — 選單就是這樣測試的。

## 執行測試

本套件附帶 EditMode 與 PlayMode 測試組件。把套件放進 Unity 專案後，開啟 **Window → General → Test Runner** 並執行
`WagSettings.Tests.EditMode` 套組。
