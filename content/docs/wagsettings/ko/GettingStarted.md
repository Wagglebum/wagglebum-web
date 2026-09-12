# 시작하기

> **프리릴리스.** 런타임, 어플라이어, 두 메뉴, 에디터, 셋업, Quick Start 샘플, 현지화가 들어 있습니다. CI와
> 스토어 준비는 아직입니다. [CHANGELOG.md](../../CHANGELOG.md)를 참고하세요.

## 요구 사항

- Unity **2022.3** (2022 LTS) 이상.
- 필수 패키지 의존성 없음.

선택 사항이며 자동 감지되는 것:

- **WagSave** (`com.wagglebum.wagsave`) — 영속성을 버전 관리, 클라우드 동기화, 암호화, 다중 프로필 저장으로
  업그레이드합니다. 설치하면 WagSettings가 자동으로 사용합니다.
- **Input System** (`com.unity.inputsystem`) — 컨트롤 리바인딩에 필요합니다.
- **uGUI** (`com.unity.ugui`) — 컴포넌트 기반 메뉴. 모든 2022 LTS 템플릿에 포함되어 있습니다.

## 설치

### tarball 또는 Asset Store에서

패키지를 임포트하거나 **Window → Package Manager → + → Add package from tarball…**로 추가하세요.

### 로컬 체크아웃에서

프로젝트의 `Packages/manifest.json`에 `WaggleBum/WagSettings` 폴더를 가리키도록 다음을 추가하세요.

```json
{
  "dependencies": {
    "com.wagglebum.wagsettings": "file:../../wagsettings-unity/WaggleBum/WagSettings"
  }
}
```

## 설치 확인

패키지가 임포트되면 Unity가 컴파일하고 WagSettings는 **활성 빌드 타깃**에 대해 스크립팅 디파인
`WAGGLEBUM_WAGSETTINGS`를 게시합니다. 도메인 리로드마다 다시 게시되므로 플랫폼을 전환하면 새로 선택된 타깃에
자동으로 추가됩니다. 두 가지 방법으로 확인할 수 있습니다.

![Tools → WaggleBum → WagSettings 메뉴](../Images/tools-menu.png)

1. **Package Manager** — 패키지 목록에 WagSettings가 버전 0.9.0로 나타납니다.
2. **스크립팅 디파인** — **Edit → Project Settings → Player → Other Settings → Scripting Define Symbols**를
   열면 `WAGGLEBUM_WAGSETTINGS`가 나열되어 있습니다.

이 디파인은 다른 에셋이 강한 의존성 없이 WagSettings를 감지하는 방법이기도 합니다.

```csharp
#if WAGGLEBUM_WAGSETTINGS
    // WagSettings is installed.
#endif
```

## 먼저 해보기: Quick Start

모든 것이 동작하는 것을 보는 가장 빠른 방법은 포함된 샘플입니다. 셋업 화면이 생성하는 것 그대로에 주변 씬을
더한 것이며, UI 프레임워크별로 하나씩 있습니다.

![설정 메뉴를 연 채 실행 중인 Quick Start 씬](../Images/quick-start-scene.png)

```
WaggleBum/WagSettings/Sample Scenes/Quick Start/
├── Quick Start (UI Toolkit).unity
├── Quick Start (uGUI).unity
├── Settings/            23 setting assets, the profile, and the mixer setup cloned
├── Prefabs/             WagSettingsMenu (uGUI).prefab - the uGUI menu, ready to copy
├── QuickStartActions    a starter Input Actions asset with Jump, Interact and Fire
└── Scripts/             QuickStartDemo, and QuickStartControls when the Input System is installed
```

둘 중 하나의 씬을 열고 Play를 누르세요. 그런 다음:

1. **Music을 내려보세요.** Music 버스의 220 Hz 톤이 실시간으로 따라옵니다. **Master Mute**를 체크하면 그것과
   SFX 블립 둘 다 조용해집니다. 이것이 `AudioMixerApplier`가 생성된 믹서의 노출된 파라미터에 데시벨로 쓰는
   것입니다.
2. **Window Mode나 해상도를 바꾸고 Apply를 누르세요.** 구석의 HUD가 화면이 실제로 무엇을 하는지 보고합니다.
   Apply 전까지는 아무것도 바뀌지 않습니다 — 반쯤 입력한 해상도가 창 크기를 바꾸면 안 되므로 디스플레이 설정은
   커밋 시 적용됩니다.
3. **Reduce Motion을 체크하세요.** 큐브가 회전을 멈춥니다. **UI Scale을 드래그하세요.** 메뉴와 HUD가 모두
   커집니다.
4. **Space를 누르세요.** HUD가 점프를 셉니다. **Rebind Jump**를 누르고 아무 키나 누른 뒤 Apply를 누르세요 —
   HUD가 새 컨트롤을 지목하고, Play를 멈췄다 다시 시작해도 돌아옵니다. (Input System 전용.)
