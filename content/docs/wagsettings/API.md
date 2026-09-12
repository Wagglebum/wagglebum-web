# API

The WagSettings core model. Everything on this page lives in the `WaggleBum.WagSettings` namespace and,
except for the ScriptableObject asset types, has no `UnityEngine` dependency — the model is plain C# so
it can be unit-tested directly and extracted later.

## The static API

Most game code needs one line, and this is it:

```csharp
using WaggleBum.WagSettings;

float master = WagSettings.Get<float>("audio.master");
WagSettings.Set("audio.master", 0.8f);                 // pending
WagSettings.Apply();                                    // committed and saved, in one batch
WagSettings.Definition<float>("audio.master").Changed += value => { };
```

| Member | Does |
|---|---|
| `Get<T>(key)` | The pending value |
| `Set<T>(key, value)` | Sets the pending value; `true` when it changed |
| `Definition<T>(key)` | The `ISettingDefinition<T>` behind a key, for its `Changed` event |
| `Apply()` / `Revert()` / `ResetAll()` | The registry's commands |
| `IsDirty` | Anything pending? |
| `Registry` | The registry itself, for anything above |
| `Manager` / `IsReady` | The running `WagSettingsManager`, or whether there is one |

Every call resolves to the active **`WagSettingsManager`**. With none running, `Get` and the rest
**throw**, naming the two ways to fix it — they never return a quiet default, because a settings menu
that "works" while saving nothing is the failure this exists to prevent. `IsReady` is the check when
throwing is not wanted.

### `WagSettingsManager`

The one owner of the registry. Add **WaggleBum → WagSettings → WagSettings Manager** to a scene and
assign a profile, or assign nothing and it uses the default profile from a Resources folder. It:

- builds the registry from the profile, lazily, so a menu that opens in `Awake` gets the same one;
- **attaches every `SettingApplierBase` under it** in `Start`, with nothing to write;
- hands its registry to any menu that opens — a menu with a manager running does not make its own;
- persists across scene loads by default, and a second manager warns and removes itself.

`Attach(applier)` covers an applier that lives elsewhere; detach it yourself.

### `WagSettingsBootstrapper`

If a scene has no manager and a `SettingsProfile` is in a Resources folder, one is created after the
first scene loads — so saved settings apply before the first frame and the static API works with nothing
placed. Setup generates into `Assets/WagSettings/Resources` for exactly this reason. No profile in
Resources means nothing happens. With several profiles there, tick **Is Default** on the one you mean;
none flagged warns and takes the first.

`WagSettings.Reset()` clears static state and runs before every play session, so Enter Play Mode
without a domain reload cannot hand a new session the previous one's manager. Tests call it in setup.

## The shape of it

```
SettingsProfile  (asset)  ── CreateRegistry(store) ──▶  SettingsRegistry
      │                                                       │
      └─ SettingAsset ─┐                          holds       ▼
                       └──────────────────────▶  ISettingDefinition ──▶ ISettingsStore
                                                       ▲
                             SettingDefinition<T> (plain C#, does the work)
```

A setting carries three values, and the difference between them is the whole model:

| | Meaning |
|---|---|
| `DefaultValue` | The authored default. `ResetToDefault()` restores it. |
| `Value` | The **pending** value — what the user has dialled in right now. |
| *applied baseline* | The last value committed by `Apply()` or loaded from the store. |

`IsDirty` is simply `Value != baseline`. That is what lets an Apply button light up, a Cancel button
work, and a batch commit in one write.

## `SettingDefinition<T>`

The plain-C# setting. Construct with a key and a default.

```csharp
var master = new SettingDefinition<float>("audio.master", 0.8f);

master.Changed += volume => mixer.SetFloat("MasterVolume", AudioVolume.LinearToDecibels(volume));
master.Set(0.5f);          // raises Changed, IsDirty becomes true
```

| Member | Notes |
|---|---|
| `Key`, `DefaultValue`, `ValueType` | Immutable identity. |
| `Value` / `Set(T)` | `Set` returns whether the value moved. A write of the same value is a no-op and raises nothing, so appliers are never woken needlessly. |
| `Changed` | `SettingChangedHandler<T>` — typed, for appliers and UI. |
| `ValueChanged` | Type-agnostic `Action`, used by the registry to track dirty state. |
| `IsDirty` | Pending value differs from the applied baseline. |
| `Apply()` | Adopt the pending value as the baseline. |
| `Revert()` | Restore the baseline. Raises `Changed` if the value moves. |
| `ResetToDefault()` | Restore the authored default. Leaves the setting **dirty**, so a reset is still cancellable. |
| `LoadFrom(store)` / `SaveTo(store)` | Read/write a single value. `SaveTo` does **not** flush. |

