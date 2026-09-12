# API

WagSettings 核心模型。本頁的一切都位於 `WaggleBum.WagSettings` 命名空間中，並且除 ScriptableObject 資源類型外不相依
`UnityEngine` — 模型是純 C#，因此可以直接單元測試，以後也可以抽出。

## 靜態 API

大多數遊戲程式碼只需一行，就是它：

```csharp
using WaggleBum.WagSettings;

float master = WagSettings.Get<float>("audio.master");
WagSettings.Set("audio.master", 0.8f);                 // pending
WagSettings.Apply();                                    // committed and saved, in one batch
WagSettings.Definition<float>("audio.master").Changed += value => { };
```

| 成員 | 作用 |
|---|---|
| `Get<T>(key)` | 待套用值 |
| `Set<T>(key, value)` | 設定待套用值；變了傳回 `true` |
| `Definition<T>(key)` | 鍵背後的 `ISettingDefinition<T>`，用於其 `Changed` 事件 |
| `Apply()` / `Revert()` / `ResetAll()` | 登錄表的命令 |
| `IsDirty` | 有待套用的嗎？ |
| `Registry` | 登錄表本身，用於以上之外的一切 |
| `Manager` / `IsReady` | 執行中的 `WagSettingsManager`，或是否存在一個 |

每次呼叫都解析到作用中的 **`WagSettingsManager`**。沒有管理器執行時，`Get` 與其他方法**擲回**，並指出兩種修復方式
— 它們從不傳回一個安靜的預設值，因為一個「能用」卻什麼都不儲存的設定選單正是它要防止的失敗。不想擲回時用
`IsReady` 檢查。

### `WagSettingsManager`

登錄表的唯一擁有者。把 **WaggleBum → WagSettings → WagSettings Manager** 加入場景並指定設定檔，或者不指定，它會
使用 Resources 資料夾中的預設設定檔。它：

- 從設定檔延遲建立登錄表，所以在 `Awake` 中開啟的選單得到同一個；
- 在 `Start` 中**連接其下的每個 `SettingApplierBase`**，無需寫程式碼；
- 把登錄表交給任何開啟的選單 — 有管理器執行時選單不會自建；
- 預設跨場景載入持久存在，第二個管理器會發出警告並移除自己。

`Attach(applier)` 用於放在別處的套用器；自行中斷連接。

### `WagSettingsBootstrapper`

如果場景沒有管理器而某個 `SettingsProfile` 在 Resources 資料夾中，第一個場景載入後會建立一個 — 所以儲存的設定在
第一個影格之前套用，靜態 API 無需放置任何東西即可運作。初始設定正是出於這個原因產生到
`Assets/WagSettings/Resources`。Resources 中沒有設定檔就什麼都不會發生。那裡有多個設定檔時，在你想要的那個上勾選
**Is Default**；都沒標記時發出警告並取第一個。

`WagSettings.Reset()` 清除靜態狀態並在每個播放工作階段之前執行，所以不帶網域重新載入的 Enter Play Mode 不會把上一
個工作階段的管理器交給新工作階段。測試在 setup 中呼叫它。

## 它的形狀

```
SettingsProfile  (asset)  ── CreateRegistry(store) ──▶  SettingsRegistry
      │                                                       │
      └─ SettingAsset ─┐                          holds       ▼
                       └──────────────────────▶  ISettingDefinition ──▶ ISettingsStore
                                                       ▲
                             SettingDefinition<T> (plain C#, does the work)
```

一項設定攜帶三個值，它們之間的差異就是整個模型：

| | 含義 |
|---|---|
| `DefaultValue` | 撰寫的預設值。`ResetToDefault()` 恢復它。 |
| `Value` | **待套用**值 — 使用者此刻調到的值。 |
| *已套用基準* | 由 `Apply()` 提交或從儲存區載入的最後一個值。 |

`IsDirty` 就是 `Value != baseline`。這就是讓 Apply 按鈕亮起、讓取消按鈕生效、讓批次提交一次寫入的東西。

## `SettingDefinition<T>`

純 C# 設定。用鍵與預設值建構。

```csharp
var master = new SettingDefinition<float>("audio.master", 0.8f);

master.Changed += volume => mixer.SetFloat("MasterVolume", AudioVolume.LinearToDecibels(volume));
master.Set(0.5f);          // raises Changed, IsDirty becomes true
```

| 成員 | 說明 |
|---|---|
| `Key`、`DefaultValue`、`ValueType` | 不可變的身分。 |
| `Value` / `Set(T)` | `Set` 傳回值是否變動。寫入相同的值是空操作且不觸發任何事件，所以套用器永遠不會被無謂喚醒。 |
| `Changed` | `SettingChangedHandler<T>` — 帶類型，供套用器與 UI 使用。 |
| `ValueChanged` | 無類型的 `Action`，登錄表用它追蹤變更狀態。 |
| `IsDirty` | 待套用值與已套用基準不同。 |
| `Apply()` | 把待套用值採納為基準。 |
| `Revert()` | 恢復基準。值變動時觸發 `Changed`。 |
| `ResetToDefault()` | 恢復撰寫的預設值。設定保持**已變更**狀態，所以重設仍可取消。 |
| `LoadFrom(store)` / `SaveTo(store)` | 讀/寫單一值。`SaveTo` **不**排清。 |

