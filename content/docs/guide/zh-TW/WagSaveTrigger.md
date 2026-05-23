# WagSave 觸發器

`WagSaveTrigger` 會在碰撞體進入其觸發區域時自動執行存檔。

## 設定

1. 新增一個 `Collider` 並設定 `Is Trigger = true`。
2. `Add Component > WaggleBum > WagSave > WagSave Trigger`

## Inspector 設定

| 欄位 | 說明 |
|---|---|
| **Target Layers** | 只有位於這些圖層的物件才會觸發存檔。 |
| **Required Tag** | 只有帶有此標籤的物件才會觸發存檔。 |
| **Disable After First Hit** | 僅觸發一次，之後停用直到呼叫 `ResetTrigger()`。 |

## 事件

| 事件 | 說明 |
|---|---|
| `onTriggerEntered` | 有效碰撞體進入區域時觸發。 |
| `onTriggerExited` | 有效碰撞體離開區域時觸發。 |

```csharp
var trigger = GetComponent<WagSaveTrigger>();
trigger.onTriggerEntered.AddListener(collider =>
{
    Debug.Log($"{collider.name} triggered a save");
});
```

## 存檔行為

- 已啟用自動存檔 → `wagSave.AutoSave()`
- 已啟用存檔槽位 → `Quick` 槽位
- 其他情況 → `wagSave.Save()`

## 重置單次觸發器

```csharp
trigger.ResetTrigger();
if (trigger.IsDisabled)
{
    // 觸發器已觸發過，正在等待重置
}
```

## 範例：存檔點

```csharp
// 當玩家抵達存檔點時顯示訊息
trigger.onTriggerEntered.AddListener(_ =>
{
    checkpointUI.ShowMessage("Checkpoint reached!");
});

private void OnLevelRestart()
{
    trigger.ResetTrigger();
}
```
