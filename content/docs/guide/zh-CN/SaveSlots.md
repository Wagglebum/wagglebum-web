# 存档槽位

存档槽位允许玩家维护多个相互独立的存档状态。槽位由 `SaveSlotManager` 管理，可通过 `wagSave.SaveSlots` 访问。

## 启用存档槽位

导航到 **Save Slots** 并启用 **Enable Save Slots**。可配置以下选项：

- **List Type** — 静态（Static）或动态（Dynamic）
- **Capacity** — 最大槽位数量（1–500，Dynamic 模式可设为无限）
- **Overwrite at Capacity** — 槽位已满时自动覆盖最旧的槽位
- **Use Save Slot UI** — 显示内置槽位选择器 UI
- **Include Screenshot Thumbnail** — 为每个槽位捕获截图缩略图

## 列表类型

### 静态（Static）

固定数量的槽位数组。玩家可覆盖或删除已有槽位。

### 动态（Dynamic）

按需创建槽位。将容量设为 0（无限）可不限数量。

## 内置槽位 UI

```csharp
SaveSlot slot = wagSave.SaveSlots.AddNewSlot(SaveSlotType.Manual);
await wagSave.SaveAsync(slot);
```

## 通过代码操作槽位

```csharp
WagSave wagSave = WagSave.GetInstance();
SaveSlotManager slotManager = wagSave.SaveSlots;
// 创建一个新的手动槽位
SaveSlot slot = slotManager.AddNewSlot(SaveSlotType.Manual);
slot.Title   = "Chapter 2";
slot.Summary = "Just reached the forest";
await wagSave.SaveAsync(slot);
// 获取最近修改的槽位
SaveSlot latest = slotManager.GetLatestSlot();
if (latest != null) { await wagSave.LoadAsync(latest); }
// 覆盖索引 0 处的槽位
SaveSlot slot = slotManager.OverwriteSlot(SaveSlotType.Manual, atIndex: 0);
// 删除一个槽位
slotManager.DeleteSlot(slot);
// 遍历所有槽位
foreach (SaveSlot slot in slotManager.Slots)
{
    if (!slot.IsEmpty)
        Debug.Log($"[{slot.SlotNumber}] {slot.Title} — {slot.TotalPlaySeconds}s played");
}
```

## SaveSlot 属性

| 属性 | 类型 | 说明 |
|---|---|---|
| `Id` | `string` | 此槽位的稳定 GUID。 |
| `SlotNumber` | `int` | UI 中显示的槽位编号。 |
| `Title` | `string` | 玩家可见的存档名称。 |
| `Summary` | `string` | 存档状态的简短描述。 |
| `Type` | `SaveSlotType` | Manual、Quick、Auto 或 Temporary。 |
| `TotalPlaySeconds` | `int` | 累计游戏时长（秒）。 |
| `Created` | `DateTime` | 槽位首次创建的时间。 |
| `Modified` | `DateTime` | 槽位最后一次写入的时间。 |
| `IsEmpty` | `bool` | 尚未写入任何存档数据时为 true。 |

## SaveSlotManager 属性与事件

| 成员 | 类型 | 说明 |
|---|---|---|
| `Slots` | `SaveSlot[]` | 所有槽位，包括空占位符。 |
| `Count` | `int` | 非空且非临时的槽位数量。 |
| `Capacity` | `int` | 最大槽位数量，0 表示无限。 |
| `IsAtCapacity` | `bool` | 无法再创建新槽位时为 true。 |
| `OnSlotListChanged` | 事件 | 槽位被添加、删除或更新时触发。 |

```csharp
slotManager.OnSlotListChanged += () =>
{
    // 在此刷新你的存档菜单 UI
    RefreshSlotUI(slotManager.Slots);
};
```

## 槽位类型

| 类型 | 说明 |
|---|---|
| `Manual` | 玩家主动触发的保存。 |
| `Quick` | 通过按键或 WagSaveTrigger 快速触发的保存。 |
| `Auto` | 由自动保存系统写入。 |
| `Temporary` | 不计入持久化槽位列表的临时槽位。 |

## 获取特定操作所用的槽位

```csharp
// 获取或创建适合保存的槽位
SaveSlot saveSlot = wagSave.GetSaveSlotForSaving();
SaveSlot quickSlot = wagSave.GetSaveSlotForSaving(SaveSlotType.Quick);
// 获取最适合加载的槽位
SaveSlot loadSlot = wagSave.GetSaveSlotForLoading();
```