相等性使用 `EqualityComparer<T>.Default`，除非你向建構函式傳入比較器 — 對希望使用容差而非精確相等的 `float` 設定
很有用。

### `ISettingDefinition<T>`

`SettingDefinition<T>` 與 ScriptableObject 資源類型都實作 `ISettingDefinition<T>`，它攜帶 `Value`、`Set`、
`DefaultValue` 與 `Changed`。把 UI 與套用器繫結到**這個介面**而不是具體類別，這樣設定無論是作為資源撰寫還是在
程式碼中建立都表現一致 — `SettingsRegistry.Get<T>` 正是因此傳回它。

## `SettingsRegistry`

所有設定集中一處，繫結到一個儲存區。這是 UI 繫結的對象。

```csharp
using var registry = new SettingsRegistry(store);
registry.Register(master);

registry.IsDirty;          // false — Register loaded the persisted value
master.Set(0.5f);
registry.IsDirty;          // true
registry.Apply();          // writes dirty settings, flushes once
```

| 成員 | 說明 |
|---|---|
| `Register(definition)` | 加入設定**並載入其持久化的值**，所以新登錄表是乾淨的。重複鍵時擲回。 |
| `Unregister(key)` / `Clear()` | 移除設定並中斷登錄表的訂閱。 |
| `Get<T>(key)` | 帶類型查詢，傳回 `ISettingDefinition<T>`。不存在時擲回 `KeyNotFoundException`，類型不符時擲回 `InvalidCastException`。 |
| `TryGet` / `Contains` | 不擲回的查詢。 |
| `Definitions` | 依登錄順序的已登錄設定 — UI 呈現它們的順序。 |
| `IsDirty` | 任一設定有未套用的更改時為 true。 |
| `DirtyStateChanged` | 只在 clean↔dirty **轉換**時觸發，而非每次按鍵。 |
| `Load()` | 從儲存區重新讀取一切，捨棄待套用編輯。 |
| `Apply()` | 寫入已變更設定，`Flush()` **一次**，把它們採納為基準。傳回寫入了多少個。乾淨的設定永遠不會被重寫。 |
| `Revert()` | 捨棄待套用編輯。 |
| `ResetAll()` | 恢復每個預設值，登錄表保持已變更狀態。 |
| `Dispose()` | 中斷每個訂閱。 |

> 登錄表訂閱它持有的每項設定。當擁有它的場景或設定檔消失時 **Dispose 它**（或呼叫 `Clear()`），否則那些訂閱會透過
> 設定資源讓它一直存活。

### 批次處理

`Apply()` 是唯一呼叫 `Flush()` 的東西，並且最多呼叫一次。這很重要，因為真實的儲存區可能存取磁碟或網路 — 有四十項
設定的選單仍然只花一次提交。

## 繫結層

UI 繫結到檢視模型，而不是直接繫結到登錄表。UI Toolkit 與 uGUI 選單都經過同一個，所以它們不會分道揚鑣 — 而且整個
選單無需實例化控制項即可測試。

### 標籤與分類

設定攜帶 `DisplayName` 與 `Category`。兩者都不必撰寫：它們從鍵衍生，所以選單永遠不會顯示原始鍵。

| 鍵 | 衍生標籤 | 衍生分類 |
|---|---|---|
| `audio.master` | Master | Audio |
| `display.windowMode` | Window Mode | Display |
| `accessibility.reduce_motion` | Reduce Motion | Accessibility |
| `simple` | Simple | General |

在資源上撰寫任一項都會覆寫衍生值。衍生是備援，不是政策 — 任何面向玩家的內容最終都應該撰寫並在地化。

### `ISettingBinder`

檢視眼中的一項設定：`DisplayName`、`Category`、`IsDirty`、`BoxedValue`、一個 `Changed` 事件，以及可用性。

```csharp
var binder = (SettingBinding<float>)category.Settings[0];
binder.Set(0.5f);            // goes through the registry-tracked setting
```

**編輯經過登錄表追蹤的設定，絕不繞過它直接進入儲存區。** 直接寫儲存區的檢視會讓 Apply 按鈕對待套用內容撒謊。

**可用性**是目前硬體無法滿足的設定的呈現方式：

```csharp
binder.SetAvailability(
    applier.SupportsFeature(GraphicsFeature.RenderScale),
    "Render scale needs the Universal Render Pipeline.");
```

