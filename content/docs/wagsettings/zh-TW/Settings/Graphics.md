# 圖形

畫質等級、Gamma、渲染縮放、後製效果開關與硬體升頻。這些在 **Apply 按鈕**時套用 — 畫質等級變化會重新配置渲染
目標，你不希望它在有人捲動下拉清單時發生。

## 管線感知

WagSettings 在 Built-in 管線、URP 與 HDRP 上運作，並且**不**參考其中任何一個。參考 URP 意味著 WagSettings 在
Built-in 專案中拒絕編譯 — 對一個必須處處可用的資源來說不可接受。

管線改由作用中資源的類型名稱識別：

```csharp
RenderPipelineKind kind = applier.Pipeline;   // BuiltIn, Universal, HighDefinition or Custom
```

無法識別的可編程管線回報為 `Custom` 而不是 `BuiltIn`，所以它永遠不會被提供它可能沒有的功能。

### 各管線支援什麼

| 功能 | Built-in | URP | HDRP | Custom |
|---|:--:|:--:|:--:|:--:|
| 畫質等級 | ✅ | ✅ | ✅ | ✅ |
| Gamma | ✅ | ✅ | ✅ | ✅ |
| 渲染縮放 | ❌ | ✅ | ❌ | ❌ |
| 光暈 / AO / 動態模糊 | ✅ | ✅ | ✅ | ✅ |
| 升頻 (DLSS / FSR) | ❌ | ✅ | ✅ | ❌ |

渲染縮放是 URP 資源屬性；HDRP 有動態解析度作為替代。升頻需要可編程管線。

**無法使用的功能會帶著警告略過，絕不擲回例外。** 跨管線發行同一個設定選單、或以後切換管線的專案繼續運作。顯示
之前先問：

```csharp
renderScaleSlider.SetEnabled(applier.SupportsFeature(GraphicsFeature.RenderScale));
```

警告每個功能只觸發一次，而不是每次套用都觸發。

## 設定

每個鍵都是選用的；留空一個，那個方面就不受管理。

| 設定 | 類型 | 鍵 | 說明 |
|---|---|---|---|
| 畫質等級 | `IntSetting` | `graphics.qualityTier` | Project Settings → Quality 的索引。限制到專案定義的範圍。 |
| Gamma | `FloatSetting` | `graphics.gamma` | 作為全域著色器 float 發布。 |
| 渲染縮放 | `FloatSetting` | `graphics.renderScale` | 僅 URP。限制到 0.1–2。 |
| 升頻 | `IntSetting` / `EnumSetting` | `graphics.upscaling` | 你自己的值；以事件觸發。**選擇加入**：鍵預設為空，因為可用的升頻器取決於管線。 |
| 光暈 | `BoolSetting` | `graphics.bloom` | |
| 環境光遮蔽 | `BoolSetting` | `graphics.ambientOcclusion` | |
| 動態模糊 | `BoolSetting` | `graphics.motionBlur` | |

## 後製效果：WagSettings 發布，你來套用

光暈位於 URP 或 HDRP 的 **Volume 設定檔**中，或 Built-in 管線的後製處理堆疊中。伸手進任何一個都意味著對你的專案
可能沒有的套件的硬相依。所以 WagSettings 以兩種方式發布值，讓你來連接：

1. **一個全域著色器 float**，設為 `1` 或 `0` — 供直接讀取它的著色器使用。
2. **一個 `UnityEvent<bool>`**，在檢視器中接到你的 Volume 元件、後製處理層或你自己的方法。

```csharp
public void SetBloom(bool enabled)
{
    if (_volume.profile.TryGet(out Bloom bloom))
    {
        bloom.active = enabled;
    }
}
```

在檢視器中把那個方法拖到開關的事件上就完成了。升頻也一樣：選中的值作為事件觸發，供你管線的 DLSS 或 FSR 組態
使用。

這是有意的取捨 — 用一點接線換取一個能安裝進任何專案的資源。

## Gamma

Gamma 作為全域著色器 float 發布，預設為 `_WagSettingsGamma`，因為沒有與管線無關的 Gamma 控制。在你的調色著色器中
讀取它，或透過同樣的事件模式把它餵給 URP/HDRP 的 `LiftGammaGain` 覆寫。屬性名稱可設定。

## 設定它

1. 建立你想要的設定並加入你的 `SettingsProfile`。
2. **Add Component → WaggleBum → WagSettings → Quality Applier**。首次加入時它預置光暈、環境光遮蔽與動態模糊開關。
3. 把每個開關的事件接到擁有該效果的東西上。
4. 放在 **WagSettings Manager** 之下，它啟動時會連接。

## 什麼會擲回，什麼只是警告

| 情況 | 結果 |
|---|---|
| 參考設定檔中不存在的鍵的開關 | **擲回** — `KeyNotFoundException` |
| 超出專案等級的畫質等級 | **限制** — 來自有更多等級的建置的儲存等級絕不能導致當機 |
| 超出 0.1–2 的渲染縮放 | **限制** |
| 管線沒有的功能 | **警告一次**，略過 |
| 在沒有 `renderScale` 屬性的管線資源上的渲染縮放 | **警告一次**，略過 |

## 套用模式

預設為 `OnApply`。如果你想讓 Gamma 即時預覽，給它一個單獨的、設為 `Immediate` 且只填了 Gamma 鍵的 `QualityApplier`
— 見[擴充性](../Extensibility.md)。
