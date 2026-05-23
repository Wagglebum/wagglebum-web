# 自動存檔

WagSave 的自動存檔功能會依設定的時間間隔自動觸發存檔。計時器由 `WagSaveManager` 驅動。

## 設定

1. 前往 **Autosave** → 啟用 **Enable Autosave** → 設定 **Interval (Seconds)** → 新增 **Enabled Scenes**。
2. `Add Component > WaggleBum > WagSave > WagSave Manager`

## 自動存檔與存檔槽位

**Use Latest Slot**：開啟 = 覆寫最近的槽位。關閉 = 每次建立一個新的 `Auto` 槽位。

```csharp
SaveSlot checkpoint = wagSave.SaveSlots.AddNewSlot(SaveSlotType.Auto);
wagSave.SetAutoSaveSlot(checkpoint);

// 稍後清除以恢復自動選擇
wagSave.ClearAutoSaveSlot();
```

## 在執行時期控制計時器

```csharp
WagSave wagSave = WagSave.GetInstance();

// 暫停自動存檔計時器
wagSave.PauseAutoSave();

// 恢復已暫停的計時器
wagSave.ResumeAutoSave();

// 重設倒數計時但不暫停
wagSave.ResetAutoSaveTimer();
```

## 手動觸發自動存檔

```csharp
// 立即觸發 — 例如當玩家通過存檔點時
wagSave.AutoSave();

// 或使用非同步方式：
await wagSave.AutoSaveAsync();
```

## 常見模式

```csharp
private void OpenPauseMenu()
{
    WagSave.GetInstance().PauseAutoSave();
    pauseMenuUI.SetActive(true);
}

private void ClosePauseMenu()
{
    pauseMenuUI.SetActive(false);
    WagSave.GetInstance().ResumeAutoSave();
}

public async void OnSaveButtonPressed()
{
    var wagSave = WagSave.GetInstance();
    await wagSave.SaveAsync();
    wagSave.ResetAutoSaveTimer();
}
```
