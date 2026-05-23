# 확장성

WagSave는 모든 레이어에서 확장 가능하도록 설계되었습니다. 직렬화 형식을 교체하거나, 새 출력 백엔드를 교체하거나, 저장/불러오기 로직을 완전히 오버라이드하거나, 암호화 키 제공에 훅을 달 수 있습니다 — 패키지 소스를 수정하지 않고도 가능합니다.

---

## 저장 및 불러오기 오버라이드

저장 및 불러오기 동작을 완전히 제어하는 가장 간단한 방법은 `OnSaveOverride`와 `OnLoadOverride` 이벤트를 통한 것입니다. 둘 다 구독되면 WagSave는 기본 컴포넌트 직렬화를 건너뛰고 핸들러에 완전히 위임합니다.

두 이벤트는 함께 구독해야 합니다 — 하나만 구독하면 `InvalidOperationException`이 발생합니다.

```csharp
wagSave.OnSaveOverride += (slot, saveTarget) =>
{
    // saveTarget에 원하는 것을 씁니다
    saveTarget.AddOrUpdate("myKey", myCustomData);
    // saveTarget.Save()는 이 핸들러 이후 자동으로 호출됩니다
};

wagSave.OnLoadOverride += (slot, saveTarget) =>
{
    // saveTarget에서 읽고 게임 상태에 적용합니다
    var data = saveTarget.Get<MyCustomData>("myKey");
    ApplyToGame(data);
};
```

`saveTarget` 파라미터는 설정된 저장 백엔드입니다 (Binary, JSON 등). 어떤 형식이 활성화되어 있든 같은 방식으로 상호작용합니다:

```csharp
// 값 쓰기
saveTarget.AddOrUpdate("key", value);

// 값 읽기
var value = saveTarget.Get<MyType>("key");

// 디스크 / 원격에 플러시
saveTarget.Save();
```

이 패턴은 `WagSaveComponent` 리플렉션 경로에 깔끔하게 매핑되지 않는 자체 직렬화 가능한 데이터 모델이 있을 때 유용합니다.

---

## 암호화 키 제공

**Encrypt Data**가 활성화되면 WagSave는 비대칭 암호화를 사용합니다. 공개 키는 WagSave 에셋에 저장됩니다. 개인 키는 WagSave가 저장하지 않습니다 — 이벤트를 통해 런타임에 제공합니다:

```csharp
wagSave.OnGetEncryptionPrivateKey += () =>
{
    // 안전하게 보관하는 곳에서 개인 키를 로드합니다 —
    // 원격 서버, 플랫폼 자격 증명 저장소 등.
    return SecureKeyStorage.GetPrivateKey();
};
```

또는 첫 번째 저장 또는 불러오기 전에 인스턴스에 직접 키를 할당할 수 있습니다:

```csharp
wagSave.Settings.SaveTarget.Options.EncryptPrivateKey = SecureKeyStorage.GetPrivateKey();
```

이벤트 방식은 키 조회를 사용 시점까지 지연시킬 수 있어 권장됩니다. 두 방식 모두 유효합니다.

> **보안 참고:** 소스 코드에 개인 키를 평문 문자열로 삽입하거나 빌드 내부에 평문으로 포함하지 마세요. 플랫폼 자격 증명 저장소를 사용하거나 첫 실행 시 서버에서 로드하세요.

---

## 커스텀 출력 형식

`WaggleBum.WagSave.Core.Interfaces`의 `ISaveTarget` 인터페이스를 구현하여 새 출력 형식을 만듭니다. 등록되면 에디터 드롭다운에서 내장 형식과 함께 표시됩니다.

```csharp
using WaggleBum.WagSave.Core.Interfaces;
using WaggleBum.WagSave.Core.SaveTargets;

public class MyCustomSaveTarget : ISaveTarget
{
    public void AddOrUpdate(string key, object value, string group = null) { /* ... */ }
    public object Get(string key, string group = null)                      { /* ... */ }
    public T Get<T>(string key, string group = null)                        { /* ... */ }
    public void Save()                                                      { /* ... */ }
    public void Load()                                                      { /* ... */ }
    public void Dispose()                                                   { /* ... */ }
}
```

WagSave가 발견할 수 있도록 `SaveTargetDestination`에 등록합니다:

```csharp
SaveTargetDestination.Register(new SaveTargetDestination(
    id:          "my-custom-format",
    name:        "My Format",
    description: "A custom save backend",
    groupName:   "Custom",
    factory:     settings => new MyCustomSaveTarget(settings)
));
```

시작 시 한 번 `Register`를 호출합니다. 예를 들어 `[InitializeOnLoad]` 클래스 (에디터) 또는 `RuntimeInitializeOnLoadMethod` (런타임)에서 호출합니다.

---

## 커스텀 직렬화기

WagSave의 내장 직렬화기 (Binary, JSON, Text)는 전체 저장 대상을 교체하지 않고도 데이터 인코딩 방식을 변경하기 위해 서브클래싱하여 오버라이드할 수 있습니다.

```csharp
using WaggleBum.WagSave.Core.Serialization;

public class MyJsonSerializer : JsonSerializer
{
    protected override string Serialize(object value)
    {
        // 커스텀 직렬화 로직 — 예: 다른 JSON 라이브러리 사용
        return MyJsonLibrary.Serialize(value);
    }

    protected override T Deserialize<T>(string data)
    {
        return MyJsonLibrary.Deserialize<T>(data);
    }
}
```

해당 저장 대상을 서브클래싱하고 `CreateSerializer`를 오버라이드하여 직렬화기를 주입합니다:

```csharp
public class MyJsonSaveTarget : JsonFileSaveTarget
{
    protected override ISerializer CreateSerializer() => new MyJsonSerializer();
}
```

그런 다음 위에서 보여준 것처럼 커스텀 형식으로 등록합니다.

---

## 커스텀 진행률 표시기 UI

WagSave 에셋의 `Progress Indicator Prefab` 필드에 자신만의 프리팹을 할당하여 내장 진행률 표시기를 교체합니다. 프리팹에는 `IProgressIndicator` 인터페이스를 구현하는 컴포넌트가 있어야 합니다:

```csharp
public interface IProgressIndicator
{
    void Show();
    void Hide();
    void SetProgress(int percent);
}
```

---

## 커스텀 세이브 슬롯 UI

WagSave 에셋의 `Save Slots UI Prefab` 필드에 자신만의 프리팹을 할당하여 내장 슬롯 선택기를 교체합니다. 완전히 커스텀한 구현을 원한다면 **Use Save Slot UI**를 비활성화하고 코드에서 슬롯 선택을 완전히 제어합니다. 전체 `SaveSlotManager` API는 [세이브 슬롯](SaveSlots.md)을 참조하세요.
