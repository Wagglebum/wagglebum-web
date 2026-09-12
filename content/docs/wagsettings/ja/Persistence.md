# 永続化

WagSettings は `ISettingsStore` という 1 つの小さなインターフェイスを通じて保存します。初期状態では
`PlayerPrefsStore` を使い、これは依存なしにすべての Unity プロジェクトで動きます。
[WagSave](https://www.wagglebum.com) をインストールすれば、永続化は自らアップグレードします — バージョン付き、
クラウド同期、暗号化、マルチプロファイル — 配線するものは何もありません。

## 保存の仕組み

プレイヤーがスライダーをドラッグしている間、何も書き込まれません。設定は**保留**値を持ち、ストアはレジストリが
適用するときにだけそれを知ります。

```csharp
master.Set(0.5f);      // nothing touches disk
registry.Apply();      // writes dirty settings, then Flush() — once
```

`Apply()` は実際にダーティな設定だけを書き、`Flush()` を**正確に一度**呼びます。40 個の設定を持つメニューでも
コミットは 1 回で、これがディスクやネットワークを背後に持つストアを実用的にします。

`Revert()` はストアに一切触れずに保留値を破棄します。これが Cancel ボタンを 2 度目の書き込みではなく誠実な
ものにします。

### バッファされるが、見えなくはならない

`Save` と `Delete` は `Flush` までバッファしますが、`Has` と `Load` はコミット済みの状態の上に重ねたそれらの
バッファ済みの書き込みを読みます — 呼び出し側は常に自分の書き込みを見ます。`Flush` が変えるのは**耐久性**で
あって可視性ではありません。

```csharp
store.Save("audio.master", 0.5f);
store.Load("audio.master", 0f);   // 0.5 — your own write
// another store instance still reads the old value until Flush()
```

## ストアを選ぶ

`SettingsProfile` はどのバックエンドを望むかを記録し、`SettingsStoreFactory` がそれを解決します。

| `StoreKind` | 結果 |
|---|---|
| `Automatic` *(既定)* | インストールされていれば WagSave、そうでなければ PlayerPrefs |
| `PlayerPrefs` | WagSave がインストールされていても常に PlayerPrefs |

```csharp
ISettingsStore store = SettingsStoreFactory.Create(profile.StoreKind);
using SettingsRegistry registry = profile.CreateRegistry(store);
```

引数なしの `SettingsStoreFactory.Create()` は `PlayerPrefsStore` を返します。この既定があるから、WagSettings は
セットアップなしで動きます。

## PlayerPrefsStore

既定です。シンプルで、同期的で、どこにでもあります。

**対応する型。** PlayerPrefs 自体は `int`、`float`、`string` しか保持しないので、このストアはそれらに加えて
`bool` と列挙型に対応し、`int` に対応付けます。

| 設定の型 | 保存形式 |
|---|---|
| `bool` | `int` — `0` または `1` |
| `int` | `int` |
| `float` | `float` |
| `string` | `string` — PlayerPrefs に null はないので、null 値は空文字として保存 |
| 列挙型 / `EnumSetting` | `int` — 基になる値 |

それ以外は、フラッシュ時に黙ってではなく **`Save` 呼び出し時に** `NotSupportedException` を投げるので、失敗は
原因となったコードを指します。先に `PlayerPrefsStore.IsSupportedType(type)` で確認してください。

**キーの名前空間。** すべてのキーは接頭辞付きで書かれ、既定は `WagSettings.` なので、`audio.master` という設定は
`WagSettings.audio.master` として保存され、ゲーム自身の PlayerPrefs 項目と衝突することはありません。

```csharp
var store = new PlayerPrefsStore("MyGame.Settings.");
```

> リリース後に接頭辞を変えると、キーを変えるのとまったく同じく、以前に保存されたすべての値が孤立します。

**与えてくれないもの。** バージョン管理や移行、クラウド同期、暗号化、プロファイルはなく、PlayerPrefs は平文で
保存されます — Windows ではレジストリに、macOS では plist に — ので、プレイヤーが簡単に編集できます。設定に
とっては通常それで十分です。そうでなければ、そのために WagSave があります。

## WagSave で有効になるもの

`com.wagglebum.wagsave` をインストールすると、WagSettings は `WAGGLEBUM_WAGSAVE_PRESENT` デファインを通じて
コンパイル時に検出します。`WagSettings.WagSave` アセンブリ — WagSave がなければ Unity が丸ごとスキップする — が
起動時に WagSave ベースのストアを `SettingsStoreFactory` に登録します。`Automatic` に設定されたプロファイルは、
コードを変えずにそれを拾います。

![WagSave を検出したと報告する Persistence チェック](../Images/summary-wagsave-detected.png)

| | PlayerPrefs | WagSave |
|---|---|---|
| 依存なしで動く | ✅ | — |
| アップグレード時のバージョン管理と移行 | ❌ | ✅ |
| デバイス間のクラウド同期 | ❌ | ✅ |
| 暗号化と署名 | ❌ | ✅ |
| 複数プロファイル | ❌ | ✅ |
| 形式の選択 (バイナリ / JSON / テキスト) | ❌ | ✅ |
| プリミティブ以外の型 | ❌ | ✅ |

### 接続の仕組み

オンにするものはありません。`WagSettings.WagSave` は `com.wagglebum.wagsave` がインストールされているときに
**だけ** Unity がコンパイルするアセンブリなので、そのブートストラップが動くこと自体が検出です — バージョン
チェックも、リフレクションも、設定もありません。WagSave をインストールすれば永続化は自らアップグレードし、
削除すればアセンブリは登録とともに消え、PlayerPrefs の既定が残ります。

`PlayerPrefs` に設定されたプロファイルは引き続き PlayerPrefs を得ます。ストアを明示的に選ぶことは、パッケージが
覆さない決定です。

### WagSave ストアについて知っておくこと

**設定は独自の WagSave グループに置かれます**。既定は `WagSettings` なので、ゲームのセーブデータと分離されたまま
で、WagSave 自身のツールで検査できます。

**書き込みはバッチされます。** WagSave のランタイム API は `Save` 呼び出しごとにコミットするので、このストアは
バッファし、`Flush` でだけ書きます — レジストリは Apply ごとに一度、ダーティな設定だけに対して呼びます。
プレイヤーが 2 つ変えた 40 設定のメニューは 40 回ではなく 2 回の書き込みです。まさにそれを検証するテストが
あります。

**削除は null を書きます。** WagSave の公開ランタイム API に削除はないので、削除されたキーは null として保存され、
読み戻すと不在になります。呼び出し側から見れば同じ結果で、WagSettings を WagSave の内部から遠ざけます。

**別の型で保存された値も読めます。** かつて `int` で今は `float` の設定は、失敗せずに変換されます。本当に読めない
値は既定値にフォールバックして警告します — プレイヤーが失うのは 1 つの設定で、起動する能力ではありません。

## 独自のストアを書く

`ISettingsStore` を実装して登録します。

```csharp
SettingsStoreFactory.RegisterProvider(() => new MyStore());
```

何かがレジストリを構築する前に登録してください — `[RuntimeInitializeOnLoadMethod]` が通常の場所です。最後の
登録が勝ち、`ClearProvider()` が PlayerPrefs の既定を復元し、null を返すプロバイダーは黙ってフォールバックせずに
例外を投げます。黙って永続化をやめる設定は、大きな音を立てる失敗より悪いからです。

重要な契約は 1 つ: **`Save` と `Delete` はバッファし、`Flush` がコミットする。** 書き込みごとにコミットする
ストアは 1 回の Apply を 40 回の往復に変えてしまいます。

完全な手引きは[拡張性](Extensibility.md)を参照してください。
