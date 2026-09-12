# Controls

Rebinding on the new Input System: keyboard, mouse and gamepad, with interactive rebind, conflict
detection, reset-to-default, and sensitivity and invert options.

## The package is optional, and stays optional

Control rebinding needs `com.unity.inputsystem`. Most Unity projects don't have it, and WagSettings must
install cleanly into all of them — so the rebinding code lives in its **own assembly**, which Unity
compiles only when the package is present:

| Assembly | versionDefines | defineConstraints |
|---|---|---|
| `WagSettings.InputSystem` | `com.unity.inputsystem` → `WAGGLEBUM_INPUTSYSTEM_PRESENT` | same |

An `#if ENABLE_INPUT_SYSTEM` inside the main assembly would **not** be enough: the `#if` excludes the
code, but `WagSettings.asmdef` would still have to reference `Unity.InputSystem`, and a missing assembly
reference is a compile error. The gate solves the reference, not just the code.

The consequence worth knowing: **rebind storage and conflict detection have no Input System dependency**
and live in `Runtime/Core`. They work, and are tested, in projects without the package.

## Setting it up

1. Install **Input System** from Package Manager.
2. Create a `StringSetting` with key `controls.rebinds` — **one setting holds every rebind**. Optionally
   a `FloatSetting` at `controls.sensitivity` and a `BoolSetting` at `controls.invertY`.
3. Add them to your `SettingsProfile`.
4. **Add Component → WaggleBum → WagSettings → Rebind Applier**, and assign your `InputActionAsset`.
5. Optionally list which action maps players may rebind — leave it empty to allow all of them.
6. Put it under the **WagSettings Manager**, which attaches it when it starts. The Quick Start's
   `QuickStartControls` shows a rebind button driving it.

## Interactive rebinding

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

![A controls row waiting for a key press during a rebind](../Images/rebinding-listen.png)

The next control the player presses becomes the binding. <kbd>Esc</kbd> cancels.

Two details the applier handles that hand-rolled rebinding usually misses:

- **The action is disabled during the rebind.** An enabled action swallows the very input you're waiting
  for, so the first press is consumed instead of captured. It's re-enabled afterwards only if it was
  enabled to begin with.
- **A rebind left running is cancelled on `OnDisable`.** Otherwise closing the menu mid-rebind leaves an
  operation listening to every key the player presses in-game.

The rebind is applied whether or not it conflicts, and `onComplete` tells you what it clashed with. That
way you choose the policy — warn, swap, or offer an undo — rather than having one imposed.

> **On test coverage:** interactive rebinding cannot be completed in headless CI — a bare
> `PerformInteractiveRebinding`, with no WagSettings code involved, starts but never matches a queued key
> press even under Unity's own `InputTestFixture`. Everything either side of that Unity-owned step is
> covered automatically: the operation starts, the action is muted while it listens, cancelling restores
> the previous state, and a completed rebind reaches the setting. Completion itself is verified in the
> manual verification scene.

## Conflict detection

```csharp
IReadOnlyList<BindingConflict> conflicts = applier.FindConflicts();
```

Two bindings clash when they share a control path **and could be active at the same time**. That second
half is what stops the UI crying wolf:

| Situation | Conflict? | Why |
|---|:--:|---|
| `Gameplay/Jump` and `Gameplay/Interact` both on Space | ✅ | Same map, both active |
| `Gameplay/Fire` and `Menu/Confirm` both on left mouse | ❌ | Maps are never enabled together |
| Two bindings in different named control schemes | ❌ | Only one scheme is active at a time |
| A binding with **no** scheme against one with a scheme | ✅ | No scheme means always active |
| The same action bound twice to the same key | ✅ | Redundant, and worth telling the player |
| Two actions both **unbound** | ❌ | An empty control is not a control |

Path comparison ignores case. Each conflicting pair is reported once.

To warn **before** the change lands, check the candidate against the existing bindings:

```csharp
var candidate = new InputBindingDescriptor("Gameplay", "Interact", 0, "<Keyboard>/space");
IReadOnlyList<InputBindingDescriptor> clashing =
    BindingConflictDetector.FindConflictsWith(applier.DescribeBindings(), candidate);
```

## How rebinds are stored

All rebinds go into **one** `StringSetting`, in a versioned WagSettings format rather than the Input
System's binding JSON. Three reasons:

- it stores in a normal setting, so it saves, applies, reverts and syncs like everything else
- it can be read and tested without the Input System package
- it carries a version number, so a future format change can migrate rather than discard a player's
  controls

Unreadable stored rebinds **reset to defaults with a warning** rather than throwing. Losing rebinds is
bad; a game that won't start is worse. The same applies per-entry: a rebind naming an action you have
since renamed or removed is dropped with a warning, and the rest still load.

Deliberately unbinding a control round-trips as unbound — that's a choice the player made, not missing
data.

## Resetting

```csharp
applier.ResetAllBindings();          // everything back to the asset's authored bindings
applier.ResetBinding("Gameplay/Jump");
```

`ResetAllBindings` also clears the stored setting, so the reset persists on the next Apply.

## Sensitivity and invert

These are published as `UnityEvent`s rather than applied, since what "sensitivity" multiplies is
game-specific — wire them to your camera controller in the inspector. Same pattern as the
[graphics](Graphics.md) and [accessibility](Accessibility.md) toggles.

## What throws, and what only warns

| Situation | Result |
|---|---|
| Rebinding an action that doesn't exist in the asset | **Throws** — a developer typo |
| A binding index the action doesn't have | **Throws** |
| Starting a rebind with no asset assigned, or one already running | **Throws** |
| A key not in the profile | **Throws** — `KeyNotFoundException` |
| Stored rebinds that cannot be read | **Warns**, resets to defaults |
| A stored rebind for a renamed or removed action | **Warns**, drops that one, keeps the rest |
