# 디스플레이

해상도, 주사율, 창 모드, VSync, 모니터 선택. 이들은 플레이어가 드롭다운을 스크롤하는 동안이 아니라 **Apply
버튼**에서 적용됩니다 — 스크롤 도중 창 크기가 바뀌는 것은 설정 메뉴를 망가진 것처럼 느끼게 하는 종류의
일입니다.

## 해상도는 인덱스가 아닌 해상도로 저장됨

대부분의 설정 메뉴는 "드롭다운의 세 번째 항목"을 저장합니다. WagSettings는 실제 너비, 높이, 주사율을
저장합니다. 하드웨어가 바뀌는 순간 인덱스는 다른 것을 의미하기 때문입니다.

- 플레이어가 노트북을 도킹하거나 외부 모니터를 뽑음
- 세이브를 다른 컴퓨터나 휴대용 기기로 옮김
- 드라이버 업데이트로 보고되는 모드가 바뀜

1920×1080을 가리키던 인덱스가 이제 800×600을 가리킵니다. 실제 값은 그 모든 것을 견딥니다.

트레이드오프는 저장된 모드가 눈앞의 기기에 존재하지 않을 수 있다는 것입니다. `DisplayModeMatcher`가 이를
해결합니다. **픽셀 크기가 우선하고, 주사율이 동점을 가르며**, 가장 가까운 지원 모드가 이깁니다. 게임은
해상도 때문에 시작을 거부해서는 절대 안 되므로 이는 **예외 대신 경고합니다** — 아래 *예외를 던지는 것과
경고만 하는 것*을 참고하세요.

```csharp
var desired  = new DisplayMode(1600, 900, 60);          // not supported here
var resolved = DisplayModeMatcher.FindNearest(applier.AvailableModes, desired);  // 1920 x 1080 @ 60 Hz
```

저장된 주사율 `0`은 **"이 디스플레이가 제공하는 최고값"**을 의미하며, 한 번도 구성된 적 없는 게임에 맞는
기본값입니다.

## 설정

모든 키는 선택 사항입니다. 하나를 비워 두면 어플라이어는 그 측면을 관리하지 않으므로, 창 모드 토글만 원하는
프로젝트는 정확히 그것만 가질 수 있습니다.

| 설정 | 타입 | 키 | 비고 |
|---|---|---|---|
| 너비 | `IntSetting` | `display.width` | 픽셀. 높이 키도 필요. |
| 높이 | `IntSetting` | `display.height` | 픽셀. 너비 키도 필요. |
| 주사율 | `IntSetting` | `display.refreshRate` | Hz. `0`은 가능한 최고값. |
| 창 모드 | `IntSetting` / `EnumSetting` | `display.windowMode` | `0` 창, `1` 테두리 없음, `2` 전체 화면. |
| VSync | `IntSetting` / `EnumSetting` | `display.vsync` | `0` 끔, `1` 매 블랭크, `2` 두 블랭크마다. 0–2로 제한. |
| 모니터 | `IntSetting` | `display.monitor` | 0부터 시작하는 디스플레이 인덱스. **옵트인**: 모니터 간 창 이동은 선택으로 남길 만큼 방해가 되므로 어플라이어의 키는 기본으로 비어 있고, 셋업도 생성하지 않음. |

`WindowMode`는 Unity의 `FullScreenMode`가 아닌 WagSettings 열거형입니다. 이 세 가지는 플레이어가 이해하는
선택지이고, 번호는 Unity 버전 간에 안정적이며, 값은 세이브 데이터에 들어갑니다.

## 설정하기

1. 위의 설정을 만들고 `SettingsProfile`에 추가합니다.
2. **Add Component → WaggleBum → WagSettings → Resolution Applier**. 키는 관례적인 이름으로 미리 채워져
   있습니다. 관리하지 않을 것은 비우세요.
3. **WagSettings Manager** 아래에 둡니다. 매니저가 시작할 때 연결합니다. 또는 Display를 체크하고 Setup을
   실행해 1, 2단계를 건너뛰세요.

## 해상도 드롭다운

두 메뉴 모두 너비, 높이, 주사율을 **디스플레이가 지원하는 모드의 드롭다운 하나**로 보여줍니다 —
`1920 × 1080 @ 144 Hz`, `1920 × 1080 @ 60 Hz` 등, 가장 넓은 것부터. 이것이 세 설정 위의 복합체인
`ResolutionBinder`입니다. 메뉴는 `ScreenModes.Query()`에 하드웨어가 무엇을 할 수 있는지 묻고 목록을
`SettingBinderFactory.CreateAll(registry, modes)`에 넘기며, 이는 셋을 프로필에서 `display.width`가 있던 자리에
서는 바인더 하나로 접습니다. "resolution"을 검색하면 찾을 수 있습니다.

