# はじめに

このガイドでは、WagSave のインストール、最初のセーブアセットの作成、および基本的なセーブとロードの手順を説明します。

---

## 1. WagSave アセットを作成する

Project ウィンドウで右クリックして次を選択します。

```
Assets > Create > WaggleBum > WagSave > WagSave (Save System)
```

これにより `WagSave` ScriptableObject が作成されます。たとえば `GameSave` や `SaveProfile` など、わかりやすい名前を付けてください。

Unity のメニューバーからいつでも WagSave エディタウィンドウを開くことができます。

```
Window > WagSave
```

ウィンドウ上部のドロップダウンからアセットを選択してください。

---

## 2. Resources フォルダに移動する

WagSave はビルド実行時に `Resources.Load` を使ってアセットを検索します。プロジェクト内の任意の場所にある `Resources` フォルダの中に `WagSave` という名前のフォルダを作成し、その中にアセットを配置してください。

```
Assets/
  Resources/
    WagSave/
      GameSave.asset   ← WagSave アセットをここに置く
```

> **重要:** アセットが `Resources/WagSave/` フォルダの中にない場合、ビルドでは `WagSave.GetInstance()` が `null` を返します（Unity エディタでは `AssetDatabase` を使うため、配置場所に関係なく動作します）。

---

## 3. WagSave エディタウィンドウを開く

```
Window > WagSave
```

エディタウィンドウはすべての設定を行う場所です。出力フォーマット、セーブスロット、オートセーブ、暗号化、ログなどをここで設定します。ウィンドウ上部のドロップダウンからアセットを選択してください。

---

## 4. 出力フォーマットを選択する

エディタウィンドウで **Save Output** に移動し、カテゴリとフォーマットを選択します。

| カテゴリ | フォーマット | 用途 |
|---|---|---|
| File | Binary | リリース向け — コンパクトで高速 |
| File | JSON | デバッグ向け — 人間が読める形式 |
| File | Text | シンプルなキーバリューデータ |
| Platform | PlayerPrefs | 小規模な設定データ、WebGL |
| Platform | Unity Cloud Save | オンラインマルチプレイヤーゲーム |
| Platform | Steam Cloud Save | Steamworks SDK を使用した Steam ゲーム |

ほとんどのプロジェクトでは **Binary** が推奨の出発点です。

---

## 5. シーンに WagSaveManager を追加する

`WagSaveManager` はオートセーブタイマーとシーン変更ロジックを駆動する MonoBehaviour です。シーン内の GameObject（通常は永続的なマネージャーオブジェクト）に追加してください。

```
Add Component > WaggleBum > WagSave > WagSave Manager
```

オートセーブを使用するシーンには `WagSaveManager` が 1 つあれば十分です。実行時に自動的にアクティブな `WagSave` インスタンスを検索します。

---

## 6. 保存対象の GameObject をマークする

状態をセーブしたい任意の GameObject に `WagSaveComponent` を追加します。

```
Add Component > WaggleBum > WagSave > WagSave
```

次に WagSave エディタウィンドウを開き、**Scene Content** に移動して対象の GameObject を見つけ、**Configure** をクリックして含めるフィールドやプロパティを選択します。

詳細なウォークスルーは [WagSave コンポーネント](WagSaveComponent.md) を参照してください。

---

## 7. セーブとロード

### コードから行う場合

```csharp
using WaggleBum.WagSave;

public class GameManager : MonoBehaviour
{
    private WagSave _wagSave;

    private void Start()
    {
        _wagSave = WagSave.GetInstance();
    }

    public void SaveGame()
    {
        _wagSave.Save();
    }

    public void LoadGame()
    {
        _wagSave.Load();
    }
}
```

### キーバリューのセーブ（WagSaveComponent 不要）

特定の GameObject に紐付かないシンプルな値のセーブに使用します。

```csharp
// セーブ
WagSave.Save("currentLevel", 5);
WagSave.Save("playerName", "Alex");

// ロード
int level = WagSave.Load<int>("currentLevel");
string name = WagSave.Load<string>("playerName");
```

---

## 8. 非同期セーブ（大規模シーンに推奨）

オブジェクト数が多いシーンでは、フレームのヒッチを避けるために非同期バリアントを使用してください。

```csharp
public async void SaveGame()
{
    await _wagSave.SaveAsync();
}

public async void LoadGame()
{
    await _wagSave.LoadAsync();
}
```

シリアライゼーションとファイル入出力はバックグラウンドスレッドで実行されます。Unity API の呼び出し（コンポーネントの値の読み取り）は、バックグラウンド処理が始まる前にメインスレッド上で行われます。

---

## 次のステップ

- [セーブするフィールドを設定する → WagSave コンポーネント](WagSaveComponent.md)
- [複数のセーブスロットを設定する → セーブスロット](SaveSlots.md)
- [オートセーブを設定する → オートセーブ](Autosave.md)
- [暗号化または圧縮を有効にする → 出力フォーマット](OutputFormats.md)
