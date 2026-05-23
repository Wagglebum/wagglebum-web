# Getting Started

This guide covers everything you need to go from zero to a working save/load implementation using `WaggleBum.WagSave.Core.dll`.

---

## 1. Add the DLL Reference

### Plain .NET projects (csproj)

Copy `WaggleBum.WagSave.Core.dll` somewhere stable in your repo (e.g., `libs/`) and add:

```xml
<ItemGroup>
  <Reference Include="WaggleBum.WagSave.Core">
    <HintPath>libs\WaggleBum.WagSave.Core.dll</HintPath>
  </Reference>
  <PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
</ItemGroup>
```

`Newtonsoft.Json` is a required runtime dependency of the DLL.

### Unity

The Unity-side `WagSave.cs` ScriptableObject manages the DLL lifecycle. If you are integrating the DLL directly into a non-WagSave Unity project, copy it to `Assets/Plugins/` and add a `Newtonsoft.Json` NuGet reference or use the Unity-provided version.

---

## 2. Configure the Logger

The logger is a static singleton. Before doing anything else, point it at your platform's output.

```csharp
using WaggleBum.WagSave.Core.Logging;
using WaggleBum.WagSave.Core.Enums;

// Minimum: set a threshold so the library won't spam you
Logger.LogThreshold = LogLevel.Warning;

// Optional: plug in your own output backend
Logger.Configuration = new MyLoggerConfiguration(); // see Extending guide

// Optional: write warnings and above to a file as well
Logger.LogToFileEnabled = true;
Logger.LogFilePath = @"C:\MyGame\Saves\wagsave.log";
Logger.FileLogThreshhold = LogLevel.Warning;
```

If you leave `Logger.Configuration` as `null`, the library silently drops all log output. Nothing will break, but you will have no visibility into save/load errors.

