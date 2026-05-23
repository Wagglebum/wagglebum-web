# API 레퍼런스

별도로 명시되지 않는 한 모든 타입은 `WaggleBum.WagSave` 네임스페이스에 있습니다.

```csharp
using WaggleBum.WagSave;
using WaggleBum.WagSave.Core.SaveSlots; // SaveSlot, SaveSlotManager
using WaggleBum.WagSave.Core.Enums;    // SaveSlotType, LogLevel
```

---

## 인스턴스 가져오기

```csharp
// 활성 (또는 유일한) WagSave 인스턴스 가져오기
WagSave wagSave = WagSave.GetInstance();

// ID로 특정 인스턴스 가져오기 (여러 인스턴스가 있을 때 유용)
WagSave wagSave = WagSave.GetInstance("my-instance-id");

// 프로젝트의 모든 인스턴스 가져오기
WagSave[] all = WagSave.GetAllInstances();
```

런타임 빌드에서 `GetInstance`는 `Resources/WagSave/`에서 로드합니다. 에디터에서는 `AssetDatabase`를 사용합니다. 인스턴스를 찾을 수 없으면 `null`이 반환되고 경고가 기록됩니다.

---

## 컴포넌트 저장 / 불러오기

이 메서드들은 현재 로드된 모든 씬의 `WagSaveComponent` 인스턴스를 저장하고 불러옵니다.

### 동기식

```csharp
// 모든 컴포넌트 저장 — 선택적으로 특정 슬롯에 저장
wagSave.Save();
wagSave.Save(slot);

// 모든 컴포넌트 불러오기 — 선택적으로 특정 슬롯에서 불러오기
wagSave.Load();
wagSave.Load(slot);
```

### 비동기식 (권장)

직렬화와 파일 I/O는 백그라운드 스레드에서 실행됩니다. Unity API 호출은 메인 스레드에 남습니다.

```csharp
await wagSave.SaveAsync();
await wagSave.SaveAsync(slot);

await wagSave.LoadAsync();
await wagSave.LoadAsync(slot);
```

### 세이브 슬롯이 활성화된 경우의 동작

세이브 슬롯이 활성화되어 있고 `slot` 인수가 제공되지 않은 경우:
- **Use Save Slot UI**가 켜져 있으면 내장 슬롯 선택 UI가 자동으로 표시됩니다.
- **Use Save Slot UI**가 꺼져 있으면 WagSave가 설정에 따라 자동으로 슬롯을 선택합니다.

명시적으로 `slot`을 전달하면 UI와 슬롯 선택을 완전히 우회합니다.

---

## 키-값 저장 / 불러오기

특정 GameObject에 연결되지 않은 개별 값을 저장하는 데 사용합니다.

```csharp
// 정적 편의 메서드 — 활성 WagSave 인스턴스를 사용
WagSave.Save("score", 9500);
WagSave.Save("playerName", "Alex", groupName: "player");

// 타입 지정 불러오기
int score = WagSave.Load<int>("score");
string name = WagSave.Load<string>("playerName", groupName: "player");

// 타입 미지정 불러오기
object raw = WagSave.Load("score");
```

선택적 `groupName` 파라미터는 충돌을 방지하기 위해 키에 네임스페이스를 지정합니다. 선택적 `instanceId` 파라미터는 여러 인스턴스가 있을 때 특정 WagSave 인스턴스를 대상으로 합니다.

---

## 자동저장

```csharp
// 즉시 자동저장 실행 (동기식)
wagSave.AutoSave();

// 즉시 자동저장 실행 (비동기식)
await wagSave.AutoSaveAsync();

// 자동저장 타이머 일시 정지
wagSave.PauseAutoSave();

// 일시 정지된 자동저장 타이머 재개 (카운트다운 재설정)
wagSave.ResumeAutoSave();

// 일시 정지 없이 자동저장 카운트다운 재설정
wagSave.ResetAutoSaveTimer();

// 다음 자동저장에 사용할 특정 슬롯 고정
wagSave.SetAutoSaveSlot(slot);

// 고정된 슬롯 해제하여 자동저장이 자동으로 선택하도록
wagSave.ClearAutoSaveSlot();
```

자동저장 타이머 자체는 `WagSaveManager`에 의해 구동됩니다 — 씬에 있어야 하는 MonoBehaviour입니다. [자동저장](Autosave.md)을 참조하세요.

---

## 속성

