# 컨트롤

새 Input System에서의 리바인딩: 키보드, 마우스, 게임패드. 대화형 리바인드, 충돌 감지, 기본값으로 리셋, 감도와
반전 옵션 포함.

## 패키지는 선택 사항이고, 계속 선택 사항

컨트롤 리바인딩에는 `com.unity.inputsystem`이 필요합니다. 대부분의 Unity 프로젝트에는 없고, WagSettings는 그
모두에 깔끔하게 설치되어야 합니다 — 그래서 리바인딩 코드는 **별도의 어셈블리**에 있으며, 패키지가 있을 때만
Unity가 컴파일합니다.

| 어셈블리 | versionDefines | defineConstraints |
|---|---|---|
| `WagSettings.InputSystem` | `com.unity.inputsystem` → `WAGGLEBUM_INPUTSYSTEM_PRESENT` | 동일 |

메인 어셈블리 안의 `#if ENABLE_INPUT_SYSTEM`으로는 **충분하지 않습니다**. `#if`는 코드를 제외하지만
`WagSettings.asmdef`는 여전히 `Unity.InputSystem`을 참조해야 하고, 없는 어셈블리 참조는 컴파일 오류입니다.
게이트는 코드뿐 아니라 참조를 해결합니다.

알아둘 만한 결과: **리바인드 저장과 충돌 감지는 Input System 의존성이 없으며** `Runtime/Core`에 있습니다.
패키지가 없는 프로젝트에서도 동작하고 테스트됩니다.

## 설정하기

1. Package Manager에서 **Input System**을 설치합니다.
2. 키 `controls.rebinds`로 `StringSetting`을 만듭니다 — **설정 하나가 모든 리바인드를 담습니다**. 선택적으로
   `controls.sensitivity`에 `FloatSetting`, `controls.invertY`에 `BoolSetting`.
3. `SettingsProfile`에 추가합니다.
4. **Add Component → WaggleBum → WagSettings → Rebind Applier**를 추가하고 `InputActionAsset`을 할당합니다.
5. 선택적으로 플레이어가 리바인드할 수 있는 액션 맵을 나열합니다 — 비워 두면 모두 허용.
6. **WagSettings Manager** 아래에 둡니다. 매니저가 시작할 때 연결합니다. Quick Start의 `QuickStartControls`에
   이를 구동하는 리바인드 버튼이 있습니다.

## 대화형 리바인딩

```csharp
applier.StartInteractiveRebind(
    "Gameplay/Jump", bindingIndex: 0,
    onComplete: conflicts =>
    {
        if (conflicts.Count > 0)
        {
            ShowWarning($"That control is already used by {conflicts[0].ActionName}.");
        }
    },
    onCancel: () => ShowMessage("Rebind cancelled."));
```

![리바인드 중 키 입력을 기다리는 컨트롤 행](../../Images/rebinding-listen.png)

플레이어가 다음에 누르는 컨트롤이 바인딩이 됩니다. <kbd>Esc</kbd>로 취소.

직접 만든 리바인딩이 보통 놓치고 어플라이어가 처리하는 두 가지 세부 사항:

- **리바인드 중에는 액션이 비활성화됩니다.** 활성화된 액션은 기다리고 있는 바로 그 입력을 삼키므로 첫 입력이
  캡처되지 않고 소비됩니다. 이후 처음에 활성화되어 있었을 때만 다시 활성화됩니다.
- **실행 중인 채 남은 리바인드는 `OnDisable`에서 취소됩니다.** 그렇지 않으면 리바인드 도중 메뉴를 닫으면
  게임 내에서 플레이어가 누르는 모든 키를 듣는 작업이 남습니다.

리바인드는 충돌 여부와 관계없이 적용되고, `onComplete`가 무엇과 충돌했는지 알려줍니다. 그렇게 해서 정책 —
경고, 교환, 실행 취소 제공 — 은 강제되는 것이 아니라 당신이 고릅니다.

> **테스트 커버리지에 관해:** 대화형 리바인딩은 헤드리스 CI에서 완료할 수 없습니다 — WagSettings 코드가 전혀
> 관여하지 않는 순수한 `PerformInteractiveRebinding`조차 Unity 자체의 `InputTestFixture` 아래에서도 시작은
> 하지만 큐에 넣은 키 입력과 절대 일치하지 않습니다. Unity가 소유한 그 단계의 양쪽 모두는 자동으로
> 커버됩니다. 작업이 시작되고, 듣는 동안 액션이 음소거되며, 취소가 이전 상태를 복원하고, 완료된 리바인드가
> 설정에 도달합니다. 완료 자체는 수동 검증 씬에서 검증됩니다.

