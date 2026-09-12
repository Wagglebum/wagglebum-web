# 初始設定

初始設定一口氣把專案從一無所有帶到產生好的設定檔。

**Tools → WaggleBum → WagSettings → Setup** — [編輯器視窗](EditorWindow.md)的 Setup 頁面。選擇、預覽與 Generate
都在上面；專案有什麼，以及之後還剩什麼需要手動完成，在旁邊的 **Summary** 頁面。本頁兩者都講。

## 一個畫面，而不是一串步驟

選擇少到可以一眼看全，每一項都有從專案實際情況衍生的預設值，預覽隨著它們的變化而更新。這意味著**選擇的後果在你
做出選擇時就可見**，而不是幾次點擊之後。

![Setup 頁面：分類、選單與持久化選擇、預覽與 Generate](../Images/editor-window-setup.png)

它也是為**重新開啟**而設計的。產生是冪等的，所以三個月後回來加入一個分類是常態，而不是重來。精靈意味著一次性；
這是一個你會回來的面板。

一切也是同時回報的。分步流程給你看第一個問題，把第二個藏到第一個解決之後；一個畫面負擔得起列出產生被拒絕的每一
個原因。

## 專案 — Summary 頁面

Summary 先看專案實際有什麼，並說明每項發現對你即將產生的設定意味著什麼。

![帶有警告及其 Package Manager 按鈕的 Project 區塊](../Images/summary-project-checks.png)

| 檢查 | 回報內容 |
|---|---|
| Unity 版本 | 編輯器是否為 2022.3 或更新 |
| 渲染管線 | Built-in、URP、HDRP 或自訂 — 以及由此可用的圖形設定 |
| UI 框架 | UI Toolkit 與 uGUI 是否可用 |
| Input System | 控制重新繫結是否可用 |
| TextMeshPro | uGUI 選單能否使用 TMP 文字 |
| 持久化 | 是否安裝了 WagSave，或者設定將使用 PlayerPrefs |

### 嚴重程度經過仔細選擇

WagSettings 獨立執行，所以**專案的幾乎任何情況都不能真正阻擋初始設定**。缺一個套件只是少一個功能，而不是沒有
選單。

- **Pass** — 無需操作。
- **Warning** — 缺了某樣東西，但初始設定繼續。沒有 Input System 就沒有重新繫結；其他一切照常。
- **Blocker** — 將無物可產生。只有兩種情況符合：編輯器早於 2022.3，以及 UI Toolkit 與 uGUI 都沒有，這樣就完全沒有
  辦法建立選單。

**Warning 從不停用 Generate。** 把選用套件標為阻擋會訓練你忽略這個區域，而那正是真正的阻擋被漏掉的時候。

沒有 WagSave 是 **pass**，不是缺陷 — 靠 PlayerPrefs 獨立執行就是設計。以後安裝它，設定會自行升級，這裡無需改動。

### 一鍵修復

可修復的發現帶有一個透過 Package Manager 安裝套件的按鈕。安裝完成後畫面重新掃描，因為只有新套件的組件存在之後
檢查才有意義。

阻擋總是提供一條前進的路 — 沒有修復的阻擋就是死路，並且有一個測試斷言 UI 框架阻擋會提供其安裝。Summary 頁面
顯示安裝進度。

**重新掃描重新整理的是專案有什麼，而不是你決定了什麼。** 安裝一個套件再重新掃描，不會悄悄復原你的選擇。

## 要產生的設定

每個分類成為一組設定資源與選單中的一個索引標籤。所有分類預設開啟，除了沒有 Input System 時的 Controls — 產生一個
無法運作的重新繫結區域比不產生更糟。

| 分類 | 設定 |
|---|---|
| Audio | 主音量、音樂與音效音量、靜音 |
| Display | 寬度、高度、更新率、視窗模式、VSync |
| Graphics | 畫質等級、Gamma、光暈、環境光遮蔽、動態模糊 |
| Accessibility | UI 縮放、色盲預設、減少動態效果、字幕縮放與背景 |
| Controls | 重新繫結、靈敏度、Y 軸反轉 |

每個分類的列顯示它加入多少設定，所以結果的規模在產生前而非產生後就可見。

## 選單與持久化

