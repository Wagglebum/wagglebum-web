# 無障礙

UI 縮放、色盲校正、減少動態效果，以及字幕大小與背景。這些**立即**套用 — 選擇色盲預設或文字大小的人必須看到效果才能
判斷，把它藏在 Apply 按鈕後面會讓設定幾乎無法使用。

## 色盲校正

兩種不同的轉換很容易混淆，而發行錯的那個比什麼都不發行更糟：

| | 它做什麼 | 給誰用 |
|---|---|---|
| **模擬** | 展示某種色覺缺陷*看起來的樣子* | **你**，預覽你的 UI |
| **Daltonization** | 把資訊移到玩家*能*分辨的通道 | **玩家** |

對已經有該缺陷的人套用模擬矩陣幫不了任何人 — 只會讓他們的螢幕更糟。`GetDaltonizationMatrix` 才是該發行的：

```csharp
ColorMatrix correction = ColorblindCorrection.GetDaltonizationMatrix(ColorblindPreset.Deuteranopia);
```

模擬矩陣是廣泛使用的 Viénot–Brettel–Mollon 近似。Daltonization 由它們導出為 `I + E·(I − S)`，其中 `E` 重新分配
模擬誤差 — 於是紅綠線索變成藍黃線索。

| 預設 | 影響 | 大約 |
|---|---|---|
| `Protanopia` | 紅色敏感度 | 1% 的男性 |
| `Deuteranopia` | 綠色敏感度 | 6% 的男性 — 最常見 |
| `Tritanopia` | 藍色敏感度 | 罕見，男女相同 |
| `Achromatopsia` | 無色覺 | 非常罕見 |

**Achromatopsia 有意傳回單位矩陣。** 沒有色覺就沒有可以把資訊移進去的通道，所以重新分配誤差只會扭曲影像。改用
對比與形狀來處理。

> 這些是近似，不是臨床儀器。它們有幫助，但**不能替代**同時透過形狀、圖樣、位置與文字傳達資訊。無法分辨你的紅色
> 與綠色標記的玩家需要它們在色相之外有所不同。

## 設定

每個鍵都是選用的；留空一個，那個方面就不受管理。

| 設定 | 類型 | 鍵 | 範圍 |
|---|---|---|---|
| UI 縮放 | `FloatSetting` | `accessibility.uiScale` | 限制 0.5–2 |
| 色盲預設 | `IntSetting` / `EnumSetting` | `accessibility.colorblindPreset` | `ColorblindPreset` |
| 減少動態效果 | `BoolSetting` | `accessibility.reduceMotion` | |
| 字幕縮放 | `FloatSetting` | `accessibility.subtitleScale` | 限制 0.5–3 |
| 字幕背景 | `FloatSetting` | `accessibility.subtitleBackground` | 不透明度限制 0–1 |

一切在到達你的 UI 之前都被限制，包括 `NaN`，它備援到合理的預設值而不是傳播。來自舊建置的儲存值或手動編輯的存檔
絕不能讓玩家面對一個無法閱讀或關閉的介面。

字幕的範圍比 UI 更寬（最高 3×），因為字幕易讀性常常是最受請求的無障礙功能，而能放進螢幕的選單比能從沙發上讀到
的對白門檻更低。

## 接線

值是**發布的，不是強加的**。UI 縮放對 uGUI 的 `CanvasScaler`、UI Toolkit 面板與客製 HUD 意味著不同的東西，所以每個
值都作為 `UnityEvent` 觸發並設為全域著色器值。在檢視器中接線：

```csharp
public void SetUiScale(float scale)
{
    _canvasScaler.scaleFactor = scale;
}

public void SetColorblindPreset(ColorblindPreset preset)
{
    _correctionVolume.weight = preset == ColorblindPreset.None ? 0f : 1f;
}
```

校正矩陣也上傳到一個全域著色器矩陣，預設為 `_WagSettingsColorblindMatrix`，供全螢幕效果直接讀取。減少動態效果把
`_WagSettingsReduceMotion` 設為 1 或 0。兩個屬性名稱都可設定。

**減少動態效果**有意只是一個發布的旗標 — 什麼算過多的動態效果因遊戲而異。鏡頭晃動、螢幕空間模糊、視差、大型 UI
轉場與自動播放的過場鏡頭運動是常見嫌疑對象。

## 設定它

1. 建立你想要的設定並加入你的 `SettingsProfile`。
2. **Add Component → WaggleBum → WagSettings → Accessibility Applier**。
3. 把每個事件接到你的 UI。
4. 放在 **WagSettings Manager** 之下，它啟動時會連接。

## 什麼會擲回，什麼只是警告

| 情況 | 結果 |
|---|---|
| 設定檔中不存在的鍵 | **擲回** — `KeyNotFoundException` |
| 儲存的預設不是已知值 | **警告**，不套用校正 |
| 任何超出範圍的值，包括 `NaN` | 靜默**限制** — 這是正常的，不是錯誤 |

## 套用模式

預設為 `Immediate`，你應該保持這樣。模式見[擴充性](../Extensibility.md)。
