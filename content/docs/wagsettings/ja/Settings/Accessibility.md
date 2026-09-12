# アクセシビリティ

UI スケール、色覚補正、モーション削減、字幕のサイズと背景。これらは**即座に**適用されます — 色覚プリセットや
テキストサイズを選ぶ人は、判断するために効果を見る必要があり、それを Apply ボタンの後ろに隠すと設定はほとんど
使い物になりません。

## 色覚補正

2 つの異なる変換は混同しやすく、間違った方を出荷するのは何も出荷しないより悪いです。

| | すること | 対象 |
|---|---|---|
| **シミュレーション** | 色覚特性が*どう見えるか*を示す | **あなた**。UI のプレビュー用 |
| **ダルトナイゼーション** | 情報をプレイヤーが*区別できる*チャンネルに移す | **プレイヤー** |

その特性をすでに持つ人にシミュレーション行列を適用しても誰の助けにもなりません — 画面が悪くなるだけです。
出荷すべきは `GetDaltonizationMatrix` です。

```csharp
ColorMatrix correction = ColorblindCorrection.GetDaltonizationMatrix(ColorblindPreset.Deuteranopia);
```

シミュレーション行列は広く使われる Viénot–Brettel–Mollon の近似です。ダルトナイゼーションはそこから
`I + E·(I − S)` として導かれ、`E` がシミュレーション誤差を再分配します — 赤緑の手がかりが青黄の手がかりに
なるように。

| プリセット | 影響 | おおよそ |
|---|---|---|
| `Protanopia` | 赤の感度 | 男性の 1% |
| `Deuteranopia` | 緑の感度 | 男性の 6% — 最も一般的 |
| `Tritanopia` | 青の感度 | まれ。男女同程度 |
| `Achromatopsia` | 色覚なし | 非常にまれ |

**Achromatopsia は意図的に単位行列を返します。** 色覚がなければ情報を移す先のチャンネルがなく、誤差の再分配は
画像を歪めるだけです。代わりにコントラストと形で対処してください。

> これらは近似であり、臨床機器ではありません。助けにはなりますが、形、パターン、位置、テキストでも情報を伝える
> ことの**代わりにはなりません**。赤と緑のマーカーを区別できないプレイヤーには、色相以上の違いが必要です。

## 設定

すべてのキーは任意です。空にしておけば、その側面は管理されません。

| 設定 | 型 | キー | 範囲 |
|---|---|---|---|
| UI スケール | `FloatSetting` | `accessibility.uiScale` | 0.5–2 に丸める |
| 色覚プリセット | `IntSetting` / `EnumSetting` | `accessibility.colorblindPreset` | `ColorblindPreset` |
| モーション削減 | `BoolSetting` | `accessibility.reduceMotion` | |
| 字幕スケール | `FloatSetting` | `accessibility.subtitleScale` | 0.5–3 に丸める |
| 字幕背景 | `FloatSetting` | `accessibility.subtitleBackground` | 不透明度 0–1 に丸める |

すべては UI に届く前に丸められ、`NaN` も含まれます。`NaN` は伝播せず、まともな既定値にフォールバックします。
古いビルドの保存値や手で編集したセーブが、プレイヤーを読めない・閉じられないインターフェイスに置き去りにする
ことがあってはなりません。

字幕は UI より広い範囲 (最大 3×) を得ます。字幕の読みやすさはしばしば最も要望の多いアクセシビリティ機能であり、
画面に収まるメニューは、ソファから読める台詞より低いハードルだからです。

## 配線

値は**公開されるのであって、押し付けられません**。UI スケールは uGUI の `CanvasScaler`、UI Toolkit のパネル、
独自の HUD でそれぞれ意味が異なるので、各値は `UnityEvent` として発生し、グローバルシェーダー値として設定
されます。インスペクターで配線してください。

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

補正行列はフルスクリーンエフェクトが直接読めるよう、グローバルシェーダー行列、既定では
`_WagSettingsColorblindMatrix` にもアップロードされます。モーション削減は `_WagSettingsReduceMotion` を 1 または 0
に設定します。どちらのプロパティ名も設定可能です。

**モーション削減**は意図的に公開されたフラグにすぎません — 何が過剰な動きに当たるかはゲームごとに異なります。
カメラシェイク、スクリーンスペースのブラー、パララックス、大きな UI トランジション、自動再生カットシーンの
動きが常連です。

## セットアップ

1. 欲しい設定を作り、`SettingsProfile` に追加する。
2. **Add Component → WaggleBum → WagSettings → Accessibility Applier**。
3. 各イベントを UI に配線する。
4. **WagSettings Manager** の下に置く。マネージャーが起動時に接続します。

## 例外を投げるもの、警告だけのもの

| 状況 | 結果 |
|---|---|
| プロファイルにないキー | **例外** — `KeyNotFoundException` |
| 既知の値でない保存されたプリセット | **警告**し、補正を適用しない |
| `NaN` を含む範囲外の値 | 黙って**丸める** — これは正常であり、エラーではない |

## 適用モード

既定は `Immediate` で、そのままにすべきです。モードについては[拡張性](../Extensibility.md)を参照してください。
