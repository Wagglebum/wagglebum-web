# 音訊

WagSettings 用你的設定驅動一個 `AudioMixer`，把每個線性音量滑桿轉換為混音器真正期望的分貝。音量在玩家拖曳時即時
套用 — 這是選擇音量的唯一合理方式。

## 轉換為何重要

混音器以**分貝**運作，而分貝是對數的。滑桿是**線性**的。把滑桿值直接餵給 `AudioMixer.SetFloat`，你就得到經典
錯誤：滑桿下半段聽起來一模一樣，所有可聞的變化都擠在頂端十分之一。

`AudioVolume` 做這個對應，`20·log₁₀(x)`，下限為 −80 dB：

| 滑桿 | 分貝 |
|---|---|
| `1.0` | `0 dB` — 全音量 |
| `0.5` | `−6.02 dB` — 一半響度 |
| `0.25` | `−12.04 dB` |
| `0.0` | `−80 dB` — 靜音 |

```csharp
float decibels = AudioVolume.LinearToDecibels(0.5f);   // -6.0206
float slider   = AudioVolume.DecibelsToLinear(-6.02f); //  0.5
```

它位於 `Runtime/Core`，不相依 `UnityEngine`，所以可以獨立使用與測試。

## 快捷方式

勾選 Audio 執行 **Tools → WaggleBum → WagSettings → Setup**。它產生四項音訊設定，複製一個帶 Master、Music 與 SFX
群組且其音量已公開的混音器，套用器的預設值與兩者相符。在管理器下加入一個 Audio Mixer Applier 並指定
`WagSettingsMixer`。見[初始設定](../Setup.md)。

本頁的其餘部分講的是它替你做了什麼，供你想以不同方式做時參考。

## 手動設定

**1. 公開混音器參數。** 在你的 `AudioMixer` 中選擇一個群組，在 Inspector 中右鍵它的 **Volume** 欄位並選擇
**Expose 'Volume (of Group)' to script**。然後在 Audio Mixer 視窗的 **Exposed Parameters** 下拉清單中，把它重新命名為
穩定的名稱 — `MasterVolume`、`MusicVolume` 等。

> 這一步是人們遺漏的。未公開的參數意味著玩家的滑桿悄悄什麼都不做，所以 WagSettings 會帶著參數名稱擲回，而不是
> 靜靜失敗。

**2. 建立設定。** 每條匯流排一個 `FloatSetting`，可選地每個靜音開關一個 `BoolSetting`：

| 設定 | 類型 | 鍵 | 預設值 |
|---|---|---|---|
| 主音量 | `FloatSetting` | `audio.master` | `1` |
| 主靜音 | `BoolSetting` | `audio.master.mute` | `false` |
| 音樂音量 | `FloatSetting` | `audio.music` | `0.8` |
| 音效音量 | `FloatSetting` | `audio.sfx` | `1` |

把它們加入你的 `SettingsProfile`。

**3. 加入套用器。** *Add Component → WaggleBum → WagSettings → Audio Mixer Applier*。首次加入時它預置三條匯流排 —
帶靜音的主匯流排、不帶靜音的音樂與音效 — 正是上面的設定以及隨套件混音器範本公開的群組，所以常見情況下無需填寫
任何東西。指定你的混音器，然後對每條匯流排：

| 欄位 | 含義 |
|---|---|
| **Volume Key** | 持有該匯流排 0–1 音量的 float 設定的鍵。**留空表示略過該匯流排。** |
| **Mute Key** | 使該匯流排靜音的 bool 設定的鍵。匯流排沒有靜音開關時留空。 |
| **Exposed Parameter** | 你在混音器上公開的名稱，例如 `MasterVolume`。 |

把不用的匯流排的音量鍵留空，它就會被略過。想要語音或 UI 匯流排？加入一條匯流排，給它一項設定並公開參數 — 套用器
不會預置設定不存在的匯流排，因為 `Attach` 對缺少的鍵擲回，而一個直到被清理前都擲回的新元件是糟糕的預設值。

**4. 放在 WagSettings Manager 之下。** 管理器啟動時連接其下的每個套用器；無需呼叫任何東西。必須放在別處的套用器：
`WagSettings.Manager.Attach(applier)`。

## 靜音

靜音把匯流排驅動到 −80 dB **而不碰儲存的音量**，所以取消靜音恰好恢復玩家選擇的音量。靜音設定像其他設定一樣
持久化，所以靜音狀態退出的玩家以靜音狀態啟動。

## 什麼會擲回，以及為什麼

音訊設定錯誤天生是無聲的 — 一個什麼都不做的滑桿看起來像壞掉的遊戲而不是壞掉的設定。所以這些是響亮的：

| 情況 | 結果 |
|---|---|
| 混音器上找不到公開參數 | `InvalidOperationException`，指出參數及如何公開它 |
| 有音量鍵但沒有公開參數的匯流排 | `InvalidOperationException`，指出匯流排 |
| 參考設定檔中不存在的鍵的匯流排 | `KeyNotFoundException` |
| 未指定混音器 | `InvalidOperationException`，指出 GameObject |
| 音量鍵為**空**的匯流排 | 略過 — 這是專案不使用該匯流排，不是錯誤 |

## 套用模式

音訊預設為 `Immediate`，所以玩家拖曳時就能聽到變化。沒有好理由把音量變化推遲到 Apply 按鈕 — 模式見
[擴充性](../Extensibility.md)。

## 加入你自己的匯流排

匯流排只是組態。加入一個項目，指向一個 float 設定與一個公開參數，它就能運作 — 無需程式碼。要驅動不是 `AudioMixer`
參數的東西，撰寫一個套用器：見[擴充性](../Extensibility.md)。
