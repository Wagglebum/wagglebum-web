# WagSave 组件

`WagSaveComponent` 是一个 MonoBehaviour，用于将 GameObject 标记为参与 WagSave 系统。当触发保存时，WagSave 会找到所有已加载场景中的 `WagSaveComponent` 实例，并捕获其已配置字段和属性的值。加载时，这些值将被写回。

## 添加组件

`Add Component > WaggleBum > WagSave > WagSave`

或通过代码：`gameObject.AddComponent<WagSaveComponent>();`

每个 GameObject 只允许添加一个 `WagSaveComponent`。

## 配置要保存的内容

1. 打开 `Window > WagSave > Editor`
2. 导航到 **Scene Content**
3. 在列表中找到目标 GameObject，点击 **Configure**

> **提示：** 使用层级深度滑块控制组件树默认展开的层数。

### 哪些内容可以被保存？

- 基本类型（`int`、`float`、`bool`、`string`）
- Unity 值类型（`Vector2`、`Vector3`、`Quaternion`、`Color`）
- 可序列化的结构体或类

## 预制体支持

1. 打开 `Window > WagSave > Editor`
2. 导航到 **Prefabs**
3. 找到目标预制体，点击 **Configure**

## 场景标识

| 属性 | 说明 |
|---|---|
| `componentId` | 组件首次配置时分配的稳定 GUID。 |
| `sceneId` | 场景资产路径的哈希值。 |
| `runtimeId` | 运行时生成，用于区分同一预制体的多个实例。 |
| `prefabId` | 源预制体资产的 GUID。 |

## 动态对象

```csharp
// 通过已存储的 prefabId 实例化已保存的预制体
GameObject go = WagSaveComponent.InstantiatePrefabById(savedPrefabId);
```

## 通过代码读写值

```csharp
var component = GetComponent<WagSaveComponent>();
// 获取所有已选存档路径的当前快照
GameObjectData data = component.GetSaveItemData();
// 将一个值写回指定路径
component.SetSelectionValue("componentId.p|health", 75);
```
