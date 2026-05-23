# 輸出格式

WagSave 支援多種存檔後端。切換格式無需修改任何程式碼。

## 可用格式

### 基於檔案的格式

| 格式 | 索引 | 說明 |
|---|---|---|
| Binary | 是 | 體積小。建議用於正式發行。 |
| JSON | 是 | 人類可讀。建議用於開發除錯。 |
| Text | 是 | 純文字鍵值格式。 |
| PlayerPrefs | 否 | Unity 內建的鍵值儲存。適合 WebGL。 |

### 雲端 / 平台格式

| 格式 | 所需 SDK | 說明 |
|---|---|---|
| Unity Cloud Save | Unity Gaming Services | 雲端後端。 |
| Steam Cloud Save | Steamworks SDK | Steam 遠端儲存。 |

兩種雲端格式均為**條件編譯**。如果所需 SDK 不在專案中，該格式將不會出現在下拉選單中，也不會產生編譯錯誤。

---

## Unity Cloud Save 設定

Unity Cloud Save 需要額外的套件與一次性的執行時期初始化。WagSave 會自動處理所有執行緒管理，除以下步驟外無需額外程式碼。

### 1 — 安裝所需套件

開啟 **Window > Package Manager**，切換至 **Unity Registry**，安裝以下兩個套件：

| 套件 | 套件 ID |
|---|---|
| Authentication | `com.unity.services.authentication` |
| Cloud Save | `com.unity.services.cloudsave` |

`com.unity.services.core` 會作為相依套件自動安裝。

將 `com.unity.services.cloudsave` 加入專案後，`CLOUD_SAVE_ENABLED` 腳本定義符號將自動啟用，格式下拉選單中會出現 **Unity Cloud Save** 選項。無需手動設定該符號。

### 2 — 將專案連結至 Unity Gaming Services

1. 開啟 **Edit > Project Settings > Services**。
2. 登入並關聯 Unity Cloud 專案（如有需要，可在儀表板中新建）。
3. 專案 ID 與組織 ID 將被寫入專案設定。

### 3 — 執行時期初始化

在**任何存檔或讀檔操作之前**，於啟動時呼叫一次以下程式碼。`Start()` 方法或專用的引導程式均為合適位置：

```csharp
using Unity.Services.Authentication;
using Unity.Services.Core;

private async void Start()
{
    await UnityServices.InitializeAsync();

    if (!AuthenticationService.Instance.IsSignedIn)
        await AuthenticationService.Instance.SignInAnonymouslyAsync();
}
```

> 若在 `UnityServices.InitializeAsync()` 完成前觸發存檔或讀檔，WagSave 將記錄錯誤且操作會失敗。請務必在進入遊戲流程前等待初始化完成。

`SignInAnonymouslyAsync` 適用於測試。正式發布的遊戲請替換為所選的登入方式（Steam、Google、Apple ID、帳號/密碼等）。

### 4 — 選擇格式

在 WagSave 編輯器視窗中，前往 **Save Output** 並從格式下拉選單中選擇 **Unity Cloud Save**。

### 注意事項

- Cloud Save 資料按**已驗證的玩家**個別儲存，每位玩家擁有獨立的資料儲存桶。
- WagSave 會在內部為所有金鑰加上命名空間前綴，因此同一專案中的多個 WagSave 資產不會在雲端儲存桶中產生衝突。
- WagSave 會自動在主執行緒上執行所有 Cloud Save 操作，無需額外的執行緒設定。

---

## Steam Cloud Save 設定

Steam Cloud Save 需要 Steamworks.NET 套件和一個活躍的 Steam 工作階段。完成以下設定後，WagSave 將自動處理所有 Steam Remote Storage 呼叫。

### 1 — 建立 Steamworks 開發者帳號與應用程式

