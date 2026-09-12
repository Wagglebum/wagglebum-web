# 확장성

설정 추가는 에셋 하나와 목록 하나를 건드립니다. 다음에 Play를 누르면 메뉴에 있습니다. 코드는 값이 무언가를
*해야* 할 때만 필요하고, 그때도 보통 한 줄입니다.

## 설정 추가

**짧은 길:** 에디터의 **Settings Profile** 페이지 (*Tools → WaggleBum → WagSettings → Editor*)에서 **설정 추가**. 대화
상자에서 종류를 고르고, 키를 입력하고 — 입력하는 동안 검사됩니다 — 기본값과, 슬라이더라면 범위를 설정하고
**생성**을 누르세요. 에셋이 프로필 옆에 만들어져 프로필에 추가됩니다. 끝. Play를 누르세요.

![키를 입력한 설정 추가 대화 상자와 만들어질 에셋](../Images/add-setting-dialog.png)

**손으로:**

**1. 에셋을 만듭니다.** *Assets → Create → WaggleBum → WagSettings →* 필요한 타입:

| 타입 | 메뉴의 컨트롤 | 중요한 필드 |
|---|---|---|
| Float Setting | 슬라이더 | **Key**, **Default**, **Minimum**, **Maximum** |
| Int Setting | 정수 슬라이더 | **Key**, **Default**, **Minimum**, **Maximum** |
| Bool Setting | 토글 | **Key**, **Default** |
| Enum Setting | 나열한 **Options**의 드롭다운 | **Key**, **Default** (인덱스), **Options** |
| String Setting | 텍스트 필드 | **Key**, **Default** |

![Assets → Create → WaggleBum → WagSettings 메뉴](../Images/create-setting-menu.png)

키는 `category.name`입니다. 점 앞부분이 **탭**, 뒷부분이 **레이블**이 됩니다. `gameplay.difficulty`는 Gameplay
탭에 "Difficulty"로 들어가고, `gameplay.cameraShake`는 "Camera Shake"로 읽힙니다. 점이 없는 키는 General에
들어갑니다.

