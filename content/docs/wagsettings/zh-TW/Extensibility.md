# 擴充性

加入一項設定只觸及一個資源與一個清單。下次按 Play 它就在選單裡了。只有當值必須*做*某件事時才需要程式碼，即便如此
通常也只是一行。

## 加入一項設定

**捷徑：**編輯器的 **Settings Profile** 頁面 (*Tools → WaggleBum → WagSettings → Editor*)，**新增設定**。在對話方塊裡選一個
類型，輸入鍵 — 輸入時即被檢查 — 設定預設值，滑桿的話再設範圍，按 **建立**。資源在設定檔旁建立並附加到設定檔中。
完成；按 Play。

![已輸入鍵的新增設定對話方塊及其將建立的資源](../Images/add-setting-dialog.png)

**手動：**

**1. 建立資源。** *Assets → Create → WaggleBum → WagSettings →* 你需要的類型：

| 類型 | 選單中的控制項 | 重要欄位 |
|---|---|---|
| Float Setting | 滑桿 | **Key**、**Default**、**Minimum**、**Maximum** |
| Int Setting | 整數滑桿 | **Key**、**Default**、**Minimum**、**Maximum** |
| Bool Setting | 開關 | **Key**、**Default** |
| Enum Setting | 你列出的 **Options** 的下拉清單 | **Key**、**Default** (索引)、**Options** |
| String Setting | 文字欄位 | **Key**、**Default** |

![Assets → Create → WaggleBum → WagSettings 選單](../Images/create-setting-menu.png)

鍵是 `category.name`：點之前的部分是**索引標籤**，之後的部分成為**標籤**。`gameplay.difficulty` 以 "Difficulty"
落在 Gameplay 索引標籤；`gameplay.cameraShake` 顯示為 "Camera Shake"。沒有點的鍵落在 General 下。

> 鍵就是儲存鍵。發行後更改它會讓每個玩家儲存的值變成孤兒，所以把它當作永久的。鍵不能包含 `"` `\` `{` `}` `,` `:`
> 或控制字元。

**2. 把它加入 `SettingsProfile`。** 把資源放進設定檔的清單 — 初始設定在 `Assets/WagSettings/Resources` 產生的那個，
或你自己的。清單中的順序就是選單中的順序。以後重新執行初始設定會保留你手動加入的一切；它只取代它自己寫的項目。

![Inspector 中帶有設定清單的 SettingsProfile](../Images/profile-inspector.png)

**3. 按 Play。** 在 UI Toolkit 選單中，那一列就在那裡：正確的索引標籤、正確的控制項、正確的標籤，並且
Apply / Revert / Reset、搜尋、變更標記與持久化都已為它運作。

**在 uGUI 選單中**，列是手動放置的，所以加入一列：在預製物件中複製一個現有的列
(`Sample Scenes/Quick Start/Prefabs/WagSettingsMenu (uGUI).prefab` 每種類型各有一個)，放進正確的分類面板，並設定
繫結器的 **Key**。這就是兩個框架之間的全部區別 — 見[快速入門](GettingStarted.md)。

### 讀取它

只要有 `WagSettingsManager` 在執行，從任何地方：

```csharp
int difficulty = WagSettings.Get<int>("gameplay.difficulty");                 // the pending value
WagSettings.Definition<int>("gameplay.difficulty").Changed += value => { };   // Set, Revert, Reset
```

對於大多數遊戲玩法設定，這就是全部程式碼：在需要的地方讀取它，或者回應事件。本頁的其餘部分是給必須驅動 Unity 本身
的值準備的。

### 檢視器在你輸入時檢查鍵

否則格式錯誤的鍵只會在設定首次*被使用*時失敗 — 常常是在另一個場景、另一天，離犯錯的地方很遠。檢視器立即回報：

| | 回報為 | 例子 |
|---|---|---|
| 無法使用 | **Error** | 空、禁止的字元、首尾空白 |
| 能用但不合慣例 | **Warning** | 沒有分類前綴、`Audio.Master` 的大小寫、點之間的空段 |

![Inspector 標出設定資源上格式錯誤的鍵](../Images/inspector-key-check.png)

Warning 是建議，不是障礙 — 沒有分類的鍵仍然能用，只是落在 "General" 下。

### 查看目前的值

不在播放時，檢視器只顯示撰寫的欄位，因為目前的值是執行階段狀態，並且有意從不儲存進資源 — 玩家的選擇屬於他們的
存檔資料，而不是你發行的檔案。

進入播放模式，檢視器顯示即時值、是否有未套用的更改，以及還原或重設它的按鈕。遊戲明明以 `0.25` 執行而 Default 仍
顯示 `0.8` 的資源是在正確運作。

## 撰寫套用器

套用器依排程把值變成 Unity 中的效果 — 玩家拖曳時即時，或僅在他們按 Apply 時。它知道 `UnityEngine`；核心不知道。
從 `SettingApplierBase` 衍生並提供兩樣東西：你追蹤哪些設定，以及如何推送它們。

```csharp
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Audio;
using WaggleBum.WagSettings;

