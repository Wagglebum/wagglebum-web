# WagSave Trigger

`WagSaveTrigger` is a MonoBehaviour that automatically fires a save when a collider enters its trigger zone. It is useful for checkpoint systems, zone-based autosaves, and any scenario where saving should happen without player input.

---

## Setup

1. Add a `Collider` component to a GameObject and set it as a trigger (`Is Trigger = true` — `WagSaveTrigger` sets this automatically).
2. Add `WagSaveTrigger`:

```
Add Component > WaggleBum > WagSave > WagSave Trigger
```

`WagSaveTrigger` requires a `Collider` and will not compile without one (`RequireComponent` is enforced).

---

## Inspector Settings

| Field | Description |
|---|---|
| **Target Layers** | Only objects on these layers trigger a save. Defaults to all layers. |
| **Required Tag** | If set, only objects with this tag trigger a save. Leave empty to match any tag. |
| **Disable After First Hit** | When enabled, the trigger fires once and then deactivates until `ResetTrigger()` is called. |

---

## Events

| Event | Description |
|---|---|
| `onTriggerEntered` | Fired when a valid collider enters the zone. Passes the `Collider`. |
| `onTriggerExited` | Fired when a valid collider exits the zone. Passes the `Collider`. |

Wire these up in the Inspector or in code:

```csharp
var trigger = GetComponent<WagSaveTrigger>();

trigger.onTriggerEntered.AddListener(collider =>
{
    Debug.Log($"{collider.name} triggered a save");
});
```

---

## Save Behaviour

When a valid collision occurs, `WagSaveTrigger` calls the active `WagSave` instance automatically:

- If **Autosave is enabled** → calls `wagSave.AutoSave()`
- If **Save Slots are enabled** (and autosave is off) → creates a `Quick` slot and saves into it
- Otherwise → calls `wagSave.Save()`

You do not need to configure this — it follows whatever is set on the active `WagSave` instance.

---

## Resetting a One-Shot Trigger

When **Disable After First Hit** is on, call `ResetTrigger()` to allow the trigger to fire again:

```csharp
WagSaveTrigger trigger = GetComponent<WagSaveTrigger>();

// Re-enable after returning from a menu, loading a scene, etc.
trigger.ResetTrigger();
```

Check `IsDisabled` to know whether the trigger is currently inactive:

```csharp
if (trigger.IsDisabled)
{
    // Trigger has already fired and is waiting to be reset
}
```

---

## Example: Checkpoint

Place a `WagSaveTrigger` at a checkpoint location in your level. Configure it to:
- Target the `Player` layer only
- Enable **Disable After First Hit** so it only saves once per visit
- Wire `onTriggerEntered` to show a "Checkpoint reached" UI message

```csharp
// Show a message when the player hits the checkpoint
trigger.onTriggerEntered.AddListener(_ =>
{
    checkpointUI.ShowMessage("Checkpoint reached!");
});
```

Re-enable the trigger if the player can replay the area:

```csharp
private void OnLevelRestart()
{
    trigger.ResetTrigger();
}
```
