# はじめよう

> **プレリリース。** ランタイム、アプライヤー、両方のメニュー、エディター、セットアップ、Quick Start サンプル、
> ローカライズは揃っています。CI とストアの準備はこれからです。[CHANGELOG.md](../../CHANGELOG.md) を参照してください。

## 要件

- Unity **2022.3** (2022 LTS) 以降。
- 必須のパッケージ依存はありません。

任意で、自動検出されるもの:

- **WagSave** (`com.wagglebum.wagsave`) — 永続化をバージョン付き、クラウド同期、暗号化、マルチプロファイルの
  セーブにアップグレードします。インストールすれば WagSettings が自動で使います。
- **Input System** (`com.unity.inputsystem`) — コントロールのリバインドに必要です。
- **uGUI** (`com.unity.ugui`) — コンポーネントベースのメニュー。2022 LTS のすべてのテンプレートに含まれます。

## インストール

### tarball または Asset Store から

パッケージをインポートするか、**Window → Package Manager → + → Add package from tarball…** で追加します。

### ローカルのチェックアウトから

プロジェクトの `Packages/manifest.json` に、`WaggleBum/WagSettings` フォルダーを指すよう次を追加します。

```json
{
  "dependencies": {
    "com.wagglebum.wagsettings": "file:../../wagsettings-unity/WaggleBum/WagSettings"
  }
}
```

## インストールの確認

パッケージがインポートされると Unity がコンパイルし、WagSettings は**アクティブなビルドターゲット**に対して
スクリプティングデファイン `WAGGLEBUM_WAGSETTINGS` を公開します。ドメインリロードのたびに再公開されるので、
プラットフォームを切り替えると新しく選んだターゲットにも自動で追加されます。2 つの方法で確認できます。

![Tools → WaggleBum → WagSettings メニュー](../Images/tools-menu.png)

1. **Package Manager** — パッケージ一覧に WagSettings がバージョン 0.9.0 で表示される。
2. **スクリプティングデファイン** — **Edit → Project Settings → Player → Other Settings → Scripting
   Define Symbols** を開くと `WAGGLEBUM_WAGSETTINGS` が並んでいる。

このデファインは、ほかのアセットが WagSettings に強い依存を持たずに検出する方法でもあります。

```csharp
#if WAGGLEBUM_WAGSETTINGS
    // WagSettings is installed.
#endif
```

## まず試す: Quick Start

すべてが動くのを見る最速の方法は同梱のサンプルです。セットアップ画面が生成するものそのものに、周りのシーンを
加えたもので、UI フレームワークごとに 1 つあります。

![設定メニューを開いた状態で実行中の Quick Start シーン](../Images/quick-start-scene.png)

```
WaggleBum/WagSettings/Sample Scenes/Quick Start/
├── Quick Start (UI Toolkit).unity
├── Quick Start (uGUI).unity
├── Settings/            23 setting assets, the profile, and the mixer setup cloned
├── Prefabs/             WagSettingsMenu (uGUI).prefab - the uGUI menu, ready to copy
├── QuickStartActions    a starter Input Actions asset with Jump, Interact and Fire
└── Scripts/             QuickStartDemo, and QuickStartControls when the Input System is installed
```

どちらかのシーンを開いて Play を押します。それから:

1. **Music を下げる。** Music バスの 220 Hz トーンがライブで追従します。**Master Mute** にチェックを入れると、
   それと SFX のブリップの両方が無音になります。これが `AudioMixerApplier` が生成されたミキサーの公開
   パラメーターにデシベルで書き込んでいるところです。
2. **Window Mode か解像度を変えて Apply を押す。** 隅の HUD が画面が実際に何をしているかを報告します。Apply まで
   何も変わりません — 入力途中の解像度でウィンドウがリサイズされるべきではないので、ディスプレイ設定はコミット時に
   適用されます。
3. **Reduce Motion にチェックを入れる。** キューブが回転を止めます。**UI Scale をドラッグする。** メニューと HUD の
   両方が大きくなります。
4. **Space を押す。** HUD がジャンプを数えます。**Rebind Jump** を押し、任意のキーを押し、Apply を押す — HUD が
   新しいコントロールを名指しし、Play を止めて再開しても戻ってきます。(Input System のみ。)
