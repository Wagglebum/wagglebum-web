# API

WagSettings のコアモデルです。このページのすべては `WaggleBum.WagSettings` 名前空間にあり、ScriptableObject の
アセット型を除いて `UnityEngine` への依存がありません — モデルは素の C# なので、直接ユニットテストでき、後で
抽出できます。

## 静的 API

ほとんどのゲームコードに必要なのは 1 行で、これがそれです。

```csharp
using WaggleBum.WagSettings;

float master = WagSettings.Get<float>("audio.master");
WagSettings.Set("audio.master", 0.8f);                 // pending
WagSettings.Apply();                                    // committed and saved, in one batch
WagSettings.Definition<float>("audio.master").Changed += value => { };
```

| メンバー | 動作 |
|---|---|
| `Get<T>(key)` | 保留値 |
| `Set<T>(key, value)` | 保留値を設定。変わったら `true` |
| `Definition<T>(key)` | キーの背後の `ISettingDefinition<T>`。`Changed` イベント用 |
| `Apply()` / `Revert()` / `ResetAll()` | レジストリのコマンド |
| `IsDirty` | 何か保留中か |
| `Registry` | レジストリそのもの。上記以上のことのために |
| `Manager` / `IsReady` | 動作中の `WagSettingsManager`、またはそれがあるか |

すべての呼び出しはアクティブな **`WagSettingsManager`** に解決されます。動いていなければ、`Get` などは
**例外を投げ**、直す 2 つの方法を名指しします — 静かな既定値を返すことは決してありません。何も保存せずに
「動く」設定メニューは、まさにこれが防ぐために存在する失敗だからです。例外を投げてほしくないときの確認は
`IsReady` です。

### `WagSettingsManager`

レジストリの唯一の所有者。**WaggleBum → WagSettings → WagSettings Manager** をシーンに追加してプロファイルを
割り当てるか、何も割り当てずに Resources フォルダーの既定プロファイルを使わせます。これは:

- プロファイルからレジストリを遅延構築するので、`Awake` で開くメニューも同じものを得る。
- `Start` で**その下のすべての `SettingApplierBase` を接続する**。書くものはない。
- 開くすべてのメニューにレジストリを渡す — マネージャーが動いていればメニューは自分のものを作らない。
- 既定でシーンロードをまたいで存続し、2 つ目のマネージャーは警告して自らを削除する。

`Attach(applier)` は別の場所にあるアプライヤーを扱います。切り離しは自分で行ってください。

### `WagSettingsBootstrapper`

シーンにマネージャーがなく、`SettingsProfile` が Resources フォルダーにあれば、最初のシーンのロード後に 1 つ
作られます — 保存された設定は最初のフレームの前に適用され、静的 API は何も置かなくても動きます。まさにこの
ために、セットアップは `Assets/WagSettings/Resources` に生成します。Resources にプロファイルがなければ何も
起きません。複数のプロファイルがあれば、意図するものに **Is Default** のチェックを入れてください。どれにも
フラグがなければ警告して最初のものを取ります。

`WagSettings.Reset()` は静的状態をクリアし、すべてのプレイセッションの前に実行されるので、ドメインリロードなしの
Enter Play Mode が新しいセッションに前回のマネージャーを渡すことはありません。テストはセットアップでこれを
呼びます。

## 全体の形

```
SettingsProfile  (asset)  ── CreateRegistry(store) ──▶  SettingsRegistry
      │                                                       │
      └─ SettingAsset ─┐                          holds       ▼
                       └──────────────────────▶  ISettingDefinition ──▶ ISettingsStore
                                                       ▲
                             SettingDefinition<T> (plain C#, does the work)
```

設定は 3 つの値を持ち、その違いがモデルのすべてです。

