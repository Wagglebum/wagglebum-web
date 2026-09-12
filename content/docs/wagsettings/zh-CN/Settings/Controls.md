# 控制

在新 Input System 上的重绑定：键盘、鼠标和手柄，带交互式重绑定、冲突检测、恢复默认，以及灵敏度和反转选项。

## 该包是可选的，并且保持可选

控制重绑定需要 `com.unity.inputsystem`。大多数 Unity 项目没有它，而 WagSettings 必须能干净地安装进所有项目 —
所以重绑定代码位于它**自己的程序集**中，Unity 只在该包存在时才编译它：

| 程序集 | versionDefines | defineConstraints |
|---|---|---|
| `WagSettings.InputSystem` | `com.unity.inputsystem` → `WAGGLEBUM_INPUTSYSTEM_PRESENT` | 相同 |

主程序集内的 `#if ENABLE_INPUT_SYSTEM` **不够**：`#if` 排除了代码，但 `WagSettings.asmdef` 仍然必须引用
`Unity.InputSystem`，而缺失的程序集引用是编译错误。这道门解决的是引用，不只是代码。

值得知道的后果：**重绑定存储和冲突检测不依赖 Input System**，位于 `Runtime/Core`。它们在没有该包的项目中工作，
并且经过测试。

## 设置它

1. 从 Package Manager 安装 **Input System**。
2. 创建一个键为 `controls.rebinds` 的 `StringSetting` — **一个设置保存所有重绑定**。可选地在
   `controls.sensitivity` 创建一个 `FloatSetting`，在 `controls.invertY` 创建一个 `BoolSetting`。
3. 把它们加入你的 `SettingsProfile`。
4. **Add Component → WaggleBum → WagSettings → Rebind Applier**，并指定你的 `InputActionAsset`。
5. 可选地列出玩家可以重绑定哪些动作映射 — 留空则允许全部。
6. 放在 **WagSettings Manager** 之下，它启动时会连接。Quick Start 的 `QuickStartControls` 展示了一个驱动它的
   重绑定按钮。

## 交互式重绑定

```csharp
applier.StartInteractiveRebind(
    "Gameplay/Jump", bindingIndex: 0,
    onComplete: conflicts =>
    {
        if (conflicts.Count > 0)
        {
            ShowWarning($"That control is already used by {conflicts[0].ActionName}.");
        }
    },
    onCancel: () => ShowMessage("Rebind cancelled."));
```

![重新绑定时等待按键的控制行](../../Images/rebinding-listen.png)

玩家接下来按的控制键成为绑定。<kbd>Esc</kbd> 取消。

应用器处理的、手写重绑定通常遗漏的两个细节：

- **重绑定期间动作被禁用。** 已启用的动作会吞掉你正在等待的那个输入，所以第一次按键被消耗而不是被捕获。之后
  只有在它一开始就是启用的情况下才会重新启用。
- **未完成的重绑定在 `OnDisable` 时取消。** 否则在重绑定中途关闭菜单会留下一个监听玩家在游戏中按下的每个键的
  操作。

无论是否冲突，重绑定都会应用，`onComplete` 告诉你它与什么冲突。这样策略由你选择 — 警告、交换或提供撤销 —
而不是被强加一种。

> **关于测试覆盖：**交互式重绑定无法在无头 CI 中完成 — 一个不涉及任何 WagSettings 代码的裸
> `PerformInteractiveRebinding` 会启动，但即使在 Unity 自己的 `InputTestFixture` 下也永远不会匹配排队的按键。
> 这个 Unity 拥有的步骤两侧的一切都自动覆盖：操作启动、监听时动作被静音、取消恢复先前状态、完成的重绑定到达
> 设置。完成本身在手动验证场景中验证。

## 冲突检测

```csharp
IReadOnlyList<BindingConflict> conflicts = applier.FindConflicts();
```

两个绑定在共享控制路径**并且可能同时处于活动状态**时冲突。后半句就是阻止 UI 喊"狼来了"的东西：

| 情况 | 冲突？ | 原因 |
|---|:--:|---|
| `Gameplay/Jump` 和 `Gameplay/Interact` 都在空格上 | ✅ | 同一映射，都活动 |
| `Gameplay/Fire` 和 `Menu/Confirm` 都在鼠标左键上 | ❌ | 映射从不同时启用 |
| 不同命名控制方案中的两个绑定 | ❌ | 一次只有一个方案活动 |
| **没有**方案的绑定对上有方案的绑定 | ✅ | 没有方案意味着始终活动 |
| 同一动作两次绑定到同一键 | ✅ | 冗余，值得告诉玩家 |
| 两个都**未绑定**的动作 | ❌ | 空控制不是控制 |

路径比较忽略大小写。每对冲突报告一次。

要在更改落地**之前**警告，把候选者与现有绑定对照：

```csharp
var candidate = new InputBindingDescriptor("Gameplay", "Interact", 0, "<Keyboard>/space");
IReadOnlyList<InputBindingDescriptor> clashing =
    BindingConflictDetector.FindConflictsWith(applier.DescribeBindings(), candidate);
```

## 重绑定如何存储

所有重绑定进入**一个** `StringSetting`，采用带版本的 WagSettings 格式，而不是 Input System 的绑定 JSON。三个
原因：

- 它存在普通设置中，所以像其他一切一样保存、应用、恢复和同步
- 它可以在没有 Input System 包的情况下读取和测试
- 它带有版本号，所以未来的格式变更可以迁移而不是丢弃玩家的控制设置

无法读取的存储重绑定**带着警告恢复默认**而不是抛出。丢失重绑定不好；无法启动的游戏更糟。逐条也是如此：指向
你后来重命名或移除的动作的重绑定会带着警告丢弃，其余仍然加载。

有意解除绑定的控制会以未绑定的形式往返 — 那是玩家做出的选择，不是缺失的数据。

## 重置

```csharp
applier.ResetAllBindings();          // everything back to the asset's authored bindings
applier.ResetBinding("Gameplay/Jump");
```

`ResetAllBindings` 也会清除存储的设置，所以重置在下次 Apply 时持久化。

## 灵敏度与反转

这些作为 `UnityEvent` 发布而不是应用，因为"灵敏度"乘的是什么因游戏而异 — 在检查器中把它们接到你的摄像机
控制器。与[图形](Graphics.md)和[无障碍](Accessibility.md)开关的模式相同。

## 什么会抛出，什么只是警告

| 情况 | 结果 |
|---|---|
| 重绑定资源中不存在的动作 | **抛出** — 开发者拼写错误 |
| 动作没有的绑定索引 | **抛出** |
| 未指定资源或已有一个在运行时启动重绑定 | **抛出** |
| 配置中不存在的键 | **抛出** — `KeyNotFoundException` |
| 无法读取的存储重绑定 | **警告**，恢复默认 |
| 已重命名或移除的动作的存储重绑定 | **警告**，丢弃那一条，保留其余 |
