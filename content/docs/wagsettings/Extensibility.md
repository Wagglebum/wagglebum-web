# Extensibility

Adding a setting touches one asset and one list. It is in the menu the next time you press Play. Code
comes in only when the value has to *do* something, and even then it is usually one line.

## Add a setting

**The short way:** the editor's **Settings Profile** page (*Tools → WaggleBum → WagSettings → Editor*), **Add
Setting**. In the dialog pick a kind, type a key — checked as you type — set a default and, for a
slider, a range, press **Create**. The asset is made next to the profile and appended to it. Done;
press Play.

![The Add Setting dialog with a key typed and the asset it will create](Images/add-setting-dialog.png)

**By hand:**

**1. Create the asset.** *Assets → Create → WaggleBum → WagSettings →* the type you need:

| Type | Control in the menu | Fields that matter |
|---|---|---|
| Float Setting | slider | **Key**, **Default**, **Minimum**, **Maximum** |
| Int Setting | slider with whole numbers | **Key**, **Default**, **Minimum**, **Maximum** |
| Bool Setting | toggle | **Key**, **Default** |
| Enum Setting | dropdown of the **Options** you list | **Key**, **Default** (an index), **Options** |
| String Setting | text field | **Key**, **Default** |

![The Assets → Create → WaggleBum → WagSettings menu](Images/create-setting-menu.png)

The key is `category.name`: the part before the dot is the **tab**, the part after becomes the **label**.
`gameplay.difficulty` lands in a Gameplay tab as "Difficulty"; `gameplay.cameraShake` reads "Camera
Shake". A key with no dot lands under General.

> The key is the storage key. Changing it after release orphans every player's saved value, so treat it
> as permanent. Keys may not contain `"` `\` `{` `}` `,` `:` or control characters.

**2. Add it to the `SettingsProfile`.** Drop the asset into the profile's list — the one setup generated
in `Assets/WagSettings/Resources`, or your own. Order in the list is order in the menu. Re-running setup
later keeps anything you added by hand; it only replaces the entries it wrote itself.

![A SettingsProfile in the Inspector with its list of settings](Images/profile-inspector.png)

**3. Press Play.** In the UI Toolkit menu the row is there: right tab, right control, right label, and
Apply / Revert / Reset, search, dirty marking and persistence already work for it.

**In the uGUI menu**, rows are placed by hand, so add one: duplicate an existing row in the prefab
(`Sample Scenes/Quick Start/Prefabs/WagSettingsMenu (uGUI).prefab` has one of each kind), put it in the
right category panel, and set the binder's **Key**. That is the whole difference between the two
frameworks — see [Getting Started](GettingStarted.md#the-ugui-route-instead).

### Reading it

From anywhere, once a `WagSettingsManager` is running:

```csharp
int difficulty = WagSettings.Get<int>("gameplay.difficulty");                 // the pending value
WagSettings.Definition<int>("gameplay.difficulty").Changed += value => { };   // Set, Revert, Reset
```

For most gameplay settings that is all the code there is: read it where it matters, or react to the
event. The rest of this page is for values that have to drive Unity itself.

### The inspector checks the key as you type it

A malformed key otherwise fails only when the setting is first *used* — often in a different scene, on a
different day, a long way from where the mistake was made. The inspector reports it immediately:

| | Reported as | Examples |
|---|---|---|
| Cannot be used | **Error** | empty, a forbidden character, leading or trailing whitespace |
| Works, but unconventional | **Warning** | no category prefix, `Audio.Master` casing, an empty part between dots |

![The Inspector flagging a malformed key on a setting asset](Images/inspector-key-check.png)

Warnings are advice, not obstacles — a key with no category still works, it just lands under "General".

### Seeing the current value

The inspector shows only the authored fields when you are not playing, because the current value is
runtime state and is deliberately never saved into the asset — a player's choices belong in their save
data, not in a file you ship.

Enter play mode and the inspector shows the live value, whether it has unapplied changes, and buttons to
revert or reset it. An asset whose Default still reads `0.8` while the game is plainly playing at `0.25`
is working correctly.

## Write an applier

An applier turns a value into a Unity effect on a schedule — live as the player drags, or only when
they press Apply. It knows about `UnityEngine`; the core does not. Derive from `SettingApplierBase` and
supply two things: which settings you track, and how to push them.

```csharp
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Audio;
using WaggleBum.WagSettings;

