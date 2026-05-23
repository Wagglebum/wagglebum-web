# Autosave

WagSave's autosave system fires a save automatically at a configurable interval. The timer is driven by `WagSaveManager`, a MonoBehaviour that must be present in any scene that uses autosave.

---

## Setup

### 1. Enable autosave in the editor

In the WagSave editor window, navigate to **Autosave** and:
- Enable **Enable Autosave**
- Set **Interval (Seconds)** — how often the save fires
- Add scenes to **Enabled Scenes** — autosave only runs in listed scenes

### 2. Add WagSaveManager to the scene

`WagSaveManager` is the MonoBehaviour that counts down the timer and fires the save. Add it to a persistent GameObject in your scene:

```
Add Component > WaggleBum > WagSave > WagSave Manager
```

`WagSaveManager` finds the active `WagSave` instance automatically in `Start`. You do not need to wire it up in code.

---

## Enabled Scenes

Autosave will only fire when the active scene is in the **Enabled Scenes** list. If the player is in a scene not in the list, the timer is automatically paused. This prevents autosaves during menus, loading screens, or cutscene-only scenes.

Configure this in the editor window under **Autosave > Enabled Scenes**. Drag scene assets into the list.

---

## Autosave and Save Slots

When Save Slots are enabled, each autosave writes to a slot of type `SaveSlotType.Auto`.

**Use Latest Slot** (configured in the editor under **Autosave**):
- **On** — autosave overwrites the most recently modified slot. The player's last manual save is kept up to date.
- **Off** — a new `Auto` slot is created for every autosave. Useful for maintaining a rolling autosave history.

You can also pin a specific slot for autosave:

```csharp
SaveSlot checkpoint = wagSave.SaveSlots.AddNewSlot(SaveSlotType.Auto);
wagSave.SetAutoSaveSlot(checkpoint);

// Clear it later to return to automatic selection
wagSave.ClearAutoSaveSlot();
```

---

## Controlling the Timer at Runtime

```csharp
WagSave wagSave = WagSave.GetInstance();

// Pause the autosave timer (e.g. during a cutscene or pause menu)
wagSave.PauseAutoSave();

// Resume a paused timer — resets the countdown to the full interval
wagSave.ResumeAutoSave();

// Reset the countdown without pausing (e.g. after a manual save)
wagSave.ResetAutoSaveTimer();
```

### Reacting to timer events

```csharp
// Display a countdown to the player
wagSave.OnAutoSaveTimer += (secondsRemaining, interval) =>
{
    float progress = (float)secondsRemaining / interval;
    autosaveProgressBar.value = progress;
};

wagSave.OnAutosavePause  += () => Debug.Log("Autosave paused");
wagSave.OnAutosaveResume += () => Debug.Log("Autosave resumed");
```

---

## Triggering Autosave Manually

Call `AutoSave()` or `AutoSaveAsync()` at any time to fire an autosave immediately, regardless of the timer state. The slot selection logic (latest vs. new) still applies.

```csharp
// Trigger immediately — e.g. when the player passes a checkpoint
wagSave.AutoSave();

// Or async:
await wagSave.AutoSaveAsync();
```

---

## Subscribing to Autosave Events

```csharp
wagSave.OnSaveStart     += () => ShowAutosaveIndicator();
wagSave.OnSaveCompleted += () => HideAutosaveIndicator();
wagSave.OnError         += (msg, ex) => Debug.LogError($"Autosave failed: {msg}");
```

These are the same events used by manual saves — `OnSaveStart` and `OnSaveCompleted` fire for every save regardless of type.

---

## Common Patterns

### Pause autosave during a menu

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
```

### Reset the countdown after a manual save

Prevents autosave from firing immediately after the player just saved manually:

```csharp
public async void OnSaveButtonPressed()
{
    var wagSave = WagSave.GetInstance();
    await wagSave.SaveAsync();
    wagSave.ResetAutoSaveTimer();
}
```
