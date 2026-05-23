# 자동저장

WagSave의 자동저장 시스템은 설정 가능한 인터벌마다 자동으로 저장을 실행합니다. 타이머는 `WagSaveManager`에 의해 구동되며, 자동저장을 사용하는 모든 씬에 이 MonoBehaviour가 있어야 합니다.

---

## 설정

### 1. 에디터에서 자동저장 활성화

WagSave 에디터 창에서 **Autosave**로 이동하여:
- **Enable Autosave** 활성화
- **Interval (Seconds)** 설정 — 저장이 실행되는 빈도
- **Enabled Scenes**에 씬 추가 — 자동저장은 목록에 있는 씬에서만 실행됩니다

### 2. 씬에 WagSaveManager 추가

`WagSaveManager`는 타이머를 카운트다운하고 저장을 실행하는 MonoBehaviour입니다. 씬의 영구적인 GameObject에 추가합니다:

```
Add Component > WaggleBum > WagSave > WagSave Manager
```

`WagSaveManager`는 `Start`에서 활성 `WagSave` 인스턴스를 자동으로 찾습니다. 코드에서 직접 연결할 필요가 없습니다.

---

## 활성화된 씬

자동저장은 **Enabled Scenes** 목록에 있는 씬이 활성 씬일 때만 실행됩니다. 플레이어가 목록에 없는 씬에 있으면 타이머가 자동으로 일시 정지됩니다. 이렇게 하면 메뉴, 로딩 화면, 컷씬 전용 씬에서 자동저장이 실행되지 않습니다.

에디터 창의 **Autosave > Enabled Scenes**에서 설정합니다. 씬 에셋을 목록으로 드래그합니다.

---

## 자동저장과 세이브 슬롯

세이브 슬롯이 활성화된 경우, 각 자동저장은 `SaveSlotType.Auto` 타입의 슬롯에 기록됩니다.

**Use Latest Slot** (에디터의 **Autosave** 아래에서 설정):
- **켜짐** — 자동저장이 가장 최근에 수정된 슬롯을 덮어씁니다. 플레이어의 마지막 수동 저장이 최신 상태로 유지됩니다.
- **꺼짐** — 매 자동저장마다 새 `Auto` 슬롯이 생성됩니다. 롤링 자동저장 기록 유지에 유용합니다.

특정 슬롯을 자동저장에 고정할 수도 있습니다:

```csharp
SaveSlot checkpoint = wagSave.SaveSlots.AddNewSlot(SaveSlotType.Auto);
wagSave.SetAutoSaveSlot(checkpoint);

// 나중에 자동 선택으로 돌아가려면 해제
wagSave.ClearAutoSaveSlot();
```

---

## 런타임에서 타이머 제어

```csharp
WagSave wagSave = WagSave.GetInstance();

// 자동저장 타이머 일시 정지 (예: 컷씬 또는 일시 정지 메뉴 중)
wagSave.PauseAutoSave();

// 일시 정지된 타이머 재개 — 카운트다운을 전체 인터벌로 재설정
wagSave.ResumeAutoSave();

// 일시 정지 없이 카운트다운 재설정 (예: 수동 저장 후)
wagSave.ResetAutoSaveTimer();
```

### 타이머 이벤트 반응

```csharp
// 플레이어에게 카운트다운 표시
wagSave.OnAutoSaveTimer += (secondsRemaining, interval) =>
{
    float progress = (float)secondsRemaining / interval;
    autosaveProgressBar.value = progress;
};

wagSave.OnAutosavePause  += () => Debug.Log("Autosave paused");
wagSave.OnAutosaveResume += () => Debug.Log("Autosave resumed");
```

---

## 수동으로 자동저장 트리거

타이머 상태와 관계없이 언제든지 `AutoSave()` 또는 `AutoSaveAsync()`를 호출하여 자동저장을 즉시 실행합니다. 슬롯 선택 로직 (최신 vs. 새 슬롯)은 여전히 적용됩니다.

```csharp
// 즉시 트리거 — 예: 플레이어가 체크포인트를 통과할 때
wagSave.AutoSave();

// 또는 비동기식:
await wagSave.AutoSaveAsync();
```

---

## 자동저장 이벤트 구독

```csharp
wagSave.OnSaveStart     += () => ShowAutosaveIndicator();
wagSave.OnSaveCompleted += () => HideAutosaveIndicator();
wagSave.OnError         += (msg, ex) => Debug.LogError($"Autosave failed: {msg}");
```

이것들은 수동 저장에서도 사용되는 동일한 이벤트입니다 — `OnSaveStart`와 `OnSaveCompleted`는 타입에 관계없이 모든 저장에 대해 발생합니다.

---

## 일반적인 패턴

### 메뉴 중 자동저장 일시 정지

```csharp
private void OpenPauseMenu()
{
    WagSave.GetInstance().PauseAutoSave();
    pauseMenuUI.SetActive(true);
}

private void ClosePauseMenu()
{
    pauseMenuUI.SetActive(false);
    WagSave.GetInstance().ResumeAutoSave();
}
```

### 수동 저장 후 카운트다운 재설정

플레이어가 방금 수동으로 저장한 직후 자동저장이 실행되는 것을 방지합니다:

```csharp
public async void OnSaveButtonPressed()
{
    var wagSave = WagSave.GetInstance();
    await wagSave.SaveAsync();
    wagSave.ResetAutoSaveTimer();
}
```
