# 拡張性

設定の追加は、アセット 1 つとリスト 1 つに触るだけです。次に Play を押したときにはメニューにあります。コードが
必要になるのは値が何かを*する*必要があるときだけで、それでもたいていは 1 行です。

## 設定を追加する

**近道:** エディターの **Settings Profile** ページ (*Tools → WaggleBum → WagSettings → Editor*) で **設定を追加**。
ダイアログで種類を選び、キーを入力し — 入力中にチェックされます — 既定値と、スライダーなら範囲を設定し、
**作成** を押します。アセットはプロファイルの隣に作られ、プロファイルに追加されます。以上。Play を押してください。

![キーを入力した状態の設定を追加ダイアログと作成されるアセット](../Images/add-setting-dialog.png)

**手作業で:**

**1. アセットを作る。** *Assets → Create → WaggleBum → WagSettings →* 必要な型:

| 型 | メニューのコントロール | 重要なフィールド |
|---|---|---|
| Float Setting | スライダー | **Key**、**Default**、**Minimum**、**Maximum** |
| Int Setting | 整数のスライダー | **Key**、**Default**、**Minimum**、**Maximum** |
| Bool Setting | トグル | **Key**、**Default** |
| Enum Setting | 列挙した **Options** のドロップダウン | **Key**、**Default** (インデックス)、**Options** |
| String Setting | テキストフィールド | **Key**、**Default** |

![Assets → Create → WaggleBum → WagSettings メニュー](../Images/create-setting-menu.png)

キーは `category.name` です。ドットの前が**タブ**、後ろが**ラベル**になります。`gameplay.difficulty` は Gameplay
タブに「Difficulty」として入り、`gameplay.cameraShake` は「Camera Shake」と読めます。ドットのないキーは General に
入ります。

