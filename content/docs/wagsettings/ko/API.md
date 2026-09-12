# API

WagSettings 코어 모델입니다. 이 페이지의 모든 것은 `WaggleBum.WagSettings` 네임스페이스에 있고, ScriptableObject
에셋 타입을 제외하면 `UnityEngine` 의존성이 없습니다 — 모델은 순수 C#이므로 직접 단위 테스트할 수 있고 나중에
추출할 수 있습니다.

## 정적 API

대부분의 게임 코드에는 한 줄이면 되고, 이것이 그 한 줄입니다.

```csharp
using WaggleBum.WagSettings;

float master = WagSettings.Get<float>("audio.master");
WagSettings.Set("audio.master", 0.8f);                 // pending
WagSettings.Apply();                                    // committed and saved, in one batch
WagSettings.Definition<float>("audio.master").Changed += value => { };
```

| 멤버 | 동작 |
|---|---|
| `Get<T>(key)` | 보류 값 |
| `Set<T>(key, value)` | 보류 값 설정. 바뀌었으면 `true` |
| `Definition<T>(key)` | 키 뒤의 `ISettingDefinition<T>`. `Changed` 이벤트용 |
| `Apply()` / `Revert()` / `ResetAll()` | 레지스트리의 명령 |
| `IsDirty` | 보류 중인 것이 있는지 |
| `Registry` | 레지스트리 그 자체. 그 이상의 모든 것을 위해 |
| `Manager` / `IsReady` | 실행 중인 `WagSettingsManager`, 또는 그것이 있는지 |

모든 호출은 활성 **`WagSettingsManager`**로 해석됩니다. 실행 중인 것이 없으면 `Get`과 나머지는 **예외를 던지며**
고칠 두 가지 방법을 지목합니다 — 조용한 기본값을 절대 반환하지 않습니다. 아무것도 저장하지 않으면서 "동작하는"
설정 메뉴가 바로 이것이 막기 위해 존재하는 실패이기 때문입니다. 예외를 원하지 않을 때의 확인은 `IsReady`입니다.

### `WagSettingsManager`

레지스트리의 유일한 소유자. **WaggleBum → WagSettings → WagSettings Manager**를 씬에 추가하고 프로필을
할당하거나, 아무것도 할당하지 않으면 Resources 폴더의 기본 프로필을 사용합니다. 이것은:

- 프로필에서 레지스트리를 지연 생성하므로 `Awake`에서 열리는 메뉴도 같은 것을 얻습니다.
- `Start`에서 **그 아래의 모든 `SettingApplierBase`를 연결**합니다. 작성할 것 없이.
- 열리는 모든 메뉴에 레지스트리를 넘깁니다 — 매니저가 실행 중이면 메뉴는 자기 것을 만들지 않습니다.
- 기본적으로 씬 로드를 넘어 유지되며, 두 번째 매니저는 경고하고 스스로 제거됩니다.

`Attach(applier)`는 다른 곳에 있는 어플라이어를 다룹니다. 분리는 직접 하세요.

### `WagSettingsBootstrapper`

씬에 매니저가 없고 `SettingsProfile`이 Resources 폴더에 있으면 첫 씬이 로드된 뒤 하나가 생성됩니다 — 그래서
저장된 설정은 첫 프레임 전에 적용되고 정적 API는 아무것도 배치하지 않아도 동작합니다. 바로 이 이유로 셋업은
`Assets/WagSettings/Resources`에 생성합니다. Resources에 프로필이 없으면 아무 일도 일어나지 않습니다. 여러
프로필이 있으면 의도한 것에 **Is Default**를 체크하세요. 아무것도 플래그되지 않으면 경고하고 첫 번째를
가져갑니다.

`WagSettings.Reset()`은 정적 상태를 지우고 모든 플레이 세션 전에 실행되므로, 도메인 리로드 없는 Enter Play
Mode가 새 세션에 이전 세션의 매니저를 넘길 수 없습니다. 테스트는 셋업에서 이를 호출합니다.

## 전체 형태

```
SettingsProfile  (asset)  ── CreateRegistry(store) ──▶  SettingsRegistry
      │                                                       │
      └─ SettingAsset ─┐                          holds       ▼
                       └──────────────────────▶  ISettingDefinition ──▶ ISettingsStore
                                                       ▲
                             SettingDefinition<T> (plain C#, does the work)
```

설정은 세 가지 값을 갖고, 그 차이가 모델의 전부입니다.

