# 拡張性

WagSave はあらゆる層で拡張できるよう設計されています。シリアライゼーションフォーマットの置き換え、新しい出力バックエンドへの差し替え、セーブ・ロードロジックの完全なオーバーライド、暗号化キーの提供へのフック — これらすべてをパッケージのソースコードを変更することなく実現できます。

---

## セーブ・ロードのオーバーライド

セーブとロードの動作を完全に制御する最もシンプルな方法は、`OnSaveOverride` と `OnLoadOverride` イベントを使用することです。両方を購読すると、WagSave はデフォルトのコンポーネントシリアライゼーションをスキップし、完全にハンドラーに委譲します。

どちらか一方だけを購読すると `InvalidOperationException` がスローされます。両方を必ずセットで購読してください。

```csharp
wagSave.OnSaveOverride += (slot, saveTarget) =>
{
    // saveTarget に任意のデータを書き込む
    saveTarget.AddOrUpdate("myKey", myCustomData);
    // このハンドラーの後に saveTarget.Save() が自動的に呼ばれる
};

wagSave.OnLoadOverride += (slot, saveTarget) =>
{
    // saveTarget から読み取り、ゲーム状態に適用する
    var data = saveTarget.Get<MyCustomData>("myKey");
    ApplyToGame(data);
};
```

`saveTarget` パラメーターは設定されているセーブバックエンド（Binary、JSON など）です。どのフォーマットがアクティブであっても同じ方法で操作できます。

```csharp
// 値を書き込む
saveTarget.AddOrUpdate("key", value);

// 値を読み込む
var value = saveTarget.Get<MyType>("key");

// ディスク・リモートにフラッシュする
saveTarget.Save();
```

このパターンは、`WagSaveComponent` のリフレクションパスにうまくマッピングされない独自のシリアライズ可能なデータモデルがある場合に便利です。

---

## 暗号化キーの提供

**Encrypt Data** が有効の場合、WagSave は非対称暗号化を使用します。公開鍵は WagSave アセットに保存されます。秘密鍵は WagSave によって保存されることはなく、イベントを通じて実行時に提供します。

```csharp
wagSave.OnGetEncryptionPrivateKey += () =>
{
    // 秘密鍵を安全に保管している場所から読み込む —
    // リモートサーバー、プラットフォームの認証情報ストアなど
    return SecureKeyStorage.GetPrivateKey();
};
```

または、最初のセーブまたはロードの前にインスタンスに直接キーを設定することもできます。

```csharp
wagSave.Settings.SaveTarget.Options.EncryptPrivateKey = SecureKeyStorage.GetPrivateKey();
```

イベントはキーの取得を使用時まで遅らせることができるため推奨されますが、どちらの方法も有効です。

> **セキュリティに関する注意:** 秘密鍵をソースコード内にプレーンテキストの文字列として埋め込んだり、ビルドにプレーンテキストで含めたりしないでください。プラットフォームの認証情報ストアを使用するか、初回起動時にサーバーから読み込んでください。

---

## カスタム出力フォーマット

`WaggleBum.WagSave.Core.Interfaces` の `ISaveTarget` インターフェースを実装することで新しい出力フォーマットを作成できます。登録すると、エディタのドロップダウンで組み込みフォーマットと並んで表示されます。

```csharp
using WaggleBum.WagSave.Core.Interfaces;
using WaggleBum.WagSave.Core.SaveTargets;

public class MyCustomSaveTarget : ISaveTarget
{
    public void AddOrUpdate(string key, object value, string group = null) { /* ... */ }
    public object Get(string key, string group = null)                      { /* ... */ }
    public T Get<T>(string key, string group = null)                        { /* ... */ }
    public void Save()                                                      { /* ... */ }
    public void Load()                                                      { /* ... */ }
    public void Dispose()                                                   { /* ... */ }
}
```

WagSave が検出できるよう `SaveTargetDestination` に登録します。

```csharp
SaveTargetDestination.Register(new SaveTargetDestination(
    id:          "my-custom-format",
    name:        "My Format",
    description: "カスタムセーブバックエンド",
    groupName:   "Custom",
    factory:     settings => new MyCustomSaveTarget(settings)
));
```

`Register` は起動時に一度だけ呼び出してください。たとえば `[InitializeOnLoad]` クラス（エディタ）や `RuntimeInitializeOnLoadMethod`（実行時）内で呼び出します。

---

## カスタムシリアライザー

WagSave の組み込みシリアライザー（Binary、JSON、Text）はサブクラス化してオーバーライドできます。セーブターゲット全体を置き換えることなく、データのエンコード方法を変更できます。

```csharp
using WaggleBum.WagSave.Core.Serialization;

public class MyJsonSerializer : JsonSerializer
{
    protected override string Serialize(object value)
    {
        // カスタムシリアライゼーションロジック — 例：別の JSON ライブラリを使用する
        return MyJsonLibrary.Serialize(value);
    }

    protected override T Deserialize<T>(string data)
    {
        return MyJsonLibrary.Deserialize<T>(data);
    }
}
```

対応するセーブターゲットをサブクラス化し、`CreateSerializer` をオーバーライドしてシリアライザーを注入します。

```csharp
public class MyJsonSaveTarget : JsonFileSaveTarget
{
    protected override ISerializer CreateSerializer() => new MyJsonSerializer();
}
```

その後、上記のようにカスタムフォーマットとして登録してください。

---

## カスタムプログレスインジケーター UI

WagSave アセットの `Progress Indicator Prefab` フィールドに独自のプレハブを割り当てることで、組み込みのプログレスインジケーターを置き換えられます。プレハブには `IProgressIndicator` インターフェースを実装したコンポーネントが必要です。

```csharp
public interface IProgressIndicator
{
    void Show();
    void Hide();
    void SetProgress(int percent);
}
```

---

## カスタムセーブスロット UI

WagSave アセットの `Save Slots UI Prefab` フィールドに独自のプレハブを割り当てることで、組み込みのスロット選択 UI を置き換えられます。完全にカスタム実装したい場合は **Use Save Slot UI** を無効にして、コードでスロット選択を完全に制御してください。`SaveSlotManager` の全 API については [セーブスロット](SaveSlots.md) を参照してください。
