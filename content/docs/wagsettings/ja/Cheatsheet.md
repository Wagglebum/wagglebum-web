# WagSettings チートシート

1 ページ。ほかはすべて[ドキュメント](index.md)にあります。

## ゼロからメニューへ

**Tools → WaggleBum → WagSettings → Setup** でカテゴリにチェックを入れ、**Generate** を押します。設定アセット、
それらを保持する `SettingsProfile`、Master・Music・SFX を公開した `AudioMixer` が、すべて
`Assets/WagSettings/Resources/` 以下に生成されます。再実行は安全です。欠けているものだけを作り、編集済みのアセットは
決して上書きしません。

次に、メニューシーンで:

| UI Toolkit | uGUI |
|---|---|
| **UI Document** を作り、その上に **Settings Menu (UI Toolkit)** を追加。プロファイル、`WagSettingsMenu.uxml`、`WagSettingsMenu.uss` を割り当て、Panel Settings のテーマを `WagSettingsUI.tss` に設定。 | `Sample Scenes/Quick Start/Prefabs/WagSettingsMenu (uGUI).prefab` をコピーし、自分のプロファイルに向ける。 |

Play を押します。プロファイルが Resources にあるので、起動時に **WagSettings Manager** が作られ、メニューにその
プロファイルが表示されます。マネージャーの居場所を選ぶ — そしてアプライヤーの置き場を用意する — には、
*WaggleBum → WagSettings → WagSettings Manager* を自分でシーンに追加してください。

## キー

`category.name`。ドットの前がタブ、後ろがラベルになります。

```
audio.master   audio.music   audio.sfx   audio.master.mute
display.width  display.height  display.refreshRate  display.windowMode  display.vsync
graphics.qualityTier  graphics.gamma  graphics.renderScale  graphics.bloom  graphics.ambientOcclusion  graphics.motionBlur
accessibility.uiScale  accessibility.colorblindPreset  accessibility.reduceMotion  accessibility.subtitleScale  accessibility.subtitleBackground
controls.rebinds  controls.sensitivity  controls.invertY
```

これらがセットアップが生成し、各アプライヤーが既定でバインドするものです。独自のものは
**Assets → Create → WaggleBum → WagSettings → …** で追加し、アセットをプロファイルに加えてください。

## コードでの読み書き

```csharp
using WaggleBum.WagSettings;

float master = WagSettings.Get<float>("audio.master");
WagSettings.Set("audio.master", 0.8f);                       // pending - the game does not change yet
WagSettings.Definition<float>("audio.master").Changed += value => { };

WagSettings.IsDirty;        // anything pending?
WagSettings.Apply();        // write every pending value to the store, in one batch
WagSettings.Revert();       // throw pending values away
WagSettings.ResetAll();     // authored defaults, pending until applied
```

これは `WagSettingsManager` が動いているところならどこでも動きます — 自分で配置したものでも、プロファイルが
Resources フォルダーにあるために起動時に作られたものでも。どちらもなければ、すべての呼び出しが例外を投げ、
何を追加すべきかを伝えます。ファサード以上のものが欲しいときは `WagSettings.Registry` がレジストリそのものです。

## アプライヤー

アプライヤーは値を Unity 上の効果に変えます。コンポーネントを **WagSettings Manager の下**に追加し、駆動する
対象を割り当ててください — マネージャーは起動時にその下のすべてを接続します。書くコードはありません。

| アプライヤー | 駆動するもの | 適用 |
|---|---|---|
| Audio Mixer Applier | 割り当てた `AudioMixer` の公開パラメーター | ライブ |
| Resolution Applier | `Screen` の解像度、ウィンドウモード、VSync | Apply 時 |
| Quality Applier | 品質ティア、ガンマ、レンダースケール、ポストエフェクトのトグル | ライブ |
| Accessibility Applier | UI スケール、色覚マトリクス、モーション削減、字幕 — イベントとシェーダーグローバルとして | ライブ |
| Rebind Applier | `InputActionAsset` のバインディングオーバーライド *(Input System)* | ライブ |

`Attach` はレジストリにないキーで例外を投げます。アプライヤー上のキーを空にすればスキップされます。別の場所に
置かなければならないアプライヤーは `WagSettings.Manager.Attach(applier)` で。

## バインダー (uGUI)

コントロールにバインダーを付け、キーを設定します。親からメニューを見つけます。

| コントロール | バインダー |
|---|---|
| `Slider` | Slider Setting Binder |
| `Toggle` | Toggle Setting Binder |
| `Dropdown` | Dropdown Setting Binder — オプションは `EnumSetting` から、`display.resolution` ならディスプレイから |
| `InputField` | Input Field Setting Binder |
| `Button` | Settings Command Button — Apply、Revert、Reset |
| `InputField` | Settings Search Binder |

UI Toolkit にはこれらは不要です。行はプロファイルから構築されます。

## ものの場所

| | |
|---|---|
| 生成されたアセット | `Assets/WagSettings/Resources/` |
| サンプル | `WaggleBum/WagSettings/Sample Scenes/Quick Start/` — UI フレームワークごとに 1 シーン |
| uGUI メニューのプレハブ | `…/Quick Start/Prefabs/WagSettingsMenu (uGUI).prefab` |
| メニューのスタイル | `Runtime/UI/UIToolkit/WagSettingsMenu.uss` と `WagSettingsUI.tss` の変数 |
| セットアップ | Tools → WaggleBum → WagSettings → Setup |
| マネージャー | *WaggleBum → WagSettings → WagSettings Manager*、または起動時に Resources から作成 |

## 例外を投げるとき

大きな音で、意図的に。プロファイルにないキーのバインダー、レジストリにないキーのアプライヤー、公開されていない
ミキサーパラメーター、プロファイルの空きスロット。それぞれキーを名指しします。黙って何もしないコントロールは、
理由を告げる失敗より悪いのです。