> 키는 저장 키입니다. 출시 후 바꾸면 모든 플레이어의 저장된 값이 고아가 되므로 영구적인 것으로 취급하세요.
> 키에는 `"` `\` `{` `}` `,` `:` 나 제어 문자를 넣을 수 없습니다.

**2. `SettingsProfile`에 추가합니다.** 에셋을 프로필의 목록에 넣으세요 — 셋업이 `Assets/WagSettings/Resources`에
생성한 것이든 자신의 것이든. 목록의 순서가 메뉴의 순서입니다. 나중에 셋업을 재실행해도 손으로 추가한 것은
유지됩니다. 자신이 쓴 항목만 교체합니다.

![설정 목록이 있는 Inspector의 SettingsProfile](../Images/profile-inspector.png)

**3. Play를 누릅니다.** UI Toolkit 메뉴에 행이 있습니다. 맞는 탭, 맞는 컨트롤, 맞는 레이블, 그리고
Apply / Revert / Reset, 검색, 더티 표시, 영속성이 이미 동작합니다.

**uGUI 메뉴**에서는 행을 손으로 배치하므로 하나 추가하세요. 프리팹의 기존 행을 복제하고
(`Sample Scenes/Quick Start/Prefabs/WagSettingsMenu (uGUI).prefab`에 종류별로 하나씩 있습니다), 맞는 카테고리
패널에 넣고, 바인더의 **Key**를 설정하세요. 그것이 두 프레임워크의 차이 전부입니다 —
[시작하기](GettingStarted.md)를 참고하세요.

### 읽기

`WagSettingsManager`가 실행 중이면 어디서든:

```csharp
int difficulty = WagSettings.Get<int>("gameplay.difficulty");                 // the pending value
WagSettings.Definition<int>("gameplay.difficulty").Changed += value => { };   // Set, Revert, Reset
```

대부분의 게임플레이 설정에는 이것이 코드의 전부입니다. 필요한 곳에서 읽거나 이벤트에 반응하세요. 이 페이지의
나머지는 Unity 자체를 구동해야 하는 값을 위한 것입니다.

### 인스펙터는 입력하는 동안 키를 검사함

그렇지 않으면 잘못된 키는 설정이 처음 *사용될* 때에야 실패합니다 — 종종 다른 씬에서, 다른 날에, 실수한
곳에서 멀리 떨어져서. 인스펙터는 즉시 보고합니다.

![설정 에셋의 잘못된 키를 표시하는 Inspector](../Images/inspector-key-check.png)

| | 보고 | 예 |
|---|---|---|
| 사용 불가 | **Error** | 비어 있음, 금지된 문자, 앞뒤 공백 |
| 동작하지만 관례에 어긋남 | **Warning** | 카테고리 접두사 없음, `Audio.Master` 대소문자, 점 사이의 빈 부분 |

Warning은 조언이지 장애물이 아닙니다 — 카테고리 없는 키도 동작합니다. "General"에 들어갈 뿐입니다.

### 현재 값 보기

플레이 중이 아닐 때 인스펙터는 작성된 필드만 보여줍니다. 현재 값은 런타임 상태이고 의도적으로 에셋에 절대
저장되지 않기 때문입니다 — 플레이어의 선택은 출시하는 파일이 아니라 세이브 데이터에 속합니다.

플레이 모드에 들어가면 인스펙터는 실시간 값, 적용되지 않은 변경이 있는지, 되돌리거나 리셋하는 버튼을
보여줍니다. 게임이 분명히 `0.25`로 실행 중인데 Default가 여전히 `0.8`인 에셋은 올바르게 동작하는 것입니다.

## 어플라이어 작성

어플라이어는 값을 일정에 따라 Unity 효과로 바꿉니다 — 플레이어가 드래그하는 동안 실시간으로, 또는 Apply를
누를 때만. `UnityEngine`을 압니다. 코어는 모릅니다. `SettingApplierBase`에서 파생하고 두 가지를 제공하세요.
어떤 설정을 추적할지, 그리고 어떻게 밀어 넣을지.

```csharp
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Audio;
using WaggleBum.WagSettings;

public sealed class MusicVolumeApplier : SettingApplierBase
{
    [SerializeField] private AudioMixer _mixer = null!;

    private ISettingDefinition<float> _music = null!;

    protected override void ResolveSettings(SettingsRegistry registry, IList<ISettingDefinition> tracked)
    {
        _music = Require<float>(registry, "audio.music");
        tracked.Add(_music);
    }

