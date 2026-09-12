# 持久化

WagSettings 透過一個小介面 `ISettingsStore` 儲存。開箱即用時它使用 `PlayerPrefsStore`，在每個 Unity 專案中都能運作，
無需相依性。安裝 [WagSave](https://www.wagglebum.com)，持久化會自行升級 — 帶版本、雲端同步、加密、多設定檔 —
無需接線。

## 儲存如何運作

玩家拖曳滑桿時什麼都不寫入。設定持有一個**待套用**值；只有當登錄表套用時儲存區才會得知：

```csharp
master.Set(0.5f);      // nothing touches disk
registry.Apply();      // writes dirty settings, then Flush() — once
```

`Apply()` 只寫入真正已變更的設定，並**恰好一次**呼叫 `Flush()`。一個有四十項設定的選單只花一次提交，這使得基於
磁碟或網路的儲存區切實可行。

`Revert()` 捨棄待套用值而完全不碰儲存區。這讓取消按鈕誠實，而不是第二次寫入。

### 緩衝，但不是不可見

`Save` 與 `Delete` 緩衝到 `Flush` 為止，但 `Has` 與 `Load` 讀取的是疊在已提交狀態之上的那些緩衝寫入 — 呼叫者總能
看到自己的寫入。`Flush` 改變的是**持久性**，不是可見性。

```csharp
store.Save("audio.master", 0.5f);
store.Load("audio.master", 0f);   // 0.5 — your own write
// another store instance still reads the old value until Flush()
```

## 選擇儲存區

`SettingsProfile` 記錄它想要哪個後端，`SettingsStoreFactory` 解析它：

| `StoreKind` | 結果 |
|---|---|
| `Automatic` *(預設)* | 安裝了 WagSave 時為 WagSave，否則為 PlayerPrefs |
| `PlayerPrefs` | 始終為 PlayerPrefs，即使安裝了 WagSave |

```csharp
ISettingsStore store = SettingsStoreFactory.Create(profile.StoreKind);
using SettingsRegistry registry = profile.CreateRegistry(store);
```

不帶參數的 `SettingsStoreFactory.Create()` 傳回一個 `PlayerPrefsStore`。這個預設值就是 WagSettings 無需任何設定即可
運作的原因。

## PlayerPrefsStore

預設儲存區。簡單、同步、隨處可用。

**支援的類型。** PlayerPrefs 本身只保存 `int`、`float` 與 `string`，所以這個儲存區支援這些，外加對應到 `int` 的
`bool` 與列舉：

| 設定類型 | 儲存為 |
|---|---|
| `bool` | `int` — `0` 或 `1` |
| `int` | `int` |
| `float` | `float` |
| `string` | `string` — null 值存為空，因為 PlayerPrefs 沒有 null |
| 列舉 / `EnumSetting` | `int` — 底層值 |

其他任何類型都在 **`Save` 呼叫時**擲回 `NotSupportedException`，而不是在排清時悄悄失敗，所以失敗指向引起它的
程式碼。先用 `PlayerPrefsStore.IsSupportedType(type)` 檢查。

**鍵命名空間。** 每個鍵都帶前綴寫入，預設為 `WagSettings.`，所以名為 `audio.master` 的設定存為
`WagSettings.audio.master`，永遠不會與你遊戲自己的 PlayerPrefs 項目衝突。

```csharp
var store = new PlayerPrefsStore("MyGame.Settings.");
```

> 發行後更改前綴會讓之前儲存的每個值變成孤兒，與更改鍵完全一樣。

**它不提供的。** 沒有版本控制或遷移、沒有雲端同步、沒有加密、沒有設定檔，並且 PlayerPrefs 以明文儲存 — Windows
上在登錄檔，macOS 上在 plist — 所以玩家可以輕易編輯。對於設定來說這通常沒問題。如果不行，那正是 WagSave 的用武
之地。

## 安裝 WagSave 後啟用的功能

安裝 `com.wagglebum.wagsave`，WagSettings 透過 `WAGGLEBUM_WAGSAVE_PRESENT` 定義符號在編譯時偵測到它。
`WagSettings.WagSave` 組件 — 沒有 WagSave 時 Unity 完全略過它 — 在啟動時向 `SettingsStoreFactory` 登錄一個
WagSave 儲存區。設為 `Automatic` 的設定檔無需你改動任何程式碼就會使用它。

![報告已偵測到 WagSave 的 Persistence 檢查](../Images/summary-wagsave-detected.png)

| | PlayerPrefs | WagSave |
|---|---|---|
| 無相依性即可運作 | ✅ | — |
| 升級時的版本控制與遷移 | ❌ | ✅ |
| 跨裝置雲端同步 | ❌ | ✅ |
| 加密與簽章 | ❌ | ✅ |
| 多設定檔 | ❌ | ✅ |
| 格式選擇 (二進位 / JSON / 文字) | ❌ | ✅ |
| 基本類型之外的類型 | ❌ | ✅ |

### 它如何接入

無需打開任何開關。`WagSettings.WagSave` 是一個**只有**在安裝了 `com.wagglebum.wagsave` 時 Unity 才編譯的組件，
所以它的啟動程式碼得以執行這件事本身就是偵測 — 沒有版本檢查、沒有反射、沒有設定。安裝 WagSave，持久化自行升級；
移除它，組件連同登錄一起消失，留下 PlayerPrefs 預設值。

設為 `PlayerPrefs` 的設定檔仍然得到 PlayerPrefs。明確選擇儲存區是本套件不會推翻的決定。

### 關於 WagSave 儲存區需要知道的

**設定存放在它們自己的 WagSave 群組中**，預設為 `WagSettings`，所以它們與你遊戲的存檔資料保持可分離，並可在
WagSave 自己的工具中檢視。

**寫入是批次的。** WagSave 的執行階段 API 在每次 `Save` 呼叫時提交，所以這個儲存區緩衝並只在 `Flush` 時寫入 —
登錄表每次 Apply 呼叫一次，且只針對已變更設定。一個玩家改了兩項的四十設定選單只花兩次寫入而不是四十次。有一個
測試恰好斷言這一點。

**刪除寫入 null。** WagSave 的公開執行階段 API 沒有移除，所以刪除的鍵存為 null，讀回時視為不存在。從呼叫者的角度
結果相同，並且讓 WagSettings 遠離 WagSave 的內部。

**以另一種類型儲存的值仍然可讀。** 以前是 `int` 現在是 `float` 的設定會轉換而不是失敗。真正無法讀取的值備援到
預設值並發出警告 — 玩家失去的是一項設定，而不是啟動的能力。

## 撰寫你自己的儲存區

實作 `ISettingsStore` 並登錄它：

```csharp
SettingsStoreFactory.RegisterProvider(() => new MyStore());
```

在任何東西建立登錄表之前登錄 — `[RuntimeInitializeOnLoadMethod]` 是通常的位置。最後一次登錄勝出，
`ClearProvider()` 恢復 PlayerPrefs 預設值，傳回 null 的提供者會擲回而不是悄悄備援，因為悄悄停止持久化的設定比一次
響亮的失敗更糟。

唯一重要的契約：**`Save` 與 `Delete` 緩衝，`Flush` 提交。** 每次寫入都提交的儲存區會把一次 Apply 變成四十次往返。

完整的導覽見[擴充性](Extensibility.md)。