| | 意味 |
|---|---|
| `DefaultValue` | 記述された既定値。`ResetToDefault()` がこれを復元する。 |
| `Value` | **保留**値 — ユーザーが今まさに設定した値。 |
| *適用済みベースライン* | `Apply()` でコミットされた、またはストアから読み込まれた最後の値。 |

`IsDirty` は単に `Value != baseline` です。これが Apply ボタンを点灯させ、Cancel ボタンを機能させ、一括コミットを
1 回の書き込みにします。

## `SettingDefinition<T>`

素の C# の設定。キーと既定値で構築します。

```csharp
var master = new SettingDefinition<float>("audio.master", 0.8f);

master.Changed += volume => mixer.SetFloat("MasterVolume", AudioVolume.LinearToDecibels(volume));
master.Set(0.5f);          // raises Changed, IsDirty becomes true
```

| メンバー | 注記 |
|---|---|
| `Key`, `DefaultValue`, `ValueType` | 不変の識別。 |
| `Value` / `Set(T)` | `Set` は値が動いたかを返す。同じ値の書き込みは no-op で何も発生させないので、アプライヤーが無駄に起こされることはない。 |
| `Changed` | `SettingChangedHandler<T>` — 型付き。アプライヤーと UI 向け。 |
| `ValueChanged` | 型に依存しない `Action`。レジストリがダーティ状態の追跡に使う。 |
| `IsDirty` | 保留値が適用済みベースラインと異なる。 |
| `Apply()` | 保留値をベースラインとして採用する。 |
| `Revert()` | ベースラインを復元する。値が動けば `Changed` を発生させる。 |
| `ResetToDefault()` | 記述された既定値を復元する。設定は**ダーティ**のままなので、リセットは取り消せる。 |
| `LoadFrom(store)` / `SaveTo(store)` | 単一の値を読み書きする。`SaveTo` はフラッシュ**しない**。 |

等価性はコンストラクターにコンパレーターを渡さない限り `EqualityComparer<T>.Default` を使います — 厳密な等価
ではなく許容差が欲しい `float` 設定に便利です。

### `ISettingDefinition<T>`

`SettingDefinition<T>` と ScriptableObject アセット型はどちらも `ISettingDefinition<T>` を実装し、これは `Value`、
`Set`、`DefaultValue`、`Changed` を持ちます。UI とアプライヤーは具象クラスではなく**このインターフェイス**に
バインドしてください。そうすれば、アセットとして記述されたものでもコードで構築されたものでも設定は同じように
動きます — `SettingsRegistry.Get<T>` はまさにそのためにこれを返します。

## `SettingsRegistry`

すべての設定を 1 か所に、1 つのストアにバインドして。UI がバインドするのはこれです。

```csharp
using var registry = new SettingsRegistry(store);
registry.Register(master);

registry.IsDirty;          // false — Register loaded the persisted value
master.Set(0.5f);
registry.IsDirty;          // true
registry.Apply();          // writes dirty settings, flushes once
```

| メンバー | 注記 |
|---|---|
| `Register(definition)` | 設定を追加し、**永続化された値を読み込む**ので、新しいレジストリはクリーン。重複キーで例外。 |
| `Unregister(key)` / `Clear()` | 設定を削除し、レジストリの購読を切り離す。 |
| `Get<T>(key)` | 型付き検索。`ISettingDefinition<T>` を返す。なければ `KeyNotFoundException`、型不一致なら `InvalidCastException`。 |
| `TryGet` / `Contains` | 例外を投げない検索。 |
| `Definitions` | 登録順の登録済み設定 — UI が提示する順。 |
| `IsDirty` | いずれかの設定に未適用の変更があれば true。 |
| `DirtyStateChanged` | clean↔dirty の**遷移**でだけ発火。キー入力ごとではない。 |
| `Load()` | ストアからすべてを読み直し、保留中の編集を破棄する。 |
| `Apply()` | ダーティな設定を書き、`Flush()` を**一度**呼び、ベースラインとして採用する。書いた数を返す。クリーンな設定は決して書き直さない。 |
| `Revert()` | 保留中の編集を破棄する。 |
| `ResetAll()` | すべての既定値を復元し、レジストリはダーティのまま。 |
| `Dispose()` | すべての購読を切り離す。 |

