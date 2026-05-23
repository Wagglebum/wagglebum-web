# WagSave 컴포넌트

`WagSaveComponent`는 GameObject를 WagSave 시스템에 참여시키는 MonoBehaviour입니다. 저장이 트리거되면 WagSave는 로드된 모든 씬에서 `WagSaveComponent` 인스턴스를 찾아 설정된 필드와 속성의 값을 캡처합니다. 불러올 때는 해당 값들이 다시 기록됩니다.

---

## 컴포넌트 추가

상태를 유지하려는 모든 GameObject에 `WagSaveComponent`를 추가합니다:

```
Add Component > WaggleBum > WagSave > WagSave
```

또는 코드에서:

```csharp
gameObject.AddComponent<WagSaveComponent>();
```

GameObject당 하나의 `WagSaveComponent`만 허용됩니다 (`DisallowMultipleComponent`가 적용됩니다).

---

## 저장할 항목 설정

`WagSaveComponent`는 모든 것을 저장하지 않습니다 — 포함할 필드와 속성을 정확히 선택합니다. 이는 WagSave 에디터 창을 통해 수행됩니다.

1. `Window > WagSave`를 엽니다
2. **Scene Content**로 이동합니다
3. 목록에서 GameObject를 찾아 **Configure**를 클릭합니다

에디터가 GameObject의 모든 컴포넌트에 대한 트리 뷰를 엽니다. 컴포넌트를 펼치면 사용 가능한 필드와 속성이 표시되며, 포함할 항목을 체크합니다.

> **팁:** 깊이 슬라이더를 사용하여 컴포넌트 트리가 기본적으로 얼마나 깊이 펼쳐지는지 제어합니다.

### 저장 가능한 항목은?

WagSave는 리플렉션을 사용하여 값을 읽고 씁니다. 다음에 해당하는 모든 필드 또는 속성을:
- 기본 타입 (`int`, `float`, `bool`, `string`)
- Unity 값 타입 (`Vector2`, `Vector3`, `Quaternion`, `Color`)
- 직렬화 가능한 구조체 또는 클래스

...저장 대상으로 선택할 수 있습니다.

---

## 프리팹 지원

프리팹의 경우, 개별 씬 인스턴스가 아닌 **프리팹 에셋**에서 `WagSaveComponent`를 설정합니다. 이렇게 하면 모든 인스턴스가 동일한 저장 설정을 공유합니다.

1. `Window > WagSave`를 엽니다
2. **Prefabs**로 이동합니다
3. 프리팹을 찾아 **Configure**를 클릭합니다

프리팹 에셋의 GUID는 컴포넌트의 `prefabId`에 저장되어, WagSave가 동적으로 스폰된 오브젝트가 있던 씬을 로드할 때 올바른 프리팹을 재인스턴스화할 수 있습니다.

> **참고:** 씬 인스턴스에 오버라이드된 `WagSaveComponent`가 있는 경우, 프리팹 에셋의 변경 사항은 해당 인스턴스에 영향을 미치지 않습니다.

---

## 씬 식별

각 `WagSaveComponent`는 다음으로 식별됩니다:

| 속성 | 설명 |
|---|---|
| `componentId` | 에디터에서 컴포넌트가 처음 설정될 때 할당되는 안정적인 GUID. 세션 간에 유지됩니다. |
| `sceneId` | 씬 에셋 경로의 해시. 저장 데이터를 올바른 씬으로 범위를 지정합니다. |
| `runtimeId` | 런타임에 (`Start`에서) 생성됩니다. 한 세션에서 스폰된 동일 프리팹의 여러 인스턴스를 구분합니다. |
| `prefabId` | 소스 프리팹 에셋의 GUID. 불러올 때 프리팹을 재인스턴스화하는 데 사용됩니다. |

이 ID들은 모두 자동으로 할당됩니다 — 직접 설정할 필요가 없습니다.

---

## 동적 오브젝트 (런타임 스폰 프리팹)

WagSave는 동적으로 인스턴스화된 프리팹을 처리합니다. 프리팹 인스턴스가 저장되면, `prefabId`와 `runtimeId`가 데이터와 함께 저장됩니다. 불러올 때 `WagSaveComponent.InstantiatePrefabById`를 사용하여 오브젝트를 재생성합니다:

```csharp
// 저장된 prefabId로 프리팹 스폰
GameObject go = WagSaveComponent.InstantiatePrefabById(savedPrefabId);
```

> **런타임 요구사항:** 빌드에서 `InstantiatePrefabById`가 작동하려면 프리팹이 `Resources` 폴더에 있어야 합니다. 에디터에서는 `AssetDatabase`가 사용되므로 `Resources` 폴더가 필요하지 않습니다.

---

## 코드에서 값 읽기 및 쓰기

대부분의 경우 이것들을 직접 호출할 필요는 없습니다 — `WagSave.Save()`와 `WagSave.Load()`가 모든 것을 처리합니다. 하지만 수동 제어가 필요한 경우 컴포넌트는 다음 메서드를 제공합니다:

```csharp
var component = GetComponent<WagSaveComponent>();

// 선택된 모든 저장 경로의 현재 스냅샷 가져오기
GameObjectData data = component.GetSaveItemData();

// 특정 경로에 값 다시 쓰기
component.SetSelectionValue("componentId.p|health", 75);
```

---

## 디버거에서 컴포넌트 검사

Play 모드에서 `Window > WagSave`를 열고 **Debugger**로 이동합니다. **Save Content** 패널에는 활성 씬의 모든 `WagSaveComponent`, 각각에 설정된 저장 항목 수, 그리고 **Configure** 및 **Focus** 버튼이 표시됩니다.
