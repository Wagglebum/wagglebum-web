# 용어집

| 용어 | 의미 |
|---|---|
| **설정 (Setting)** | 플레이어가 바꿀 수 있는 값 하나: 마스터 볼륨, 창 모드, UI 배율. 프로젝트에서는 `SettingAsset`, 런타임에서는 `ISettingDefinition`. |
| **키 (Key)** | 설정의 안정적인 저장 이름, `category.name` 형식 — `audio.master`. 접두사가 탭, 나머지가 레이블. 한 번 출시하면 영구적. |
| **프로필 (Profile)** | `SettingsProfile` 에셋: 게임이 노출하는 설정의 메뉴 순서 목록과 이를 영속화하는 스토어. 기본 프로필은 Resources 폴더에 있음. |
| **레지스트리 (Registry)** | `SettingsRegistry`: 스토어에서 로드된 프로필의 설정에 보류 값, 더티 추적, Apply / Revert / Reset 명령이 더해진 것. |
| **매니저 (Manager)** | 레지스트리를 소유하고, 그 아래의 어플라이어를 연결하며, 정적 API를 뒷받침하는 `WagSettingsManager` 씬 컴포넌트. 게임당 하나. |
| **정적 API (Static API)** | `WagSettings.Get / Set / Apply` 등 — 매니저를 통해 어떤 스크립트에서든 한 줄로 설정을 읽고 쓰는 방법. |
| **보류 값 (Pending value)** | 플레이어가 선택했지만 아직 적용하지 않은 값. 정의의 `Value`. |
| **적용된 기준선 (Applied baseline)** | Apply로 커밋되었거나 스토어에서 로드된 마지막 값. |
| **더티 (Dirty)** | 보류 값이 기준선과 다른 설정. Apply와 Revert가 이에 따라 활성화됨. |
| **Apply** | 모든 보류 값을 스토어에 한 번에 커밋. Apply 버튼과 `WagSettings.Apply()`가 하는 일. |
| **Revert** | 모든 보류 값을 버리고 기준선을 복원. |
| **Reset** | 모든 설정을 작성된 기본값으로 되돌림. 적용되기 전까지 보류. |
| **스토어 (Store)** | `ISettingsStore`: 값이 영속화되는 곳. 기본은 `PlayerPrefsStore`, WagSave가 설치되면 `WagSaveStore`. 쓰기는 버퍼링되고 `Flush`가 커밋. |
| **어플라이어 (Applier)** | 값을 Unity 효과 — 믹서 볼륨, 화면 해상도, 품질 티어 — 로 바꾸는 `SettingApplierBase` 컴포넌트. 매니저 아래에 위치. |
| **적용 모드 (Apply mode)** | 어플라이어가 매 변경마다 동작하는지 (Immediate), 레지스트리가 커밋할 때만 동작하는지 (OnApply). |
| **바인더 (Binder)** | UI 컨트롤이 바인딩하는 대상: UI Toolkit에서는 정의 위의 `ISettingBinder`, uGUI에서는 컨트롤 위의 `…SettingBinder` 컴포넌트. |
| **카테고리 (Category)** | 키의 접두사로 결정되는, 설정이 들어가는 탭. 런타임에서는 `SettingsMenuCategory`. |
| **메뉴 (Menu)** | `WagSettingsMenu` (UI Toolkit) 또는 `WagSettingsMenuUGUI`. 둘 다 `ISettingsMenu`. 매니저의 레지스트리를 빌려 씀. |
| **셋업 (Setup)** | 프로젝트를 스캔하고 설정, 프로필, 믹서를 `Assets/WagSettings/Resources`에 생성하는 에디터 페이지. |
| **매니페스트 (Manifest)** | 셋업이 쓴 것과 그 지문의 기록. 재실행 시 빠진 것만 만들고 편집한 것은 절대 덮어쓰지 않음. |
| **디스플레이 모드 (Display mode)** | 너비, 높이, 주사율. 해상도 드롭다운은 디스플레이가 지원하는 것을 나열. |
| **로케일 (Locale)** | 언어 코드 — `en`, `es`, `ja`, `ko`, `zh-CN`, `zh-TW`. 메뉴의 것은 게임이 고르고, 에디터의 것은 Help 페이지에서 고름. |
