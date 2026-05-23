# 擴充性

WagSave 的設計允許在每個層級進行擴充，且無需修改套件原始碼。

## 存檔與讀檔覆寫

`OnSaveOverride` 和 `OnLoadOverride` 必須同時訂閱。

```csharp
wagSave.OnSaveOverride += (slot, saveTarget) =>
{
    // 將任何內容寫入 saveTarget
    saveTarget.AddOrUpdate("myKey", myCustomData);
    // 此處理常式執行完畢後，saveTarget.Save() 會自動被呼叫
};

wagSave.OnLoadOverride += (slot, saveTarget) =>
{
    // 從 saveTarget 讀取並套用至遊戲狀態
    var data = saveTarget.Get<MyCustomData>("myKey");
    ApplyToGame(data);
};
```

## 加密金鑰提供

```csharp
wagSave.OnGetEncryptionPrivateKey += () =>
{
    // 從您安全儲存私鑰的地方讀取
    return SecureKeyStorage.GetPrivateKey();
};
```

或者，在第一次存檔或讀檔之前直接在實例上設定金鑰：

```csharp
wagSave.Settings.SaveTarget.Options.EncryptPrivateKey = SecureKeyStorage.GetPrivateKey();
```

事件方式較為推薦，因為它將金鑰取得延遲至實際使用時。兩種方式均有效。

## 自訂輸出格式

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

SaveTargetDestination.Register(new SaveTargetDestination(
    id:          "my-custom-format",
    name:        "My Format",
    description: "A custom save backend",
    groupName:   "Custom",
    factory:     settings => new MyCustomSaveTarget(settings)
));
```

## 自訂序列化器

```csharp
using WaggleBum.WagSave.Core.Serialization;

public class MyJsonSerializer : JsonSerializer
{
    protected override string Serialize(object value)
    {
        // 自訂序列化邏輯 — 例如使用不同的 JSON 函式庫
        return MyJsonLibrary.Serialize(value);
    }

    protected override T Deserialize<T>(string data)
    {
        return MyJsonLibrary.Deserialize<T>(data);
    }
}

public class MyJsonSaveTarget : JsonFileSaveTarget
{
    protected override ISerializer CreateSerializer() => new MyJsonSerializer();
}
```

## 自訂進度指示器 UI

```csharp
public interface IProgressIndicator
{
    void Show();
    void Hide();
    void SetProgress(int percent);
}
```

## 自訂存檔槽位 UI

將您自訂的預製體指派給 `Save Slots UI Prefab`。完整 API 請參閱[存檔槽位](SaveSlots.md)。

---
