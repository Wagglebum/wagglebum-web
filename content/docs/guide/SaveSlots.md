# Save Slots

Save Slots let players maintain multiple independent save states — each with its own title, summary, play time, creation date, and optional screenshot thumbnail. They are managed by the `SaveSlotManager`, accessible via `wagSave.SaveSlots`.

---

## Enabling Save Slots

In the WagSave editor window, navigate to **Save Slots** and enable the **Enable Save Slots** toggle. From there you configure:

- **List Type** — Static or Dynamic (see below)
- **Capacity** — Maximum number of slots (1–500, or unlimited for Dynamic lists)
- **Overwrite at Capacity** — Automatically overwrites the oldest slot when full
- **Use Save Slot UI** — Shows the built-in slot picker UI on save/load
- **Include Screenshot Thumbnail** — Captures a screenshot per slot

---

## List Types

### Static

A fixed array of slots is pre-created. Players overwrite or delete existing slots rather than creating new ones. Good for classic "slot 1, slot 2, slot 3" save menus.

### Dynamic

Slots are created on demand. New saves always add a new slot up to the capacity limit. Set capacity to 0 (Infinite) for an unlimited list. Good for games where the player saves frequently with a history of states.

---

## Built-in Slot UI

When **Use Save Slot UI** is enabled, calling `wagSave.Save()` or `wagSave.Load()` without a slot argument automatically shows the built-in slot picker UI. The player selects or confirms a slot and the operation proceeds.

To bypass the UI and control slot selection in code, pass a slot directly:

```csharp
SaveSlot slot = wagSave.SaveSlots.AddNewSlot(SaveSlotType.Manual);
await wagSave.SaveAsync(slot);
```

---

## Working with Slots in Code

```csharp
using WaggleBum.WagSave;
using WaggleBum.WagSave.Core.SaveSlots;
using WaggleBum.WagSave.Core.Enums;

WagSave wagSave = WagSave.GetInstance();
SaveSlotManager slotManager = wagSave.SaveSlots;
```

### Creating a slot and saving into it

```csharp
// Create a new Manual slot
SaveSlot slot = slotManager.AddNewSlot(SaveSlotType.Manual);
slot.Title   = "Chapter 2";
slot.Summary = "Just reached the forest";

await wagSave.SaveAsync(slot);
```

### Loading from a slot

```csharp
// Get the most recently modified slot
SaveSlot latest = slotManager.GetLatestSlot();
if (latest != null)
{
    await wagSave.LoadAsync(latest);
}
```

### Overwriting a slot

```csharp
// Overwrite the slot at index 0 with a Manual save
SaveSlot slot = slotManager.OverwriteSlot(SaveSlotType.Manual, atIndex: 0);
await wagSave.SaveAsync(slot);
```

### Deleting a slot

```csharp
slotManager.DeleteSlot(slot);
```

### Iterating all slots

```csharp
foreach (SaveSlot slot in slotManager.Slots)
{
    if (!slot.IsEmpty)
    {
        Debug.Log($"[{slot.SlotNumber}] {slot.Title} — {slot.TotalPlaySeconds}s played");
    }
}
```

---

## SaveSlot Properties

| Property | Type | Description |
|---|---|---|
| `Id` | `string` | Stable GUID for this slot. |
| `SlotNumber` | `int` | Display number shown in UI. |
| `Title` | `string` | Player-visible save name. Set before calling `Save`. |
| `Summary` | `string` | Short description of the save state. |
| `Type` | `SaveSlotType` | Manual, Quick, Auto, or Temporary. |
| `TotalPlaySeconds` | `int` | Accumulated play time in seconds. |
| `Created` | `DateTime` | When the slot was first created. |
| `Modified` | `DateTime` | When the slot was last written to. |
| `IsEmpty` | `bool` | True when no save data has been written to this slot. |

---

## SaveSlotManager Properties and Events

| Member | Type | Description |
|---|---|---|
| `Slots` | `SaveSlot[]` | All slots, including empty placeholders. |
| `Count` | `int` | Number of non-empty, non-temporary slots. |
| `Capacity` | `int` | Maximum slot count. 0 means unlimited. |
| `IsAtCapacity` | `bool` | True when no more slots can be created. |
| `OnSlotListChanged` | event | Raised when a slot is added, removed, or updated. |

```csharp
slotManager.OnSlotListChanged += () =>
{
    // Refresh your save menu UI here
    RefreshSlotUI(slotManager.Slots);
};
```

---

## Slot Types

| Type | Description |
|---|---|
| `Manual` | Player-initiated save. Typical for menu-driven saves. |
| `Quick` | Fast save triggered by a key press or the `WagSaveTrigger` component. |
| `Auto` | Written by the autosave system. |
| `Temporary` | Transient slot excluded from the persistent slot list. Useful for checkpoints. |

---

## Getting the Slot for a Specific Operation

WagSave provides helpers to get the correct slot for saving or loading without managing selection logic yourself:

```csharp
// Get or create the appropriate slot for saving (respects capacity and overwrite settings)
SaveSlot saveSlot = wagSave.GetSaveSlotForSaving();
SaveSlot quickSlot = wagSave.GetSaveSlotForSaving(SaveSlotType.Quick);

// Get the most appropriate slot for loading
SaveSlot loadSlot = wagSave.GetSaveSlotForLoading();
```
