# API Reference

All types live in the `WaggleBum.WagSave` namespace unless otherwise noted.

```csharp
using WaggleBum.WagSave;
using WaggleBum.WagSave.Core.SaveSlots; // SaveSlot, SaveSlotManager
using WaggleBum.WagSave.Core.Enums;    // SaveSlotType, LogLevel
```

---

## Getting an Instance

```csharp
// Get the active (or only) WagSave instance
WagSave wagSave = WagSave.GetInstance();

// Get a specific instance by its ID (useful when multiple instances exist)
WagSave wagSave = WagSave.GetInstance("my-instance-id");

// Get all instances in the project
WagSave[] all = WagSave.GetAllInstances();
```

At runtime in builds, `GetInstance` loads from `Resources/WagSave/`. In the editor it uses `AssetDatabase`. If no instance is found, `null` is returned and a warning is logged.

---

## Component Save / Load

These methods save and load all `WagSaveComponent` instances across every currently loaded scene.

### Synchronous

```csharp
// Save all components — optionally into a specific slot
wagSave.Save();
wagSave.Save(slot);

// Load all components — optionally from a specific slot
wagSave.Load();
wagSave.Load(slot);
```

### Asynchronous (recommended)

Serialization and file I/O run on a background thread. Unity API calls remain on the main thread.

```csharp
await wagSave.SaveAsync();
await wagSave.SaveAsync(slot);

await wagSave.LoadAsync();
await wagSave.LoadAsync(slot);
```

### Behaviour when Save Slots are enabled

When Save Slots are enabled and no `slot` argument is provided:
- If **Use Save Slot UI** is on, the built-in slot selection UI is shown automatically.
- If **Use Save Slot UI** is off, WagSave selects a slot automatically based on your configuration.

Pass an explicit `slot` to bypass UI and slot selection entirely.

---

## Key-Value Save / Load

For saving individual values that are not tied to a specific GameObject.

```csharp
// Static convenience — uses the active WagSave instance
WagSave.Save("score", 9500);
WagSave.Save("playerName", "Alex", groupName: "player");

// Typed load
int score = WagSave.Load<int>("score");
string name = WagSave.Load<string>("playerName", groupName: "player");

// Untyped load
object raw = WagSave.Load("score");
```

The optional `groupName` parameter namespaces keys to avoid collisions. The optional `instanceId` parameter targets a specific WagSave instance when multiple exist.

---

## Autosave

```csharp
// Fire an autosave immediately (sync)
wagSave.AutoSave();

// Fire an autosave immediately (async)
await wagSave.AutoSaveAsync();

// Pause the autosave timer
wagSave.PauseAutoSave();

// Resume a paused autosave timer (resets the countdown)
wagSave.ResumeAutoSave();

// Reset the autosave countdown without pausing
wagSave.ResetAutoSaveTimer();

// Pin a specific slot to be used by the next autosave
wagSave.SetAutoSaveSlot(slot);

// Clear the pinned slot so autosave selects automatically again
wagSave.ClearAutoSaveSlot();
```

The autosave timer itself is driven by `WagSaveManager` — a MonoBehaviour that must be present in the scene. See [Autosave](Autosave.md).

---

## Properties

| Property | Type | Description |
|---|---|---|
| `IsSaving` | `bool` | True while a save operation is in progress. |
| `IsLoading` | `bool` | True while a load operation is in progress. |
| `Progress` | `int` | Current operation progress, 0–100. |
| `Settings` | `WagSaveSettings` | Access to all configuration settings. |
| `SaveSlots` | `SaveSlotManager` | The save slot manager. See [Save Slots](SaveSlots.md). |
| `IsSaveOverrideEnabled` | `bool` | True when both `OnSaveOverride` and `OnLoadOverride` are subscribed. |
| `DebugLogLevel` | `LogLevel` | Minimum log severity written to the Unity Console. |
| `LogToFileEnabled` | `bool` | When true, log output is also written to a file. |
| `InstanceCount` | `int` | Number of WagSave assets found in the project. |

---

## Events

Subscribe to events on the WagSave instance to react to save/load lifecycle changes.

```csharp
private void OnEnable()
{
    var wagSave = WagSave.GetInstance();
    wagSave.OnSaveStart     += HandleSaveStart;
    wagSave.OnSaveCompleted += HandleSaveCompleted;
    wagSave.OnLoadStart     += HandleLoadStart;
    wagSave.OnLoadCompleted += HandleLoadCompleted;
    wagSave.OnProgress      += HandleProgress;
    wagSave.OnError         += HandleError;
}

private void OnDisable()
{
    var wagSave = WagSave.GetInstance();
    if (wagSave == null) return;
    wagSave.OnSaveStart     -= HandleSaveStart;
    wagSave.OnSaveCompleted -= HandleSaveCompleted;
    wagSave.OnLoadStart     -= HandleLoadStart;
    wagSave.OnLoadCompleted -= HandleLoadCompleted;
    wagSave.OnProgress      -= HandleProgress;
    wagSave.OnError         -= HandleError;
}

private void HandleSaveStart()    { Debug.Log("Save started"); }
private void HandleSaveCompleted(){ Debug.Log("Save complete"); }
private void HandleLoadStart()    { Debug.Log("Load started"); }
private void HandleLoadCompleted(){ Debug.Log("Load complete"); }
private void HandleProgress(int percent) { Debug.Log($"Progress: {percent}%"); }
private void HandleError(string message, Exception ex) { Debug.LogError(message); }
```

### Full Event Reference

| Event | Signature | Raised When |
|---|---|---|
| `OnSaveStart` | `() => void` | Immediately before a save begins. |
| `OnSaveCompleted` | `() => void` | After a save finishes successfully. |
| `OnLoadStart` | `() => void` | Immediately before a load begins. |
| `OnLoadCompleted` | `() => void` | After a load finishes successfully. |
| `OnProgress` | `(int percent) => void` | Periodically during save or load with 0–100 completion. |
| `OnError` | `(string msg, Exception ex) => void` | When a save or load error occurs. |
| `OnAutoSaveTimer` | `(int secondsRemaining, int interval) => void` | Each frame during an active autosave countdown. |
| `OnAutosavePause` | `() => void` | When autosave is paused. |
| `OnAutosaveResume` | `() => void` | When autosave is resumed. |
| `OnAutosaveTimerReset` | `() => void` | When the autosave countdown is reset. |
| `OnGetEncryptionPrivateKey` | See [Extensibility](Extensibility.md) | When an encrypted save needs the private key. |
| `OnSaveOverride` | See [Extensibility](Extensibility.md) | Custom serialization — replaces default save logic. |
| `OnLoadOverride` | See [Extensibility](Extensibility.md) | Custom deserialization — replaces default load logic. |

---

## Multiple Instances

If your project has more than one WagSave asset (e.g. separate profiles for game data and settings), mark one as **Active** in the editor or call:

```csharp
wagSave.SetActive(); // marks this instance active, deactivates all others
```

`GetInstance()` without arguments returns the active instance. To get a specific one:

```csharp
WagSave settingsSave = WagSave.GetInstance("settings-instance-id");
```

The instance ID is shown in the WagSave editor window header and stored on the asset.
