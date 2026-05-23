# WagSave コンポーネント

`WagSaveComponent` は、GameObject を WagSave システムへの参加対象としてマークする MonoBehaviour です。セーブがトリガーされると、WagSave はロード済みのすべてのシーンにわたって `WagSaveComponent` のインスタンスを検索し、設定されたフィールドやプロパティの値を取得します。ロード時はその値を書き戻します。

---

## コンポーネントの追加

状態を保持したい任意の GameObject に `WagSaveComponent` を追加します。

```
Add Component > WaggleBum > WagSave > WagSave
```

またはコードから追加することもできます。

```csharp
gameObject.AddComponent<WagSaveComponent>();
```

1 つの GameObject につき `WagSaveComponent` は 1 つだけ許可されています（`DisallowMultipleComponent` が適用されています）。

---

## セーブ対象の設定

`WagSaveComponent` はすべてのフィールドを自動的にセーブするわけではありません。含めるフィールドやプロパティを WagSave エディタウィンドウで選択します。

1. `Window > WagSave > Editor` を開く
2. **Scene Content** に移動する
3. リストから目的の GameObject を見つけ、**Configure** をクリックする

エディタが GameObject 上のすべてのコンポーネントのツリービューを表示します。任意のコンポーネントを展開すると利用可能なフィールドやプロパティが表示されるので、含めたいものにチェックを入れます。

> **ヒント:** 深さスライダーを使ってコンポーネントツリーのデフォルト展開レベルを制御できます。

### セーブできるものは？

WagSave はリフレクションを使って値の読み書きを行います。次の型のフィールドやプロパティを選択できます。

- プリミティブ型（`int`、`float`、`bool`、`string`）
- Unity の値型（`Vector2`、`Vector3`、`Quaternion`、`Color`）
- シリアライズ可能な構造体やクラス

---

## プレハブのサポート

プレハブの場合は、個々のシーンインスタンスではなく **プレハブアセット** 上で `WagSaveComponent` を設定します。こうすることで、すべてのインスタンスが同じセーブ設定を共有します。

1. `Window > WagSave > Editor` を開く
2. **Prefabs** に移動する
3. プレハブを見つけ、**Configure** をクリックする

プレハブアセットの GUID がコンポーネントの `prefabId` に保存され、動的にスポーンされたオブジェクトを含むシーンのロード時に正しいプレハブを再インスタンス化できます。

> **注意:** シーンインスタンスで `WagSaveComponent` がオーバーライドされている場合、プレハブアセットへの変更はそのインスタンスに反映されません。

---

## シーンの識別情報

各 `WagSaveComponent` は次のプロパティで識別されます。

| プロパティ | 説明 |
|---|---|
| `componentId` | エディタでコンポーネントが初めて設定されたときに割り当てられる安定した GUID。セッションをまたいで保持されます。 |
| `sceneId` | シーンのアセットパスのハッシュ。セーブデータを正しいシーンにスコープします。 |
| `runtimeId` | 実行時（`Start`）に生成されます。同じプレハブの複数インスタンスをセッション内で区別します。 |
| `prefabId` | ソースプレハブアセットの GUID。ロード時にプレハブを再インスタンス化するために使用されます。 |

これらの ID はすべて自動的に割り当てられます。手動で設定する必要はありません。

---

## 動的オブジェクト（実行時にスポーンされるプレハブ）

WagSave は動的にインスタンス化されたプレハブに対応しています。プレハブインスタンスがセーブされると、`prefabId` と `runtimeId` がデータとともに保存されます。ロード時は `WagSaveComponent.InstantiatePrefabById` を使ってオブジェクトを再生成します。

```csharp
// 保存された prefabId を使ってプレハブを生成する
GameObject go = WagSaveComponent.InstantiatePrefabById(savedPrefabId);
```

> **実行時の要件:** ビルドで `InstantiatePrefabById` を機能させるには、プレハブが `Resources` フォルダ内に存在する必要があります。エディタでは `AssetDatabase` が使用されるため、`Resources` フォルダは不要です。

---

## コードから値を読み書きする

ほとんどの場合、直接呼び出す必要はありません。`WagSave.Save()` と `WagSave.Load()` がすべてを処理します。ただし、手動制御が必要な場合はコンポーネントの次のメソッドを使用できます。

```csharp
var component = GetComponent<WagSaveComponent>();

// 選択されたすべてのセーブパスの現在のスナップショットを取得する
GameObjectData data = component.GetSaveItemData();

// 特定のパスに値を書き戻す
component.SetSelectionValue("componentId.p|health", 75);
```

---

## デバッガーでコンポーネントを確認する

プレイモード中に `Window > WagSave > Editor` を開き、**Debugger** に移動します。**Save Content** パネルにはアクティブなシーン内のすべての `WagSaveComponent` が一覧表示され、それぞれに設定されたセーブアイテム数と **Configure**・**Focus** ボタンが表示されます。