1. 前往 [partner.steamgames.com](https://partner.steamgames.com) 註冊帳號。需同意 Steam 發行協議並支付 100 美元的應用程式費用（銷售額達 1,000 美元後退款）。
2. 在 Steamworks 合作夥伴控制台建立應用程式，您將獲得一個 **App ID**。
3. 在 Steamworks 控制台前往 **App Admin → Cloud**，為應用程式啟用 **Steam Cloud**，並設定儲存配額（預設 1 GB / 1,000 個檔案對大多數遊戲已足夠）。

> 開發期間可使用 App ID `480`（Valve 的公開測試應用程式 SpaceWar）代替您自己的 App ID。

### 2 — 安裝 Steamworks.NET

開啟 **Window > Package Manager**，點擊 **+** 選擇 **Add package from git URL**，輸入：

```
https://github.com/rlabrecque/Steamworks.NET.git?path=/com.rlabrecque.steamworks.net
```

或從 [steamworks.github.io](https://steamworks.github.io) 下載 `.unitypackage`，透過 **Assets > Import Package** 匯入。

套件安裝後，WagSave 組件定義會自動啟用 `STEAM_ENABLED` 腳本定義符號，格式下拉選單中將出現 **Steam Cloud Save** 選項。無需手動設定該符號。

### 3 — 新增 steam_appid.txt

在專案根目錄（包含 `Assets/` 資料夾的目錄）建立名為 `steam_appid.txt` 的純文字檔案，內容僅填寫您的 App ID：

```
480
```

發布前請將 `480` 替換為您的真實 App ID。在 Steam 外部執行時，此檔案是 `SteamAPI.Init()` 成功的必要條件。

### 4 — 執行時期初始化 SteamAPI

Steam 存檔目標要求在任何存檔或讀檔操作之前呼叫 `SteamAPI.Init()`。Steamworks.NET 附帶了專用的 `SteamManager` 元件。

1. 若匯入了完整的 Steamworks.NET `.unitypackage`，其中包含 `SteamManager` 預製件——將其拖入場景即可。
2. 若透過 Package Manager 安裝，請手動將 `SteamManager` 腳本新增至場景中的 GameObject（原始碼可在 [Steamworks.NET 儲存庫](https://github.com/rlabrecque/Steamworks.NET) 取得）。
3. 將 `SteamManager` 放在場景階層的較早位置，確保在任何 WagSave 存檔或讀檔觸發之前完成初始化。

> 機器上必須執行 Steam 用戶端。若 Steam 未啟動，`SteamAPI.IsSteamRunning()` 將回傳 false，WagSave 將拋出錯誤。

### 5 — 設定存檔設定檔

1. 在 Project 視窗中選取您的 WagSave 資產。
2. 在 Inspector 中開啟或建立一個存檔設定檔。
3. 將 **Save Target Destination** 下拉選單設定為 **Steam Cloud Save**。
4. 設定 **Target ID**——這將成為儲存在 Steam Cloud 中的檔案名稱。例如，Target ID 為 `slot1` 時，將建立名為 `slot1.wsav` 的檔案。

### 注意事項

- 存檔以 `.wsav` 格式儲存至 Steam Cloud，遊戲結束時自動同步。
- Steam Cloud 每個檔案大小上限為 100 MB，超出時將記錄錯誤。
- 資料綁定至已登入的 Steam 帳號，每位 Steam 使用者擁有獨立的雲端儲存空間。
- 每個存檔目標的所有金鑰存放在單一檔案中。若使用多個 WagSave 資產，請為每個資產設定唯一的 Target ID。

---

## 檔案屬性

- **Folder** — 位於 `Application.persistentDataPath` 內
- **Filename** — 基本檔名
- **Extension** — 例如 `sav`、`dat`、`json`

## 保護選項

### 加密

1. 啟用 **Encrypt Data** 2. 安全地儲存私鑰。 3. 在執行時期使用以下兩種方式之一提供私鑰：

   **方式 A — 事件（推薦）：** 在第一次存檔或讀檔之前訂閱 `OnGetEncryptionPrivateKey`：

   ```csharp
   wagSave.OnGetEncryptionPrivateKey += () => LoadPrivateKeyFromSecureStorage();
   ```

   **方式 B — 直接設定：** 直接在實例上設定金鑰：

   ```csharp
   wagSave.Settings.SaveTarget.Options.EncryptPrivateKey = LoadPrivateKeyFromSecureStorage();
   ```

   事件方式較為推薦，因為它將金鑰取得延遲至實際使用時。兩種方式均有效。

### 檔案簽章

啟用 **Sign Output File**。點擊 **Regenerate Key** 以產生新的密鑰。

### 存檔檔案備份

在每次儲存之前建立現有存檔檔案的副本（副檔名為 `.bak`）。如果儲存失敗（加密錯誤、磁碟寫入失敗等），會自動從備份還原先前的檔案，因此玩家不會遇到寫到一半的損毀存檔。

1. 在 **Save Output > Protection** 中啟用 **Backup Before Save**。
2. 備份會寫入與資料檔案相同的資料夾，檔名相同並加上 `.bak`。
3. 儲存成功後，備份會自動移除。儲存失敗後，備份會保留在磁碟上以供檢查。

> 索引檔案格式不可用。索引目標會對資料檔案進行就地增量寫入，而不是每次儲存產生單一替換檔案，因此儲存前的備份無法代表完整的先前狀態。

## 壓縮

啟用 **Compress Output** 以縮減檔案大小。

## 選擇格式

| 情境 | 建議格式 |
|---|---|
| 桌機 / 主機正式發行 | Binary |
| 除錯開發 | JSON |
| WebGL / 簡單資料 | PlayerPrefs |
| 具有伺服器個人資料的線上遊戲 | Unity Cloud Save |
| Steam 遊戲 | Steam Cloud Save |