| | 의미 |
|---|---|
| `DefaultValue` | 작성된 기본값. `ResetToDefault()`가 복원. |
| `Value` | **보류** 값 — 사용자가 지금 막 맞춘 값. |
| *적용된 기준선* | `Apply()`로 커밋되었거나 스토어에서 로드된 마지막 값. |

`IsDirty`는 단순히 `Value != baseline`입니다. 이것이 Apply 버튼을 켜고, Cancel 버튼을 동작하게 하며, 일괄
커밋을 한 번의 쓰기로 만듭니다.

## `SettingDefinition<T>`

순수 C# 설정. 키와 기본값으로 생성합니다.

```csharp
var master = new SettingDefinition<float>("audio.master", 0.8f);

master.Changed += volume => mixer.SetFloat("MasterVolume", AudioVolume.LinearToDecibels(volume));
master.Set(0.5f);          // raises Changed, IsDirty becomes true
```

| 멤버 | 비고 |
|---|---|
| `Key`, `DefaultValue`, `ValueType` | 불변 식별자. |
| `Value` / `Set(T)` | `Set`은 값이 움직였는지 반환. 같은 값의 쓰기는 no-op이며 아무것도 발생시키지 않으므로 어플라이어가 불필요하게 깨어나지 않음. |
| `Changed` | `SettingChangedHandler<T>` — 타입 지정. 어플라이어와 UI용. |
| `ValueChanged` | 타입 무관 `Action`. 레지스트리가 더티 상태 추적에 사용. |
| `IsDirty` | 보류 값이 적용된 기준선과 다름. |
| `Apply()` | 보류 값을 기준선으로 채택. |
| `Revert()` | 기준선 복원. 값이 움직이면 `Changed` 발생. |
| `ResetToDefault()` | 작성된 기본값 복원. 설정은 **더티**로 남으므로 리셋은 여전히 취소 가능. |
| `LoadFrom(store)` / `SaveTo(store)` | 단일 값 읽기/쓰기. `SaveTo`는 플러시하지 **않음**. |

동등성은 생성자에 비교자를 넘기지 않는 한 `EqualityComparer<T>.Default`를 사용합니다 — 정확한 동등이 아닌
허용 오차를 원하는 `float` 설정에 유용합니다.

### `ISettingDefinition<T>`

`SettingDefinition<T>`와 ScriptableObject 에셋 타입은 모두 `ISettingDefinition<T>`를 구현하며, 이는 `Value`,
`Set`, `DefaultValue`, `Changed`를 갖습니다. UI와 어플라이어는 구체 클래스가 아니라 **이 인터페이스**에
바인딩하세요. 그러면 에셋으로 작성되었든 코드로 만들어졌든 설정이 똑같이 동작합니다 —
`SettingsRegistry.Get<T>`가 바로 그 이유로 이를 반환합니다.

## `SettingsRegistry`

모든 설정을 한곳에, 하나의 스토어에 바인딩하여. UI가 바인딩하는 것이 이것입니다.

```csharp
using var registry = new SettingsRegistry(store);
registry.Register(master);

registry.IsDirty;          // false — Register loaded the persisted value
master.Set(0.5f);
registry.IsDirty;          // true
registry.Apply();          // writes dirty settings, flushes once
```

| 멤버 | 비고 |
|---|---|
| `Register(definition)` | 설정을 추가하고 **영속화된 값을 로드**하므로 새 레지스트리는 깨끗함. 중복 키에서 예외. |
| `Unregister(key)` / `Clear()` | 설정을 제거하고 레지스트리의 구독을 분리. |
| `Get<T>(key)` | 타입 지정 조회. `ISettingDefinition<T>` 반환. 없으면 `KeyNotFoundException`, 타입 불일치면 `InvalidCastException`. |
| `TryGet` / `Contains` | 예외를 던지지 않는 조회. |
| `Definitions` | 등록 순서의 등록된 설정 — UI가 제시하는 순서. |
| `IsDirty` | 어느 설정이든 적용되지 않은 변경이 있으면 true. |
| `DirtyStateChanged` | clean↔dirty **전환**에서만 발생. 키 입력마다가 아님. |
| `Load()` | 스토어에서 모든 것을 다시 읽고 보류 편집을 버림. |
| `Apply()` | 더티 설정을 쓰고, `Flush()`를 **한 번** 호출하고, 기준선으로 채택. 쓴 개수 반환. 깨끗한 설정은 절대 다시 쓰지 않음. |
| `Revert()` | 보류 편집을 버림. |
| `ResetAll()` | 모든 기본값을 복원하고 레지스트리는 더티로 남김. |
| `Dispose()` | 모든 구독을 분리. |