> キーは保存キーです。リリース後に変えると、すべてのプレイヤーの保存値が孤立するので、恒久的なものとして扱って
> ください。キーには `"` `\` `{` `}` `,` `:` や制御文字を含められません。

**2. `SettingsProfile` に追加する。** アセットをプロファイルのリストに入れます — セットアップが
`Assets/WagSettings/Resources` に生成したものでも、自分のものでも。リストの順序がメニューの順序です。後で
セットアップを再実行しても、手で追加したものは保持されます。自分が書いた項目だけを置き換えます。

![設定の一覧を持つ Inspector 上の SettingsProfile](../Images/profile-inspector.png)

**3. Play を押す。** UI Toolkit メニューに行があります。正しいタブ、正しいコントロール、正しいラベル、そして
Apply / Revert / Reset、検索、ダーティマーク、永続化がすでに動いています。

**uGUI メニュー**では行は手で配置するので、1 つ追加します。プレハブ内の既存の行を複製し
(`Sample Scenes/Quick Start/Prefabs/WagSettingsMenu (uGUI).prefab` に各種類が 1 つずつあります)、正しい
カテゴリパネルに入れ、バインダーの **Key** を設定します。それが 2 つのフレームワークの違いのすべてです —
[はじめよう](GettingStarted.md)を参照してください。

### 読む

`WagSettingsManager` が動いていれば、どこからでも:

```csharp
int difficulty = WagSettings.Get<int>("gameplay.difficulty");                 // the pending value
WagSettings.Definition<int>("gameplay.difficulty").Changed += value => { };   // Set, Revert, Reset
```

ほとんどのゲームプレイ設定では、これがコードのすべてです。必要な場所で読むか、イベントに反応するか。このページの
残りは、Unity 自体を駆動しなければならない値のためのものです。

### インスペクターは入力中にキーをチェックする

そうでなければ、不正なキーは設定が最初に*使われた*ときにだけ失敗します — 多くの場合、別のシーンで、別の日に、
間違いを犯した場所から遠く離れて。インスペクターは即座に報告します。

![設定アセットの不正なキーを指摘する Inspector](../Images/inspector-key-check.png)

| | 報告 | 例 |
|---|---|---|
| 使えない | **Error** | 空、禁止文字、先頭または末尾の空白 |
| 動くが慣例外 | **Warning** | カテゴリ接頭辞なし、`Audio.Master` の大文字小文字、ドット間の空の部分 |

Warning は助言であって障害ではありません — カテゴリのないキーも動きます。「General」に入るだけです。

### 現在の値を見る

プレイしていないとき、インスペクターは記述されたフィールドだけを表示します。現在の値はランタイムの状態で、
意図的にアセットには決して保存されないからです — プレイヤーの選択は出荷するファイルではなく、セーブデータに
属します。

プレイモードに入ると、インスペクターはライブの値、未適用の変更があるか、そして戻す・リセットするボタンを
表示します。ゲームが明らかに `0.25` で動いているのに Default が `0.8` のままのアセットは、正しく動いています。

## アプライヤーを書く

アプライヤーは値をスケジュールに従って Unity 上の効果に変えます — プレイヤーがドラッグする間ライブで、
あるいは Apply を押したときだけ。`UnityEngine` を知っています。コアは知りません。`SettingApplierBase` から
派生し、2 つを与えます。どの設定を追跡するか、そしてどう押し込むか。

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

コンポーネントを **WagSettings Manager の下**に置きます。マネージャーは起動時にその下のすべてを接続します。
呼ぶものはありません。(別の場所に置かなければならないアプライヤーは `WagSettings.Manager.Attach(applier)` で、
切り離しは自分で行います。)

基底クラスは、手書きのアプライヤーが間違える 2 つのことを処理します。

1. **すべての `+=` に対応する `-=` がある。** 設定は ScriptableObject なので、シーンより長生きします。解放しない
   購読は、コンポーネント、その GameObject、それらが参照するすべてをシーンロードをまたいで生かし続けます。
   `Attach`/`Detach` と Unity の `OnEnable`/`OnDisable` は配線済みです。
2. **永続化された値はアタッチ時に適用される。** `Changed` にだけ反応するアプライヤーは、プレイヤーが次に設定に
   触るまで、シーンに記述されたままの値でゲームを動かします — 誰かがシーンをリロードするまで隠れているバグです。

3 つ目のルールはあなたのものです。**アプライヤーからストアに書き込んではいけません。** アプライヤーは読み、
レジストリが `Apply()` で一度だけ書きます。

`Require` はレジストリにないキーで、そのキーを名指しして例外を投げます。これは意図的です。黙って何も
駆動しないスライダーは、壊れたセットアップではなく壊れたゲームに見えるからです。

### Immediate か OnApply か

すべてのアプライヤーの `Apply Mode` フィールドがいつ動くかを決めます。

| モード | 発火 | 用途 |
|---|---|---|
| `Immediate` *(既定)* | 追跡する設定のすべての変更 | プレイヤーがドラッグ中に聞いたり見たりすべき安価な変更 — 音量、UI スケール |
| `OnApply` | `Apply()` または `Load()` によるレジストリのコミット | 高価または破壊的なもの — 解像度、品質ティア、ウィンドウモード |

`OnApply` が、ドロップダウンをスクロールしている間に解像度設定がウィンドウを暴れさせるのを止めます。
`SettingsRegistry.Committed` を聴き、これは何かを書いた `Apply()` の後と `Load()` の後に発火します — どちらも
コミット済みの値が本当に変わったケースです。

`ApplyCurrentValues()` は変わったものだけでなく、アプライヤーが追跡する**すべて**の設定を再適用することに
注意してください。1 つのアプライヤーが持つ一握りの設定では、設定ごとのコールバックを振り分けるより安く、
メソッドを「現在の状態を Unity に押し込む」という素直なものに保ちます。

## 新しい設定の*型*を追加する

組み込みの型では表現できない値にだけ必要です。

```csharp
[CreateAssetMenu(fileName = "New Vector2Setting", menuName = "WaggleBum/WagSettings/Vector2 Setting")]
public sealed class Vector2Setting : TypedSettingAsset<Vector2>
{
}
```

これが実装のすべてです — `TypedSettingAsset<T>` がキー、既定値、値、変更イベント、ダーティ追跡を提供します。
型は Unity でシリアライズ可能でなければならず、使うストアがそれを永続化できなければなりません
(`PlayerPrefsStore` はプリミティブ型を扱います。[永続化](Persistence.md)を参照)。

固定の選択肢リストには、新しい型より `EnumSetting` を使ってください — インデックスと表示名を保存し、
すでにドロップダウン UI で動きます。

## ストアを書く

別の場所 — セーブファイル、バックエンド、テストダブル — に永続化するには `ISettingsStore` を実装します。

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

重要な契約は 1 つ: **`Save` と `Delete` はバッファし、`Flush` がコミットする。** レジストリはすべてのダーティな
設定を書いてから正確に一度フラッシュするので、書き込みごとにコミットするストアは 1 回の Apply を 40 回の
往復に変えてしまいます。

書いたストアはラウンドトリップテストをしてください — set、save、flush、reload、assert — `Tests/EditMode` の
テストと同じ形です。
