# WagSave 元件

`WagSaveComponent` 是一個 MonoBehaviour，用於將 GameObject 標記為參與 WagSave 系統的物件。

## 新增元件

`Add Component > WaggleBum > WagSave > WagSave`

或：`gameObject.AddComponent<WagSaveComponent>();`

## 設定要儲存的內容

1. 開啟 `Window > WagSave > Editor` → **Scene Content** → 點擊 **Configure**

### 哪些內容可以儲存？

- 基本型別（`int`、`float`、`bool`、`string`）
- Unity 值型別（`Vector2`、`Vector3`、`Quaternion`、`Color`）
- 可序列化的結構或類別

## 預製體支援

1. 開啟 `Window > WagSave > Editor` → **Prefabs** → 點擊 **Configure**

## 場景識別

| 屬性 | 說明 |
|---|---|
| `componentId` | 首次設定時指派的穩定 GUID。 |
| `sceneId` | 場景資源路徑的雜湊值。 |
| `runtimeId` | 在執行時期產生，用於區分預製體實例。 |
| `prefabId` | 來源預製體資源的 GUID。 |

## 動態物件

```csharp
// 依據儲存的 prefabId 生成已存檔的預製體
GameObject go = WagSaveComponent.InstantiatePrefabById(savedPrefabId);
```

## 在程式碼中讀取與寫入數值

```csharp
var component = GetComponent<WagSaveComponent>();

// 取得所有已選取存檔路徑的當前快照
GameObjectData data = component.GetSaveItemData();

// 將數值寫回指定路徑
component.SetSelectionValue("componentId.p|health", 75);
```