無法使用的繫結器忽略寫入而不是擲回，所以尚未灰階顯示控制項的檢視不會讓選單當機。灰階顯示控制項並顯示
`UnavailableReason` — **不要隱藏它**，否則玩家會四處尋找一個他們讀到過的選項。

### `SettingsMenuModel`

```csharp
using var model = new SettingsMenuModel(registry, SettingBinderFactory.CreateAll(registry), ownsBinders: true);

model.SearchText = "volume";
foreach (SettingsMenuCategory category in model.Categories)
{
    foreach (ISettingBinder setting in category.Settings) { /* build a row */ }
}
```

| 成員 | 說明 |
|---|---|
| `Categories` | 相符的分類，依**撰寫**順序而非字母順序 — 設定檔順序是設計選擇。空的被丟棄。 |
| `SearchText` | 不區分大小寫地比對標籤、分類或鍵。每次真正的變化觸發一次 `Changed`。 |
| `CanApply` / `CanRevert` | 有任何已變更設定時為 true。 |
| `CanReset` | 只有當某項與撰寫的預設值不同時為 true — 什麼都不做的 Reset 不應引人點擊。 |
| `Apply()` / `Revert()` / `ResetAll()` | 直通登錄表；`Apply` 傳回寫入了多少個。 |
| `Changed` | 任何值、可用性、搜尋或變更狀態的變化。 |

`SettingBinderFactory` 為整個登錄表建立帶類型的繫結器，直接比對常見值類型，對自訂類型備援到反射 — 所以加入設定
類型不意味著編輯一個 switch。

> 在 IL2CPP 上，反射路徑要求泛型實體化在建置時就已存在。套件內的 `link.xml` 會保住 `SettingBinding<T>` 的建構函式
> 不被裁剪，但對於你自己的值類型，`SettingBinding<YourType>` 還必須出現在你程式碼的某處——一個欄位即可——AOT 編譯器
> 才會產生它。四種內建值類型無需任何處理。

> 選單關閉時 Dispose 模型。它訂閱登錄表與每個繫結器；`ownsBinders: true` 會連同繫結器一起 Dispose。

## `ISettingsStore`

持久化接縫。`PlayerPrefsStore` 是預設，安裝了 WagSave 時 `WagSaveStore` 接管；見[持久化](Persistence.md)。

```csharp
public interface ISettingsStore
{
    bool Has(string key);
    T    Load<T>(string key, T fallback);
    void Save<T>(string key, T value);   // buffered
    void Flush();                        // commits the batch
    void Delete(string key);             // buffered
}
```

`Save` 與 `Delete` 緩衝；只有 `Flush` 提交。

## 設定資源

ScriptableObject 包裝器，讓設定可以作為資源撰寫與參考。每個都委派給內部的 `SettingDefinition<T>` — 資源是撰寫
介面，定義做實際工作。

`BoolSetting` · `IntSetting` · `FloatSetting` · `StringSetting` · `EnumSetting`

從 **Assets → Create → WaggleBum → WagSettings** 建立它們。每個資源都需要一個 **Key** — 空鍵在設定被使用時立即
擲回。

`EnumSetting` 儲存的是撰寫的選項名稱清單中被選中的**索引**，而不是 C# 列舉，所以一種資源類型服務於每個下拉清單
（視窗模式、色盲預設、畫質等級），UI 無需反射即可得到顯示名稱。

## `SettingsProfile`

把遊戲公開的設定分組，並記錄哪個儲存區持久化它們。

```csharp
using SettingsRegistry registry = profile.CreateRegistry(store);
```

`CreateRegistry` 依撰寫順序登錄每項設定。**清單中的空槽會擲回**而不是被略過 — 執行階段悄悄從選單中丟掉一項設定
比一次響亮的失敗更糟。

`StoreKind` 是 `Automatic`（安裝了 WagSave 時為 WagSave，否則為 PlayerPrefs）或 `PlayerPrefs`。
`SettingsStoreFactory` 解析它。`IsDefault` 標記當多個設定檔共用一個 Resources 資料夾時管理器使用的那個。

## `Guard` 與錯誤

每個公開進入點都透過 `Guard` 驗證，每個 WagSettings 錯誤都遵循一個契約：**create → log → throw**。

```csharp
Guard.AgainstNull(store, nameof(store));
Guard.AgainstNullOrEmpty(value, nameof(value));
Guard.AgainstInvalidKey(key, nameof(key));
Guard.AgainstNumberNotInRange(value, 0, 10, nameof(value));
```

有效的鍵非空、非空白，且不含 `"` `\` `{` `}` `,` `:` 與控制字元。允許點，並且點是約定的分組分隔符：
`audio.master`、`display.window_mode`。

訂閱 `WagSettingsLog.ErrorLogged` 以觀察失敗 — 它在例外擲回**之前**立即觸發，所以即使上游有人捕捉了它，你也能
看到錯誤。

```csharp
WagSettingsLog.ErrorLogged += exception => Debug.LogException(exception);
```
