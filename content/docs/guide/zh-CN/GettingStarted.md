# 快速入门

本指南将带你完成 WagSave 的安装、创建第一个存档资产以及执行基本的保存与加载操作。

## 1. 创建 WagSave 资产

在 Project 窗口中右键单击，选择：`Assets > Create > WaggleBum > WagSave > WagSave (Save System)`

这将创建一个 `WagSave` ScriptableObject。请为其命名一个有意义的名称，例如 `GameSave` 或 `SaveProfile`。

也可以随时通过 Unity 菜单栏打开 WagSave 编辑器窗口：

```
Window > WagSave > Editor
```

在窗口顶部的下拉菜单中选择您的资产。

## 2. 将其放入 Resources 文件夹

WagSave 在构建版本中使用 `Resources.Load` 在运行时查找资产。请将资产放置在项目任意位置的 `Resources` 文件夹下，名为 `WagSave` 的子文件夹中：

```
Assets/
  Resources/
    WagSave/
      GameSave.asset   ← 你的 WagSave 资产放在这里
```

> **重要提示：** 如果资产不在 `Resources/WagSave/` 文件夹内，`WagSave.GetInstance()` 在构建版本中将返回 `null`。

## 3. 打开 WagSave 编辑器窗口

`Window > WagSave > Editor`

编辑器窗口是所有配置操作的入口——包括输出格式、存档槽位、自动保存、加密、日志等。

## 4. 选择输出格式

| 类别 | 格式 | 最适合场景 |
|---|---|---|
| 文件 | Binary（二进制） | 正式发布——紧凑且高效 |
| 文件 | JSON | 调试——人类可读 |
| 文件 | Text（文本） | 简单的键值数据 |
| 平台 | PlayerPrefs | 小型设置数据、WebGL |
| 平台 | Unity Cloud Save | 在线多人游戏 |
| 平台 | Steam Cloud Save | 使用 Steamworks SDK 的 Steam 游戏 |

对于大多数项目，推荐以 **Binary（二进制）** 作为起点。

## 5. 向场景添加 WagSaveManager

`WagSaveManager` 是一个 MonoBehaviour，负责驱动自动保存计时器和场景切换逻辑。

`Add Component > WaggleBum > WagSave > WagSave Manager`

## 6. 标记需要保存的 GameObject

`Add Component > WaggleBum > WagSave > WagSave`

然后导航到 **Scene Content**，点击 **Configure**。

详细操作请参阅 [WagSave 组件](WagSaveComponent.md)。

## 7. 保存与加载

```csharp
using WaggleBum.WagSave;
public class GameManager : MonoBehaviour
{
    private WagSave _wagSave;
    private void Start() { _wagSave = WagSave.GetInstance(); }
    public void SaveGame() { _wagSave.Save(); }
    public void LoadGame() { _wagSave.Load(); }
}
```

键值保存：

```csharp
// 保存
WagSave.Save("currentLevel", 5);
// 加载
int level = WagSave.Load<int>("currentLevel");
```

## 8. 异步保存（推荐用于大型场景）

```csharp
public async void SaveGame() { await _wagSave.SaveAsync(); }
public async void LoadGame() { await _wagSave.LoadAsync(); }
```

## 后续步骤

- [配置要保存的字段 → WagSave 组件](WagSaveComponent.md)
- [设置多存档槽位 → 存档槽位](SaveSlots.md)
- [设置自动保存 → 自动保存](Autosave.md)
- [启用加密或压缩 → 输出格式](OutputFormats.md)