See the [Extending guide](extending.md#custom-logger) for how to implement `ILoggerConfiguration`.

---

## 3. Set the Save File Base Path

All file-based targets resolve their paths relative to a single static base path.

```csharp
using WaggleBum.WagSave.Core.SaveTargets.Settings;

// Defaults to the executing assembly's directory if not set
SaveTargetFileSettings.BasePath = @"C:\MyGame\Saves";
```

Set this once at application startup, before creating any save targets or slot managers.

---

## 4. Quick Start — Direct Save Target (No Slots)

The simplest possible usage: create one save target and read/write values directly.

```csharp
using WaggleBum.WagSave.Core.SaveTargets;
using WaggleBum.WagSave.Core.SaveTargets.Settings;

// Configure
var settings = new SaveTargetSettings(SaveTargetDestination.JsonFile);
settings.File.Properties.FileName      = "MyGame";
settings.File.Properties.FileExtension = "save";
settings.File.Properties.FolderName    = "Saves";

// Create and load (Load() is called automatically by GetSaveTarget)
using var target = SaveTargetDestination.GetSaveTarget(settings);

// Write
target.AddOrUpdate("playerLevel", 5);
target.AddOrUpdate("playerName", "Hero");
target.Save();

// Read
var level = target.Get<int>("playerLevel");     // 5
var name  = target.Get<string>("playerName");   // "Hero"
```

The `using` statement ensures `Dispose()` is called, which flushes any unsaved changes to disk.

---

## 5. Quick Start — Save Slot Manager

The slot system wraps multiple save targets behind a named-slot UI (manual saves, auto-saves, quick saves).

```csharp
using WaggleBum.WagSave.Core.SaveSlots;
using WaggleBum.WagSave.Core.SaveTargets;
using WaggleBum.WagSave.Core.Enums;

// 1. Configure the slot system
var settings = new SaveSlotsSettings(
    slotListDestinationId: SaveTargetDestination.BinaryIndexedFile.Id,
    slotDestinationId:     SaveTargetDestination.BinaryFile.Id,
    listType:              SaveSlotListType.Dynamic,
    capacity:              10,
    overwriteAtCapacity:   true
);
settings.IsEnabled = true;

// 2. Create the manager (loads any existing slot list from disk automatically)
using var manager = new SaveSlotManager(settings);

// 3. Create a new manual save slot
var slot = manager.AddNewSlot(SaveSlotType.Manual);
slot.Title   = "Chapter 1";
slot.Summary = "Entered the forest";

// 4. Open the slot and write game data
slot.Open();
slot.Save("score",  1500);
slot.Save("level",  3);
slot.Save("health", 0.75f);

// 5. Persist the slot list metadata (slot titles, timestamps, etc.)
manager.FlushSlotList();

// 6. Close the slot when done
slot.Close();
```

### Loading back

```csharp
// Retrieve a slot (by index or ID)
var slot = manager.GetSlot(0);
// -- or --
var latest = manager.GetLatestSlot();

slot.Open();
var score  = slot.Load<int>("score");
var level  = slot.Load<int>("level");
var health = slot.Load<float>("health");
slot.Close();
```

---

## 6. Saving Custom Objects

Any class can be saved if the serialization system can handle its fields. By default, the library uses reflection-based `CustomObjectSerialization`. For fine-grained control use the attributes.

### Default: serialize all public fields and properties

```csharp
public class PlayerProfile
{
    public string Name  = "Hero";
    public int    Level = 1;
    public float  Health = 1.0f;
}

slot.Open();
slot.Save("profile", new PlayerProfile { Name = "Aria", Level = 7 });
var profile = slot.Load<PlayerProfile>("profile");
slot.Close();
```

### Opt-in mode: only save tagged members

```csharp
using WaggleBum.WagSave.Core.Attributes;

[WagSave(includeWagSaveOnly: true)]
public class GameSettings
{
    [WagSaveField("vol_master")]
    public float MasterVolume = 1.0f;

    [WagSaveField("vol_sfx")]
    public float SfxVolume = 0.8f;

    // This field is NOT saved (no [WagSaveField])
    public bool   DebugMode = false;
}
```

### Stable keys across renames

```csharp
[WagSave]
public class InventoryItem
{
    [WagSaveField("item_id")]   // Saved as "item_id" even if the property is renamed
    public string ItemId = "";

    [WagSaveField("qty")]
    public int    Quantity = 0;
}
```

### Excluding a field

Apply `[System.NonSerialized]` to any field you want excluded from serialization.

```csharp
[WagSave]
public class EnemyState
{
    public int  HitPoints = 100;

    [NonSerialized]
    public bool IsAggro = false; // transient, not saved
}
```

---

## 7. Async Operations

Every `Save`, `Load`, `AddOrUpdate`, and slot operation has an async counterpart.

```csharp
// Create target asynchronously
var target = await SaveTargetDestination.GetSaveTargetAsync(settings);

// Slot manager
var slot = await manager.AddNewSlotAsync(SaveSlotType.Auto, atIndex: 0);
await slot.OpenAsync();
await slot.SaveAsync("score", 9999);
await slot.LoadAsync();
var score = await slot.LoadAsync<int>("score");
await slot.CloseAsync();

await manager.DeleteSlotAsync("slot-guid-here");
await manager.DeleteAllSlotsAsync();
```

---

## 8. Choosing a Storage Format

| Destination | ID constant | Format | Memory strategy | Best for |
|---|---|---|---|---|
| `BinaryIndexedFile` | `SaveTargetDestination.BinaryIndexedFile.Id` | Binary | On-disk (indexed) | Large saves, frequent partial updates |
| `BinaryFile` | `SaveTargetDestination.BinaryFile.Id` | Binary | Full in-memory buffer | Small-to-medium saves, simple setup |
| `JsonIndexedFile` | `SaveTargetDestination.JsonIndexedFile.Id` | JSON | On-disk (indexed) | Human-readable + low memory overhead |
| `JsonFile` | `SaveTargetDestination.JsonFile.Id` | JSON | Full in-memory buffer | Debugging, small saves |
| `TextFile` | `SaveTargetDestination.TextFile.Id` | Text | Full in-memory buffer | Plain-text exports |
| `TextIndexedFile` | `SaveTargetDestination.TextIndexedFile.Id` | Text | On-disk (indexed) | Plain-text with low memory overhead |
| `Memory` | `SaveTargetDestination.Memory.Id` | In-process | N/A | Testing, temporary session state |

**Memory-buffered targets** (`BinaryFile`, `JsonFile`, `TextFile`) load the entire file into a dictionary on open and flush the entire dictionary back to disk on save. They are simpler but consume more RAM for large save files.

**Indexed targets** (`BinaryIndexedFile`, `JsonIndexedFile`, `TextIndexedFile`) track per-entry byte offsets and sizes. Individual values are read and written directly to disk without loading the full file. These are the better choice for saves with many keys or large values.

---

## 9. Encryption and Compression

These options are configured on `SaveTargetSettings.Options` and apply to all file-based targets.

```csharp
var settings = new SaveTargetSettings(SaveTargetDestination.BinaryFile);

// GZip compression (applied before writing)
settings.Options.CompressData = true;

// RSA + AES encryption (applied after compression)
settings.Options.EncryptData      = true;
settings.Options.EncryptPublicKey = "BASE64_RSA_PUBLIC_KEY";
// Set private key at runtime (marked [NonSerialized] — never persisted)
settings.Options.EncryptPrivateKey = "BASE64_RSA_PRIVATE_KEY";
```

### File signing (tamper detection)

```csharp
settings.File.Options.SignFileOutput    = true;
settings.File.Options.SignFileSecretKey = "BASE64_HMAC_SECRET";
```

When `SignFileOutput` is `true`, the library appends an HMAC-SHA256 signature on save and verifies it on load. If the file has been modified outside the library, load throws `TamperedSaveTargetException`.

---

## 10. Using Groups

Keys can be organized into named groups. The group name is prefixed to the key internally, which prevents collisions when different subsystems share the same target.

```csharp
target.AddOrUpdate("volume", 0.8f, groupName: "audio");
target.AddOrUpdate("volume", 1.0f, groupName: "video");  // separate entry

var audioVol = target.Get<float>("volume", groupName: "audio");  // 0.8
var videoVol = target.Get<float>("volume", groupName: "video");  // 1.0
```

---

## 11. Implementing ISaveSystem

`ISaveSystem` is the top-level orchestration interface. The core library defines the contract but **does not provide a concrete implementation** — you provide one that fits your application's lifecycle.

```csharp
using WaggleBum.WagSave.Core.Interfaces;
using WaggleBum.WagSave.Core.SaveSlots;

public class MySaveSystem : ISaveSystem
{
    private readonly SaveSlotManager _manager;

    public bool IsSaving  { get; private set; }
    public bool IsLoading { get; private set; }
    public int  Progress  { get; private set; }

    public event OnSaveStartHandler?     OnSaveStart;
    public event OnProgressHandler?      OnProgress;
    public event OnSaveCompletedHandler? OnSaveCompleted;
    public event OnLoadStartHandler?     OnLoadStart;
    public event OnLoadCompletedHandler? OnLoadCompleted;

    public MySaveSystem(SaveSlotManager manager)
    {
        _manager = manager;
    }

    public void Save(SaveSlot? slot = null)
    {
        IsSaving = true;
        OnSaveStart?.Invoke();

        // Collect all saveable objects and write them to the slot
        var target = slot ?? _manager.GetLatestSlot();
        target?.Open();
        // ... call target.Save(key, value) for each game object
        target?.Close();

        OnProgress?.Invoke(100);
        IsSaving = false;
        OnSaveCompleted?.Invoke();
    }

    public void Load(SaveSlot? slot = null)
    {
        IsLoading = true;
        OnLoadStart?.Invoke();

        var target = slot ?? _manager.GetLatestSlot();
        target?.Open();
        // ... call target.Load<T>(key) for each game object
        target?.Close();

        IsLoading = false;
        OnLoadCompleted?.Invoke();
    }
}
```

In Unity, `WagSave.cs` provides a concrete `ISaveSystem` built around the `[WagSave]` attribute auto-discovery. In a plain .NET project you wire this up yourself as shown above.
