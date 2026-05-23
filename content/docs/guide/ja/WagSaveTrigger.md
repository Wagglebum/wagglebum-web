# WagSave トリガー

`WagSaveTrigger` は、コライダーがトリガーゾーンに入ったときに自動的にセーブを実行する MonoBehaviour です。チェックポイントシステム、ゾーンベースのオートセーブ、プレイヤーの操作なしにセーブが発生すべきあらゆる場面に便利です。

---

## セットアップ

1. GameObject に `Collider` コンポーネントを追加し、トリガーとして設定します（`Is Trigger = true` — `WagSaveTrigger` がこれを自動的に設定します）。
2. `WagSaveTrigger` を追加します。

```
Add Component > WaggleBum > WagSave > WagSave Trigger
```

`WagSaveTrigger` は `Collider` を必要とし、`Collider` なしではコンパイルできません（`RequireComponent` が適用されています）。

---

## インスペクター設定

| フィールド | 説明 |
|---|---|
| **Target Layers** | これらのレイヤーのオブジェクトだけがセーブをトリガーします。デフォルトはすべてのレイヤー。 |
| **Required Tag** | 設定されている場合、このタグを持つオブジェクトだけがセーブをトリガーします。空にするとすべてのタグにマッチします。 |
| **Disable After First Hit** | 有効にすると、トリガーは一度発火した後に `ResetTrigger()` が呼ばれるまで非アクティブになります。 |

---

## イベント

| イベント | 説明 |
|---|---|
| `onTriggerEntered` | 有効なコライダーがゾーンに入ったときに発火します。`Collider` を渡します。 |
| `onTriggerExited` | 有効なコライダーがゾーンを出たときに発火します。`Collider` を渡します。 |

インスペクターまたはコードで設定できます。

```csharp
var trigger = GetComponent<WagSaveTrigger>();

trigger.onTriggerEntered.AddListener(collider =>
{
    Debug.Log($"{collider.name} がセーブをトリガーしました");
});
```

---

## セーブの動作

有効な衝突が発生すると、`WagSaveTrigger` は自動的にアクティブな `WagSave` インスタンスを呼び出します。

- **オートセーブが有効** の場合 → `wagSave.AutoSave()` を呼び出す
- **セーブスロットが有効**（オートセーブがオフ）の場合 → `Quick` スロットを作成してセーブする
- **それ以外** → `wagSave.Save()` を呼び出す

このロジックを設定する必要はありません。アクティブな `WagSave` インスタンスに設定されている内容に従います。

---

## ワンショットトリガーのリセット

**Disable After First Hit** がオンの場合、`ResetTrigger()` を呼び出すとトリガーを再度発火できるようになります。

```csharp
WagSaveTrigger trigger = GetComponent<WagSaveTrigger>();

// メニューから戻ったり、シーンをロードしたりした後に再有効化する
trigger.ResetTrigger();
```

トリガーが現在非アクティブかどうかを確認するには `IsDisabled` を使います。

```csharp
if (trigger.IsDisabled)
{
    // トリガーはすでに発火しており、リセットを待っている状態
}
```

---

## 例：チェックポイント

レベルのチェックポイント地点に `WagSaveTrigger` を配置します。次のように設定します。
- `Player` レイヤーのみを対象にする
- **Disable After First Hit** を有効にして、1 回の訪問につき 1 度だけセーブされるようにする
- `onTriggerEntered` に「チェックポイント到達」の UI メッセージを表示するよう設定する

```csharp
// プレイヤーがチェックポイントに到達したらメッセージを表示する
trigger.onTriggerEntered.AddListener(_ =>
{
    checkpointUI.ShowMessage("チェックポイントに到達しました!");
});
```

プレイヤーがそのエリアを再プレイできる場合はトリガーを再有効化します。

```csharp
private void OnLevelRestart()
{
    trigger.ResetTrigger();
}
```