> 레지스트리는 담고 있는 각 설정을 구독합니다. 소유하는 씬이나 프로필이 사라질 때 **Dispose**하세요 (또는
> `Clear()` 호출). 그렇지 않으면 그 구독이 설정 에셋을 통해 레지스트리를 살려 둡니다.

### 일괄 처리

`Apply()`는 `Flush()`를 호출하는 유일한 것이며 최대 한 번 호출합니다. 실제 스토어는 디스크나 네트워크에 닿을 수
있으므로 중요합니다 — 설정이 마흔 개인 메뉴도 커밋은 한 번입니다.

## 바인딩 계층

UI는 레지스트리에 직접이 아니라 뷰 모델에 바인딩합니다. UI Toolkit과 uGUI 메뉴 모두 같은 것을 거치므로 서로
어긋날 수 없습니다 — 그리고 메뉴 전체를 컨트롤을 인스턴스화하지 않고 테스트할 수 있습니다.

### 레이블과 카테고리

설정은 `DisplayName`과 `Category`를 갖습니다. 둘 다 작성할 필요가 없습니다. 키에서 파생되므로 메뉴가 원시 키를
보여주는 일은 없습니다.

| 키 | 파생 레이블 | 파생 카테고리 |
|---|---|---|
| `audio.master` | Master | Audio |
| `display.windowMode` | Window Mode | Display |
| `accessibility.reduce_motion` | Reduce Motion | Accessibility |
| `simple` | Simple | General |

에셋에 둘 중 하나를 작성하면 파생 값을 오버라이드합니다. 파생은 폴백이지 정책이 아닙니다 — 플레이어에게
보이는 것은 결국 작성되고 현지화되어야 합니다.

### `ISettingBinder`

뷰가 보는 설정 하나: `DisplayName`, `Category`, `IsDirty`, `BoxedValue`, `Changed` 이벤트, 가용성.

```csharp
var binder = (SettingBinding<float>)category.Settings[0];
binder.Set(0.5f);            // goes through the registry-tracked setting
```

**편집은 레지스트리가 추적하는 설정을 통과하며, 옆으로 돌아 스토어로 가는 일은 없습니다.** 스토어에 직접
쓰는 뷰는 Apply 버튼이 보류 중인 내용에 관해 거짓말하게 만듭니다.

**가용성**은 현재 하드웨어가 지원할 수 없는 설정을 제시하는 방법입니다.

```csharp
binder.SetAvailability(
    applier.SupportsFeature(GraphicsFeature.RenderScale),
    "Render scale needs the Universal Render Pipeline.");
```

사용 불가 바인더는 예외를 던지지 않고 쓰기를 무시하므로, 아직 컨트롤을 회색 처리하지 않은 뷰가 메뉴를
충돌시킬 수 없습니다. 컨트롤을 회색 처리하고 `UnavailableReason`을 보여주세요 — **숨기지 마세요**. 그러면
플레이어가 읽은 적 있는 옵션을 찾아 헤맵니다.

### `SettingsMenuModel`

```csharp
using var model = new SettingsMenuModel(registry, SettingBinderFactory.CreateAll(registry), ownsBinders: true);

model.SearchText = "volume";
foreach (SettingsMenuCategory category in model.Categories)
{
    foreach (ISettingBinder setting in category.Settings) { /* build a row */ }
}
```

| 멤버 | 비고 |
|---|---|
| `Categories` | 일치하는 카테고리를 **작성** 순서로. 알파벳순이 아님 — 프로필 순서는 설계상의 선택. 빈 것은 제외. |
| `SearchText` | 레이블, 카테고리, 키에 대소문자 구분 없이 일치. 실제 변경마다 한 번 `Changed` 발생. |
| `CanApply` / `CanRevert` | 무언가 더티인 동안 true. |
| `CanReset` | 작성된 기본값과 다른 것이 있을 때만 true — 아무것도 하지 않는 Reset이 클릭을 유도해서는 안 됨. |
| `Apply()` / `Revert()` / `ResetAll()` | 레지스트리로 직행. `Apply`는 쓴 개수 반환. |
| `Changed` | 값, 가용성, 검색, 더티의 어떤 변경이든. |