> レジストリは保持する各設定を購読します。所有するシーンやプロファイルがなくなるときは **Dispose** (または
> `Clear()`) してください。さもないと、それらの購読が設定アセットを通じてレジストリを生かし続けます。

### バッチ処理

`Apply()` は `Flush()` を呼ぶ唯一のもので、多くとも一度しか呼びません。実際のストアはディスクやネットワークに
触れるかもしれないので、これは重要です — 40 個の設定を持つメニューでもコミットは 1 回です。

## バインディング層

UI はレジストリに直接ではなく、ビューモデルにバインドします。UI Toolkit と uGUI のメニューはどちらも同じものを
通るので、ずれることはありません — そしてメニュー全体がコントロールをインスタンス化せずにテストできます。

### ラベルとカテゴリ

設定は `DisplayName` と `Category` を持ちます。どちらも記述する必要はありません。キーから導かれるので、メニューが
生のキーを表示することはありません。

| キー | 導かれるラベル | 導かれるカテゴリ |
|---|---|---|
| `audio.master` | Master | Audio |
| `display.windowMode` | Window Mode | Display |
| `accessibility.reduce_motion` | Reduce Motion | Accessibility |
| `simple` | Simple | General |

アセットにどちらかを記述すれば、導かれた値を上書きします。導出はフォールバックであって方針ではありません —
プレイヤーに見えるものは最終的に記述しローカライズすべきです。

### `ISettingBinder`

ビューから見た 1 つの設定: `DisplayName`、`Category`、`IsDirty`、`BoxedValue`、`Changed` イベント、利用可能性。

```csharp
var binder = (SettingBinding<float>)category.Settings[0];
binder.Set(0.5f);            // goes through the registry-tracked setting
```

**編集はレジストリが追跡する設定を通り、脇からストアに入ることは決してありません。** ストアに直接書く
ビューは、Apply ボタンに保留中の内容について嘘をつかせることになります。

**利用可能性**は、現在のハードウェアが尊重できない設定をどう提示するかです。

```csharp
binder.SetAvailability(
    applier.SupportsFeature(GraphicsFeature.RenderScale),
    "Render scale needs the Universal Render Pipeline.");
```

利用不可のバインダーは例外を投げずに書き込みを無視するので、まだコントロールをグレーアウトしていない
ビューがメニューをクラッシュさせることはありません。コントロールをグレーアウトして `UnavailableReason` を表示
してください — **隠さないでください**。さもないとプレイヤーは読んだことのあるオプションを探し回ります。

### `SettingsMenuModel`

```csharp
using var model = new SettingsMenuModel(registry, SettingBinderFactory.CreateAll(registry), ownsBinders: true);

model.SearchText = "volume";
foreach (SettingsMenuCategory category in model.Categories)
{
    foreach (ISettingBinder setting in category.Settings) { /* build a row */ }
}
```

| メンバー | 注記 |
|---|---|
| `Categories` | 一致するカテゴリを**記述順**で。アルファベット順ではない — プロファイルの順序は設計上の選択。空のものは除かれる。 |
| `SearchText` | ラベル、カテゴリ、キーに大文字小文字を区別せず一致。実際の変更ごとに一度 `Changed` を発生させる。 |
| `CanApply` / `CanRevert` | 何かがダーティな間 true。 |
| `CanReset` | 記述された既定値と異なるものがあるときだけ true — 何もしない Reset がクリックを誘うべきではない。 |
| `Apply()` / `Revert()` / `ResetAll()` | レジストリに直行。`Apply` は書いた数を返す。 |
| `Changed` | 値、利用可能性、検索、ダーティの任意の変更。 |