## 충돌 감지

```csharp
IReadOnlyList<BindingConflict> conflicts = applier.FindConflicts();
```

두 바인딩은 컨트롤 경로를 공유하고 **동시에 활성일 수 있을 때** 충돌합니다. 그 후반부가 UI가 양치기 소년이
되는 것을 막습니다.

| 상황 | 충돌? | 이유 |
|---|:--:|---|
| `Gameplay/Jump`와 `Gameplay/Interact` 둘 다 Space | ✅ | 같은 맵, 둘 다 활성 |
| `Gameplay/Fire`와 `Menu/Confirm` 둘 다 마우스 왼쪽 | ❌ | 맵이 함께 활성화되는 일이 없음 |
| 서로 다른 이름의 컨트롤 스킴에 있는 두 바인딩 | ❌ | 한 번에 하나의 스킴만 활성 |
| 스킴이 **없는** 바인딩과 스킴이 있는 바인딩 | ✅ | 스킴 없음은 항상 활성을 의미 |
| 같은 액션이 같은 키에 두 번 바인딩 | ✅ | 중복이며, 플레이어에게 알릴 가치 있음 |
| 둘 다 **바인딩되지 않은** 두 액션 | ❌ | 빈 컨트롤은 컨트롤이 아님 |

경로 비교는 대소문자를 무시합니다. 충돌하는 각 쌍은 한 번 보고됩니다.

변경이 반영되기 **전에** 경고하려면 후보를 기존 바인딩과 대조하세요.

```csharp
var candidate = new InputBindingDescriptor("Gameplay", "Interact", 0, "<Keyboard>/space");
IReadOnlyList<InputBindingDescriptor> clashing =
    BindingConflictDetector.FindConflictsWith(applier.DescribeBindings(), candidate);
```

## 리바인드 저장 방식

모든 리바인드는 Input System의 바인딩 JSON이 아닌 버전이 붙은 WagSettings 형식으로 **하나의** `StringSetting`에
들어갑니다. 세 가지 이유:

- 일반 설정에 저장되므로 다른 모든 것처럼 저장, 적용, 되돌리기, 동기화됨
- Input System 패키지 없이 읽고 테스트할 수 있음
- 버전 번호를 가지므로 향후 형식 변경 시 플레이어의 컨트롤을 버리지 않고 마이그레이션할 수 있음

읽을 수 없는 저장된 리바인드는 예외를 던지는 대신 **경고와 함께 기본값으로 리셋**됩니다. 리바인드를 잃는
것은 나쁩니다. 시작하지 않는 게임은 더 나쁩니다. 항목별로도 마찬가지입니다. 이후 이름을 바꾸거나 제거한
액션을 지목하는 리바인드는 경고와 함께 버려지고 나머지는 여전히 로드됩니다.

의도적으로 컨트롤을 바인딩 해제한 것은 해제된 채로 왕복합니다 — 그것은 플레이어가 한 선택이지 빠진 데이터가
아닙니다.

## 리셋

```csharp
applier.ResetAllBindings();          // everything back to the asset's authored bindings
applier.ResetBinding("Gameplay/Jump");
```

`ResetAllBindings`는 저장된 설정도 지우므로 리셋은 다음 Apply에서 영속화됩니다.

## 감도와 반전

"감도"가 무엇을 곱하는지는 게임마다 다르므로 이들은 적용되는 대신 `UnityEvent`로 게시됩니다 — 인스펙터에서
카메라 컨트롤러에 배선하세요. [그래픽](Graphics.md)과 [접근성](Accessibility.md) 토글과 같은 패턴입니다.

## 예외를 던지는 것과 경고만 하는 것

| 상황 | 결과 |
|---|---|
| 에셋에 존재하지 않는 액션 리바인딩 | **예외** — 개발자 오타 |
| 액션에 없는 바인딩 인덱스 | **예외** |
| 에셋이 할당되지 않았거나 이미 실행 중인 상태에서 리바인드 시작 | **예외** |
| 프로필에 없는 키 | **예외** — `KeyNotFoundException` |
| 읽을 수 없는 저장된 리바인드 | **경고**, 기본값으로 리셋 |
| 이름이 바뀌거나 제거된 액션의 저장된 리바인드 | **경고**, 그것만 버리고 나머지 유지 |
