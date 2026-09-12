# WagSettings 치트시트

한 페이지. 나머지는 모두 [문서](index.md)에 있습니다.

## 제로에서 메뉴까지

**Tools → WaggleBum → WagSettings → Setup**에서 카테고리를 체크하고 **Generate**를 누르세요. 설정 에셋, 이를
담는 `SettingsProfile`, Master, Music, SFX가 노출된 `AudioMixer`가 모두 `Assets/WagSettings/Resources/` 아래에
생깁니다. 재실행은 안전합니다. 빠진 것만 만들고 편집한 에셋은 절대 덮어쓰지 않습니다.

그런 다음 메뉴 씬에서:

| UI Toolkit | uGUI |
|---|---|
| **UI Document**를 만들고 그 위에 **Settings Menu (UI Toolkit)**를 추가. 프로필, `WagSettingsMenu.uxml`, `WagSettingsMenu.uss`를 할당하고 Panel Settings 테마를 `WagSettingsUI.tss`로 설정. | `Sample Scenes/Quick Start/Prefabs/WagSettingsMenu (uGUI).prefab`을 복사해 자신의 프로필을 가리키게 함. |

Play를 누르세요. 프로필이 Resources에 있으므로 시작 시 **WagSettings Manager**가 생성되고 메뉴에 그 프로필이
표시됩니다. 매니저가 있을 위치를 정하려면 — 그리고 어플라이어에게 집을 주려면 —
*WaggleBum → WagSettings → WagSettings Manager*를 직접 씬에 추가하세요.

## 키

`category.name`. 점 앞부분이 탭, 뒷부분이 레이블이 됩니다.

```
audio.master   audio.music   audio.sfx   audio.master.mute
display.width  display.height  display.refreshRate  display.windowMode  display.vsync
graphics.qualityTier  graphics.gamma  graphics.renderScale  graphics.bloom  graphics.ambientOcclusion  graphics.motionBlur
accessibility.uiScale  accessibility.colorblindPreset  accessibility.reduceMotion  accessibility.subtitleScale  accessibility.subtitleBackground
controls.rebinds  controls.sensitivity  controls.invertY
```

이것들이 셋업이 생성하고 모든 어플라이어가 기본으로 바인딩하는 것입니다. 자신만의 것은
**Assets → Create → WaggleBum → WagSettings → …**로 추가한 뒤 에셋을 프로필에 넣으세요.

## 코드에서 읽고 쓰기

```csharp
using WaggleBum.WagSettings;

float master = WagSettings.Get<float>("audio.master");
WagSettings.Set("audio.master", 0.8f);                       // pending - the game does not change yet
WagSettings.Definition<float>("audio.master").Changed += value => { };

WagSettings.IsDirty;        // anything pending?
WagSettings.Apply();        // write every pending value to the store, in one batch
WagSettings.Revert();       // throw pending values away
WagSettings.ResetAll();     // authored defaults, pending until applied
```

`WagSettingsManager`가 실행 중인 곳이면 어디서든 동작합니다 — 직접 배치한 것이든, 프로필이 Resources 폴더에
있어서 시작 시 생성된 것이든. 없으면 모든 호출이 예외를 던지며 무엇을 추가할지 알려줍니다. 파사드가 제공하는
것 이상이 필요하면 `WagSettings.Registry`가 레지스트리 그 자체입니다.

## 어플라이어

어플라이어는 값을 Unity 효과로 바꿉니다. 컴포넌트를 **WagSettings Manager 아래**에 추가하고 구동할 대상을
할당하세요 — 매니저는 시작할 때 그 아래의 모든 것을 연결합니다. 작성할 것이 없습니다.

| 어플라이어 | 구동 대상 | 적용 |
|---|---|---|
| Audio Mixer Applier | 할당된 `AudioMixer`의 노출된 파라미터 | 실시간 |
| Resolution Applier | `Screen` 해상도, 창 모드, VSync | Apply 시 |
| Quality Applier | 품질 티어, 감마, 렌더 스케일, 포스트 이펙트 토글 | 실시간 |
| Accessibility Applier | UI 배율, 색맹 행렬, 모션 줄이기, 자막 — 이벤트와 셰이더 전역으로 | 실시간 |
| Rebind Applier | `InputActionAsset`의 바인딩 오버라이드 *(Input System)* | 실시간 |

`Attach`는 레지스트리에 없는 키에서 예외를 던집니다. 어플라이어의 키를 비우면 건너뜁니다. 다른 곳에 있어야
하는 어플라이어는 `WagSettings.Manager.Attach(applier)`로.

## 바인더 (uGUI)

컨트롤에 바인더를 붙이고 키를 설정하세요. 부모에서 메뉴를 찾습니다.

| 컨트롤 | 바인더 |
|---|---|
| `Slider` | Slider Setting Binder |
| `Toggle` | Toggle Setting Binder |
| `Dropdown` | Dropdown Setting Binder — 옵션은 `EnumSetting`에서, `display.resolution`이면 디스플레이에서 |
| `InputField` | Input Field Setting Binder |
| `Button` | Settings Command Button — Apply, Revert 또는 Reset |
| `InputField` | Settings Search Binder |

UI Toolkit에는 이것들이 필요 없습니다. 행은 프로필에서 만들어집니다.

## 위치

| | |
|---|---|
| 생성된 에셋 | `Assets/WagSettings/Resources/` |
| 샘플 | `WaggleBum/WagSettings/Sample Scenes/Quick Start/` — UI 프레임워크별 씬 하나 |
| uGUI 메뉴 프리팹 | `…/Quick Start/Prefabs/WagSettingsMenu (uGUI).prefab` |
| 메뉴 스타일 | `Runtime/UI/UIToolkit/WagSettingsMenu.uss`와 `WagSettingsUI.tss`의 변수 |
| 셋업 | Tools → WaggleBum → WagSettings → Setup |
| 매니저 | *WaggleBum → WagSettings → WagSettings Manager*, 또는 시작 시 Resources에서 생성 |

## 예외를 던지는 경우

시끄럽게, 그리고 의도적으로. 프로필에 없는 키의 바인더, 레지스트리에 없는 키의 어플라이어, 노출되지 않은 믹서
파라미터, 프로필의 빈 슬롯. 각각 키를 지목합니다. 조용히 아무것도 하지 않는 컨트롤은 이유를 말하는 실패보다
나쁩니다.