Equality uses `EqualityComparer<T>.Default` unless you pass a comparer to the constructor — useful for
`float` settings where you want a tolerance rather than exact equality.

### `ISettingDefinition<T>`

`SettingDefinition<T>` and the ScriptableObject asset types both implement `ISettingDefinition<T>`, which
carries `Value`, `Set`, `DefaultValue` and `Changed`. Bind UI and appliers to **this interface**, not to
the concrete class, so a setting works the same whether it was authored as an asset or built in code —
`SettingsRegistry.Get<T>` returns it for exactly that reason.

## `SettingsRegistry`

Every setting in one place, bound to one store. This is what UI binds to.

```csharp
using var registry = new SettingsRegistry(store);
registry.Register(master);

registry.IsDirty;          // false — Register loaded the persisted value
master.Set(0.5f);
registry.IsDirty;          // true
registry.Apply();          // writes dirty settings, flushes once
```

| Member | Notes |
|---|---|
| `Register(definition)` | Adds the setting **and loads its persisted value**, so a fresh registry is clean. Throws on a duplicate key. |
| `Unregister(key)` / `Clear()` | Remove settings and detach the registry's subscriptions. |
| `Get<T>(key)` | Typed lookup, returning `ISettingDefinition<T>`. Throws `KeyNotFoundException` if absent, `InvalidCastException` on a type mismatch. |
| `TryGet` / `Contains` | Non-throwing lookups. |
| `Definitions` | Registered settings in registration order — the order the UI presents them in. |
| `IsDirty` | True when any setting has unapplied changes. |
| `DirtyStateChanged` | Fires only on a clean↔dirty **transition**, not on every keystroke. |
| `Load()` | Re-read everything from the store, discarding pending edits. |
| `Apply()` | Write dirty settings, `Flush()` **once**, adopt them as the baseline. Returns how many were written. Clean settings are never rewritten. |
| `Revert()` | Discard pending edits. |
| `ResetAll()` | Restore every default, leaving the registry dirty. |
| `Dispose()` | Detach every subscription. |

> The registry subscribes to each setting it holds. **Dispose it** (or call `Clear()`) when the owning
> scene or profile goes away, or those subscriptions keep it alive through the setting assets.

### Batching

`Apply()` is the only thing that calls `Flush()`, and it calls it at most once. That matters because a
real store may hit disk or the network — a menu with forty settings still costs one commit.

## The binding layer

UI binds to a view model, not to the registry directly. Both the UI Toolkit and uGUI menus go through the
same one, so they cannot drift apart — and the whole menu is testable without instantiating a control.

### Labels and categories

Settings carry a `DisplayName` and a `Category`. Neither has to be authored: they are derived from the
key, so a menu never shows a raw key.

| Key | Derived label | Derived category |
|---|---|---|
| `audio.master` | Master | Audio |
| `display.windowMode` | Window Mode | Display |
| `accessibility.reduce_motion` | Reduce Motion | Accessibility |
| `simple` | Simple | General |

Authoring either on the asset overrides the derived value. Derivation is a fallback, not a policy —
anything player-facing should eventually be authored and localised.

### `ISettingBinder`

One setting as a view sees it: `DisplayName`, `Category`, `IsDirty`, `BoxedValue`, a `Changed` event, and
availability.

```csharp
var binder = (SettingBinding<float>)category.Settings[0];
binder.Set(0.5f);            // goes through the registry-tracked setting
```

**Edits go through the setting the registry tracks, never round the side of it into the store.** A view
that wrote straight to the store would leave the Apply button lying about what is pending.

**Availability** is how a setting the current hardware cannot honour is presented:

```csharp
binder.SetAvailability(
    applier.SupportsFeature(GraphicsFeature.RenderScale),
    "Render scale needs the Universal Render Pipeline.");
```

