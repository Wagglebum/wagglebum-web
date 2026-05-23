# 세이브 슬롯

세이브 슬롯을 사용하면 플레이어가 각각의 제목, 요약, 플레이 시간, 생성 날짜, 선택적 스크린샷 썸네일을 가진 여러 개의 독립적인 세이브 상태를 유지할 수 있습니다. `SaveSlotManager`가 관리하며 `wagSave.SaveSlots`로 접근합니다.

---

## 세이브 슬롯 활성화

WagSave 에디터 창에서 **Save Slots**로 이동하여 **Enable Save Slots** 토글을 활성화합니다. 여기서 다음을 설정합니다:

- **List Type** — Static 또는 Dynamic (아래 참조)
- **Capacity** — 최대 슬롯 수 (1–500, Dynamic 목록은 무제한 가능)
- **Overwrite at Capacity** — 가득 찼을 때 가장 오래된 슬롯을 자동으로 덮어씀
- **Use Save Slot UI** — 저장/불러오기 시 내장 슬롯 선택기 UI 표시
- **Include Screenshot Thumbnail** — 슬롯별 스크린샷 캡처

---

## 목록 타입

### Static

고정된 슬롯 배열이 미리 생성됩니다. 플레이어는 새 슬롯을 만드는 대신 기존 슬롯을 덮어쓰거나 삭제합니다. 클래식 "슬롯 1, 슬롯 2, 슬롯 3" 저장 메뉴에 적합합니다.

### Dynamic

슬롯이 필요에 따라 생성됩니다. 새로운 저장은 항상 용량 한도까지 새 슬롯을 추가합니다. 무제한 목록을 원하면 용량을 0 (무한)으로 설정합니다. 플레이어가 상태 기록과 함께 자주 저장하는 게임에 적합합니다.

---

## 내장 슬롯 UI

**Use Save Slot UI**가 활성화된 경우, 슬롯 인수 없이 `wagSave.Save()` 또는 `wagSave.Load()`를 호출하면 내장 슬롯 선택기 UI가 자동으로 표시됩니다. 플레이어가 슬롯을 선택하거나 확인하면 작업이 진행됩니다.

UI를 우회하고 코드에서 슬롯 선택을 제어하려면 슬롯을 직접 전달합니다:

```csharp
SaveSlot slot = wagSave.SaveSlots.AddNewSlot(SaveSlotType.Manual);
await wagSave.SaveAsync(slot);
```

---

## 코드에서 슬롯 작업

```csharp
using WaggleBum.WagSave;
using WaggleBum.WagSave.Core.SaveSlots;
using WaggleBum.WagSave.Core.Enums;

WagSave wagSave = WagSave.GetInstance();
SaveSlotManager slotManager = wagSave.SaveSlots;
```

### 슬롯 생성 및 저장

```csharp
// 새 Manual 슬롯 생성
SaveSlot slot = slotManager.AddNewSlot(SaveSlotType.Manual);
slot.Title   = "Chapter 2";
slot.Summary = "Just reached the forest";

await wagSave.SaveAsync(slot);
```

### 슬롯에서 불러오기

```csharp
// 가장 최근에 수정된 슬롯 가져오기
SaveSlot latest = slotManager.GetLatestSlot();
if (latest != null)
{
    await wagSave.LoadAsync(latest);
}
```

### 슬롯 덮어쓰기

```csharp
// 인덱스 0의 슬롯을 Manual 저장으로 덮어쓰기
SaveSlot slot = slotManager.OverwriteSlot(SaveSlotType.Manual, atIndex: 0);
await wagSave.SaveAsync(slot);
```

### 슬롯 삭제

```csharp
slotManager.DeleteSlot(slot);
```

### 모든 슬롯 순회

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

## SaveSlot 속성

| 속성 | 타입 | 설명 |
|---|---|---|
| `Id` | `string` | 이 슬롯의 안정적인 GUID. |
| `SlotNumber` | `int` | UI에 표시되는 번호. |
| `Title` | `string` | 플레이어에게 보이는 저장 이름. `Save` 호출 전에 설정. |
| `Summary` | `string` | 저장 상태에 대한 짧은 설명. |
| `Type` | `SaveSlotType` | Manual, Quick, Auto, 또는 Temporary. |
| `TotalPlaySeconds` | `int` | 초 단위로 누적된 플레이 시간. |
| `Created` | `DateTime` | 슬롯이 처음 생성된 시각. |
| `Modified` | `DateTime` | 슬롯에 마지막으로 기록된 시각. |
| `IsEmpty` | `bool` | 이 슬롯에 저장 데이터가 기록되지 않은 경우 true. |

---

## SaveSlotManager 속성 및 이벤트

| 멤버 | 타입 | 설명 |
|---|---|---|
| `Slots` | `SaveSlot[]` | 빈 플레이스홀더를 포함한 모든 슬롯. |
| `Count` | `int` | 비어있지 않고 임시가 아닌 슬롯의 수. |
| `Capacity` | `int` | 최대 슬롯 수. 0은 무제한을 의미합니다. |
| `IsAtCapacity` | `bool` | 더 이상 슬롯을 생성할 수 없을 때 true. |
| `OnSlotListChanged` | event | 슬롯이 추가, 제거 또는 업데이트될 때 발생합니다. |

```csharp
slotManager.OnSlotListChanged += () =>
{
    // 여기서 저장 메뉴 UI를 새로 고칩니다
    RefreshSlotUI(slotManager.Slots);
};
```

---

## 슬롯 타입

| 타입 | 설명 |
|---|---|
| `Manual` | 플레이어가 시작한 저장. 메뉴 기반 저장에 일반적입니다. |
| `Quick` | 키 입력 또는 `WagSaveTrigger` 컴포넌트로 트리거되는 빠른 저장. |
| `Auto` | 자동저장 시스템이 기록합니다. |
| `Temporary` | 영구 슬롯 목록에서 제외되는 임시 슬롯. 체크포인트에 유용합니다. |

---

## 특정 작업을 위한 슬롯 가져오기

WagSave는 선택 로직을 직접 관리하지 않고도 저장 또는 불러오기에 적합한 슬롯을 가져올 수 있는 헬퍼를 제공합니다:

```csharp
// 저장에 적합한 슬롯 가져오기 또는 생성 (용량 및 덮어쓰기 설정 준수)
SaveSlot saveSlot = wagSave.GetSaveSlotForSaving();
SaveSlot quickSlot = wagSave.GetSaveSlotForSaving(SaveSlotType.Quick);

// 불러오기에 가장 적합한 슬롯 가져오기
SaveSlot loadSlot = wagSave.GetSaveSlotForLoading();
```
