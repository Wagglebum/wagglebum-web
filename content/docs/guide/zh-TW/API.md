# API 參考

所有型別皆位於 `WaggleBum.WagSave` 命名空間，除非另有說明。

```csharp
using WaggleBum.WagSave;
using WaggleBum.WagSave.Core.SaveSlots; // SaveSlot, SaveSlotManager
using WaggleBum.WagSave.Core.Enums;    // SaveSlotType, LogLevel
```

## 取得實例

```csharp
// 取得作用中（或唯一）的 WagSave 實例
WagSave wagSave = WagSave.GetInstance();

// 依 ID 取得特定實例
WagSave wagSave = WagSave.GetInstance("my-instance-id");

// 取得專案中的所有實例
WagSave[] all = WagSave.GetAllInstances();
```

## 元件存檔 / 讀檔

```csharp
// 儲存所有元件 — 可選擇性地指定存入特定槽位
wagSave.Save();
wagSave.Save(slot);

// 讀取所有元件 — 可選擇性地從特定槽位讀取
wagSave.Load();
wagSave.Load(slot);

// 非同步（建議使用）
await wagSave.SaveAsync();
await wagSave.LoadAsync();
```

## 鍵值存檔 / 讀檔

```csharp
// 靜態便利方法 — 使用作用中的 WagSave 實例
WagSave.Save("score", 9500);

// 有型別的讀取
int score = WagSave.Load<int>("score");

// 無型別的讀取
object raw = WagSave.Load("score");
```

## 自動存檔

```csharp
// 立即觸發自動存檔（同步）
wagSave.AutoSave();

// 暫停自動存檔計時器
wagSave.PauseAutoSave();

// 恢復已暫停的自動存檔計時器
wagSave.ResumeAutoSave();

// 重設倒數計時但不暫停
wagSave.ResetAutoSaveTimer();
```

## 屬性

| 屬性 | 型別 | 說明 |
|---|---|---|
| `IsSaving` | `bool` | 存檔操作進行中時為 true。 |
| `IsLoading` | `bool` | 讀檔操作進行中時為 true。 |
| `Progress` | `int` | 目前操作的進度，範圍 0–100。 |
| `Settings` | `WagSaveSettings` | 存取所有設定選項。 |
| `SaveSlots` | `SaveSlotManager` | 存檔槽位管理器。 |
| `DebugLogLevel` | `LogLevel` | Unity Console 顯示的最低日誌嚴重等級。 |
| `LogToFileEnabled` | `bool` | 為 true 時，日誌輸出同時寫入檔案。 |
| `InstanceCount` | `int` | 專案中 WagSave 資源的數量。 |

## 事件

| 事件 | 簽章 | 觸發時機 |
|---|---|---|
| `OnSaveStart` | `() => void` | 存檔開始前的瞬間。 |
| `OnSaveCompleted` | `() => void` | 存檔完成後。 |
| `OnLoadStart` | `() => void` | 讀檔開始前的瞬間。 |
| `OnLoadCompleted` | `() => void` | 讀檔完成後。 |
| `OnProgress` | `(int percent) => void` | 存檔或讀檔期間。 |
| `OnError` | `(string msg, Exception ex) => void` | 發生錯誤時。 |
| `OnAutoSaveTimer` | `(int secondsRemaining, int interval) => void` | 自動存檔倒數期間。 |
| `OnAutosavePause` | `() => void` | 自動存檔暫停時。 |
| `OnAutosaveResume` | `() => void` | 自動存檔恢復時。 |
| `OnGetEncryptionPrivateKey` | 請參閱 Extensibility.md | 需要私鑰時。 |
| `OnSaveOverride` | 請參閱 Extensibility.md | 自訂存檔覆寫。 |
| `OnLoadOverride` | 請參閱 Extensibility.md | 自訂讀檔覆寫。 |

## 多個實例

```csharp
wagSave.SetActive(); // 將此實例設為作用中，並停用其他所有實例
WagSave settingsSave = WagSave.GetInstance("settings-instance-id");
```
