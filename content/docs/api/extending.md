# Extending WagSave Core

The library is designed to be extended without modifying the DLL. All extension points use static delegate events, so you register your implementations at application startup and the core picks them up automatically.

---

## Table of Contents

- [Custom Type Serializer](#custom-type-serializer)
- [Custom Save Target](#custom-save-target)
  - [In-Memory Save Target](#option-a-in-memory-save-target)
  - [File-Buffered Save Target](#option-b-file-buffered-save-target)
  - [Indexed File Save Target](#option-c-indexed-file-save-target)
- [Custom ISaveSystem Implementation](#custom-isavesystem-implementation)
- [Custom Logger](#custom-logger)

---

## Custom Type Serializer

Add serialization support for any type the library does not handle natively — for example, Unity's `Vector3`, an `Enum`, or a third-party record type.

### Step 1 — Implement `TypeSerialization`

Extend the abstract base class. It handles null guards and logging; you implement only the conversion logic.

```csharp
using WaggleBum.WagSave.Core.Abstracts.Serialization;

public class ColorSerialization : TypeSerialization
{
    // Tell the base class which type this handles
    public ColorSerialization() : base(typeof(MyColor)) { }

    protected override string? HandleSerialize(object obj)
    {
        // obj is guaranteed non-null by the base class
        var color = GetObject<MyColor>(obj);    // safe-cast helper
        return $"{color.R},{color.G},{color.B},{color.A}";
    }

    protected override object? HandleDeserialize(string serializedObject, object? parentObject = null)
    {
        var parts = serializedObject.Split(',');
        return new MyColor(
            r: float.Parse(parts[0], System.Globalization.CultureInfo.InvariantCulture),
            g: float.Parse(parts[1], System.Globalization.CultureInfo.InvariantCulture),
            b: float.Parse(parts[2], System.Globalization.CultureInfo.InvariantCulture),
            a: float.Parse(parts[3], System.Globalization.CultureInfo.InvariantCulture));
    }
}
```

**Rules:**
- Always use `CultureInfo.InvariantCulture` when formatting or parsing numbers. Save files may be read on machines with different locale settings.
- Return `null` from `HandleDeserialize` only if the input genuinely represents a null/missing value.
- `GetObject<T>(obj)` casts safely and throws `InvalidCastException` (logged) on failure — prefer this over a direct cast.

### Step 2 — Register via the extension event

Subscribe before any save/load operations occur — typically at application startup or in a static initializer.

```csharp
using WaggleBum.WagSave.Core.Serialization;

// Via the static event (works everywhere, including before Unity is fully initialized)
TypeSerializationFactory.OnGetTypeSerialization += type =>
{
    if (type == typeof(MyColor))
        return new ColorSerialization();

    return null!; // return null to fall through to the next handler or the built-in default
};
```

Alternatively, call `Set()` to register unconditionally:

```csharp
TypeSerializationFactory.Set(typeof(MyColor), new ColorSerialization());
```

`Set()` replaces any existing handler and evicts the type from the resolution cache. Use the event when you have multiple separate libraries each adding their own types; use `Set()` when you own all the types being registered.

### Multiple types in one handler

```csharp
TypeSerializationFactory.OnGetTypeSerialization += type =>
{
    if (type == typeof(Vector2)) return new Vector2Serialization();
    if (type == typeof(Vector3)) return new Vector3Serialization();
    if (type == typeof(Quaternion)) return new QuaternionSerialization();
    if (type.IsEnum) return new EnumSerialization(type);

    return null!;
};
```

### Serializing a generic type

```csharp
public class ObservableListSerialization : TypeSerialization
{
    private readonly Type _elementType;

    public ObservableListSerialization(Type listType)
        : base(listType)
    {
        _elementType = listType.GetGenericArguments()[0];
    }

    protected override string? HandleSerialize(object obj)
    {
        // Serialize as a JSON array using Newtonsoft.Json
        return Newtonsoft.Json.JsonConvert.SerializeObject(obj);
    }

    protected override object? HandleDeserialize(string serializedObject, object? parentObject = null)
    {
        var listType = typeof(System.Collections.Generic.List<>).MakeGenericType(_elementType);
        return Newtonsoft.Json.JsonConvert.DeserializeObject(serializedObject, listType);
    }
}

// Registration
TypeSerializationFactory.OnGetTypeSerialization += type =>
{
    if (type.IsGenericType && type.GetGenericTypeDefinition() == typeof(ObservableList<>))
        return new ObservableListSerialization(type);

    return null!;
};
```

### Implementing `ITypeSerialization` directly

If you don't want to inherit `TypeSerialization`, implement the interface directly. You lose the null-guard and logging helpers but gain full control.

```csharp
using WaggleBum.WagSave.Core.Interfaces;

public class RawColorSerialization : ITypeSerialization
{
    public string? Serialize(object obj)
    {
        if (obj is not MyColor c) return null;
        return $"{c.R},{c.G},{c.B},{c.A}";
    }

    public object? Deserialize(string serializedObject, object? parentObject = null)
    {
        var parts = serializedObject.Split(',');
        return new MyColor(
            float.Parse(parts[0], System.Globalization.CultureInfo.InvariantCulture),
            float.Parse(parts[1], System.Globalization.CultureInfo.InvariantCulture),
            float.Parse(parts[2], System.Globalization.CultureInfo.InvariantCulture),
            float.Parse(parts[3], System.Globalization.CultureInfo.InvariantCulture));
    }
}
```

---

## Custom Save Target

Build a custom save target when you need to store data somewhere other than the local file system — for example, Steam Cloud, Epic Online Services, a database, or a custom server API.

Choose your base class:

| Scenario | Extend |
|---|---|
| Cloud/platform storage (Steam, Epic, database) | `MemorySaveTarget` |
| Custom file format on disk | `FileSaveTarget` |
| Custom indexed file format with random-access I/O | `IndexedFileSaveTarget` |

### Option A: In-Memory Save Target

Extend `MemorySaveTarget` and override `Save()`, `SaveAsync()`, `Load()`, and `LoadAsync()` to read/write from your storage backend. The in-memory dictionary (`SaveData`) serves as the working buffer.

```csharp
using System.Collections.Generic;
using System.Threading.Tasks;
using WaggleBum.WagSave.Core.SaveTargets;
using WaggleBum.WagSave.Core.SaveTargets.Settings;
using WaggleBum.WagSave.Core.Serialization;

public class SteamCloudSaveTarget : MemorySaveTarget
{
    private readonly string _fileName;

    public SteamCloudSaveTarget(SaveTargetSettings settings)
        : base()
    {
        _fileName = settings.File.Properties.FileName;
    }

    public override void Save()
    {
        // Serialize the in-memory dictionary to a string
        var json = SerializeDictionaryToJson(SaveData);

        // Write to Steam Cloud
        SteamRemoteStorage.FileWrite(_fileName, System.Text.Encoding.UTF8.GetBytes(json));
    }

    public override async Task SaveAsync()
    {
        var json = SerializeDictionaryToJson(SaveData);
        await Task.Run(() => SteamRemoteStorage.FileWrite(
            _fileName, System.Text.Encoding.UTF8.GetBytes(json)));
    }

    public override void Load()
    {
        if (!SteamRemoteStorage.FileExists(_fileName)) return;

        var bytes = SteamRemoteStorage.FileRead(_fileName);
        var json = System.Text.Encoding.UTF8.GetString(bytes);
        SaveData = DeserializeJsonToDictionary(json);
    }

    public override async Task LoadAsync()
    {
        await Task.Run(Load);
    }

    // --- Helpers ---

    private string SerializeDictionaryToJson(Dictionary<string, object> data)
    {
        var portable = new Dictionary<string, string>();
        foreach (var (key, value) in data)
        {
            var typeName   = TypeSerialization.GetTypeName(value) ?? "System.String";
            var serialized = TypeSerializationFactory.Get(value.GetType()).Serialize(value) ?? "";
            portable[key] = $"{typeName}:{serialized}";
        }
        return Newtonsoft.Json.JsonConvert.SerializeObject(portable);
    }

    private Dictionary<string, object> DeserializeJsonToDictionary(string json)
    {
        var portable = Newtonsoft.Json.JsonConvert.DeserializeObject<Dictionary<string, string>>(json)
                       ?? new Dictionary<string, string>();
        var result = new Dictionary<string, object>();
        foreach (var (key, raw) in portable)
        {
            var colon    = raw.IndexOf(':');
            var typeName = raw.Substring(0, colon);
            var value    = raw.Substring(colon + 1);
            var type     = TypeSerialization.GetTypeFromName(typeName);
            result[key]  = TypeSerializationFactory.Get(type).Deserialize(value)!;
        }
        return result;
    }
}
```

**Important:** `SaveData` is the protected `Dictionary<string, object>` inherited from `MemorySaveTarget`. Assign to it directly in `Load()` and read from it in `Save()`.

### Option B: File-Buffered Save Target

Extend `FileSaveTarget` for a custom on-disk format. You provide only the read and write logic; the base class manages the dirty flag, file signing, and the finalizer.

```csharp
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using WaggleBum.WagSave.Core.Abstracts.SaveTargets;
using WaggleBum.WagSave.Core.SaveTargets.Settings;
using WaggleBum.WagSave.Core.Serialization;

public class CsvFileSaveTarget : FileSaveTarget
{
    public CsvFileSaveTarget(SaveTargetSettings settings) : base(settings) { }

    protected override Dictionary<string, object> LoadSaveData()
    {
        var result = new Dictionary<string, object>();

        if (!SaveFile.Exists) return result;

        foreach (var line in File.ReadAllLines(SaveFile.FullName))
        {
            if (string.IsNullOrWhiteSpace(line)) continue;

            var columns  = line.Split(',', 3);   // key, typeName, serializedValue
            if (columns.Length != 3) continue;

            var key      = columns[0];
            var typeName = columns[1];
            var raw      = columns[2];

            var type  = TypeSerialization.GetTypeFromName(typeName);
            var value = TypeSerializationFactory.Get(type).Deserialize(raw);
            if (value != null) result[key] = value;
        }

        return result;
    }

    protected override async Task<Dictionary<string, object>> LoadSaveDataAsync()
    {
        return await Task.Run(LoadSaveData);
    }

    public override void Save()
    {
        using var writer = new StreamWriter(SaveFile.FullName, append: false);

        foreach (var (key, value) in SaveData)
        {
            var typeName   = TypeSerialization.GetTypeName(value) ?? "";
            var serialized = TypeSerializationFactory.Get(value.GetType()).Serialize(value) ?? "";
            writer.WriteLine($"{key},{typeName},{serialized}");
        }
    }

    public override async Task SaveAsync()
    {
        await Task.Run(Save);
    }
}
```

**What the base class handles for you:**
- Calling `Load()` in the constructor
- Setting `IsDirty = true` on `AddOrUpdate()` and `Remove()`
- Calling `Save()` and signing the file in `Dispose()`
- A finalizer that calls `Save()` as a last resort
- File signature verification in `Load()` / `LoadAsync()`

**What you must implement:**
- `LoadSaveData()` — Read the file and return a `Dictionary<string, object>`. Assign the result; the base class will store it in `SaveData`.
- `LoadSaveDataAsync()` — The async variant. Wrapping the sync version in `Task.Run()` is acceptable.
- `Save()` / `SaveAsync()` — Write the full `SaveData` dictionary to `SaveFile`.

### Option C: Indexed File Save Target

For large saves where you want to avoid loading the entire file into memory, extend `IndexedFileSaveTarget`. The base class manages a `SaveFileIndex` that records per-entry byte offsets.

This is the most complex option and is only needed for performance-critical scenarios. Consult the built-in `BinaryIndexedFile` source as a reference implementation.

---

### Registering a Custom Save Target

Once your class is written, register it as a `SaveTargetDestination` and expose it through the extension event.

```csharp
using WaggleBum.WagSave.Core.SaveTargets;

// Create the descriptor once (e.g., in a static initializer)
var steamCloudDestination = SaveTargetDestination.Create(
    id:              "myapp_steam_cloud",
    name:            "Steam Cloud",
    saveTargetType:  typeof(SteamCloudSaveTarget),
    groupName:       "Cloud",
    description:     "Saves data to Steam Remote Storage."
);

// Register it with the factory
SaveTargetDestination.OnGetCustomSaveTargetDestinations += () =>
    new[] { steamCloudDestination };
```

After registration, use the destination ID in settings like any built-in destination:

```csharp
var settings = new SaveSlotsSettings(
    slotListDestinationId: "myapp_steam_cloud",
    slotDestinationId:     "myapp_steam_cloud"
);
```

#### Requirements for custom target types

- The class **must** have a public constructor that accepts a single `SaveTargetSettings` parameter. `SaveTargetDestination.GetSaveTarget()` uses `Activator.CreateInstance` with that signature.
- The class **must** implement `ISaveTarget` (which `MemorySaveTarget` and `FileSaveTarget` already satisfy).

```csharp
// The constructor WagSave expects:
public SteamCloudSaveTarget(SaveTargetSettings settings) { ... }
```

---

## Custom ISaveSystem Implementation

`ISaveSystem` is the top-level orchestration interface. The core DLL defines the contract but ships no concrete implementation — the Unity-side `WagSave.cs` ScriptableObject provides one for Unity projects. In a plain .NET project (or a non-WagSave Unity project) you implement it yourself.

A minimal but complete example:

```csharp
using System;
using WaggleBum.WagSave.Core;
using WaggleBum.WagSave.Core.Interfaces;
using WaggleBum.WagSave.Core.SaveSlots;

public class MySaveSystem : ISaveSystem
{
    // --- State ---
    private readonly SaveSlotManager _manager;
    private readonly Action<SaveSlot, ISaveTarget> _onSave;
    private readonly Action<SaveSlot, ISaveTarget> _onLoad;

    public bool IsSaving  { get; private set; }
    public bool IsLoading { get; private set; }
    public int  Progress  { get; private set; }

    // --- Events ---
    public event OnSaveStartHandler?     OnSaveStart;
    public event OnProgressHandler?      OnProgress;
    public event OnSaveCompletedHandler? OnSaveCompleted;
    public event OnLoadStartHandler?     OnLoadStart;
    public event OnLoadCompletedHandler? OnLoadCompleted;

    /// <param name="manager">The slot manager to use.</param>
    /// <param name="onSave">Called with the slot and open target; write your game data here.</param>
    /// <param name="onLoad">Called with the slot and open target; read your game data here.</param>
    public MySaveSystem(
        SaveSlotManager manager,
        Action<SaveSlot, ISaveTarget> onSave,
        Action<SaveSlot, ISaveTarget> onLoad)
    {
        _manager = manager;
        _onSave  = onSave;
        _onLoad  = onLoad;
    }

    public void Save(SaveSlot? slot = null)
    {
        IsSaving = true;
        Progress = 0;
        OnSaveStart?.Invoke();

        var targetSlot = slot ?? _manager.GetLatestSlot();
        if (targetSlot == null) throw new InvalidOperationException("No slot available to save into.");

        targetSlot.Open();
        var target = targetSlot.GetSaveTarget()!;

        try
        {
            _onSave(targetSlot, target);          // application writes its data here
            targetSlot.UpdateModifiedState();
            OnProgress?.Invoke(90);
        }
        finally
        {
            targetSlot.Close();
        }

        _manager.FlushSlotList();
        Progress = 100;
        OnProgress?.Invoke(100);
        IsSaving = false;
        OnSaveCompleted?.Invoke();
    }

    public void Load(SaveSlot? slot = null)
    {
        IsLoading = true;
        Progress  = 0;
        OnLoadStart?.Invoke();

        var targetSlot = slot ?? _manager.GetLatestSlot();
        if (targetSlot == null) throw new InvalidOperationException("No slot available to load from.");

        targetSlot.Open();
        var target = targetSlot.GetSaveTarget()!;

        try
        {
            _onLoad(targetSlot, target);          // application reads its data here
            OnProgress?.Invoke(90);
        }
        finally
        {
            targetSlot.Close();
        }

        Progress  = 100;
        OnProgress?.Invoke(100);
        IsLoading = false;
        OnLoadCompleted?.Invoke();
    }
}
```

**Usage:**

```csharp
var manager = new SaveSlotManager(settings);

var saveSystem = new MySaveSystem(
    manager,
    onSave: (slot, target) =>
    {
        target.AddOrUpdate("score",       _game.Score);
        target.AddOrUpdate("level",       _game.Level);
        target.AddOrUpdate("playerName",  _game.PlayerName);
    },
    onLoad: (slot, target) =>
    {
        _game.Score      = target.Get<int>("score")    ?? 0;
        _game.Level      = target.Get<int>("level")    ?? 1;
        _game.PlayerName = target.Get<string>("playerName") ?? "Player";
    }
);

// Save to a specific slot
var slot = manager.AddNewSlot(SaveSlotType.Manual);
saveSystem.Save(slot);

// Load from the most recently modified slot
saveSystem.Load();
```

---

## Custom Logger

Implement `ILoggerConfiguration` to redirect WagSave's internal log output to your application's logging infrastructure.

### Example: Console logger

```csharp
using System;
using WaggleBum.WagSave.Core.Enums;
using WaggleBum.WagSave.Core.Interfaces;

public class ConsoleLoggerConfiguration : ILoggerConfiguration
{
    public void LogDebug(string caller, string message)
        => Console.WriteLine($"[DBG] [{caller}] {message}");

    public void LogInfo(string message)
        => Console.WriteLine($"[INF] {message}");

    public void LogWarning(string message)
        => Console.WriteLine($"[WRN] {message}");

    public void LogError(string message)
        => Console.Error.WriteLine($"[ERR] {message}");

    public void LogCritical(string message)
        => Console.Error.WriteLine($"[CRT] {message}");

    public void LogException(Exception exception)
        => Console.Error.WriteLine($"[EXC] {exception}");

    public void WriteToLogFile(string logFilePath, string message, LogLevel level)
    {
        // Append to file; implement however your platform requires
        System.IO.File.AppendAllText(logFilePath, $"[{level}] {message}{Environment.NewLine}");
    }
}
```

### Example: Unity logger

```csharp
using System;
using UnityEngine;
using WaggleBum.WagSave.Core.Enums;
using WaggleBum.WagSave.Core.Interfaces;

public class UnityLoggerConfiguration : ILoggerConfiguration
{
    public void LogDebug(string caller, string message) => Debug.Log($"[WagSave][{caller}] {message}");
    public void LogInfo(string message)                 => Debug.Log($"[WagSave] {message}");
    public void LogWarning(string message)              => Debug.LogWarning($"[WagSave] {message}");
    public void LogError(string message)                => Debug.LogError($"[WagSave] {message}");
    public void LogCritical(string message)             => Debug.LogError($"[WagSave][CRITICAL] {message}");
    public void LogException(Exception exception)       => Debug.LogException(exception);

    public void WriteToLogFile(string logFilePath, string message, LogLevel level)
    {
        System.IO.File.AppendAllText(logFilePath,
            $"[{System.DateTime.Now:O}][{level}] {message}{System.Environment.NewLine}");
    }
}
```

### Registering the logger

```csharp
using WaggleBum.WagSave.Core.Logging;
using WaggleBum.WagSave.Core.Enums;

Logger.Configuration       = new UnityLoggerConfiguration();
Logger.LogThreshold        = LogLevel.Info;
Logger.LogToFileEnabled    = false;
Logger.FileLogThreshhold   = LogLevel.Warning;
```

Do this before constructing any `SaveSlotManager` or calling `SaveTargetDestination.GetSaveTarget()`.

---

## Checklist for New Extensions

### New type serializer

- [ ] Extends `TypeSerialization` (preferred) or implements `ITypeSerialization` directly
- [ ] Uses `CultureInfo.InvariantCulture` for all number/date formatting
- [ ] Registered via `TypeSerializationFactory.OnGetTypeSerialization` or `TypeSerializationFactory.Set()`
- [ ] Round-trip tested: `Deserialize(Serialize(value))` equals `value`

### New save target

- [ ] Extends `MemorySaveTarget` (cloud/platform) or `FileSaveTarget` (file) or `ISaveTarget` directly
- [ ] Has a public constructor accepting exactly `(SaveTargetSettings settings)`
- [ ] Registered via `SaveTargetDestination.Create()` and `SaveTargetDestination.OnGetCustomSaveTargetDestinations`
- [ ] `Dispose()` calls `GC.SuppressFinalize(this)` (handled by base classes; verify if you override `Dispose`)
- [ ] Testable without any external dependency in isolation (use `MemorySaveTarget` fallback in tests)

### New ISaveSystem implementation

- [ ] Raises all five lifecycle events (`OnSaveStart`, `OnProgress`, `OnSaveCompleted`, `OnLoadStart`, `OnLoadCompleted`)
- [ ] Sets `IsSaving`/`IsLoading` correctly around the operation
- [ ] Calls `slot.Open()` before accessing data and `slot.Close()` when done (ideally in a `try/finally`)
- [ ] Calls `manager.FlushSlotList()` after modifying slot metadata

### New ILoggerConfiguration

- [ ] Implements all seven methods; none should throw
- [ ] `WriteToLogFile` appends rather than overwrites the log file
- [ ] Assigned to `Logger.Configuration` before any WagSave operations