5. **検索ボックスに入力する。** 一致しないタブと行が消え、クリアすると戻ります。
6. **Reset to Defaults を押し、次に Revert を押す。** Reset は適用するまで取り消せます。

Play を止め、もう一度 Play を押します。適用したものはすべて残っています。これが `PlayerPrefsStore`、または
WagSave がインストールされていれば `WagSaveStore` です。

サンプルに配線コードはありません。Quick Start オブジェクトの **WagSettings Manager** がレジストリを所有し、
その下のアプライヤーを接続します。両方のメニューはそのレジストリを借ります。`QuickStartDemo.cs` はゲーム
スクリプトがするように設定を読み返します — `WagSettings.Get<float>("audio.master")` — そしてそれ以外の部分は
すべて、デモで設定の効果が明らかになるために存在します。

## API を使う

```csharp
using WaggleBum.WagSettings;

float master = WagSettings.Get<float>("audio.master");
WagSettings.Set("audio.master", 0.8f);   // pending
WagSettings.Apply();                      // committed and saved, in one batch
```

これは動作中の **`WagSettingsManager`** — レジストリを所有し、その下のすべてのアプライヤーを接続する
コンポーネント — に解決されます。セットアップはプロファイルを `Assets/WagSettings/Resources` に置くので、
シーンに何も置かなくても起動時にマネージャーが作られます。居場所を選ぶには自分で 1 つ追加してください。
動いているものがなければ、呼び出しは例外を投げ、何を追加すべきかを伝えます。

[チートシート](Cheatsheet.md)に残りが 1 ページにまとまっています。[API](API.md) にはファサード以上を求める
コードのための下層のレジストリを含め、すべてがあります。

## 設定メニューを置く

コードなしで動くメニューへの最速ルート:

1. 設定を作り (**Assets → Create → WaggleBum → WagSettings**)、`SettingsProfile` に追加する。
2. **UI Document** GameObject を作る (*GameObject → UI Toolkit → UI Document*)。
3. そこに **WaggleBum → WagSettings → Settings Menu (UI Toolkit)** を追加する。
4. `WaggleBum/WagSettings/Runtime/UI/UIToolkit/` の `WagSettingsMenu.uxml` と `WagSettingsMenu.uss` をシェルと
   スタイルとして割り当てる。
5. UI Document の **Panel Settings** で、テーマを同じフォルダーの `WagSettingsUI.tss` に設定する。
6. **WagSettings Manager** が動いていることを確認する — プロファイル付きでシーンに配置するか、プロファイルが
   Resources フォルダーにあるために起動時に作られるか。メニューはマネージャーのプロファイルを表示します。
   メニュー自体にプロファイルを割り当てるのは、マネージャーがないときだけです。

![Play モードの UI Toolkit 設定メニュー](../Images/menu-uitoolkit.png)

Play を押します。カテゴリごとのタブ、設定ごとの行、検索フィールド、そして何かをするときだけ有効になる
Apply / Revert / Reset ボタンが得られます。

### 得られるもの

- **カテゴリごとのタブ**。プロファイルに設定が現れる順です — その順序は設計上の選択なので、アルファベット順に
  並べ替えられません。
- **設定ごとに適切なコントロール**。bool にはトグル、`EnumSetting` にはドロップダウン、範囲付きの `FloatSetting` や
  `IntSetting` にはスライダー、それ以外にはテキストフィールド — そして `display.width`、`display.height`、
  `display.refreshRate` の代わりに、ディスプレイが対応するモードの**解像度ドロップダウン 1 つ**。
- **コントローラーとキーボードのナビゲーション。** 上下で行を移動、左右でタブを切り替え、フォーカスはどこでもない
  場所ではなく最初の行から始まります。目に見えるフォーカスリングがあります。ポインターのないプレイヤーには、
  自分がどこにいるかを知る手段がほかにないからです。
- 行とそのタブの両方への**ダーティマーク**。見ていないタブでの変更も見えます。
- **利用できない設定は表示されたまま**、グレーアウトされ、理由を説明するツールチップが付きます — 隠すと、
  プレイヤーは読んだことのあるオプションを探し回ることになります。

### スタイルを変える

