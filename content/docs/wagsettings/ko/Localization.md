# 현지화

플레이어의 — 또는 개발자의 — 언어로 말하는 것이 두 가지 있습니다. 게임이 출시하는 설정 메뉴와 개발자가 사용하는
에디터입니다. 게임의 플레이어와 게임의 개발자는 같은 사람이 아니므로 이 둘은 분리되어 있습니다.

## 메뉴를 플레이어의 언어로

두 메뉴 모두 문구를 `SettingsMenuStrings`에서 가져옵니다. 제목, Apply / Revert / Reset, 검색 레이블, 모든 탭,
모든 설정의 레이블입니다. 메뉴가 열리기 전에 테이블을 설치하세요.

![일본어 설정 메뉴](../Images/menu-localized-ja.png)

```csharp
SettingsMenuLocalization.Apply("ja");   // en, es, ja, ko, zh-CN, zh-TW
```

패키지에 포함된 테이블은 명령, 생성되는 다섯 카테고리, 그리고 셋업이 생성하는 모든 설정을 다룹니다. 이미
열려 있는 메뉴는 다시 열릴 때까지 만들어질 당시의 문구를 유지합니다.

모든 조회는 자체 영어 폴백을 갖고 있어서, 항목이 빠져 있으면 영어 단어가 표시됩니다 — 키도, 빈칸도 아닙니다.

### 자신만의 설정

추가한 설정은 별도로 지정하기 전까지 모든 언어에서 키에서 파생된 레이블 — `gameplay.difficulty`는
"Difficulty" — 을 갖습니다. 자신의 테이블에 `Label.<key>` 항목을 추가하고 패키지 테이블 위에 덮으세요.

```csharp
LocalizationTable packaged = SettingsMenuLocalization.Load("ja")!;
LocalizationTable mine = LocalizationTable.Parse(myJson);    // { "Label": { "gameplay.difficulty": "難易度" } }
SettingsMenuLocalization.Merge(packaged, mine);
```

자신만의 카테고리도 같은 방식으로 `Category.<Name>`입니다. 두 테이블에 같은 키가 있으면 당신의 것이 이깁니다.

파일 형식은 에디터가 사용하는 것과 같습니다. 문자열의 중첩된 JSON 객체를 `Section.Key`로 평탄화한 것입니다.
`LocalizationTable.Parse`가 이를 읽고 그 외의 것은 시끄럽게 거부합니다. 절반만 로드되는 파일은 절반만 번역된
메뉴이기 때문입니다.

### 번역되지 않는 것

열거형 옵션 — `Windowed`, `Borderless` — 은 `EnumSetting` 에셋에 작성되고 작성된 대로 표시됩니다. 출시하는
언어로 작성하거나 언어별로 설정을 추가하세요. 옵션별 키 체계는 아직 없습니다.

## 에디터를 개발자의 언어로

에디터 창은 **Help** 페이지에서 선택한 언어를 따릅니다. 표시되는 모든 문자열은 `Editor/Localization/<locale>.json`에서,
각 페이지의 문서 창은 `Editor/EditorWindow/Docs/<Page>.<locale>.md`에서 옵니다. 거기서 언어를 선택하기 전까지는
WagSave에 설정된 언어가 사용되므로, 둘 다 설치되어 있으면 한 번만 고르면 됩니다. 번역이 빠진 곳은 영어로
표시됩니다.

![에디터 언어 드롭다운을 연 Help 페이지](../Images/help-language.png)

테스트는 포함된 모든 로케일을 영어 파일과 대조합니다. 어느 언어든 키나 페이지가 빠져 있으면 스위트가 실패합니다.

## 이 문서

사용자 문서는 `Docs/<locale>/` 아래에 있으며 영어 레이아웃을 그대로 반영합니다.