public sealed class MusicVolumeApplier : SettingApplierBase
{
    [SerializeField] private AudioMixer _mixer = null!;

    private ISettingDefinition<float> _music = null!;

    protected override void ResolveSettings(SettingsRegistry registry, IList<ISettingDefinition> tracked)
    {
        _music = Require<float>(registry, "audio.music");
        tracked.Add(_music);
    }

    public override void ApplyCurrentValues()
    {
        _mixer.SetFloat("MusicVolume", AudioVolume.LinearToDecibels(_music.Value));
    }
}
```

Put the component **under the WagSettings Manager**. The manager attaches everything under it when it
starts; there is nothing to call. (An applier that has to live elsewhere: `WagSettings.Manager.Attach(applier)`,
and detach it yourself.)

The base class handles the two things hand-written appliers get wrong:

1. **Every `+=` has a matching `-=`.** Settings are ScriptableObjects, so they outlive your scene. A
   subscription you never release keeps the component, its GameObject, and everything they reference
   alive across scene loads. `Attach`/`Detach` and Unity's `OnEnable`/`OnDisable` are wired for you.
2. **The persisted value is applied on attach.** An applier that only reacts to `Changed` leaves the game
   running on whatever was authored in the scene until the player next touches a setting — a bug that
   hides until someone reloads a scene.

The third rule is still yours: **never write to the store from an applier.** Appliers read; the registry
writes, once, in `Apply()`.

`Require` throws on a key the registry does not hold, naming it. That is deliberate: a slider that
silently drives nothing looks like a broken game rather than a broken setup.

### Immediate or on Apply

The `Apply Mode` field on every applier decides when it acts:

| Mode | Fires on | Use for |
|---|---|---|
| `Immediate` *(default)* | every change to a tracked setting | cheap changes the player should hear or see as they drag — volume, UI scale |
| `OnApply` | the registry committing, via `Apply()` or `Load()` | anything expensive or disruptive — resolution, quality tier, window mode |

`OnApply` is what stops a resolution setting from thrashing the window while a dropdown is being
scrolled. It listens to `SettingsRegistry.Committed`, which fires after an `Apply()` that wrote something
and after a `Load()` — both cases where the committed values genuinely changed.

Note that `ApplyCurrentValues()` re-applies **all** of an applier's tracked settings, not just the one
that changed. For the handful of settings a single applier owns that is cheaper than routing per-setting
callbacks, and it keeps the method a straightforward "push the current state into Unity".

## Add a new setting *type*

Only needed for a value the built-in types cannot express.

```csharp
[CreateAssetMenu(fileName = "New Vector2Setting", menuName = "WaggleBum/WagSettings/Vector2 Setting")]
public sealed class Vector2Setting : TypedSettingAsset<Vector2>
{
}
```

That is the whole implementation — `TypedSettingAsset<T>` supplies the key, default, value, change event
and dirty tracking. The type must be serializable by Unity, and the store you use must be able to
persist it (`PlayerPrefsStore` handles the primitive types; see [Persistence](Persistence.md)).

For a fixed list of choices, prefer `EnumSetting` over a new type — it stores an index plus display
names and already works with the dropdown UI.

## Write a store

Implement `ISettingsStore` to persist somewhere else — a save file, a backend, a test double.

```csharp
public sealed class MyStore : ISettingsStore
{
    public bool Has(string key)                  { ... }
    public T    Load<T>(string key, T fallback)  { ... }
    public void Save<T>(string key, T value)     { /* buffer, do not commit */ }
    public void Flush()                          { /* commit the whole batch */ }
    public void Delete(string key)               { /* buffer */ }
}
```

The one contract that matters: **`Save` and `Delete` buffer, `Flush` commits.** The registry writes every
dirty setting and then flushes exactly once, so a store that commits per-write turns one Apply into forty
round trips.

Round-trip test any store you write — set, save, flush, reload, assert — the same shape as the tests in
`Tests/EditMode`.
