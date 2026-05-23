# 存檔槽位

存檔槽位讓玩家能夠維護多個獨立的存檔狀態。透過 `wagSave.SaveSlots` 存取 `SaveSlotManager` 進行管理。

## 啟用存檔槽位

前往 **Save Slots** → 啟用 **Enable Save Slots**。設定清單類型、容量、達到上限時是否覆寫、是否使用存檔槽位 UI，以及是否包含截圖縮圖。

## 清單類型

### Static（靜態）：固定數量的槽位陣列。

### Dynamic（動態）：依需求建立槽位。將容量設為 0 表示無限制。

## 在程式碼中操作槽位

```csharp
WagSave wagSave = WagSave.GetInstance();
SaveSlotManager slotManager = wagSave.SaveSlots;

// 建立一個新的手動槽位
SaveSlot slot = slotManager.AddNewSlot(SaveSlotType.Manual);
slot.Title   = "Chapter 2";
slot.Summary = "Just reached the forest";
await wagSave.SaveAsync(slot);

// 取得最近修改的槽位
SaveSlot latest = slotManager.GetLatestSlot();
if (latest != null) { await wagSave.LoadAsync(latest); }

// 覆寫索引 0 的槽位
SaveSlot slot = slotManager.OverwriteSlot(SaveSlotType.Manual, atIndex: 0);

// 刪除一個槽位
slotManager.DeleteSlot(slot);

// 遍歷所有槽位
foreach (SaveSlot slot in slotManager.Slots)
{
    if (!slot.IsEmpty)
        Debug.Log($"[{slot.SlotNumber}] {slot.Title} — {slot.TotalPlaySeconds}s played");
}
```

## SaveSlot 屬性

| 屬性 | 型別 | 說明 |
|---|---|---|
| `Id` | `string` | 穩定的 GUID。 |
| `SlotNumber` | `int` | 顯示用的編號。 |
| `Title` | `string` | 玩家可見的存檔名稱。 |
| `Summary` | `string` | 簡短描述。 |
| `Type` | `SaveSlotType` | Manual、Quick、Auto 或 Temporary。 |
| `TotalPlaySeconds` | `int` | 累計遊玩時間（秒）。 |
| `Created` | `DateTime` | 建立日期。 |
| `Modified` | `DateTime` | 最後寫入日期。 |
| `IsEmpty` | `bool` | 尚未寫入任何資料時為 true。 |

## 槽位類型

| 類型 | 說明 |
|---|---|
| `Manual` | 由玩家主動觸發的存檔。 |
| `Quick` | 由按鍵或 WagSaveTrigger 觸發。 |
| `Auto` | 由自動存檔系統寫入。 |
| `Temporary` | 暫時性存檔，不列入持久化清單。 |

## 取得特定操作的槽位

```csharp
// 取得或建立用於存檔的槽位
SaveSlot saveSlot = wagSave.GetSaveSlotForSaving();

// 取得用於讀檔的槽位
SaveSlot loadSlot = wagSave.GetSaveSlotForLoading();
```