5. **검색 상자에 입력하세요.** 일치하지 않는 탭과 행이 사라지고, 지우면 돌아옵니다.
6. **Reset to Defaults를 누른 다음 Revert를 누르세요.** Reset은 적용하기 전까지 취소할 수 있습니다.

Play를 멈추고 다시 Play를 누르세요. 적용한 것이 모두 남아 있습니다. 이것이 `PlayerPrefsStore`, 또는 WagSave가
설치되어 있으면 `WagSaveStore`입니다.

샘플에는 배선 코드가 없습니다. Quick Start 오브젝트의 **WagSettings Manager**가 레지스트리를 소유하고 그 아래의
어플라이어를 연결합니다. 두 메뉴 모두 그 레지스트리를 빌려 씁니다. `QuickStartDemo.cs`는 게임 스크립트가 하듯
설정을 읽어옵니다 — `WagSettings.Get<float>("audio.master")` — 그리고 그 안의 나머지는 모두 데모에서 설정의
효과가 분명히 보이도록 존재합니다.

## API 사용하기

```csharp
using WaggleBum.WagSettings;

float master = WagSettings.Get<float>("audio.master");
WagSettings.Set("audio.master", 0.8f);   // pending
WagSettings.Apply();                      // committed and saved, in one batch
```

이것은 실행 중인 **`WagSettingsManager`** — 레지스트리를 소유하고 그 아래의 모든 어플라이어를 연결하는
컴포넌트 — 로 해석됩니다. 셋업은 프로필을 `Assets/WagSettings/Resources`에 두므로 씬에 아무것도 배치하지 않아도
시작 시 매니저가 생성됩니다. 위치를 정하려면 직접 하나 추가하세요. 실행 중인 것이 없으면 호출이 예외를 던지며
무엇을 추가할지 알려줍니다.

[치트시트](Cheatsheet.md)에 나머지가 한 페이지에 있습니다. [API](API.md)에는 파사드 이상을 원하는 코드를 위한
하부 레지스트리를 포함해 모든 것이 있습니다.

## 설정 메뉴 넣기

코드 없이 동작하는 메뉴로 가는 가장 빠른 길:

1. 설정을 만들고 (**Assets → Create → WaggleBum → WagSettings**) `SettingsProfile`에 추가합니다.
2. **UI Document** GameObject를 만듭니다 (*GameObject → UI Toolkit → UI Document*).
3. 거기에 **WaggleBum → WagSettings → Settings Menu (UI Toolkit)**를 추가합니다.
4. `WaggleBum/WagSettings/Runtime/UI/UIToolkit/`의 `WagSettingsMenu.uxml`과 `WagSettingsMenu.uss`를 셸과
   스타일로 할당합니다.
5. UI Document의 **Panel Settings**에서 테마를 같은 폴더의 `WagSettingsUI.tss`로 설정합니다.
6. **WagSettings Manager**가 실행 중인지 확인합니다 — 프로필과 함께 씬에 배치되었거나, 프로필이 Resources
   폴더에 있어서 시작 시 생성되거나. 메뉴는 매니저의 프로필을 표시합니다. 메뉴 자체에 프로필을 할당하는 것은
   매니저가 없을 때뿐입니다.

![Play 모드의 UI Toolkit 설정 메뉴](../Images/menu-uitoolkit.png)

Play를 누르세요. 카테고리별 탭, 설정별 행, 검색 필드, 그리고 무언가를 할 때만 활성화되는 Apply / Revert / Reset
버튼이 생깁니다.

### 얻는 것

- **카테고리별 탭**, 프로필에 설정이 나타나는 순서대로 — 그 순서는 설계상의 선택이므로 알파벳순으로 다시
  정렬되지 않습니다.
- **설정별로 알맞은 컨트롤**: bool에는 토글, `EnumSetting`에는 드롭다운, 범위가 있는 `FloatSetting`이나
  `IntSetting`에는 슬라이더, 그 외에는 텍스트 필드 — 그리고 `display.width`, `display.height`,
  `display.refreshRate`를 대신하는, 디스플레이가 지원하는 모드의 **해상도 드롭다운 하나**.
- **컨트롤러와 키보드 내비게이션.** 위아래로 행을 이동하고, 좌우로 탭을 전환하며, 포커스는 아무 데도 아닌 곳이
  아니라 첫 행에서 시작합니다. 눈에 보이는 포커스 링이 있습니다. 포인터가 없는 플레이어는 자기 위치를 알 다른
  방법이 없기 때문입니다.
- 행과 그 탭 모두에 **더티 표시**. 보고 있지 않은 탭의 변경도 보입니다.
- **사용할 수 없는 설정은 보이는 채로** 회색 처리되고 이유를 설명하는 툴팁이 붙습니다 — 숨기면 플레이어는
  읽은 적 있는 옵션을 찾아 헤매게 됩니다.

### 스타일 바꾸기

