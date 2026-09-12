# 오디오

WagSettings는 설정으로 `AudioMixer`를 구동하며, 각 선형 볼륨 슬라이더를 믹서가 실제로 기대하는 데시벨로
변환합니다. 볼륨은 플레이어가 드래그하는 동안 실시간으로 적용됩니다 — 레벨을 고르는 유일하게 합리적인
방법입니다.

## 변환이 중요한 이유

믹서는 **데시벨**로 동작하며, 이는 로그 스케일입니다. 슬라이더는 **선형**입니다. 슬라이더 값을
`AudioMixer.SetFloat`에 그대로 넣으면 고전적인 버그가 생깁니다. 슬라이더의 아래 절반은 똑같이 들리고 들리는
변화는 전부 위쪽 10분의 1에 몰립니다.

`AudioVolume`이 그 매핑 `20·log₁₀(x)`를 수행하며, 하한은 −80 dB입니다.

| 슬라이더 | 데시벨 |
|---|---|
| `1.0` | `0 dB` — 최대 볼륨 |
| `0.5` | `−6.02 dB` — 절반 크기 |
| `0.25` | `−12.04 dB` |
| `0.0` | `−80 dB` — 무음 |

```csharp
float decibels = AudioVolume.LinearToDecibels(0.5f);   // -6.0206
float slider   = AudioVolume.DecibelsToLinear(-6.02f); //  0.5
```

`UnityEngine` 의존성 없이 `Runtime/Core`에 있으므로 단독으로 사용하고 테스트할 수 있습니다.

## 빠른 길

Audio를 체크하고 **Tools → WaggleBum → WagSettings → Setup**을 실행하세요. 네 개의 오디오 설정을 생성하고,
Master, Music, SFX 그룹과 그 볼륨이 이미 노출된 믹서를 복제하며, 어플라이어의 기본값은 둘 다와 일치합니다.
매니저 아래에 Audio Mixer Applier를 추가하고 `WagSettingsMixer`를 할당하세요. [셋업](../Setup.md)을 참고하세요.

이 페이지의 나머지는 그것이 당신을 위해 하는 일이며, 다르게 하고 싶을 때를 위한 것입니다.

## 손으로 설정하기

**1. 믹서 파라미터를 노출합니다.** `AudioMixer`에서 그룹을 선택하고 Inspector의 **Volume** 필드를 우클릭한 뒤
**Expose 'Volume (of Group)' to script**를 선택합니다. 그런 다음 Audio Mixer 창의 **Exposed Parameters**
드롭다운에서 안정적인 이름 — `MasterVolume`, `MusicVolume` 등 — 으로 바꿉니다.

> 이 단계가 사람들이 놓치는 것입니다. 노출되지 않은 파라미터는 플레이어의 슬라이더가 조용히 아무것도 하지
> 않는다는 뜻이므로, WagSettings는 조용히 실패하지 않고 파라미터 이름과 함께 예외를 던집니다.

**2. 설정을 만듭니다.** 버스마다 `FloatSetting`, 선택적으로 음소거 토글마다 `BoolSetting`:

| 설정 | 타입 | 키 | 기본값 |
|---|---|---|---|
| 마스터 볼륨 | `FloatSetting` | `audio.master` | `1` |
| 마스터 음소거 | `BoolSetting` | `audio.master.mute` | `false` |
| 음악 볼륨 | `FloatSetting` | `audio.music` | `0.8` |
| SFX 볼륨 | `FloatSetting` | `audio.sfx` | `1` |

이를 `SettingsProfile`에 추가하세요.

**3. 어플라이어를 추가합니다.** *Add Component → WaggleBum → WagSettings → Audio Mixer Applier*. 처음 추가될 때
세 개의 버스 — 음소거가 있는 마스터, 없는 음악과 SFX — 를 시드합니다. 이는 위의 설정 그대로이며 포함된 믹서
템플릿이 노출하는 그룹이므로 일반적인 경우에는 채울 것이 없습니다. 믹서를 할당한 뒤 각 버스에 대해:

| 필드 | 의미 |
|---|---|
| **Volume Key** | 이 버스의 0–1 볼륨을 담는 float 설정의 키. **비어 있으면 이 버스를 건너뜀.** |
| **Mute Key** | 버스를 음소거하는 bool 설정의 키. 음소거 토글이 없으면 비움. |
| **Exposed Parameter** | 믹서에서 노출한 이름. 예: `MasterVolume`. |

사용하지 않는 버스의 볼륨 키를 비우면 건너뜁니다. 보이스나 UI 버스가 필요한가요? 버스를 추가하고 설정을 주고
파라미터를 노출하세요 — 어플라이어는 설정이 존재하지 않는 버스를 시드하지 않습니다. `Attach`는 빠진 키에서
예외를 던지고, 정리하기 전까지 예외를 던지는 새 컴포넌트는 나쁜 기본값이기 때문입니다.

**4. WagSettings Manager 아래에 둡니다.** 매니저는 시작할 때 그 아래의 모든 어플라이어를 연결합니다. 호출할
것이 없습니다. 다른 곳에 있어야 하는 어플라이어는 `WagSettings.Manager.Attach(applier)`로.

## 음소거

음소거는 **저장된 볼륨을 건드리지 않고** 버스를 −80 dB로 구동하므로, 음소거 해제는 플레이어가 고른 레벨을
정확히 복원합니다. 음소거 설정은 다른 것과 마찬가지로 영속화되므로 음소거 상태로 종료한 플레이어는 음소거
상태로 시작합니다.

## 예외를 던지는 것과 그 이유

오디오 설정 오류는 본질적으로 조용합니다 — 아무것도 하지 않는 슬라이더는 망가진 셋업이 아니라 망가진
게임처럼 보입니다. 그래서 이것들은 시끄럽습니다.

| 상황 | 결과 |
|---|---|
| 노출된 파라미터를 믹서에서 찾을 수 없음 | 파라미터와 노출 방법을 지목하는 `InvalidOperationException` |
| 볼륨 키는 있지만 노출된 파라미터가 없는 버스 | 버스를 지목하는 `InvalidOperationException` |
| 프로필에 없는 키를 참조하는 버스 | `KeyNotFoundException` |
| 믹서가 할당되지 않음 | GameObject를 지목하는 `InvalidOperationException` |
| 볼륨 키가 **빈** 버스 | 건너뜀 — 그 버스를 사용하지 않는 프로젝트이지, 오류가 아님 |

## 적용 모드

오디오는 기본이 `Immediate`이므로 플레이어는 드래그하면서 변화를 듣습니다. 볼륨 변경을 Apply 버튼까지 미룰
좋은 이유는 없습니다 — 모드는 [확장성](../Extensibility.md)을 참고하세요.

## 자신만의 버스 추가

버스는 그저 구성입니다. 항목을 추가하고 float 설정과 노출된 파라미터를 가리키게 하면 동작합니다 — 코드 없이.
`AudioMixer` 파라미터가 아닌 것을 구동하려면 어플라이어를 작성하세요. [확장성](../Extensibility.md)을
참고하세요.