`SettingBinderFactory`는 레지스트리 전체의 타입 지정 바인더를 만들며, 일반적인 값 타입은 직접 매칭하고
커스텀 타입은 리플렉션으로 폴백합니다 — 그래서 설정 타입 추가가 switch 편집을 뜻하지 않습니다.

> IL2CPP에서는 리플렉션 경로에 제네릭 인스턴스화가 빌드 시점에 존재해야 합니다. 패키지의 `link.xml`은
> `SettingBinding<T>`의 생성자가 제거되지 않게 하지만, 자신만의 값 타입이라면 `SettingBinding<YourType>`이 코드
> 어딘가에 나타나야 — 필드 하나면 충분합니다 — AOT 컴파일러가 생성합니다. 내장된 네 가지 값 타입은 아무것도
> 필요 없습니다.

> 메뉴가 닫힐 때 모델을 Dispose하세요. 레지스트리와 모든 바인더를 구독합니다. `ownsBinders: true`면 바인더도
> 함께 Dispose합니다.

## `ISettingsStore`

영속성 이음새. `PlayerPrefsStore`가 기본이고 WagSave가 설치되면 `WagSaveStore`가 이어받습니다.
[영속성](Persistence.md)을 참고하세요.

```csharp
public interface ISettingsStore
{
    bool Has(string key);
    T    Load<T>(string key, T fallback);
    void Save<T>(string key, T value);   // buffered
    void Flush();                        // commits the batch
    void Delete(string key);             // buffered
}
```

`Save`와 `Delete`는 버퍼링하고, `Flush`만 커밋합니다.

## 설정 에셋

설정을 에셋으로 작성하고 참조할 수 있게 하는 ScriptableObject 래퍼입니다. 각각 내부 `SettingDefinition<T>`에
위임합니다 — 에셋은 작성 표면이고, 정의가 일을 합니다.

`BoolSetting` · `IntSetting` · `FloatSetting` · `StringSetting` · `EnumSetting`

**Assets → Create → WaggleBum → WagSettings**에서 만듭니다. 모든 에셋에는 **Key**가 필요합니다 — 빈 키는 설정이
사용되는 즉시 예외를 던집니다.

`EnumSetting`은 C# 열거형이 아니라 작성된 옵션 이름 목록에 대한 선택된 **인덱스**를 저장하므로, 하나의 에셋
타입이 모든 드롭다운 (창 모드, 색맹 프리셋, 품질 티어)을 담당하고 UI는 리플렉션 없이 표시 이름을 얻습니다.

## `SettingsProfile`

게임이 노출하는 설정을 묶고 어떤 스토어가 이를 영속화하는지 기록합니다.

```csharp
using SettingsRegistry registry = profile.CreateRegistry(store);
```

`CreateRegistry`는 모든 설정을 작성 순서로 등록합니다. **목록의 빈 슬롯은** 건너뛰지 않고 **예외를 던집니다** —
런타임에 메뉴에서 설정을 조용히 빠뜨리는 것은 시끄러운 실패보다 나쁩니다.

`StoreKind`는 `Automatic` (설치되어 있으면 WagSave, 아니면 PlayerPrefs) 또는 `PlayerPrefs`입니다.
`SettingsStoreFactory`가 이를 해석합니다. `IsDefault`는 여러 프로필이 Resources 폴더를 공유할 때 매니저가
사용하는 프로필을 표시합니다.

## `Guard`와 오류

모든 공개 진입점은 `Guard`를 통해 검증하고, 모든 WagSettings 오류는 하나의 계약을 따릅니다.
**create → log → throw**.

```csharp
Guard.AgainstNull(store, nameof(store));
Guard.AgainstNullOrEmpty(value, nameof(value));
Guard.AgainstInvalidKey(key, nameof(key));
Guard.AgainstNumberNotInRange(value, 0, 10, nameof(value));
```

유효한 키는 비어 있지 않고, 공백이 아니며, `"` `\` `{` `}` `,` `:` 와 제어 문자가 없습니다. 점은 허용되며
관례적인 그룹 구분자입니다: `audio.master`, `display.window_mode`.

실패를 관찰하려면 `WagSettingsLog.ErrorLogged`를 구독하세요 — 예외가 던져지기 **직전**에 발생하므로 상위에서
무언가 잡더라도 오류를 볼 수 있습니다.

```csharp
WagSettingsLog.ErrorLogged += exception => Debug.LogException(exception);
```