![디스플레이 모드를 나열하는 해상도 드롭다운](../../Images/resolution-dropdown.png)

플레이어가 보는 것은 선택 하나입니다. 스토어가 보는 것은 여전히 숫자 세 개이며, 그것이 위 섹션의
요점입니다. 모드 목록에 대한 저장된 인덱스는 다음 모니터에서 다른 것을 의미하지만 `1920 × 1080`은 그렇지
않습니다.

저장된 값이 디스플레이가 할 수 있는 어떤 것과도 일치하지 않으면 — 더 큰 모니터에서 넘어온 설정 — 드롭다운은
조용히 맞추는 대신 **Custom: 2560 × 1440 @ 165 Hz**를 앞세우고, 어플라이어는 적용할 때 여전히 가장 가까운
모드를 고릅니다. 실제 모드를 선택하면 커스텀 항목은 사라집니다.

프로필에 `display.refreshRate` 설정이 없으면 목록은 크기만 있고 주사율에 의한 중복은 합쳐집니다.

### 플랫폼이 모드를 보고하지 않을 때

일부 플랫폼은 빈 `Screen.resolutions`를 반환합니다 — **macOS Editor가 그렇고**, WebGL도 그렇습니다. 그대로
두면 드롭다운은 제시할 것이 없고 어플라이어는 맞출 것이 없으며, Editor에서는 해상도 변경을 절대 볼 수
없습니다. 그래서 `ScreenModes.Query()`는 현재 디스플레이보다 크지 않은 일반적인 16:9와 16:10 크기에 각각
디스플레이의 주사율을 붙이고, 디스플레이 자체를 맨 앞에 두어 폴백합니다. 모드를 보고하는 플랫폼의 빌드는
실제 목록을 사용합니다. 폴백은 그렇지 않으면 무반응일 곳에서 메뉴를 시험해 볼 수 있게 하는 것입니다.

### 손으로 하기

어느 메뉴도 쓰지 않는다면 같은 부품이 당신의 것입니다.

```csharp
var binder = new ResolutionBinder(width, height, refreshRate, ScreenModes.Query());

foreach (string option in binder.Options) { /* add to your control */ }
binder.Select(index);                       // writes width, height and refresh rate
```

또는 같은 목록인 `applier.AvailableModes`에서 직접 부품을 작성하세요.

```csharp
width.Set(mode.Width);
height.Set(mode.Height);
refreshRate.Set(mode.RoundedRefreshRate);
```

어플라이어의 목록은 캐시됩니다. 게임 실행 중 디스플레이가 연결되면 `RefreshAvailableModes()`를 호출하세요.

## 예외를 던지는 것과 경고만 하는 것

디스플레이 설정은 플레이어 잘못 없이도 틀리기 가장 쉬운 것이므로 구분은 의도적입니다. **개발자 실수는 예외를
던지고, 하드웨어 불일치는 경고합니다.**

| 상황 | 결과 |
|---|---|
| 높이 키 없이 너비 키만 설정, 또는 그 반대 | **예외** — 개발자만 고칠 수 있는 구성 오류 |
| 프로필에 없는 키 | **예외** — `KeyNotFoundException` |
| 저장된 모드를 이 디스플레이가 지원하지 않음 | **경고**, 가장 가까운 지원 모드 적용 |
| 저장된 창 모드가 인식되는 값이 아님 | **경고**, 창 모드로 폴백 |
| 선택한 모니터가 연결되지 않음 | **경고**, 창을 그 자리에 둠 |
| 플랫폼이 모드를 전혀 보고하지 않음 | **경고**, 해상도를 그대로 둠 |

개발 중에 보려면 경고를 구독하세요.

```csharp
WagSettingsLog.WarningLogged += message => Debug.LogWarning(message);
```

## 적용 모드

기본은 `OnApply`입니다. `Immediate`로 바꾸면 해상도 필드의 모든 키 입력이 창 크기를 바꾸는데, 이는 거의
원하지 않는 것입니다 — [확장성](../Extensibility.md)을 참고하세요.

VSync와 모니터 선택도 같은 일정으로 적용된다는 점에 유의하세요. VSync를 즉시 토글하고 싶다면 `Immediate`로
설정한 별도의 어플라이어를 주세요.