| 選擇 | 預設 | 影響 |
|---|---|---|
| UI 框架 | 可用時為 UI Toolkit，否則為 uGUI | 完成步驟告訴你加入哪個選單元件 |
| 持久化 | Automatic | 寫入產生的設定檔 |
| 音訊混音器 | 從範本建立 | 是否產生混音器 — 僅在勾選 Audio 時顯示 |

`Automatic` 在安裝了 WagSave 時解析為 WagSave，否則為 PlayerPrefs，所以這裡通常無需選擇。`PlayerPrefs` 即使在有
WagSave 的專案中也強制使用簡單儲存區。

### 音訊混音器

音量滑桿需要一個帶公開參數的 `AudioMixer` 來驅動，而公開參數正是人們遺漏的步驟。所以初始設定附帶一個**混音器
範本** — Master、Music 與 SFX 群組，公開了 `MasterVolume`、`MusicVolume` 與 `SfxVolume` — 並把它複製到產生資料夾中，
名為 `WagSettingsMixer.mixer`。

範本、產生的音訊設定與 `AudioMixerApplier` 的預設匯流排被寫成一致的，並有一個測試把它們綁在一起。加入一個
Audio Mixer Applier，指定產生的混音器，每條預設匯流排都能找到它的設定與參數，無需手動輸入任何東西。

**Use an existing mixer** 什麼都不寫。混音器是你的；在上面公開 `MasterVolume`、`MusicVolume` 與 `SfxVolume`，或者
把套用器的匯流排改名為它已經公開的參數。選了這項卻沒有挑選混音器，是 Generate 拒絕的情況之一。

複製品像其他每個產生的資源一樣被追蹤：重新執行會略過它，你在混音器視窗中的編輯會被保留，後續套件版本中更新的範本
會顯示為更新 — 且只套用到你沒動過的複製品上。

`AudioMixer` 沒有公開的建立 API，所以這是複製而不是建置。範本撰寫一次並提交；套件只是複製它。

## 什麼被拒絕，以及為什麼

只要下列任一情況成立，Generate 就被停用，並且**每一個**未滿足的原因都列在按鈕上方：

- **UI 框架** — 未安裝套件卻選擇 uGUI。選單打不開。
- **分類** — 什麼都沒選，或在沒有 Input System 時選了 Controls。
- **音訊混音器** — 「使用現有混音器」卻沒有選擇一個。
- **專案** — 一個阻擋，意味著根本無物可產生。

持久化從不拒絕：`Automatic` 已經備援到 PlayerPrefs。

當預覽說無事可做，因為每個資源都已是最新時，Generate 也被停用。

## 預覽與產生

**在你確切看到會發生什麼之前，什麼都不會寫入。** 預覽列出每個資源以及它會得到什麼，並隨你改變選擇而更新：

```
Into Assets/WagSettings/Resources

Create   Assets/WagSettings/Resources/AudioMaster.asset
Update   Assets/WagSettings/Resources/WagSettingsProfile.asset
Skip     Assets/WagSettings/Resources/AudioMusic.asset  (already up to date)
Keep     Assets/WagSettings/Resources/AudioSfx.asset  (edited since it was generated)
```

![列出 Generate 將建立、更新和保留內容的預覽](../Images/setup-preview-plan.png)

Generate 按鈕旁的一行摘要始終可見，所以詳情可以一直摺疊，直到你想看。

### 重新執行是安全的

初始設定保存一份**產生資訊清單**，記錄它產生的每個資源與所寫內容的指紋。這讓它能區分三種情況：

| 情況 | 結果 |
|---|---|
| 資源不存在 | **Create** |
| 初始設定建立了它且無人動過 | 設定變了則 **Update**，否則 **Skip** |
| 初始設定建立了它且之後被編輯過 | **Keep** — 原樣保留 |
| 那個路徑上已有別的東西 | **Keep** — 不是初始設定該覆寫的 |

所以加入一個分類後再次產生，只會建立新資源。**手動調整過的產生預設值絕不會被丟棄。** 刪除一個產生的資源，初始
設定會提議再做一個。

### 如果產生失敗

