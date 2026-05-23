# WagSave 문서

WagSave는 Unity 2022 LTS 이상을 위한 실제 배포에 사용할 수 있는 세이브 시스템입니다. 직렬화, 파일 I/O, 암호화, 압축, 세이브 슬롯, 자동저장, 클라우드 백엔드를 처리하며 — 모든 설정은 Unity 에디터 창을 통해 이루어지며 시작하는 데 코드가 필요하지 않습니다.

**네임스페이스:** `WaggleBum.WagSave`
**Unity 버전:** 2022.3 LTS+
**퍼블리셔:** WaggleBum

---

## 에디터 언어

WagSave 에디터는 여러 언어를 지원합니다. 표시 언어를 변경하려면:

1. **Edit > Preferences**（Windows / Linux）또는 **Unity > Preferences**（macOS）를 엽니다.
2. 왼쪽 패널에서 **WagSave**를 선택합니다.
3. **Locale** 드롭다운에서 원하는 언어를 선택합니다.
4. 변경 사항을 적용하려면 Unity 에디터를 닫았다가 다시 엽니다.

**사용 가능한 언어:**

- English (영어)
- Español (스페인어)
- 日本語 (일본어)
- 한국어 (Korean)
- 中文（简体）(중국어 간체)
- 中文（繁體）(중국어 번체)

---

## 이 문서에서 다루는 내용

| 문서 | 설명 |
|---|---|
| [빠른 시작](#빠른-시작) | 간단한 안내로 빠르게 시작하기 |
| [시작하기](GettingStarted.md) | 설치, 설정, 첫 번째 저장/불러오기 |
| [WagSave 컴포넌트](WagSaveComponent.md) | 저장 대상 GameObject 지정 |
| [API 레퍼런스](API.md) | 전체 저장/불러오기 API, 이벤트, 속성 |
| [세이브 슬롯](SaveSlots.md) | 멀티 슬롯 세이브 시스템 |
| [자동저장](Autosave.md) | 인터벌 기반 자동 저장 |
| [출력 형식](OutputFormats.md) | 형식, 파일 설정, 암호화, 압축 |
| [WagSave 트리거](WagSaveTrigger.md) | 물리 기반 세이브 트리거 컴포넌트 |
| [확장성](Extensibility.md) | 커스텀 형식, 직렬화기, 세이브 오버라이드 |

---

## 빠른 시작

### 키 / 값
다음 코드 스니펫은 프로젝트에 WagSave 인스턴스를 구성하지 않고도 기본적인 저장 및 불러오기를 수행하기 위한 것입니다. 기본 설정으로 기본 인스턴스가 생성됩니다. 저장 출력을 구성하거나 고급 기능을 사용하려면 WagSave 인스턴스의 빠른 시작 지침을 따르세요.

다음 코드 샘플은 패키지에 포함된 빠른 시작 샘플 씬에서 실제로 사용되는 것을 확인할 수 있습니다.
```csharp
        void Update()
        {
            var kb = Keyboard.current;
            if (kb == null) return;

            // Move Player
            var h = (kb.rightArrowKey.isPressed ? 1f : 0f) - (kb.leftArrowKey.isPressed ? 1f : 0f);
            var v = (kb.upArrowKey.isPressed ? 1f : 0f) - (kb.downArrowKey.isPressed ? 1f : 0f);
            transform.Translate(new Vector3(h, 0f, v) * (moveSpeed * Time.deltaTime));

            // Save Player Position
            if (kb.sKey.wasPressedThisFrame)
            {
                WagSave.Save("playerPosition", transform.position);
            }

            // Load Player Position
            if (kb.lKey.wasPressedThisFrame)
            {
                transform.position = WagSave.Load<Vector3>("playerPosition");
            }
        }
```

---

### WagSave 인스턴스 (권장)
Unity 메뉴 <b>Window -> WagSave -> Editor</b>에서 WagSave 에디터 창을 엽니다.
에디터 인터페이스를 사용하면 프로젝트에서 구성할 수 있는 기능과 옵션을 확인할 수 있습니다.

- WagSave 에디터를 열고 프로젝트의 Resources 폴더에 인스턴스를 생성합니다.
- 사용 가능한 옵션과 기능으로 프로젝트에 맞게 인스턴스를 구성합니다.
- 에디터를 사용하여 프로젝트의 게임 오브젝트에 WagSaveComponent를 추가하고 저장할 속성을 선택합니다.
- 아래 코드를 구현하여 콘텐츠를 저장하고 불러옵니다. 코드 없이 세이브 트리거, 자동저장 및/또는 세이브 슬롯을 추가할 수도 있습니다.

```csharp
using WaggleBum.WagSave;

// 씬의 모든 WagSaveComponent 저장
var wagSave = WagSave.GetInstance();
wagSave.Save();

// 다시 불러오기
wagSave.Load();
```

---

## 아키텍처 개요

WagSave는 세 가지 개념을 중심으로 구축되어 있습니다.

**WagSave ScriptableObject**는 중앙 관리자입니다. `Assets > Create > WaggleBum > WagSave`를 통해 하나 이상 생성할 수 있습니다. 출력 형식, 슬롯, 자동저장, 암호화 등 모든 설정이 여기에 저장됩니다. 런타임에는 `Resources` 폴더에서 로드됩니다.

**WagSaveComponent**는 상태를 저장하려는 GameObject에 추가하는 MonoBehaviour입니다. WagSave 에디터 창을 통해 포함할 필드와 속성을 정확히 선택합니다. 직렬화 코드가 필요하지 않습니다.

**Save Targets**는 교체 가능한 출력 백엔드입니다 (Binary 파일, JSON 파일, PlayerPrefs, Steam Cloud, Unity Cloud). 게임 코드를 건드리지 않고 에디터에서 형식을 변경할 수 있습니다.

---

*WagSave는 WaggleBum이 개발 및 유지 관리합니다. Unity Asset Store에서 이용 가능합니다.*
