# 顯示

解析度、更新率、視窗模式、VSync 與顯示器選擇。這些在 **Apply 按鈕**時套用，而不是在玩家捲動下拉清單時 — 捲動中途
調整視窗大小正是讓設定選單顯得壞掉的那種事。

## 解析度作為解析度儲存，而不是索引

大多數設定選單儲存「下拉清單中的第三項」。WagSettings 儲存實際的寬度、高度與更新率，因為硬體一變，索引就意味著
別的東西：

- 玩家給筆電接上擴充基座，或拔掉外接顯示器
- 他們把存檔移到另一台機器，或移到掌機
- 驅動程式更新改變了回報的模式

曾指向 1920×1080 的索引現在指向 800×600。實際值經得起這一切。

代價是儲存的模式可能在你面前的機器上不存在。`DisplayModeMatcher` 解決這個問題：**像素尺寸優先，更新率決勝**，最
接近的受支援模式勝出。遊戲絕不能因為解析度而拒絕啟動，所以這會**警告而不是擲回** — 見下文*什麼會擲回，什麼只是
警告*。

```csharp
var desired  = new DisplayMode(1600, 900, 60);          // not supported here
var resolved = DisplayModeMatcher.FindNearest(applier.AvailableModes, desired);  // 1920 x 1080 @ 60 Hz
```

儲存的更新率 `0` 表示**「該顯示器提供的最高值」**，這是從未設定過的遊戲的正確預設值。

## 設定

每個鍵都是選用的。留空一個，套用器就不管理那個方面，所以只想要視窗模式開關的專案可以恰好只有它。

| 設定 | 類型 | 鍵 | 說明 |
|---|---|---|---|
| 寬度 | `IntSetting` | `display.width` | 像素。也需要高度鍵。 |
| 高度 | `IntSetting` | `display.height` | 像素。也需要寬度鍵。 |
| 更新率 | `IntSetting` | `display.refreshRate` | Hz。`0` 表示可用的最高值。 |
| 視窗模式 | `IntSetting` / `EnumSetting` | `display.windowMode` | `0` 視窗，`1` 無邊框，`2` 全螢幕。 |
| VSync | `IntSetting` / `EnumSetting` | `display.vsync` | `0` 關，`1` 每次垂直空白，`2` 每隔一次。限制到 0–2。 |
| 顯示器 | `IntSetting` | `display.monitor` | 從零開始的顯示器索引。**選擇加入**：套用器的鍵預設為空，因為在顯示器之間移動視窗的干擾足以讓它成為一個選擇，初始設定也不產生它。 |

`WindowMode` 是 WagSettings 的列舉而非 Unity 的 `FullScreenMode`：這三個是玩家理解的選項，編號跨 Unity 版本穩定，
並且值會進入存檔資料。

## 設定它

1. 建立上面的設定並加入你的 `SettingsProfile`。
2. **Add Component → WaggleBum → WagSettings → Resolution Applier**。鍵已預填為約定名稱；把你不想管理的留空。
3. 放在 **WagSettings Manager** 之下，它啟動時會連接。或者勾選 Display 執行初始設定，略過第 1、2 步。

## 解析度下拉清單

兩種選單都把寬度、高度與更新率顯示為**一個列出顯示器支援模式的下拉清單** — `1920 × 1080 @ 144 Hz`、
`1920 × 1080 @ 60 Hz` 等，最寬的在前。那是 `ResolutionBinder`，三項設定之上的複合體。選單向
`ScreenModes.Query()` 詢問硬體能做什麼，把清單交給 `SettingBinderFactory.CreateAll(registry, modes)`，它把三個
摺疊成一個繫結器，站在設定檔中 `display.width` 原來的位置。搜尋 "resolution" 能找到它。

![列出顯示器模式的解析度下拉選單](../../Images/resolution-dropdown.png)

玩家看到的是一個選擇。儲存區看到的仍然是三個數字，這正是上一節的要點：儲存的模式清單索引在下一台顯示器上意味著
別的東西；`1920 × 1080` 不會。

如果儲存的值與顯示器能做的任何模式都不相符 — 一個從更大顯示器帶過來的設定 — 下拉清單會以 **Custom: 2560 × 1440 @
165 Hz** 打頭，而不是悄悄吸附，套用器在套用時仍會選擇最接近的模式。選擇任何真實模式，自訂項目就消失。

設定檔中沒有 `display.refreshRate` 設定時，清單只有尺寸，按更新率重複的項會合併。

### 當平台不回報任何模式時

有些平台傳回空的 `Screen.resolutions` — **macOS 編輯器就是**，WebGL 也是。放任不管會讓下拉清單無物可提供，套用器
無物可吸附，並且在編輯器裡你永遠看不到解析度變化。所以 `ScreenModes.Query()` 備援到不大於目前顯示器的常見 16:9
與 16:10 尺寸，各自使用顯示器的更新率，顯示器本身排在首位。在回報模式的平台上的建置使用真實清單；備援只是讓你能
在原本無反應的地方試用選單。

### 手動完成

如果你不用任一選單，同樣的零件歸你使用：

```csharp
var binder = new ResolutionBinder(width, height, refreshRate, ScreenModes.Query());

foreach (string option in binder.Options) { /* add to your control */ }
binder.Select(index);                       // writes width, height and refresh rate
```

或者從 `applier.AvailableModes`（同一個清單）自己寫各部分：

```csharp
width.Set(mode.Width);
height.Set(mode.Height);
refreshRate.Set(mode.RoundedRefreshRate);
```

套用器的清單是快取的；如果遊戲執行時接入了顯示器，呼叫 `RefreshAvailableModes()`。

## 什麼會擲回，什麼只是警告

顯示設定是最可能在玩家無過錯的情況下出錯的，所以這種劃分是有意的：**開發者錯誤擲回，硬體不相符警告。**

| 情況 | 結果 |
|---|---|
| 設了寬度鍵沒設高度鍵，或反之 | **擲回** — 只有開發者能修的設定錯誤 |
| 設定檔中不存在的鍵 | **擲回** — `KeyNotFoundException` |
| 儲存的模式此顯示器不支援 | **警告**，套用最接近的受支援模式 |
| 儲存的視窗模式不是可識別的值 | **警告**，備援到視窗模式 |
| 選擇的顯示器未連接 | **警告**，視窗留在原處 |
| 平台根本不回報模式 | **警告**，不動解析度 |

訂閱警告以在開發期間看到它們：

```csharp
WagSettingsLog.WarningLogged += message => Debug.LogWarning(message);
```

## 套用模式

預設為 `OnApply`。改為 `Immediate` 意味著解析度輸入欄位的每次按鍵都會調整視窗大小，這很少是你想要的 — 見
[擴充性](../Extensibility.md)。

注意 VSync 與顯示器選擇按同一節奏套用。如果你希望 VSync 即時切換，給它一個單獨的、設為 `Immediate` 的套用器。
