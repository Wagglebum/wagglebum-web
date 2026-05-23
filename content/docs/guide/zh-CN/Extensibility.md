# 扩展性

WagSave 的每个层次都可以进行扩展，且无需修改包的源代码。

## 保存与加载覆写

```csharp
wagSave.OnSaveOverride += (slot, saveTarget) =>
{
    // 将任何你需要的内容写入 saveTarget
    saveTarget.AddOrUpdate("myKey", myCustomData);
    // 此处理程序执行后，saveTarget.Save() 将自动被调用
};
wagSave.OnLoadOverride += (slot, saveTarget) =>
{
    // 从 saveTarget 读取并应用到你的游戏状态
    var data = saveTarget.Get<MyCustomData>("myKey");
    ApplyToGame(data);
};
// 写入一个值
saveTarget.AddOrUpdate("key", value);
// 读取一个值
var value = saveTarget.Get<MyType>("key");
// 刷新到磁盘 / 远端
saveTarget.Save();
```

两个事件必须同时订阅——仅订阅其中一个将抛出 `InvalidOperationException`。

## 加密密钥的提供

```csharp
wagSave.OnGetEncryptionPrivateKey += () =>
{
    // 从你安全存储私钥的位置加载它
    return SecureKeyStorage.GetPrivateKey();
};
```

也可以在第一次存档或读档之前直接在实例上设置密钥：

```csharp
wagSave.Settings.SaveTarget.Options.EncryptPrivateKey = SecureKeyStorage.GetPrivateKey();
```

事件方式更推荐，因为它将密钥获取推迟到实际使用时。两种方式均有效。

> **安全提示：** 请勿将私钥以明文字符串形式嵌入源代码中。

## 自定义输出格式

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

## 自定义序列化器

```csharp
using WaggleBum.WagSave.Core.Serialization;
public class MyJsonSerializer : JsonSerializer
{
    protected override string Serialize(object value)
    {
        // 自定义序列化逻辑——例如使用其他 JSON 库
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

## 自定义进度指示器 UI

```csharp
public interface IProgressIndicator
{
    void Show();
    void Hide();
    void SetProgress(int percent);
}
```

## 自定义存档槽位 UI

将你自己的预制体赋值给 `Save Slots UI Prefab` 字段，即可替换内置槽位选择器。完整的 `SaveSlotManager` API 请参阅[存档槽位](SaveSlots.md)。

---