`SettingBinderFactory` はレジストリ全体の型付きバインダーを構築し、一般的な値型は直接一致させ、カスタムの型は
リフレクションにフォールバックします — 設定型の追加が switch の編集を意味することはありません。

> IL2CPP では、リフレクション経路にはジェネリックのインスタンス化がビルド時に存在している必要があります。パッケージの
> `link.xml` は `SettingBinding<T>` のコンストラクターがストリップされないようにしますが、独自の値型では
> `SettingBinding<YourType>` がコードのどこかに現れる必要があります — フィールドひとつで十分です — そうすれば AOT
> コンパイラーが生成します。組み込みの 4 つの値型には何も必要ありません。

> メニューを閉じるときはモデルを Dispose してください。レジストリとすべてのバインダーを購読しています。
> `ownsBinders: true` ならバインダーも一緒に Dispose します。

## `ISettingsStore`

永続化の継ぎ目。`PlayerPrefsStore` が既定で、WagSave がインストールされていれば `WagSaveStore` が引き継ぎます。
[永続化](Persistence.md)を参照してください。

```csharp
public interface ISettingsStore
{
    bool Has(string key);
    T    Load<T>(string key, T fallback);
    void Save<T>(string key, T value);   // buffered
    void Flush();                        // commits the batch
    void Delete(string key);             // buffered
}
```

`Save` と `Delete` はバッファし、`Flush` だけがコミットします。

## 設定アセット

設定をアセットとして記述し参照できるようにする ScriptableObject ラッパーです。それぞれが内部の
`SettingDefinition<T>` に委譲します — アセットは記述面で、定義が仕事をします。

`BoolSetting` · `IntSetting` · `FloatSetting` · `StringSetting` · `EnumSetting`

**Assets → Create → WaggleBum → WagSettings** から作成します。すべてのアセットに **Key** が必要です — 空のキーは
設定が使われた瞬間に例外を投げます。

`EnumSetting` は C# の列挙型ではなく、記述されたオプション名のリストへの選択**インデックス**を保存するので、
1 つのアセット型がすべてのドロップダウン (ウィンドウモード、色覚プリセット、品質ティア) に対応し、UI は
リフレクションなしに表示名を得ます。

## `SettingsProfile`

ゲームが公開する設定をまとめ、どのストアがそれらを永続化するかを記録します。

```csharp
using SettingsRegistry registry = profile.CreateRegistry(store);
```

`CreateRegistry` はすべての設定を記述順で登録します。**リストの空きスロットは**スキップされず**例外を投げます** —
ランタイムでメニューから設定を黙って落とすのは、大きな音を立てる失敗より悪いからです。

`StoreKind` は `Automatic` (インストールされていれば WagSave、なければ PlayerPrefs) または `PlayerPrefs` です。
`SettingsStoreFactory` がこれを解決します。`IsDefault` は、複数が Resources フォルダーを共有するときに
マネージャーが使うプロファイルを示します。

## `Guard` とエラー

すべての公開エントリポイントは `Guard` で検証し、すべての WagSettings のエラーは 1 つの契約に従います。
**create → log → throw**。

```csharp
Guard.AgainstNull(store, nameof(store));
Guard.AgainstNullOrEmpty(value, nameof(value));
Guard.AgainstInvalidKey(key, nameof(key));
Guard.AgainstNumberNotInRange(value, 0, 10, nameof(value));
```

有効なキーは空でなく、空白でなく、`"` `\` `{` `}` `,` `:` と制御文字を含みません。ドットは許され、慣例的な
グループ区切りです: `audio.master`、`display.window_mode`。

失敗を観測するには `WagSettingsLog.ErrorLogged` を購読してください — 例外が投げられる**直前**に発火するので、
上流で何かが捕捉してもエラーが見えます。

```csharp
WagSettingsLog.ErrorLogged += exception => Debug.LogException(exception);
```
