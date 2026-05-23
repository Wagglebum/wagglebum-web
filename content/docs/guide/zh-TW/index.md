# WagSave 說明文件

WagSave 是一套適用於 Unity 2022 LTS 及以上版本、可直接投入正式環境的存檔系統。它涵蓋序列化、檔案讀寫、加密、壓縮、存檔槽位、自動存檔與雲端後端等功能，全部透過 Unity 編輯器視窗進行設定，無需撰寫任何程式碼即可上手。

**命名空間：** `WaggleBum.WagSave`
**Unity 版本：** 2022.3 LTS+
**發行商：** WaggleBum

## 編輯器語言

WagSave 編輯器支援多種語言。若要變更顯示語言：

1. 開啟 **Edit > Preferences**（Windows / Linux）或 **Unity > Preferences**（macOS）。
2. 在左側面板中選擇 **WagSave**。
3. 使用 **Locale** 下拉選單選擇您偏好的語言。
4. 關閉並重新開啟 Unity 編輯器以套用變更。

**可用語言：**

- English（英語）
- Español（西班牙語）
- 日本語（日語）
- 한국어（韓語）
- 中文（简体）（簡體中文）
- 中文（繁體）(Traditional Chinese)

---

## 文件目錄

| 文件 | 說明 |
|---|---|
| [快速開始](#快速開始) | 透過簡單步驟快速上手 |
| [快速入門](GettingStarted.md) | 安裝、設定，以及第一次存檔與讀檔 |
| [WagSave 元件](WagSaveComponent.md) | 標記要儲存的 GameObject |
| [API 參考](API.md) | 完整的存檔/讀檔 API、事件與屬性 |
| [存檔槽位](SaveSlots.md) | 多槽位存檔系統 |
| [自動存檔](Autosave.md) | 以時間間隔為基礎的自動存檔 |
| [輸出格式](OutputFormats.md) | 格式、檔案設定、加密與壓縮 |
| [WagSave 觸發器](WagSaveTrigger.md) | 基於物理事件的存檔觸發元件 |
| [擴充性](Extensibility.md) | 自訂格式、序列化器與存檔覆寫 |

## 快速開始

### 鍵 / 值
以下程式碼片段用於在無需為專案設定 WagSave 執行個體的情況下進行基本的存檔與讀檔。系統將使用預設設定自動建立一個預設執行個體。若要設定存檔輸出或使用進階功能，請依照 WagSave 執行個體的快速開始說明進行操作。

以下程式碼範例可在套件中提供的快速開始範例場景中查看。
```csharp
        void Update()
        {
            var kb = Keyboard.current;
            if (kb == null) return;

            // Move Player
            var h = (kb.rightArrowKey.isPressed ? 1f : 0f) - (kb.leftArrowKey.isPressed ? 1f : 0f);
            var v = (kb.upArrowKey.isPressed ? 1f : 0f) - (kb.downArrowKey.isPressed ? 1f : 0f);
            transform.Translate(new Vector3(h, 0f, v) * (moveSpeed * Time.deltaTime));

            // Save Player Position
            if (kb.sKey.wasPressedThisFrame)
            {
                WagSave.Save("playerPosition", transform.position);
            }

            // Load Player Position
            if (kb.lKey.wasPressedThisFrame)
            {
                transform.position = WagSave.Load<Vector3>("playerPosition");
            }
        }
```

---

### WagSave 執行個體（推薦）
在 Unity 中從選單 <b>Window -> WagSave -> Editor</b> 開啟 WagSave 編輯器視窗。
使用編輯器介面有助於了解可在專案中設定的功能與選項。

- 開啟 WagSave 編輯器，並在專案的 Resources 資料夾中建立一個執行個體。
- 使用可用的選項與功能，針對您的專案設定執行個體。
- 使用編輯器將 WagSaveComponent 新增至專案中的遊戲物件，並選取要儲存的屬性。
- 實作以下程式碼以儲存和讀取您的內容。您也可以不撰寫任何程式碼，直接新增存檔觸發器、自動存檔和/或存檔槽位。

```csharp
using WaggleBum.WagSave;

// 儲存場景中所有的 WagSaveComponent
var wagSave = WagSave.GetInstance();
wagSave.Save();

// 讀取它們
wagSave.Load();
```

## 架構概覽

**WagSave ScriptableObject** 是核心管理器。透過 `Assets > Create > WaggleBum > WagSave` 建立一個（或多個）。

**WagSaveComponent** 是一個 MonoBehaviour，可附加至任何需要儲存狀態的 GameObject 上。

**Save Targets** 是可插拔的輸出後端（二進位檔案、JSON 檔案、PlayerPrefs、Steam Cloud、Unity Cloud）。

*WagSave 由 WaggleBum 開發與維護，可在 Unity Asset Store 上取得。*