An unavailable binder ignores writes rather than throwing, so a view that has not yet greyed out a
control cannot crash the menu. Grey the control out and show `UnavailableReason` — **don't hide it**, or
the player hunts for an option they read about.

### `SettingsMenuModel`

```csharp
using var model = new SettingsMenuModel(registry, SettingBinderFactory.CreateAll(registry), ownsBinders: true);

model.SearchText = "volume";
foreach (SettingsMenuCategory category in model.Categories)
{
    foreach (ISettingBinder setting in category.Settings) { /* build a row */ }
}
```

| Member | Notes |
|---|---|
| `Categories` | Matching categories in **authored** order, not alphabetical — profile order is a design choice. Empty ones are dropped. |
| `SearchText` | Matches label, category or key, case-insensitively. Raises `Changed` once per real change. |
| `CanApply` / `CanRevert` | True while anything is dirty. |
| `CanReset` | True only when something differs from its authored default — a Reset that would do nothing shouldn't invite a click. |
| `Apply()` / `Revert()` / `ResetAll()` | Straight through to the registry; `Apply` returns how many were written. |
| `Changed` | Any value, availability, search or dirty change. |

`SettingBinderFactory` builds typed binders for a whole registry, matching the common value types
directly and falling back to reflection for a custom one — so adding a setting type doesn't mean editing
a switch.

> On IL2CPP the reflection path needs the generic instantiation to exist at build time. The package's
> `link.xml` keeps `SettingBinding<T>`'s constructors from being stripped, but for a value type of your
> own, `SettingBinding<YourType>` must also appear somewhere in your code — a field is enough — so the
> AOT compiler generates it. The four built-in value types need nothing.

> Dispose the model when the menu closes. It subscribes to the registry and to every binder;
> `ownsBinders: true` disposes the binders with it.

## `ISettingsStore`

The persistence seam. `PlayerPrefsStore` is the default and `WagSaveStore` takes over when WagSave is
installed; see [Persistence](Persistence.md).

```csharp
public interface ISettingsStore
{
    bool Has(string key);
    T    Load<T>(string key, T fallback);
    void Save<T>(string key, T value);   // buffered
    void Flush();                        // commits the batch
    void Delete(string key);             // buffered
}
```

`Save` and `Delete` buffer; only `Flush` commits.

## Setting assets

ScriptableObject wrappers so settings can be authored and referenced as assets. Each delegates to an
inner `SettingDefinition<T>` — the asset is the authoring surface, the definition does the work.

`BoolSetting` · `IntSetting` · `FloatSetting` · `StringSetting` · `EnumSetting`

Create them from **Assets → Create → WaggleBum → WagSettings**. Every asset needs a **Key** — an empty
key throws as soon as the setting is used.

`EnumSetting` stores the selected **index** into an authored list of option names rather than a C# enum,
so one asset type serves every dropdown (window mode, colourblind preset, quality tier) and the UI gets
its display names without reflection.

## `SettingsProfile`

Groups the settings a game exposes and records which store persists them.

```csharp
using SettingsRegistry registry = profile.CreateRegistry(store);
```

`CreateRegistry` registers every setting in authored order. An **empty slot in the list throws** rather
than being skipped — silently dropping a setting from the menu at runtime is worse than a loud failure.

`StoreKind` is `Automatic` (WagSave when installed, else PlayerPrefs) or `PlayerPrefs`. `SettingsStoreFactory`
resolves it. `IsDefault` marks the profile the manager uses when several share a Resources folder.

## `Guard` and errors

Every public entry point validates through `Guard`, and every WagSettings error follows one contract:
**create → log → throw**.

```csharp
Guard.AgainstNull(store, nameof(store));
Guard.AgainstNullOrEmpty(value, nameof(value));
Guard.AgainstInvalidKey(key, nameof(key));
Guard.AgainstNumberNotInRange(value, 0, 10, nameof(value));
```

A valid key is non-empty, non-whitespace, and free of `"` `\` `{` `}` `,` `:` and control characters.
Dots are allowed and are the conventional group separator: `audio.master`, `display.window_mode`.

Subscribe to `WagSettingsLog.ErrorLogged` to observe failures — it fires immediately **before** the
exception is thrown, so you see the error even if something upstream catches it.

```csharp
WagSettingsLog.ErrorLogged += exception => Debug.LogException(exception);
```
