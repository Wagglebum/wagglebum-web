# 시작하기

이 가이드는 WagSave 설치, 첫 번째 세이브 에셋 생성, 그리고 기본 저장 및 불러오기 수행 방법을 안내합니다.

---

## 1. WagSave 에셋 생성

Project 창에서 마우스 오른쪽 버튼을 클릭하고 다음을 선택합니다:

```
Assets > Create > WaggleBum > WagSave > WagSave (Save System)
```

이렇게 하면 `WagSave` ScriptableObject가 생성됩니다. 의미 있는 이름을 붙이세요 — 예를 들어 `GameSave` 또는 `SaveProfile`.

Unity 메뉴 바에서 언제든지 WagSave 에디터 창을 열 수 있습니다:

```
Window > WagSave
```

창 상단의 드롭다운에서 에셋을 선택합니다.

---

## 2. Resources 폴더로 이동

WagSave는 빌드된 런타임에서 에셋을 찾기 위해 `Resources.Load`를 사용합니다. 프로젝트 내 어디에든 `Resources` 폴더 안의 `WagSave` 폴더에 에셋을 배치합니다:

```
Assets/
  Resources/
    WagSave/
      GameSave.asset   ← WagSave 에셋을 여기에 배치합니다
```

> **중요:** 에셋이 `Resources/WagSave/` 폴더 안에 없으면, 빌드에서 `WagSave.GetInstance()`가 `null`을 반환합니다 (Unity 에디터는 `AssetDatabase`를 사용하므로 위치에 관계없이 작동합니다).

---

## 3. WagSave 에디터 창 열기

```
Window > WagSave
```

에디터 창은 모든 설정이 이루어지는 곳입니다 — 출력 형식, 세이브 슬롯, 자동저장, 암호화, 로깅 등. 상단의 드롭다운에서 에셋을 선택합니다.

---

## 4. 출력 형식 선택

에디터 창에서 **Save Output**으로 이동하여 카테고리와 형식을 선택합니다:

| 카테고리 | 형식 | 적합한 용도 |
|---|---|---|
| File | Binary | 출시 — 압축적이고 빠름 |
| File | JSON | 디버깅 — 사람이 읽을 수 있음 |
| File | Text | 단순한 키-값 데이터 |
| Platform | PlayerPrefs | 소규모 설정 데이터, WebGL |
| Platform | Unity Cloud Save | 온라인 멀티플레이어 게임 |
| Platform | Steam Cloud Save | Steamworks SDK를 사용하는 Steam 게임 |

대부분의 프로젝트에서 **Binary**가 권장되는 시작점입니다.

---

## 5. 씬에 WagSaveManager 추가

`WagSaveManager`는 자동저장 타이머와 씬 전환 로직을 구동하는 MonoBehaviour입니다. 씬의 GameObject에 추가합니다 (일반적으로 영구적인 매니저 오브젝트에).

```
Add Component > WaggleBum > WagSave > WagSave Manager
```

자동저장을 사용하는 모든 씬에서 `WagSaveManager`는 하나만 필요합니다. 런타임에 활성 `WagSave` 인스턴스를 자동으로 찾습니다.

---

## 6. 저장할 GameObject 지정

상태를 저장하려는 모든 GameObject에 `WagSaveComponent`를 추가합니다:

```
Add Component > WaggleBum > WagSave > WagSave
```

그런 다음 WagSave 에디터 창을 열고 **Scene Content**로 이동한 후, 목록에서 GameObject를 찾아 **Configure**를 클릭하여 포함할 필드와 속성을 선택합니다.

전체 안내는 [WagSave 컴포넌트](WagSaveComponent.md)를 참조하세요.

---

## 7. 저장 및 불러오기

### 코드를 통해

```csharp
using WaggleBum.WagSave;

public class GameManager : MonoBehaviour
{
    private WagSave _wagSave;

    private void Start()
    {
        _wagSave = WagSave.GetInstance();
    }

    public void SaveGame()
    {
        _wagSave.Save();
    }

    public void LoadGame()
    {
        _wagSave.Load();
    }
}
```

### 키-값 저장 (WagSaveComponent 불필요)

특정 GameObject에 속하지 않는 단순한 값에 사용합니다:

```csharp
// 저장
WagSave.Save("currentLevel", 5);
WagSave.Save("playerName", "Alex");

// 불러오기
int level = WagSave.Load<int>("currentLevel");
string name = WagSave.Load<string>("playerName");
```

---

## 8. 비동기 저장 (대형 씬에 권장)

오브젝트가 많은 씬에서는 프레임 끊김을 방지하기 위해 비동기 변형을 사용합니다:

```csharp
public async void SaveGame()
{
    await _wagSave.SaveAsync();
}

public async void LoadGame()
{
    await _wagSave.LoadAsync();
}
```

직렬화와 파일 I/O는 백그라운드 스레드에서 실행됩니다. Unity API 호출 (컴포넌트 값 읽기)은 백그라운드 작업이 시작되기 전에 메인 스레드에서 계속 이루어집니다.

---

## 다음 단계

- [저장할 필드 설정 → WagSave 컴포넌트](WagSaveComponent.md)
- [멀티 세이브 슬롯 설정 → 세이브 슬롯](SaveSlots.md)
- [자동저장 설정 → 자동저장](Autosave.md)
- [암호화 또는 압축 활성화 → 출력 형식](OutputFormats.md)
