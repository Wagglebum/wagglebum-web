# セーブスロット

セーブスロットを使うと、プレイヤーは複数の独立したセーブ状態を管理できます。各スロットにはタイトル、サマリー、プレイ時間、作成日、オプションのスクリーンショットサムネイルを設定できます。スロットは `SaveSlotManager` によって管理され、`wagSave.SaveSlots` からアクセスできます。

---

## セーブスロットの有効化

WagSave エディタウィンドウで **Save Slots** に移動し、**Enable Save Slots** トグルを有効にします。そこで次の設定を行います。

- **List Type** — Static または Dynamic（下記参照）
- **Capacity** — スロットの最大数（1〜500、Dynamic リストの場合は無制限も可）
- **Overwrite at Capacity** — 容量が上限に達したときに最も古いスロットを自動的に上書き
- **Use Save Slot UI** — セーブ・ロード時に組み込みのスロット選択 UI を表示
- **Include Screenshot Thumbnail** — スロットごとにスクリーンショットをキャプチャ

---

## リストタイプ

### Static

固定数のスロットがあらかじめ作成されます。プレイヤーは既存のスロットを上書きまたは削除します。「スロット 1、スロット 2、スロット 3」のようなクラシックなセーブメニューに適しています。

### Dynamic

スロットはオンデマンドで作成されます。新しいセーブは常に容量の上限まで新しいスロットを追加します。容量を 0（無制限）に設定すると無限リストになります。プレイヤーが頻繁にセーブしてセーブ履歴を管理するゲームに適しています。

---

## 組み込みスロット UI

**Use Save Slot UI** が有効の場合、スロット引数なしで `wagSave.Save()` または `wagSave.Load()` を呼び出すと、組み込みのスロット選択 UI が自動的に表示されます。プレイヤーがスロットを選択・確認すると操作が実行されます。

UI をバイパスしてコードでスロット選択を制御するには、直接スロットを渡します。

```csharp
SaveSlot slot = wagSave.SaveSlots.AddNewSlot(SaveSlotType.Manual);
await wagSave.SaveAsync(slot);
```

---

## コードからスロットを操作する

```csharp
using WaggleBum.WagSave;
using WaggleBum.WagSave.Core.SaveSlots;
using WaggleBum.WagSave.Core.Enums;

WagSave wagSave = WagSave.GetInstance();
SaveSlotManager slotManager = wagSave.SaveSlots;
```

### スロットを作成してセーブする

```csharp
// 新しい Manual スロットを作成する
SaveSlot slot = slotManager.AddNewSlot(SaveSlotType.Manual);
slot.Title   = "Chapter 2";
slot.Summary = "Just reached the forest";

await wagSave.SaveAsync(slot);
```

### スロットからロードする

```csharp
// 最後に変更されたスロットを取得する
SaveSlot latest = slotManager.GetLatestSlot();
if (latest != null)
{
    await wagSave.LoadAsync(latest);
}
```

### スロットを上書きする

```csharp
// インデックス 0 のスロットを Manual セーブで上書きする
SaveSlot slot = slotManager.OverwriteSlot(SaveSlotType.Manual, atIndex: 0);
await wagSave.SaveAsync(slot);
```

### スロットを削除する

```csharp
slotManager.DeleteSlot(slot);
```

### すべてのスロットを反復処理する

```csharp
foreach (SaveSlot slot in slotManager.Slots)
{
    if (!slot.IsEmpty)
    {
        Debug.Log($"[{slot.SlotNumber}] {slot.Title} — {slot.TotalPlaySeconds}s プレイ済み");
    }
}
```

---

## SaveSlot のプロパティ

| プロパティ | 型 | 説明 |
|---|---|---|
| `Id` | `string` | このスロットの安定した GUID。 |
| `SlotNumber` | `int` | UI に表示される番号。 |
| `Title` | `string` | プレイヤーに見えるセーブ名。`Save` を呼び出す前に設定します。 |
| `Summary` | `string` | セーブ状態の短い説明。 |
| `Type` | `SaveSlotType` | Manual、Quick、Auto、Temporary のいずれか。 |
| `TotalPlaySeconds` | `int` | 累計プレイ時間（秒）。 |
| `Created` | `DateTime` | スロットが最初に作成された日時。 |
| `Modified` | `DateTime` | スロットが最後に書き込まれた日時。 |
| `IsEmpty` | `bool` | このスロットにセーブデータが書き込まれていない場合 true。 |

---

## SaveSlotManager のプロパティとイベント

| メンバー | 型 | 説明 |
|---|---|---|
| `Slots` | `SaveSlot[]` | 空のプレースホルダーを含むすべてのスロット。 |
| `Count` | `int` | 空でなく Temporary でもないスロットの数。 |
| `Capacity` | `int` | スロットの最大数。0 は無制限。 |
| `IsAtCapacity` | `bool` | これ以上スロットを作成できない場合 true。 |
| `OnSlotListChanged` | event | スロットが追加、削除、または更新されたときに発火。 |

```csharp
slotManager.OnSlotListChanged += () =>
{
    // ここでセーブメニュー UI を更新する
    RefreshSlotUI(slotManager.Slots);
};
```

---

## スロットタイプ

| タイプ | 説明 |
|---|---|
| `Manual` | プレイヤーが開始するセーブ。メニュー操作でのセーブに典型的。 |
| `Quick` | キー入力または `WagSaveTrigger` コンポーネントによって発火する高速セーブ。 |
| `Auto` | オートセーブシステムによって書き込まれます。 |
| `Temporary` | 永続的なスロットリストから除外される一時的なスロット。チェックポイントに便利。 |

---

## 特定の操作に使うスロットの取得

WagSave は、スロット選択ロジックを自分で管理しなくても適切なスロットを取得するためのヘルパーを提供しています。

```csharp
// セーブ用の適切なスロットを取得または作成する（容量と上書き設定を考慮）
SaveSlot saveSlot = wagSave.GetSaveSlotForSaving();
SaveSlot quickSlot = wagSave.GetSaveSlotForSaving(SaveSlotType.Quick);

// ロードに最適なスロットを取得する
SaveSlot loadSlot = wagSave.GetSaveSlotForLoading();
```
