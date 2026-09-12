# WagSettings 문서

WagSettings는 Unity 2022 LTS 이상을 위한 설정 및 옵션 메뉴 시스템입니다. 오디오, 디스플레이, 그래픽, 컨트롤
리바인딩, 접근성 설정을 깔끔한 런타임 API 뒤에 제공하며, 동작하는 메뉴를 생성해 주는 단일 화면 설정을 갖추고
있습니다.

![Summary 페이지를 연 에디터 창: 레일, 페이지, 문서 창](../Images/editor-window-summary.png)

## 여기서 시작

- [치트시트](Cheatsheet.md) — 모든 것을 한 페이지에.
- [시작하기](GettingStarted.md) — 패키지를 설치하고 설정 메뉴를 실행합니다.
- [에디터 창](EditorWindow.md) — 레일, 페이지, 문서 창, 언어.
- [셋업](Setup.md) — Setup 페이지와 생성되는 것들.
- [Quick Start 샘플](GettingStarted.md) — UI 프레임워크별 씬이 `Sample Scenes/Quick Start`에 있습니다. 시작하기에서 안내합니다.

## 참조

- [API](API.md) — 런타임 API 표면.
- [영속성](Persistence.md) — 설정이 어떻게 저장되는지, WagSave가 있으면 무엇이 활성화되는지.
- [확장성](Extensibility.md) — 자신만의 설정과 어플라이어 추가하기.
- [현지화](Localization.md) — 메뉴는 플레이어의 언어로, 에디터는 당신의 언어로.
- [용어집](Glossary.md) — 이 문서 전반에서 사용하는 용어.

## 설정 카테고리

- [오디오](Settings/Audio.md)
- [디스플레이](Settings/Display.md)
- [그래픽](Settings/Graphics.md)
- [접근성](Settings/Accessibility.md)
- [컨트롤](Settings/Controls.md)

다른 언어: [English](../index.md) · [Español](../es/index.md) · [日本語](../ja/index.md) · [简体中文](../zh-CN/index.md) · [繁體中文](../zh-TW/index.md)

이 패키지는 프리릴리스입니다. 반영된 내용은 [CHANGELOG.md](../../CHANGELOG.md)를 참고하세요.

## 아키텍처 한눈에 보기

WagSettings는 엄격하게 아래쪽으로만 의존하는 다섯 개의 계층입니다. UI는 영속성을 절대 건드리지 않고, 영속성은
UI를 전혀 알지 못합니다.

| 계층 | 폴더 | 책임 |
|---|---|---|
| 5 | `Runtime/UI/` | 레지스트리에 바인딩하고 아무것도 소유하지 않는 UI Toolkit 및 uGUI 뷰 |
| 4 | `Runtime/Appliers/` | 설정 값을 Unity 효과로 변환 |
| 3 | `Runtime/Core/` | `SettingDefinition<T>`, `SettingsRegistry`, `ISettingsStore`, `Guard` — `UnityEngine` 없음 |
| — | `WagSettings.cs`, `WagSettingsManager.cs` | 정적 API와 레지스트리를 소유하는 씬 컴포넌트 |
| 3 | `Runtime/Definitions/` | ScriptableObject 설정 에셋과 `SettingsProfile` |
| 2 | `Runtime/Persistence/` | `ISettingsStore` 구현과 스토어 팩토리 |
| — | `WagSave/` | WagSave가 설치되었을 때만 컴파일되는 선택적 WagSave 기반 스토어 |

설정을 추가한다는 것은 `SettingDefinition` 에셋 하나와 어플라이어 하나를 추가하는 것입니다. 다른 것은 아무것도
바뀌지 않습니다.
