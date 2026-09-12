# 에디터 창

**Tools → WaggleBum → WagSettings → Editor**

창 하나, WagSave의 것과 같은 모양입니다. 둘 다 가진 개발자는 하나의 레이아웃만 익히면 됩니다.

```
┌────────────────────┬──────────────────────────────────────────────┐
│ [logo] WagSettings │ Setup                                 [Docs] │
│────────────────────│──────────────────────────────────────────────│
│ ▸ Summary          │  the page                     │ its docs,    │
│   Setup            │                               │ in your      │
│   Settings Profile │                               │ language     │
│   Debugger         │                               │              │
│   Help             │                               │              │
│ v0.9.0             │                               │              │
└────────────────────┴───────────────────────────────┴──────────────┘
```

![Summary 페이지를 연 에디터 창: 레일, 페이지, 문서 창](../Images/editor-window-summary.png)

- 왼쪽의 **레일**에 페이지가 나열됩니다. 지난번에 있던 페이지가 열립니다.
- 오른쪽의 **문서 창**은 보고 있는 페이지를 설명합니다. 드래그해서 넓히거나 좁히고, 헤더의 **Docs**로 끌 수
  있습니다. 둘 다 기억됩니다.
- **Summary**는 상태입니다. 프로젝트에 무엇이 있는지, 셋업이 생성할 것이 이미 갖춰져 있는지, 손으로 할
  일이 무엇이 남았는지. 여기서는 프로젝트에 아무것도 바뀌지 않습니다.
- **Setup**은 선택입니다. 무엇을 생성할지, 미리보기, Generate. *Tools → WaggleBum → WagSettings → Setup*은 이
  페이지로 에디터를 열므로 기존 링크가 모두 그대로 동작합니다. 생성하면 Summary로 이동합니다.
- **Settings Profile**은 "자신만의 설정 추가"가 있는 곳입니다. 어느 프로필이 기본인지, 그 안의 모든 설정과 키, 종류, 기본값,
  범위, 순서 변경과 제거, 그리고 **설정 추가** — 프로필 옆에 새 설정 에셋을 만드는 대화 상자로, 키는 입력하는 동안
  검사됩니다.
  [확장성](Extensibility.md)을 참고하세요.
- **Debugger**는 플레이 모드에서 실시간입니다. 모든 설정의 보류 값, Apply / Revert / Reset, 매니저가 연결한
  어플라이어. 초당 네 번 폴링하고 무언가 움직였을 때만 다시 그립니다.
- **Help**에는 버전, 치트시트, 두 Quick Start 씬, 에디터 언어가 있습니다.

![프로필의 모든 설정을 나열하는 Settings Profile 페이지](../Images/settings-profile-page.png)

![Play 모드의 Debugger, 대기 중인 값이 굵게 표시됨](../Images/debugger-play-mode.png)

## 첫 실행

`SettingsProfile`이 전혀 없는 프로젝트는 레일 대신 단일 화면을 봅니다. 로고, 한 문장, 그리고 **Run Setup**.
아직 존재하지 않는 설정에 관한 페이지 레일은 소음일 뿐입니다.

## 언어

에디터는 Help 페이지에서 선택한 언어를 따릅니다. 선택하기 전까지는 WagSave에 설정된 언어를 따르므로, 둘 다
설치되어 있으면 한 번만 고르면 됩니다. 번역이 빠진 곳은 영어로 표시됩니다 — 아직 번역되지 않은 문자열은 영어로
나타나며, 빈칸이나 키로 나타나지 않습니다.

![에디터 언어 드롭다운을 연 Help 페이지](../Images/help-language.png)

## 궁금한 분들을 위해

각 페이지는 `EditorContent`, 레일은 `EditorPages`, 창이 기억하는 것은 `IEditorPreferences` 이음새 위의
`EditorWindowState`, 페이지의 문서는 `EditorDocs`로 `<Page>.<locale>.md`, 그다음 `.en.md`, 그다음 `.md`를
시도합니다. 문자열은 `Editor/Localization/<locale>.json` 위의 `WagSettingsL10n`에서 옵니다. 이들은 모두 테스트가
있는 평범한 클래스입니다. 창 자체만이 직접 눈으로 봐야 하는 유일한 것입니다.