產生作為一個 `AssetDatabase` 交易執行。如果中途擲回例外，該次執行建立的每個資源都會在錯誤浮現前被刪除 — 半產生的
專案比沒有更糟。交易在 `finally` 中關閉，所以失敗不會讓資源資料庫在本工作階段餘下時間裡保持暫停。

建立的資源登錄到 `Undo`，所以 <kbd>Ctrl</kbd>+<kbd>Z</kbd> 有效。

### 產生資料夾為何是 Resources 資料夾

`Assets/WagSettings/Resources` 不是命名巧合。Resources 資料夾中的 `SettingsProfile` 正是 `WagSettingsBootstrapper`
在啟動時尋找的東西，所以執行過初始設定的專案無需在任何場景放置任何東西，就能得到一個執行中的 `WagSettingsManager`
— 以及可用的靜態 API。產生的設定檔帶有 **Is Default** 標記，所以當另一個設定檔共用該資料夾時它會勝出。產生資訊清單
是編輯器的記帳，被標記為不隨建置發布。

### 執行之後

編輯器跳到 **Summary**，顯示寫入了什麼，並附有前往產生的設定檔、產生資料夾、Quick Start 場景與速查表的按鈕。
需要手動完成的步驟在該頁面的文件面板中，隨時回來都在。回到 Setup 調整並再次產生。

![產生後的 Summary 頁面及其快捷按鈕](../Images/summary-after-generate.png)

## 尚未產生的內容

初始設定產生**設定資源、裝著它們的設定檔，以及音訊混音器**。它還不會建立 InputActionAsset 或套用視覺樣式預設，
所以不顯示相關控制項。`StyleRule` 規則、`WiringRule` 的輸入動作那一半以及它們的模型欄位已經存在，等待產生支援
它們。

目前請手動接線輸入動作；見[控制](Settings/Controls.md)。

## 如何進入 Setup

| 路徑 | 時機 |
|---|---|
| **Tools → WaggleBum → WagSettings → Setup** | 任何時候 — 在 Setup 頁面開啟編輯器 |
| 編輯器導覽列中的 **Setup** 頁面 | 編輯器開啟時 |
| Scene 檢視覆疊 | 從 Scene 檢視的覆疊選單啟用 "WagSettings" |
| 自動，僅一次 | 安裝後編輯器首次載入時 |

### 關於自動開啟

初始設定**只**自薦一次，之後再也不會。每次網域重新載入都重新開啟視窗的資源會被解除安裝，所以答案在它出現的那一刻
就被記住 — 立即關掉也算已被提議過。

該標記按套件版本儲存，所以大版本升級可能再自我介紹一次。如果無法確定版本，它根本不會自動開啟，因為無法記錄的
版本意味著每次重新載入都要問。

Scene 檢視覆疊**預設隱藏**。永久駐紮在別人 Scene 檢視上的套件是越界的；它就在覆疊選單裡，留給想要它的人。

## 它是怎麼組成的

這些頁面是同一個 `SetupSession` 之上的外殼，共用該工作階段，所以在 Summary 與 Setup 之間切換既不丟掃描也不丟選擇。
專案有什麼是 `EnvironmentDetector`，你選了什麼是 `SetupModel`，能否產生是 `ISetupRule` 清單之上的
`SetupValidation`，會寫入什麼是 `SettingsGenerator` — 全是不相依編輯器視窗的普通類別，所以每條規則都能直接測試。

規則回答 `IsSatisfied(model, out reason)`。它不擁有任何 UI，這就是為什麼讓 Generate 按鈕灰階顯示的同一個條件在
測試中是兩行斷言。

偵測透過 `IEnvironmentProbe` 讀取原始事實，這就是為什麼「不支援的編輯器上沒有 Input System 的 HDRP」這樣的情境是
兩行測試而不是一整個專案。每個選用套件都透過按名稱查詢類型而非參考它來發現：在這裡參考 URP 或 Input System 意味著
初始設定恰恰在它要幫助的專案中編譯失敗。

Setup 頁面把重建控制項與重新整理由此衍生的內容分開：工作階段在 `Changed` 之外單獨觸發 `Scanned`，所以勾選一個框永遠
不會重建正在被勾選的那個框 — 設定選單曾因重建每一列而在拖曳中失去焦點，這個教訓學得很痛。
