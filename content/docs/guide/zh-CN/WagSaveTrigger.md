# WagSave 触发器

`WagSaveTrigger` 是一个 MonoBehaviour，当碰撞体进入其触发区域时会自动触发保存。

## 设置

1. 添加一个 `Collider` 并将 `Is Trigger` 设为 `true`。
2. `Add Component > WaggleBum > WagSave > WagSave Trigger`

## Inspector 设置

| 字段 | 说明 |
|---|---|
| **Target Layers** | 仅位于这些层级的对象才会触发保存。 |
| **Required Tag** | 仅拥有此标签的对象才会触发保存。 |
| **Disable After First Hit** | 触发一次后停用，直到调用 `ResetTrigger()` 才重新启用。 |

## 事件

| 事件 | 说明 |
|---|---|
| `onTriggerEntered` | 有效碰撞体进入触发区域时触发。 |
| `onTriggerExited` | 有效碰撞体离开触发区域时触发。 |

```csharp
var trigger = GetComponent<WagSaveTrigger>();
trigger.onTriggerEntered.AddListener(collider =>
{
    Debug.Log($"{collider.name} 触发了保存");
});
```

## 保存行为

- 若**已启用自动保存** → 调用 `wagSave.AutoSave()`
- 若**已启用存档槽位** → 创建一个 `Quick` 槽位并保存
- 否则 → 调用 `wagSave.Save()`

## 重置一次性触发器

```csharp
WagSaveTrigger trigger = GetComponent<WagSaveTrigger>();
// 从菜单返回、加载场景等操作后重新启用
trigger.ResetTrigger();
if (trigger.IsDisabled)
{
    // 触发器已触发过，正在等待被重置
}
```

## 示例：检查点

```csharp
// 玩家到达检查点时显示提示信息
trigger.onTriggerEntered.AddListener(_ =>
{
    checkpointUI.ShowMessage("已到达检查点！");
});
private void OnLevelRestart()
{
    trigger.ResetTrigger();
}
```
