# 用語集

| 用語 | 意味 |
|---|---|
| **設定 (Setting)** | プレイヤーが変更できる 1 つの値。マスター音量、ウィンドウモード、UI スケールなど。プロジェクトでは `SettingAsset`、ランタイムでは `ISettingDefinition`。 |
| **キー (Key)** | 設定の安定した保存名。`category.name` の形 — `audio.master`。接頭辞がタブ、残りがラベル。一度出荷したら恒久。 |
| **プロファイル (Profile)** | `SettingsProfile` アセット。ゲームが公開する設定のメニュー順のリストと、それらを永続化するストア。既定のものは Resources フォルダーにある。 |
| **レジストリ (Registry)** | `SettingsRegistry`。ストアから読み込まれたプロファイルの設定に、保留値、ダーティ追跡、Apply / Revert / Reset のコマンドが付いたもの。 |
| **マネージャー (Manager)** | `WagSettingsManager` シーンコンポーネント。レジストリを所有し、その下のアプライヤーを接続し、静的 API を支える。ゲームに 1 つ。 |
| **静的 API (Static API)** | `WagSettings.Get / Set / Apply` など — マネージャーを通じて任意のスクリプトから設定を 1 行で読み書きする方法。 |
| **保留値 (Pending value)** | プレイヤーが選んだがまだ適用していない値。定義の `Value`。 |
| **適用済みベースライン (Applied baseline)** | Apply でコミットされた、またはストアから読み込まれた最後の値。 |
| **ダーティ (Dirty)** | 保留値がベースラインと異なる設定。Apply と Revert はこれで有効になる。 |
| **Apply** | すべての保留値をストアに一括でコミットする。Apply ボタンと `WagSettings.Apply()` が行うこと。 |
| **Revert** | すべての保留値を破棄し、ベースラインに戻す。 |
| **Reset** | すべての設定を記述された既定値に戻す。適用されるまで保留。 |
| **ストア (Store)** | `ISettingsStore`。値が永続化される場所。既定は `PlayerPrefsStore`、WagSave がインストールされていれば `WagSaveStore`。書き込みはバッファされ、`Flush` でコミット。 |
| **アプライヤー (Applier)** | 値を Unity 上の効果 — ミキサー音量、画面解像度、品質ティア — に変える `SettingApplierBase` コンポーネント。マネージャーの下に置く。 |
| **適用モード (Apply mode)** | アプライヤーが変更のたびに動く (Immediate) か、レジストリがコミットしたときだけ動く (OnApply) か。 |
| **バインダー (Binder)** | UI コントロールがバインドする先。UI Toolkit では定義の上の `ISettingBinder`、uGUI ではコントロール上の `…SettingBinder` コンポーネント。 |
| **カテゴリ (Category)** | キーの接頭辞から決まる、設定が入るタブ。ランタイムでは `SettingsMenuCategory`。 |
| **メニュー (Menu)** | `WagSettingsMenu` (UI Toolkit) または `WagSettingsMenuUGUI`。どちらも `ISettingsMenu`。マネージャーのレジストリを借りる。 |
| **セットアップ (Setup)** | プロジェクトをスキャンし、設定、プロファイル、ミキサーを `Assets/WagSettings/Resources` に生成するエディターページ。 |
| **マニフェスト (Manifest)** | セットアップが書き込んだものとその指紋の記録。再実行では欠けているものだけを作り、編集済みのものは決して上書きしない。 |
| **ディスプレイモード (Display mode)** | 幅、高さ、リフレッシュレート。解像度ドロップダウンはディスプレイが対応するものを列挙する。 |
| **ロケール (Locale)** | 言語コード — `en`、`es`、`ja`、`ko`、`zh-CN`、`zh-TW`。メニューのものはゲームが選び、エディターのものは Help ページで選ぶ。 |
