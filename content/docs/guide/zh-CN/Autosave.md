# 自动保存

WagSave 的自动保存系统会按照可配置的时间间隔自动触发保存。计时器由 `WagSaveManager` 驱动。

## 设置

### 1. 在编辑器中启用自动保存

导航到 **Autosave** 并启用 **Enable Autosave**。设置 **Interval (Seconds)** 并将场景添加到 **Enabled Scenes** 列表。

### 2. 向场景添加 WagSaveManager

`Add Component > WaggleBum > WagSave > WagSave Manager`

## 启用的场景

自动保存仅在当前活跃场景位于 **Enabled Scenes** 列表中时才会触发。

## 自动保存与存档槽位

**Use Latest Slot（使用最新槽位）**：
- **开启** — 自动保存覆盖最近修改的槽位。
- **关闭** — 每次自动保存创建一个新的 `Auto` 槽位。

```csharp
SaveSlot checkpoint = wagSave.SaveSlots.AddNewSlot(SaveSlotType.Auto);
wagSave.SetAutoSaveSlot(checkpoint);
// 稍后清除，恢复自动选择
wagSave.ClearAutoSaveSlot();
```

## 在运行时控制计时器

```csharp
WagSave wagSave = WagSave.GetInstance();
// 暂停自动保存计时器（例如在过场动画或暂停菜单期间）
wagSave.PauseAutoSave();
// 恢复已暂停的计时器
wagSave.ResumeAutoSave();
// 重置倒计时但不暂停（例如手动保存后）
wagSave.ResetAutoSaveTimer();
```

### 响应计时器事件

```csharp
// 向玩家显示倒计时
wagSave.OnAutoSaveTimer += (secondsRemaining, interval) =>
{
    float progress = (float)secondsRemaining / interval;
    autosaveProgressBar.value = progress;
};
wagSave.OnAutosavePause  += () => Debug.Log("自动保存已暂停");
wagSave.OnAutosaveResume += () => Debug.Log("自动保存已恢复");
```

## 手动触发自动保存

```csharp
// 立即触发——例如玩家到达检查点时
wagSave.AutoSave();
// 或使用异步方式：
await wagSave.AutoSaveAsync();
```

## 常见使用模式

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