    public override void ApplyCurrentValues()
    {
        _mixer.SetFloat("MusicVolume", AudioVolume.LinearToDecibels(_music.Value));
    }
}
```

컴포넌트를 **WagSettings Manager 아래**에 두세요. 매니저는 시작할 때 그 아래의 모든 것을 연결합니다. 호출할
것이 없습니다. (다른 곳에 있어야 하는 어플라이어는 `WagSettings.Manager.Attach(applier)`로, 분리는 직접
하세요.)

기반 클래스는 손으로 작성한 어플라이어가 틀리는 두 가지를 처리합니다.

1. **모든 `+=`에 짝이 되는 `-=`가 있습니다.** 설정은 ScriptableObject이므로 씬보다 오래 삽니다. 해제하지 않은
   구독은 컴포넌트, 그 GameObject, 그리고 이들이 참조하는 모든 것을 씬 로드를 넘어 살려 둡니다.
   `Attach`/`Detach`와 Unity의 `OnEnable`/`OnDisable`이 배선되어 있습니다.
2. **영속화된 값이 연결 시 적용됩니다.** `Changed`에만 반응하는 어플라이어는 플레이어가 다음에 설정을 건드릴
   때까지 씬에 작성된 값으로 게임을 실행합니다 — 누군가 씬을 다시 로드하기 전까지 숨어 있는 버그입니다.

세 번째 규칙은 여전히 당신의 것입니다. **어플라이어에서 절대 스토어에 쓰지 마세요.** 어플라이어는 읽고,
레지스트리가 `Apply()`에서 한 번 씁니다.

`Require`는 레지스트리에 없는 키에서 그 키를 지목하며 예외를 던집니다. 의도적입니다. 조용히 아무것도 구동하지
않는 슬라이더는 망가진 셋업이 아니라 망가진 게임처럼 보입니다.

### Immediate 또는 OnApply

모든 어플라이어의 `Apply Mode` 필드가 언제 동작할지 결정합니다.

| 모드 | 발생 시점 | 용도 |
|---|---|---|
| `Immediate` *(기본)* | 추적하는 설정의 모든 변경 | 플레이어가 드래그하며 듣거나 봐야 하는 저렴한 변경 — 볼륨, UI 배율 |
| `OnApply` | `Apply()` 또는 `Load()`를 통한 레지스트리 커밋 | 비싸거나 방해가 되는 것 — 해상도, 품질 티어, 창 모드 |

`OnApply`가 드롭다운을 스크롤하는 동안 해상도 설정이 창을 요동치게 하는 것을 막습니다.
`SettingsRegistry.Committed`를 듣는데, 이는 무언가를 쓴 `Apply()` 뒤와 `Load()` 뒤에 발생합니다 — 둘 다
커밋된 값이 실제로 바뀐 경우입니다.

`ApplyCurrentValues()`는 바뀐 것만이 아니라 어플라이어가 추적하는 **모든** 설정을 다시 적용한다는 점에
유의하세요. 어플라이어 하나가 소유하는 몇 개의 설정에는 설정별 콜백을 라우팅하는 것보다 저렴하고, 메서드를
"현재 상태를 Unity에 밀어 넣기"라는 단순한 것으로 유지합니다.

## 새 설정 *타입* 추가

내장 타입으로 표현할 수 없는 값에만 필요합니다.

```csharp
[CreateAssetMenu(fileName = "New Vector2Setting", menuName = "WaggleBum/WagSettings/Vector2 Setting")]
public sealed class Vector2Setting : TypedSettingAsset<Vector2>
{
}
```

이것이 구현의 전부입니다 — `TypedSettingAsset<T>`가 키, 기본값, 값, 변경 이벤트, 더티 추적을 제공합니다. 타입은
Unity에서 직렬화 가능해야 하고, 사용하는 스토어가 이를 영속화할 수 있어야 합니다 (`PlayerPrefsStore`는 원시
타입을 처리합니다. [영속성](Persistence.md) 참고).

고정된 선택 목록에는 새 타입보다 `EnumSetting`을 쓰세요 — 인덱스와 표시 이름을 저장하고 이미 드롭다운 UI와
동작합니다.

## 스토어 작성

다른 곳 — 세이브 파일, 백엔드, 테스트 더블 — 에 영속화하려면 `ISettingsStore`를 구현하세요.

```csharp
public sealed class MyStore : ISettingsStore
{
    public bool Has(string key)                  { ... }
    public T    Load<T>(string key, T fallback)  { ... }
    public void Save<T>(string key, T value)     { /* buffer, do not commit */ }
    public void Flush()                          { /* commit the whole batch */ }
    public void Delete(string key)               { /* buffer */ }
}
```

중요한 계약은 하나입니다. **`Save`와 `Delete`는 버퍼링하고, `Flush`가 커밋합니다.** 레지스트리는 모든 더티
설정을 쓴 다음 정확히 한 번 플러시하므로, 쓰기마다 커밋하는 스토어는 Apply 한 번을 마흔 번의 왕복으로
만듭니다.

작성한 스토어는 왕복 테스트를 하세요 — set, save, flush, reload, assert — `Tests/EditMode`의 테스트와 같은
형태입니다.
