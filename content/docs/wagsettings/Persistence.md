# Persistence

WagSettings saves through one small interface, `ISettingsStore`. Out of the box it uses
`PlayerPrefsStore`, which works in every Unity project with no dependencies. Install
[WagSave](https://www.wagglebum.com) and persistence upgrades itself — versioned, cloud-synced,
encrypted, multi-profile — with nothing to wire up.

## How saving works

Nothing is written while the player drags a slider. A setting holds a **pending** value; the store only
hears about it when the registry applies:

```csharp
master.Set(0.5f);      // nothing touches disk
registry.Apply();      // writes dirty settings, then Flush() — once
```

`Apply()` writes only the settings that are actually dirty and calls `Flush()` **exactly once**. A menu
with forty settings costs one commit, which is what makes a disk- or network-backed store practical.

`Revert()` discards pending values without ever reaching the store. That is what makes a Cancel button
honest rather than a second write.

### Buffered, not invisible

`Save` and `Delete` buffer until `Flush`, but `Has` and `Load` read those buffered writes layered over
committed state — a caller always sees its own writes. `Flush` changes **durability**, not visibility.

```csharp
store.Save("audio.master", 0.5f);
store.Load("audio.master", 0f);   // 0.5 — your own write
// another store instance still reads the old value until Flush()
```

## Choosing a store

A `SettingsProfile` records which backend it wants, and `SettingsStoreFactory` resolves it:

| `StoreKind` | Result |
|---|---|
| `Automatic` *(default)* | WagSave when installed, otherwise PlayerPrefs |
| `PlayerPrefs` | Always PlayerPrefs, even when WagSave is installed |

```csharp
ISettingsStore store = SettingsStoreFactory.Create(profile.StoreKind);
using SettingsRegistry registry = profile.CreateRegistry(store);
```

`SettingsStoreFactory.Create()` with no argument returns a `PlayerPrefsStore`. That default is why
WagSettings needs no setup to work.

## PlayerPrefsStore

The default. Simple, synchronous, and present everywhere.

**Supported types.** PlayerPrefs itself holds only `int`, `float` and `string`, so this store supports
those plus `bool` and enums, which it maps onto `int`:

| Setting type | Stored as |
|---|---|
| `bool` | `int` — `0` or `1` |
| `int` | `int` |
| `float` | `float` |
| `string` | `string` — a null value is stored as empty, since PlayerPrefs has no null |
| enum / `EnumSetting` | `int` — the underlying value |

Anything else throws `NotSupportedException` **at the `Save` call**, not silently at flush time, so the
failure points at the code that caused it. Use `PlayerPrefsStore.IsSupportedType(type)` to check first.

**Key namespacing.** Every key is written with a prefix, `WagSettings.` by default, so a setting called
`audio.master` is stored as `WagSettings.audio.master` and can never collide with your game's own
PlayerPrefs entries.

```csharp
var store = new PlayerPrefsStore("MyGame.Settings.");
```

> Changing the prefix after release orphans every previously saved value, exactly like changing a key.

**What it does not give you.** No versioning or migration, no cloud sync, no encryption, no profiles, and
PlayerPrefs is stored in the clear — on Windows in the registry, on macOS in a plist — so it is trivially
editable by players. For settings that is usually fine. If it is not, that is what WagSave is for.

## What lights up with WagSave

Install `com.wagglebum.wagsave` and WagSettings detects it at compile time through the
`WAGGLEBUM_WAGSAVE_PRESENT` define. The `WagSettings.WagSave` assembly — which Unity skips entirely when
WagSave is absent — registers a WagSave-backed store with `SettingsStoreFactory` at startup. Profiles set
to `Automatic` pick it up with no code change on your part.

![The Persistence check reporting WagSave detected](Images/summary-wagsave-detected.png)

| | PlayerPrefs | WagSave |
|---|---|---|
| Works with no dependencies | ✅ | — |
| Versioning and migration on upgrade | ❌ | ✅ |
| Cloud sync across devices | ❌ | ✅ |
| Encryption and signing | ❌ | ✅ |
| Multiple profiles | ❌ | ✅ |
| Format choice (binary / JSON / text) | ❌ | ✅ |
| Types beyond the primitives | ❌ | ✅ |

### How it hooks up

There is nothing to switch on. `WagSettings.WagSave` is an assembly Unity compiles **only** when
`com.wagglebum.wagsave` is installed, so the fact that its bootstrap runs at all is the detection — no
version check, no reflection, no setting. Install WagSave and persistence upgrades itself; remove it and
the assembly disappears along with the registration, leaving the PlayerPrefs default.

A profile set to `PlayerPrefs` still gets PlayerPrefs. Choosing a store explicitly is a decision the
package does not overrule.

### What to know about the WagSave store

**Settings live in their own WagSave group**, `WagSettings` by default, so they stay separable from your
game's save data and can be inspected in WagSave's own tools.

**Writes are batched.** WagSave's runtime API commits on every `Save` call, so this store buffers and
writes only on `Flush` — which the registry calls once per Apply, for the dirty settings only. A
forty-setting menu where the player changed two costs two writes, not forty. There is a test asserting
exactly that.

**Deleting writes a null.** WagSave's public runtime API has no remove, so a deleted key is stored as
null, which reads back as absent. Same outcome from a caller's point of view, and it keeps WagSettings
off WagSave's internals.

**A value stored as another type still reads.** A setting that used to be an `int` and is now a `float`
converts rather than failing. A value that genuinely cannot be read falls back to the default and warns —
the player loses one setting, not the ability to start.

## Writing your own store

Implement `ISettingsStore` and register it:

```csharp
SettingsStoreFactory.RegisterProvider(() => new MyStore());
```

Register before anything builds a registry — a `[RuntimeInitializeOnLoadMethod]` is the usual place. The
last registration wins, `ClearProvider()` restores the PlayerPrefs default, and a provider that returns
null throws rather than quietly falling back, since settings that silently stop persisting are worse than
a loud failure.

The one contract that matters: **`Save` and `Delete` buffer, `Flush` commits.** A store that commits on
every write turns one Apply into forty round trips.

See [Extensibility](Extensibility.md) for the full walkthrough.
