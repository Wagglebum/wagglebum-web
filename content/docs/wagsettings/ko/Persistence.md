# 영속성

WagSettings는 `ISettingsStore`라는 작은 인터페이스 하나를 통해 저장합니다. 기본으로는 `PlayerPrefsStore`를
사용하며, 이는 의존성 없이 모든 Unity 프로젝트에서 동작합니다. [WagSave](https://www.wagglebum.com)를
설치하면 영속성이 스스로 업그레이드됩니다 — 버전 관리, 클라우드 동기화, 암호화, 다중 프로필 — 배선할 것은
없습니다.

## 저장 방식

플레이어가 슬라이더를 드래그하는 동안 아무것도 기록되지 않습니다. 설정은 **보류** 값을 가지며, 스토어는
레지스트리가 적용할 때에만 이를 듣습니다.

```csharp
master.Set(0.5f);      // nothing touches disk
registry.Apply();      // writes dirty settings, then Flush() — once
```

`Apply()`는 실제로 더티인 설정만 쓰고 `Flush()`를 **정확히 한 번** 호출합니다. 설정이 마흔 개인 메뉴도 커밋
한 번이며, 이것이 디스크나 네트워크 기반 스토어를 실용적으로 만듭니다.

`Revert()`는 스토어에 닿지 않고 보류 값을 버립니다. 이것이 Cancel 버튼을 두 번째 쓰기가 아닌 정직한 것으로
만듭니다.

### 버퍼링되지만 보이지 않는 것은 아님

`Save`와 `Delete`는 `Flush`까지 버퍼링하지만, `Has`와 `Load`는 커밋된 상태 위에 겹쳐진 그 버퍼링된 쓰기를
읽습니다 — 호출자는 항상 자신의 쓰기를 봅니다. `Flush`는 **내구성**을 바꾸지, 가시성을 바꾸지 않습니다.

```csharp
store.Save("audio.master", 0.5f);
store.Load("audio.master", 0f);   // 0.5 — your own write
// another store instance still reads the old value until Flush()
```

## 스토어 선택

`SettingsProfile`은 원하는 백엔드를 기록하고 `SettingsStoreFactory`가 이를 해석합니다.

| `StoreKind` | 결과 |
|---|---|
| `Automatic` *(기본)* | 설치되어 있으면 WagSave, 아니면 PlayerPrefs |
| `PlayerPrefs` | WagSave가 설치되어 있어도 항상 PlayerPrefs |

```csharp
ISettingsStore store = SettingsStoreFactory.Create(profile.StoreKind);
using SettingsRegistry registry = profile.CreateRegistry(store);
```

인수 없는 `SettingsStoreFactory.Create()`는 `PlayerPrefsStore`를 반환합니다. 그 기본값 덕분에 WagSettings는
셋업 없이 동작합니다.

## PlayerPrefsStore

기본값입니다. 단순하고, 동기적이며, 어디에나 있습니다.

**지원 타입.** PlayerPrefs 자체는 `int`, `float`, `string`만 담으므로 이 스토어는 그것들에 더해 `bool`과
열거형을 지원하며 `int`로 매핑합니다.

| 설정 타입 | 저장 형식 |
|---|---|
| `bool` | `int` — `0` 또는 `1` |
| `int` | `int` |
| `float` | `float` |
| `string` | `string` — PlayerPrefs에는 null이 없으므로 null 값은 빈 문자열로 저장 |
| 열거형 / `EnumSetting` | `int` — 기저 값 |

그 외에는 플러시 시점에 조용히가 아니라 **`Save` 호출 시** `NotSupportedException`을 던지므로 실패가 원인이 된
코드를 가리킵니다. 먼저 `PlayerPrefsStore.IsSupportedType(type)`으로 확인하세요.

**키 네임스페이스.** 모든 키는 접두사와 함께 기록되며 기본은 `WagSettings.`이므로, `audio.master`라는 설정은
`WagSettings.audio.master`로 저장되어 게임 자체의 PlayerPrefs 항목과 절대 충돌하지 않습니다.

```csharp
var store = new PlayerPrefsStore("MyGame.Settings.");
```

> 출시 후 접두사를 바꾸면 키를 바꾸는 것과 똑같이 이전에 저장된 모든 값이 고아가 됩니다.

**제공하지 않는 것.** 버전 관리나 마이그레이션, 클라우드 동기화, 암호화, 프로필이 없고, PlayerPrefs는 평문으로
저장됩니다 — Windows에서는 레지스트리에, macOS에서는 plist에 — 그래서 플레이어가 쉽게 편집할 수 있습니다.
설정에는 보통 그것으로 충분합니다. 아니라면 그것이 WagSave가 있는 이유입니다.

## WagSave로 활성화되는 것

`com.wagglebum.wagsave`를 설치하면 WagSettings가 `WAGGLEBUM_WAGSAVE_PRESENT` 디파인을 통해 컴파일 시 감지합니다.
`WagSettings.WagSave` 어셈블리 — WagSave가 없으면 Unity가 통째로 건너뛰는 — 가 시작 시 WagSave 기반 스토어를
`SettingsStoreFactory`에 등록합니다. `Automatic`으로 설정된 프로필은 코드 변경 없이 이를 사용합니다.

![WagSave가 감지되었다고 보고하는 Persistence 검사](../Images/summary-wagsave-detected.png)

| | PlayerPrefs | WagSave |
|---|---|---|
| 의존성 없이 동작 | ✅ | — |
| 업그레이드 시 버전 관리와 마이그레이션 | ❌ | ✅ |
| 기기 간 클라우드 동기화 | ❌ | ✅ |
| 암호화와 서명 | ❌ | ✅ |
| 다중 프로필 | ❌ | ✅ |
| 형식 선택 (바이너리 / JSON / 텍스트) | ❌ | ✅ |
| 원시 타입 이외의 타입 | ❌ | ✅ |

### 연결 방식

켤 것이 없습니다. `WagSettings.WagSave`는 `com.wagglebum.wagsave`가 설치되었을 때**만** Unity가 컴파일하는
어셈블리이므로, 그 부트스트랩이 실행된다는 사실 자체가 감지입니다 — 버전 확인도, 리플렉션도, 설정도 없습니다.
WagSave를 설치하면 영속성이 스스로 업그레이드되고, 제거하면 어셈블리가 등록과 함께 사라져 PlayerPrefs 기본값이
남습니다.

`PlayerPrefs`로 설정된 프로필은 여전히 PlayerPrefs를 얻습니다. 스토어를 명시적으로 선택하는 것은 패키지가
뒤집지 않는 결정입니다.

### WagSave 스토어에 관해 알아둘 것

**설정은 자체 WagSave 그룹에 있습니다.** 기본은 `WagSettings`이므로 게임의 세이브 데이터와 분리된 채 WagSave
자체 도구에서 검사할 수 있습니다.

**쓰기는 일괄 처리됩니다.** WagSave의 런타임 API는 `Save` 호출마다 커밋하므로 이 스토어는 버퍼링하고 `Flush`에서만
씁니다 — 레지스트리는 Apply마다 한 번, 더티 설정에 대해서만 호출합니다. 플레이어가 두 개를 바꾼 마흔 개 설정
메뉴는 마흔 번이 아니라 두 번의 쓰기입니다. 정확히 그것을 검증하는 테스트가 있습니다.

**삭제는 null을 씁니다.** WagSave의 공개 런타임 API에는 제거가 없으므로 삭제된 키는 null로 저장되고, 읽으면
없는 것으로 나옵니다. 호출자 관점에서는 같은 결과이며, WagSettings를 WagSave 내부에서 떼어 놓습니다.

**다른 타입으로 저장된 값도 읽힙니다.** 예전에 `int`였다가 지금 `float`인 설정은 실패하지 않고 변환됩니다.
정말로 읽을 수 없는 값은 기본값으로 폴백하고 경고합니다 — 플레이어는 설정 하나를 잃지, 시작할 능력을 잃지
않습니다.

## 자신만의 스토어 작성

`ISettingsStore`를 구현하고 등록하세요.

```csharp
SettingsStoreFactory.RegisterProvider(() => new MyStore());
```

무언가 레지스트리를 만들기 전에 등록하세요 — `[RuntimeInitializeOnLoadMethod]`가 보통의 자리입니다. 마지막
등록이 이기고, `ClearProvider()`가 PlayerPrefs 기본값을 복원하며, null을 반환하는 프로바이더는 조용히 폴백하지
않고 예외를 던집니다. 조용히 영속화를 멈추는 설정은 시끄러운 실패보다 나쁘기 때문입니다.

중요한 계약은 하나입니다. **`Save`와 `Delete`는 버퍼링하고, `Flush`가 커밋합니다.** 쓰기마다 커밋하는 스토어는
Apply 한 번을 마흔 번의 왕복으로 만듭니다.

전체 안내는 [확장성](Extensibility.md)을 참고하세요.
