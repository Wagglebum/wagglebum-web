# WagSave 文档

WagSave 是一套适用于 Unity 2022 LTS 及更高版本的生产就绪存档系统。它涵盖序列化、文件 I/O、加密、压缩、存档槽位、自动保存以及云端后端——所有配置均通过 Unity 编辑器窗口完成，无需编写任何代码即可上手。

**命名空间：** `WaggleBum.WagSave`
**Unity 版本：** 2022.3 LTS+
**发布者：** WaggleBum

## 编辑器语言

WagSave 编辑器支持多种语言。要更改显示语言：

1. 打开 **Edit > Preferences**（Windows / Linux）或 **Unity > Preferences**（macOS）。
2. 在左侧面板中选择 **WagSave**。
3. 使用 **Locale** 下拉菜单选择所需语言。
4. 关闭并重新打开 Unity 编辑器以使更改生效。

**可用语言：**

- English（英语）
- Español（西班牙语）
- 日本語（日语）
- 한국어（韩语）
- 中文（简体）(Simplified Chinese)
- 中文（繁體）（繁体中文）

---

## 本文档内容

| 文档 | 说明 |
|---|---|
| [快速入门](#快速开始) | 通过简单步骤快速上手 |
| [快速入门](GettingStarted.md) | 安装、配置及第一次保存/加载 |
| [WagSave 组件](WagSaveComponent.md) | 将 GameObject 标记为可保存对象 |
| [API 参考](API.md) | 完整的保存/加载 API、事件与属性 |
| [存档槽位](SaveSlots.md) | 多槽位存档系统 |
| [自动保存](Autosave.md) | 基于时间间隔的自动保存 |
| [输出格式](OutputFormats.md) | 格式、文件设置、加密与压缩 |
| [WagSave 触发器](WagSaveTrigger.md) | 基于物理的存档触发组件 |
| [扩展性](Extensibility.md) | 自定义格式、序列化器与存档覆写 |

## 快速开始

### 键 / 值
以下代码片段用于在无需为项目配置 WagSave 实例的情况下进行基本的保存和加载。系统将使用默认设置自动创建一个默认实例。若要配置存档输出或使用高级功能，请按照 WagSave 实例快速入门中的说明进行操作。

以下代码示例可在包中提供的快速入门示例场景中查看。
```csharp
        void Update()
        {
            var kb = Keyboard.current;
            if (kb == null) return;

            // Move Player
            var h = (kb.rightArrowKey.isPressed ? 1f : 0f) - (kb.leftArrowKey.isPressed ? 1f : 0f);
            var v = (kb.upArrowKey.isPressed ? 1f : 0f) - (kb.downArrowKey.isPressed ? 1f : 0f);
            transform.Translate(new Vector3(h, 0f, v) * (moveSpeed * Time.deltaTime));

            // Save Player Position
            if (kb.sKey.wasPressedThisFrame)
            {
                WagSave.Save("playerPosition", transform.position);
            }

            // Load Player Position
            if (kb.lKey.wasPressedThisFrame)
            {
                transform.position = WagSave.Load<Vector3>("playerPosition");
            }
        }
```

---

### WagSave 实例（推荐）
在 Unity 中通过菜单 <b>Window -> WagSave -> Editor</b> 打开 WagSave 编辑器窗口。
使用编辑器界面有助于了解可在项目中配置的功能和选项。

- 打开 WagSave 编辑器，并在项目的 Resources 文件夹中创建一个实例。
- 根据项目需求，使用可用的选项和功能对实例进行配置。
- 使用编辑器将 WagSaveComponent 添加到项目中的游戏对象，并选择要保存的属性。
- 实现以下代码以保存和加载内容。还可以不编写任何代码，直接添加存档触发器、自动保存和/或存档槽位。

```csharp
using WaggleBum.WagSave;

// 保存场景中所有 WagSaveComponent
var wagSave = WagSave.GetInstance();
wagSave.Save();

// 加载它们
wagSave.Load();
```

## 架构概览

WagSave 围绕三个核心概念构建：

**WagSave ScriptableObject** 是中央管理器。通过 `Assets > Create > WaggleBum > WagSave` 创建一个（或多个）实例。所有配置——输出格式、槽位、自动保存、加密——均保存于此。运行时从 `Resources` 文件夹加载。

**WagSaveComponent** 是一个 MonoBehaviour，将其添加到任何需要保存状态的 GameObject 上。通过 WagSave 编辑器窗口精确选择要包含的字段和属性，无需编写序列化代码。

**存档目标（Save Targets）** 是可插拔的输出后端（二进制文件、JSON 文件、PlayerPrefs、Steam Cloud、Unity Cloud）。在编辑器中切换格式，无需修改游戏代码。

*WagSave 由 WaggleBum 开发和维护，可在 Unity Asset Store 上获取。*
