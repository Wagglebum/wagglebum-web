# WagSave 트리거

`WagSaveTrigger`는 콜라이더가 트리거 영역에 진입할 때 자동으로 저장을 실행하는 MonoBehaviour입니다. 체크포인트 시스템, 구역 기반 자동저장, 그리고 플레이어 입력 없이 저장이 이루어져야 하는 모든 시나리오에 유용합니다.

---

## 설정

1. GameObject에 `Collider` 컴포넌트를 추가하고 트리거로 설정합니다 (`Is Trigger = true` — `WagSaveTrigger`가 자동으로 설정합니다).
2. `WagSaveTrigger`를 추가합니다:

```
Add Component > WaggleBum > WagSave > WagSave Trigger
```

`WagSaveTrigger`는 `Collider`가 필요하며 없으면 컴파일되지 않습니다 (`RequireComponent`가 적용됩니다).

---

## 인스펙터 설정

| 필드 | 설명 |
|---|---|
| **Target Layers** | 이 레이어의 오브젝트만 저장을 트리거합니다. 기본값은 모든 레이어입니다. |
| **Required Tag** | 설정된 경우, 이 태그를 가진 오브젝트만 저장을 트리거합니다. 임의의 태그와 일치하려면 비워 두세요. |
| **Disable After First Hit** | 활성화되면 트리거가 한 번 실행된 후 `ResetTrigger()`가 호출될 때까지 비활성화됩니다. |

---

## 이벤트

| 이벤트 | 설명 |
|---|---|
| `onTriggerEntered` | 유효한 콜라이더가 영역에 진입할 때 발생합니다. `Collider`를 전달합니다. |
| `onTriggerExited` | 유효한 콜라이더가 영역을 벗어날 때 발생합니다. `Collider`를 전달합니다. |

인스펙터 또는 코드에서 연결합니다:

```csharp
var trigger = GetComponent<WagSaveTrigger>();

trigger.onTriggerEntered.AddListener(collider =>
{
    Debug.Log($"{collider.name} triggered a save");
});
```

---

## 저장 동작

유효한 충돌이 발생하면 `WagSaveTrigger`는 자동으로 활성 `WagSave` 인스턴스를 호출합니다:

- **자동저장이 활성화된 경우** → `wagSave.AutoSave()` 호출
- **세이브 슬롯이 활성화된 경우** (자동저장 꺼짐) → `Quick` 슬롯을 생성하고 저장
- **그 외의 경우** → `wagSave.Save()` 호출

별도로 설정할 필요가 없습니다 — 활성 `WagSave` 인스턴스에 설정된 대로 따릅니다.

---

## 원샷 트리거 재설정

**Disable After First Hit**이 켜져 있을 때, `ResetTrigger()`를 호출하여 트리거가 다시 실행될 수 있도록 합니다:

```csharp
WagSaveTrigger trigger = GetComponent<WagSaveTrigger>();

// 메뉴에서 돌아오거나 씬을 로드한 후 등에 재활성화
trigger.ResetTrigger();
```

트리거가 현재 비활성 상태인지 확인하려면 `IsDisabled`를 확인합니다:

```csharp
if (trigger.IsDisabled)
{
    // 트리거가 이미 실행되었으며 재설정을 기다리고 있습니다
}
```

---

## 예시: 체크포인트

레벨의 체크포인트 위치에 `WagSaveTrigger`를 배치합니다. 다음과 같이 설정합니다:
- `Player` 레이어만 대상으로 설정
- 방문당 한 번만 저장되도록 **Disable After First Hit** 활성화
- `onTriggerEntered`를 연결하여 "체크포인트 도달" UI 메시지 표시

```csharp
// 플레이어가 체크포인트에 도달했을 때 메시지 표시
trigger.onTriggerEntered.AddListener(_ =>
{
    checkpointUI.ShowMessage("Checkpoint reached!");
});
```

플레이어가 해당 구역을 다시 플레이할 수 있는 경우 트리거 재활성화:

```csharp
private void OnLevelRestart()
{
    trigger.ResetTrigger();
}
```