| 속성 | 타입 | 설명 |
|---|---|---|
| `IsSaving` | `bool` | 저장 작업이 진행 중일 때 true. |
| `IsLoading` | `bool` | 불러오기 작업이 진행 중일 때 true. |
| `Progress` | `int` | 현재 작업 진행률, 0–100. |
| `Settings` | `WagSaveSettings` | 모든 설정에 대한 액세스. |
| `SaveSlots` | `SaveSlotManager` | 세이브 슬롯 매니저. [세이브 슬롯](SaveSlots.md) 참조. |
| `IsSaveOverrideEnabled` | `bool` | `OnSaveOverride`와 `OnLoadOverride` 모두 구독된 경우 true. |
| `DebugLogLevel` | `LogLevel` | Unity 콘솔에 기록되는 최소 로그 심각도. |
| `LogToFileEnabled` | `bool` | true일 때 로그 출력이 파일에도 기록됩니다. |
| `InstanceCount` | `int` | 프로젝트에서 찾은 WagSave 에셋의 수. |

---

## 이벤트

저장/불러오기 수명 주기 변화에 반응하려면 WagSave 인스턴스의 이벤트를 구독합니다.

```csharp
private void OnEnable()
{
    var wagSave = WagSave.GetInstance();
    wagSave.OnSaveStart     += HandleSaveStart;
    wagSave.OnSaveCompleted += HandleSaveCompleted;
    wagSave.OnLoadStart     += HandleLoadStart;
    wagSave.OnLoadCompleted += HandleLoadCompleted;
    wagSave.OnProgress      += HandleProgress;
    wagSave.OnError         += HandleError;
}

private void OnDisable()
{
    var wagSave = WagSave.GetInstance();
    if (wagSave == null) return;
    wagSave.OnSaveStart     -= HandleSaveStart;
    wagSave.OnSaveCompleted -= HandleSaveCompleted;
    wagSave.OnLoadStart     -= HandleLoadStart;
    wagSave.OnLoadCompleted -= HandleLoadCompleted;
    wagSave.OnProgress      -= HandleProgress;
    wagSave.OnError         -= HandleError;
}

private void HandleSaveStart()    { Debug.Log("Save started"); }
private void HandleSaveCompleted(){ Debug.Log("Save complete"); }
private void HandleLoadStart()    { Debug.Log("Load started"); }
private void HandleLoadCompleted(){ Debug.Log("Load complete"); }
private void HandleProgress(int percent) { Debug.Log($"Progress: {percent}%"); }
private void HandleError(string message, Exception ex) { Debug.LogError(message); }
```

### 전체 이벤트 레퍼런스

| 이벤트 | 시그니처 | 발생 시점 |
|---|---|---|
| `OnSaveStart` | `() => void` | 저장이 시작되기 직전. |
| `OnSaveCompleted` | `() => void` | 저장이 성공적으로 완료된 후. |
| `OnLoadStart` | `() => void` | 불러오기가 시작되기 직전. |
| `OnLoadCompleted` | `() => void` | 불러오기가 성공적으로 완료된 후. |
| `OnProgress` | `(int percent) => void` | 저장 또는 불러오기 중 0–100 완료율과 함께 주기적으로. |
| `OnError` | `(string msg, Exception ex) => void` | 저장 또는 불러오기 오류 발생 시. |
| `OnAutoSaveTimer` | `(int secondsRemaining, int interval) => void` | 활성 자동저장 카운트다운 중 매 프레임. |
| `OnAutosavePause` | `() => void` | 자동저장이 일시 정지될 때. |
| `OnAutosaveResume` | `() => void` | 자동저장이 재개될 때. |
| `OnAutosaveTimerReset` | `() => void` | 자동저장 카운트다운이 재설정될 때. |
| `OnGetEncryptionPrivateKey` | [확장성](Extensibility.md) 참조 | 암호화된 저장 파일에 개인 키가 필요할 때. |
| `OnSaveOverride` | [확장성](Extensibility.md) 참조 | 커스텀 직렬화 — 기본 저장 로직을 대체합니다. |
| `OnLoadOverride` | [확장성](Extensibility.md) 참조 | 커스텀 역직렬화 — 기본 불러오기 로직을 대체합니다. |

---

## 다중 인스턴스

프로젝트에 WagSave 에셋이 여러 개 있는 경우 (예: 게임 데이터와 설정을 위한 별도 프로필), 에디터에서 하나를 **Active**로 표시하거나 다음을 호출합니다:

```csharp
wagSave.SetActive(); // 이 인스턴스를 활성으로 표시하고 나머지를 비활성화
```

`GetInstance()`는 인수 없이 호출하면 활성 인스턴스를 반환합니다. 특정 인스턴스를 가져오려면:

```csharp
WagSave settingsSave = WagSave.GetInstance("settings-instance-id");
```

인스턴스 ID는 WagSave 에디터 창 헤더에 표시되고 에셋에 저장됩니다.