public sealed class MusicVolumeApplier : SettingApplierBase
{
    [SerializeField] private AudioMixer _mixer = null!;

    private ISettingDefinition<float> _music = null!;

    protected override void ResolveSettings(SettingsRegistry registry, IList<ISettingDefinition> tracked)
    {
        _music = Require<float>(registry, "audio.music");
        tracked.Add(_music);
    }

    public override void ApplyCurrentValues()
    {
        _mixer.SetFloat("MusicVolume", AudioVolume.LinearToDecibels(_music.Value));
    }
}
```

把元件放在 **WagSettings Manager 之下**。管理器啟動時連接其下的一切；無需呼叫任何東西。(必須放在別處的套用器：
`WagSettings.Manager.Attach(applier)`，並自行中斷連接。)

基底類別處理手寫套用器容易出錯的兩件事：

1. **每個 `+=` 都有相符的 `-=`。** 設定是 ScriptableObject，所以它們比你的場景活得久。一個從不釋放的訂閱會讓元件、
   它的 GameObject 以及它們參考的一切跨場景載入存活。`Attach`/`Detach` 與 Unity 的 `OnEnable`/`OnDisable` 已為你
   接好。
2. **持久化的值在連接時套用。** 只回應 `Changed` 的套用器會讓遊戲一直執行在場景中撰寫的值上，直到玩家下次碰觸
   設定 — 一個直到有人重新載入場景才暴露的錯誤。

第三條規則仍然由你負責：**永遠不要從套用器寫入儲存區。** 套用器讀取；登錄表在 `Apply()` 中寫入，一次。

`Require` 對登錄表中不存在的鍵擲回並指出鍵名。這是有意的：一個悄悄什麼都不驅動的滑桿看起來像壞掉的遊戲而不是
壞掉的設定。

### Immediate 還是 OnApply

每個套用器上的 `Apply Mode` 欄位決定它何時動作：

| 模式 | 觸發於 | 用於 |
|---|---|---|
| `Immediate` *(預設)* | 被追蹤設定的每次變化 | 玩家拖曳時就應該聽到或看到的廉價變化 — 音量、UI 縮放 |
| `OnApply` | 登錄表透過 `Apply()` 或 `Load()` 提交 | 任何昂貴或有干擾的東西 — 解析度、畫質等級、視窗模式 |

`OnApply` 就是阻止解析度設定在下拉清單捲動時反覆折騰視窗的東西。它監聽 `SettingsRegistry.Committed`，該事件在
寫入了內容的 `Apply()` 之後與 `Load()` 之後觸發 — 兩種情況下已提交的值都真正變了。

注意 `ApplyCurrentValues()` 重新套用套用器追蹤的**全部**設定，而不只是變化的那個。對於單一套用器擁有的少數幾項
設定，這比按設定路由回呼更便宜，並且讓該方法保持為直白的「把目前狀態推進 Unity」。

## 加入新的設定*類型*

只有內建類型無法表達的值才需要。

```csharp
[CreateAssetMenu(fileName = "New Vector2Setting", menuName = "WaggleBum/WagSettings/Vector2 Setting")]
public sealed class Vector2Setting : TypedSettingAsset<Vector2>
{
}
```

這就是全部實作 — `TypedSettingAsset<T>` 提供鍵、預設值、值、變化事件與變更追蹤。該類型必須能被 Unity 序列化，
並且你使用的儲存區必須能持久化它 (`PlayerPrefsStore` 處理基本類型；見[持久化](Persistence.md))。

對於固定的選項清單，優先用 `EnumSetting` 而不是新類型 — 它儲存索引加顯示名稱，並且已經能與下拉清單 UI 配合。

## 撰寫儲存區

實作 `ISettingsStore` 以持久化到別處 — 存檔檔案、後端、測試替身。

```csharp
public sealed class MyStore : ISettingsStore
{
    public bool Has(string key)                  { ... }
    public T    Load<T>(string key, T fallback)  { ... }
    public void Save<T>(string key, T value)     { /* buffer, do not commit */ }
    public void Flush()                          { /* commit the whole batch */ }
    public void Delete(string key)               { /* buffer */ }
}
```

唯一重要的契約：**`Save` 與 `Delete` 緩衝，`Flush` 提交。** 登錄表寫入每個已變更設定然後恰好排清一次，所以每次
寫入都提交的儲存區會把一次 Apply 變成四十次往返。

對你寫的任何儲存區做往返測試 — set、save、flush、reload、assert — 與 `Tests/EditMode` 中的測試形狀相同。