見た目は `WagSettingsMenu.uss` と `WagSettingsUI.tss` のテーマ変数にあります。

```css
:root {
    --wag-surface: rgb(28, 30, 34);
    --wag-text: rgb(236, 238, 242);
    --wag-accent: rgb(74, 144, 226);
    --wag-focus: rgb(255, 196, 61);
}
```

これらを自分のテーマで上書きすれば、パッケージを編集せずにメニューが追従します。

## 代わりに uGUI ルート

プロジェクトが UI Toolkit ではなく uGUI を使っているなら、同じモデルがコンポーネントベースのメニューを駆動します。
uGUI 層は `com.unity.ugui` がインストールされているときだけ Unity がコンパイルする独自のアセンブリにあるので、
UI Toolkit のみのプロジェクトがそれを抱えることはありません。

![Play モードの uGUI 設定メニュー](../Images/menu-ugui.png)

**プレハブから始めてください。** `Sample Scenes/Quick Start/Prefabs/WagSettingsMenu (uGUI).prefab` は生成された
プロファイル用の完全なメニューです — 検索付きヘッダー、タブストリップ、カテゴリごとに設定ごとの行を持つ
スクロールページ、3 つのコマンドボタン — 標準の uGUI コントロールだけで作られているので、スタイル変更は通常の
uGUI の作業です。コピーして自分のプロファイルに向け、行を削除または追加してください。代わりにゼロから作るには:

1. メニュー Canvas のルートに **Settings Menu (uGUI)** を置く。マネージャーが動いていればマネージャーの
   プロファイルを表示します。メニューに割り当てるのはマネージャーがないときだけです。
2. 各コントロールに対応するバインダーを追加し、**Key** を設定する:

| コントロール | コンポーネント |
|---|---|
| `Slider` | Slider Setting Binder |
| `Toggle` | Toggle Setting Binder |
| `Dropdown` | Dropdown Setting Binder |
| `InputField` | Input Field Setting Binder |

3. Apply / Revert / Reset には、各 `Button` に **Settings Command Button** を置いてコマンドを選ぶ。コマンドが
   何もしないときは自らグレーアウトします。
4. 検索には、`InputField` に **Settings Search Binder** を置く。
5. タブには、各ページにカテゴリ名付きの **Settings Category Panel** を置き、タブストリップにテンプレートとして
   使うボタン付きの **Settings Category Selector** を置く。

バインダーは親からメニューを見つけるので、キー以外に手で配線するものはありません。プロファイルにないキーを
指したバインダーは**例外を投げます** — 黙って何もしないコントロールは、大きな音を立てる失敗より悪いのです。

各バインダーには任意の **Row** があります — ラベルとコントロールの両方を持つオブジェクトです。カテゴリパネルは
検索が設定を絞り込むのに合わせて行を表示・非表示にします。Row を空にすると、コントロール自身のオブジェクトが
非表示になります。

ドロップダウンはオプションを `EnumSetting` から、スライダーは範囲を設定から取るので、どちらもアセットとずれる
おそれのある第 2 のコピーを持ちません。

### ラベル

バインダーは任意で `Text` に設定の表示名を入れます。2022 LTS では TextMeshPro は別パッケージなので、パッケージは
それに依存しません。TMP ラベルは自分で設定するか、ラベルを未割り当てのままにしてプレハブでテキストを記述して
ください。

### 代わりにコードで行う

```csharp
ISettingsStore store = SettingsStoreFactory.Create(profile.StoreKind);
using SettingsRegistry registry = profile.CreateRegistry(store);

var model = new SettingsMenuModel(registry, SettingBinderFactory.CreateAll(registry), ownsBinders: true);
using var view = new SettingsMenuView(shellUxml, model, ownsModel: true);

document.rootVisualElement.Add(view.Root);
view.FocusFirstRow();
```

`SettingsMenuView` はコンポーネントではなく素のクラスなので、UIDocument なしで構築して検査できます — メニューは
そうやってテストされています。

## テストの実行

パッケージには EditMode と PlayMode のテストアセンブリが同梱されています。パッケージを Unity プロジェクトに入れた
状態で、**Window → General → Test Runner** を開き、`WagSettings.Tests.EditMode` スイートを実行してください。
