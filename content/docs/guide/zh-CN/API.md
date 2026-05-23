# API 参考

所有类型均位于 `WaggleBum.WagSave` 命名空间下，除非另有说明。

```csharp
using WaggleBum.WagSave;
using WaggleBum.WagSave.Core.SaveSlots; // SaveSlot, SaveSlotManager
using WaggleBum.WagSave.Core.Enums;    // SaveSlotType, LogLevel
```

## 获取实例

```csharp
// 获取当前活跃（或唯一）的 WagSave 实例
WagSave wagSave = WagSave.GetInstance();
// 通过 ID 获取指定实例
WagSave wagSave = WagSave.GetInstance("my-instance-id");
// 获取项目中所有实例
WagSave[] all = WagSave.GetAllInstances();
```

## 组件保存 / 加载

### 同步

```csharp
// 保存所有组件——可选择保存到指定槽位
wagSave.Save();
wagSave.Save(slot);
// 加载所有组件——可选择从指定槽位加载
wagSave.Load();
wagSave.Load(slot);
```

### 异步（推荐）

```csharp
await wagSave.SaveAsync();
await wagSave.SaveAsync(slot);
await wagSave.LoadAsync();
await wagSave.LoadAsync(slot);
```

## 键值保存 / 加载

```csharp
// 静态便捷方法——使用当前活跃的 WagSave 实例
WagSave.Save("score", 9500);
WagSave.Save("playerName", "Alex", groupName: "player");
// 带类型的加载
int score = WagSave.Load<int>("score");
string name = WagSave.Load<string>("playerName", groupName: "player");
// 不带类型的加载
object raw = WagSave.Load("score");
```

## 自动保存

```csharp
// 立即触发自动保存（同步）
wagSave.AutoSave();
// 立即触发自动保存（异步）
await wagSave.AutoSaveAsync();
// 暂停自动保存计时器
wagSave.PauseAutoSave();
// 恢复已暂停的自动保存计时器
wagSave.ResumeAutoSave();
// 重置自动保存倒计时，但不暂停
wagSave.ResetAutoSaveTimer();
// 为下次自动保存指定特定槽位
wagSave.SetAutoSaveSlot(slot);
// 清除已指定的槽位
wagSave.ClearAutoSaveSlot();
```

## 属性

| 属性 | 类型 | 说明 |
|---|---|---|
| `IsSaving` | `bool` | 保存操作进行中时为 true。 |
| `IsLoading` | `bool` | 加载操作进行中时为 true。 |
| `Progress` | `int` | 当前操作进度，范围 0–100。 |
| `Settings` | `WagSaveSettings` | 访问所有配置设置。 |
| `SaveSlots` | `SaveSlotManager` | 存档槽位管理器。 |
| `IsSaveOverrideEnabled` | `bool` | 两个覆写事件均已订阅时为 true。 |
| `DebugLogLevel` | `LogLevel` | 写入 Unity 控制台的最低日志级别。 |
| `LogToFileEnabled` | `bool` | 为 true 时，日志输出同时写入文件。 |
| `InstanceCount` | `int` | 项目中找到的 WagSave 资产数量。 |

## 事件

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
private void HandleSaveStart()    { Debug.Log("保存已开始"); }
private void HandleSaveCompleted(){ Debug.Log("保存已完成"); }
private void HandleLoadStart()    { Debug.Log("加载已开始"); }
private void HandleLoadCompleted(){ Debug.Log("加载已完成"); }
private void HandleProgress(int percent) { Debug.Log($"进度：{percent}%"); }
private void HandleError(string message, Exception ex) { Debug.LogError(message); }
```

### 完整事件参考

| 事件 | 签名 | 触发时机 |
|---|---|---|
| `OnSaveStart` | `() => void` | 保存开始前立即触发。 |
| `OnSaveCompleted` | `() => void` | 保存成功完成后触发。 |
| `OnLoadStart` | `() => void` | 加载开始前立即触发。 |
| `OnLoadCompleted` | `() => void` | 加载成功完成后触发。 |
| `OnProgress` | `(int percent) => void` | 保存或加载过程中周期性触发。 |
| `OnError` | `(string msg, Exception ex) => void` | 保存或加载发生错误时触发。 |
| `OnAutoSaveTimer` | `(int secondsRemaining, int interval) => void` | 自动保存倒计时期间每帧触发。 |
| `OnAutosavePause` | `() => void` | 自动保存被暂停时触发。 |
| `OnAutosaveResume` | `() => void` | 自动保存被恢复时触发。 |
| `OnAutosaveTimerReset` | `() => void` | 自动保存倒计时被重置时触发。 |
| `OnGetEncryptionPrivateKey` | 参见 Extensibility.md | 加密存档需要私钥时触发。 |
| `OnSaveOverride` | 参见 Extensibility.md | 自定义序列化覆写。 |
| `OnLoadOverride` | 参见 Extensibility.md | 自定义反序列化覆写。 |

## 多实例

```csharp
wagSave.SetActive(); // 将此实例标记为活跃，同时停用其他所有实例
WagSave settingsSave = WagSave.GetInstance("settings-instance-id");
```