외관은 `WagSettingsMenu.uss`와 `WagSettingsUI.tss`의 테마 변수에 있습니다.

```css
:root {
    --wag-surface: rgb(28, 30, 34);
    --wag-text: rgb(236, 238, 242);
    --wag-accent: rgb(74, 144, 226);
    --wag-focus: rgb(255, 196, 61);
}
```

자신의 테마에서 이를 오버라이드하면 패키지를 편집하지 않고도 메뉴가 따라옵니다.

## 대신 uGUI 경로

프로젝트가 UI Toolkit이 아니라 uGUI를 사용한다면, 같은 모델이 컴포넌트 기반 메뉴를 구동합니다. uGUI 계층은
`com.unity.ugui`가 설치되었을 때만 Unity가 컴파일하는 별도의 어셈블리에 있으므로 UI Toolkit 전용 프로젝트는
이를 결코 떠안지 않습니다.

![Play 모드의 uGUI 설정 메뉴](../Images/menu-ugui.png)

**프리팹에서 시작하세요.** `Sample Scenes/Quick Start/Prefabs/WagSettingsMenu (uGUI).prefab`은 생성된 프로필을
위한 완전한 메뉴입니다 — 검색이 있는 헤더, 탭 스트립, 카테고리별로 설정마다 행이 있는 스크롤 페이지, 세 개의
명령 버튼 — 전부 표준 uGUI 컨트롤로 만들어져 스타일 변경은 일반적인 uGUI 작업입니다. 복사해서 자신의 프로필을
가리키게 하고 행을 삭제하거나 추가하세요. 대신 처음부터 만들려면:

1. 메뉴 Canvas의 루트에 **Settings Menu (uGUI)**를 둡니다. 매니저가 실행 중이면 매니저의 프로필을 표시합니다.
   메뉴에 할당하는 것은 매니저가 없을 때뿐입니다.
2. 각 컨트롤에 맞는 바인더를 추가하고 **Key**를 설정합니다:

| 컨트롤 | 컴포넌트 |
|---|---|
| `Slider` | Slider Setting Binder |
| `Toggle` | Toggle Setting Binder |
| `Dropdown` | Dropdown Setting Binder |
| `InputField` | Input Field Setting Binder |

3. Apply / Revert / Reset에는 각 `Button`에 **Settings Command Button**을 두고 명령을 고릅니다. 명령이 아무것도
   하지 않을 때는 스스로 회색이 됩니다.
4. 검색에는 `InputField`에 **Settings Search Binder**를 둡니다.
5. 탭에는 각 페이지에 카테고리 이름이 있는 **Settings Category Panel**을, 탭 스트립에는 템플릿으로 쓸 버튼이
   있는 **Settings Category Selector**를 둡니다.

바인더는 부모에서 메뉴를 찾으므로 키 외에는 손으로 배선할 것이 없습니다. 프로필에 없는 키를 가리키는 바인더는
**예외를 던집니다** — 조용히 아무것도 하지 않는 컨트롤은 시끄러운 실패보다 나쁩니다.

각 바인더에는 선택적인 **Row**가 있습니다 — 레이블과 컨트롤을 모두 담은 오브젝트입니다. 카테고리 패널은 검색이
설정을 걸러내는 대로 행을 보이고 숨깁니다. Row를 비워 두면 컨트롤 자체의 오브젝트가 숨겨집니다.

드롭다운은 옵션을 `EnumSetting`에서, 슬라이더는 범위를 설정에서 가져오므로 어느 쪽도 에셋과 어긋날 수 있는
두 번째 사본을 갖지 않습니다.

### 레이블

바인더는 선택적으로 `Text`에 설정의 표시 이름을 채웁니다. 2022 LTS에서 TextMeshPro는 별도 패키지이므로 패키지는
이에 의존하지 않습니다. TMP 레이블은 직접 설정하거나, 레이블을 할당하지 않은 채 프리팹에서 텍스트를 작성하세요.

### 대신 코드로 하기

```csharp
ISettingsStore store = SettingsStoreFactory.Create(profile.StoreKind);
using SettingsRegistry registry = profile.CreateRegistry(store);

var model = new SettingsMenuModel(registry, SettingBinderFactory.CreateAll(registry), ownsBinders: true);
using var view = new SettingsMenuView(shellUxml, model, ownsModel: true);

document.rootVisualElement.Add(view.Root);
view.FocusFirstRow();
```

`SettingsMenuView`는 컴포넌트가 아닌 평범한 클래스이므로 UIDocument 없이 만들고 검사할 수 있습니다 — 메뉴는
그렇게 테스트됩니다.

## 테스트 실행

패키지에는 EditMode와 PlayMode 테스트 어셈블리가 포함되어 있습니다. 패키지를 Unity 프로젝트에 넣은 상태에서
**Window → General → Test Runner**를 열고 `WagSettings.Tests.EditMode` 스위트를 실행하세요.
