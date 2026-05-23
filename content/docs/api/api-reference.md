# API Reference

This document covers every public type in `WaggleBum.WagSave.Core`.

---

## Table of Contents

- [Interfaces](#interfaces)
  - [ISaveSystem](#isavesystem)
  - [ISaveTarget](#isavetarget)
  - [ISaveManager](#isavemanager)
  - [ITypeSerialization](#itypeserialization)
  - [ILoggerConfiguration](#iloggerconfiguration)
  - [ISaveTargetSettings](#isavetargetsettings)
- [Save Slots](#save-slots)
  - [SaveSlot](#saveslot)
  - [EmptySaveSlot](#emptysaveslot)
  - [SaveSlotManager](#saveslotmanager)
  - [SaveSlotsSettings](#saveslotssettings)
- [Save Targets](#save-targets)
  - [SaveTargetDestination](#savetargetdestination)
  - [SaveTargetDestinationFlags](#savetargetdestinationflags)
  - [MemorySaveTarget](#memorysavetarget)
  - [JsonFile / BinaryFile / TextFile](#jsonfile--binaryfile--textfile)
  - [JsonIndexedFile / BinaryIndexedFile / TextIndexedFile](#jsonindexedfile--binaryindexedfile--textindexedfile)
- [Abstract Base Classes](#abstract-base-classes)
  - [SaveTarget](#savetarget-abstract)
  - [FileSaveTarget](#filesavetarget-abstract)
  - [IndexedFileSaveTarget](#indexedfilesavetarget-abstract)
  - [TypeSerialization](#typeserialization-abstract)
- [Settings](#settings)
  - [SaveTargetSettings](#savetargetsettings)
  - [SaveTargetOptions](#savetargetoptions)
  - [SaveTargetFileSettings](#savetargetfilesettings)
  - [SaveTargetFileOptions](#savetargetfileoptions)
  - [SaveFileProperties](#savefileproperties)
  - [JsonFileSettings](#jsonfilesettings)
  - [SaveTargetIndexedFileSettings](#savetargetindexedfilesettings)
- [Serialization](#serialization)
  - [TypeSerializationFactory](#typeserializationfactory)
- [Attributes](#attributes)
  - [WagSaveAttribute](#wagsaveattribute)
  - [WagSaveFieldAttribute](#wagsavefieldattribute)
- [Enums](#enums)
- [Delegates](#delegates)
- [Exceptions](#exceptions)
- [Logger](#logger)
- [Utilities](#utilities)
  - [Guard](#guard)
  - [CompressionHelper](#compressionhelper)
  - [DataEncryptor](#dataencryptor)
  - [FileVerifier](#fileverifier)
  - [BoundedStack\<T\>](#boundedstackt)

---

## Interfaces

### ISaveSystem

**Namespace:** `WaggleBum.WagSave.Core.Interfaces`

Top-level orchestration interface. The core library defines this contract but does not provide a concrete implementation. You supply one that integrates with your application's save/load lifecycle.

```csharp
public interface ISaveSystem
```

| Member | Description |
|---|---|
| `void Save(SaveSlot? slot = null)` | Save all registered data, optionally to a specific slot. |
| `void Load(SaveSlot? slot = null)` | Load all saved data, optionally from a specific slot. |
| `bool IsSaving { get; }` | Whether a save operation is currently in progress. |
| `bool IsLoading { get; }` | Whether a load operation is currently in progress. |
| `int Progress { get; }` | Current operation progress, 0–100. |
| `event OnSaveStartHandler OnSaveStart` | Raised when a save begins. |
| `event OnProgressHandler OnProgress` | Raised when progress advances. Argument is 0–100. |
| `event OnSaveCompletedHandler OnSaveCompleted` | Raised when a save finishes. |
| `event OnLoadStartHandler OnLoadStart` | Raised when a load begins. |
| `event OnLoadCompletedHandler OnLoadCompleted` | Raised when a load finishes. |

See [Getting Started § Implementing ISaveSystem](getting-started.md#11-implementing-isavesystem) for a worked example.

---

### ISaveTarget

**Namespace:** `WaggleBum.WagSave.Core.Interfaces`

Key-value store contract for a single save destination. Implemented by `MemorySaveTarget`, `FileSaveTarget`, and `IndexedFileSaveTarget` (and their concrete subclasses).

```csharp
public interface ISaveTarget : IDisposable
```

| Member | Description |
|---|---|
| `DateTime? Created { get; }` | When data in this target was first created. |
| `DateTime? LastModified { get; }` | When data in this target was last modified. |
| `void AddOrUpdate(string key, object? value, string? groupName = null)` | Add or update a value. |
| `object? Get(string key, string? groupName = null)` | Get a value as `object`. |
| `Task<object?> GetAsync(string key, string? groupName = null)` | Get a value asynchronously. |
| `T? Get<T>(string key, string? groupName = null)` | Get a strongly typed value. |
| `Task<T?> GetAsync<T>(string key, string? groupName = null)` | Get a strongly typed value asynchronously. |
| `void Remove(string key, string? groupName = null)` | Remove a value by key. |
| `object[] ReadAll()` | Return all values. |
| `string[] ReadAllKeys()` | Return all keys. |
| `void Save()` | Persist all changes. |
| `Task SaveAsync()` | Persist all changes asynchronously. |
| `void Load()` | Load saved data into the target. |
| `Task LoadAsync()` | Load saved data asynchronously. |
| `void Clear()` | Delete all saved data (and the file, for file targets). |
| `Task ClearAsync()` | Delete all saved data asynchronously. |

**Key rules:**
- Keys are case-sensitive strings. They must not be null or empty; `Guard.AgainstInvalidKey` is called at entry.
- When `groupName` is supplied, the key is stored internally as `{groupName}:{key}`. Use the same `groupName` on both read and write.
- `Dispose()` on file-based targets flushes any dirty data and signs the file if signing is enabled.

---

### ISaveManager

**Namespace:** `WaggleBum.WagSave.Core.Interfaces`

Manages the lifecycle of save slots.

```csharp
public interface ISaveManager : IDisposable
```

| Member | Description |
|---|---|
| `SaveSlot? AddNewSlot(SaveSlotType slotType, int atIndex)` | Create a new slot at `atIndex`. Returns `null` when at capacity with no overwrite. |
| `Task<SaveSlot?> AddNewSlotAsync(SaveSlotType slotType, int atIndex)` | Async variant. |
| `SaveSlot? OverwriteSlot(SaveSlotType slotType, int atIndex)` | Overwrite the slot at `atIndex`, deleting any existing data. |
| `Task<SaveSlot?> OverwriteSlotAsync(SaveSlotType slotType, int atIndex)` | Async variant. |
| `SaveSlot? GetSlot(string id)` | Get a slot by its GUID. |
| `SaveSlot? GetSlot(int slotIndex)` | Get a slot by its list index. |
| `void DeleteSlot(string id)` | Delete a slot by GUID. |
| `Task DeleteSlotAsync(string id)` | Async variant. |
| `void DeleteSlot(int slotIndex)` | Delete a slot by list index. |
| `Task DeleteSlotAsync(int slotIndex)` | Async variant. |
| `void DeleteAllSlots()` | Delete all non-temporary slots. |
| `Task DeleteAllSlotsAsync()` | Async variant. |

---

### ITypeSerialization

**Namespace:** `WaggleBum.WagSave.Core.Interfaces`

Contract for a type-specific serializer. Implement this to add support for types the library does not handle natively.

```csharp
public interface ITypeSerialization
{
    string? Serialize(object obj);
    object? Deserialize(string serializedObject, object? parentObject = null);
}
```

| Member | Description |
|---|---|
| `string? Serialize(object obj)` | Convert `obj` to its string representation. Return `null` only if `obj` itself is null. |
| `object? Deserialize(string serializedObject, object? parentObject = null)` | Reconstruct an object from its string representation. `parentObject` provides optional context (e.g., a Unity GameObject). |

---

### ILoggerConfiguration

**Namespace:** `WaggleBum.WagSave.Core.Interfaces`

Platform-specific logging backend. Assign an implementation to `Logger.Configuration` to redirect log output.

```csharp
public interface ILoggerConfiguration
{
    void LogDebug(string caller, string message);
    void LogInfo(string message);
    void LogWarning(string message);
    void LogError(string message);
    void LogCritical(string message);
    void LogException(Exception exception);
    void WriteToLogFile(string logFilePath, string message, LogLevel level);
}
```

| Member | Description |
|---|---|
| `LogDebug(string caller, string message)` | Verbose output. `caller` is the fully qualified method name captured by `[CallerMemberName]`. |
| `LogInfo(string message)` | Informational message. |
| `LogWarning(string message)` | Warning that does not stop execution. |
| `LogError(string message)` | Error that has been handled but should be investigated. |
| `LogCritical(string message)` | Severe failure. |
| `LogException(Exception exception)` | Full exception including stack trace. |
| `WriteToLogFile(string logFilePath, string message, LogLevel level)` | Called when `Logger.LogToFileEnabled` is `true`. You control the write implementation. |

---

### ISaveTargetSettings

**Namespace:** `WaggleBum.WagSave.Core.Interfaces`

Implemented by any settings class that can resolve its own `SaveTargetDestination`.

```csharp
public interface ISaveTargetSettings
{
    SaveTargetDestination GetDestination();
}
```

---

## Save Slots

### SaveSlot

**Namespace:** `WaggleBum.WagSave.Core.SaveSlots`

Represents one save game slot. Holds metadata and provides save/load access to the underlying `ISaveTarget`.

**Public fields (metadata — serialized as the slot list)**

| Field | Type | Description |
|---|---|---|
| `Id` | `string` | Unique GUID generated on construction. |
| `SlotNumber` | `int` | Ordering number. |
| `Title` | `string` | Display title (e.g., "Chapter 1"). |
| `Summary` | `string` | Short description. |
| `Type` | `SaveSlotType` | `Manual`, `Quick`, `Auto`, or `Temporary`. |
| `SaveSettings` | `SaveTargetSettings?` | Storage configuration for this slot's data file. |
| `TotalPlaySeconds` | `float` | Accumulated play time in seconds. |
| `Created` | `DateTime` | When the slot was created. |
| `Modified` | `DateTime` | When the slot was last saved. |
| `Thumbnail` | `string?` | Optional path to a screenshot thumbnail. |
| `ExtendedProperties` | `Dictionary<string, string>` | Arbitrary custom metadata. |

**Properties**

| Property | Description |
|---|---|
| `bool IsEmpty { get; }` | `true` if this slot is an `EmptySaveSlot` placeholder. |

**Constructors**

```csharp
SaveSlot()              // Creates a non-empty slot with a new GUID
SaveSlot(bool isEmpty)  // Pass true to create an empty placeholder
```

**Methods**

| Method | Description |
|---|---|
| `void Open()` | Opens the underlying save target, loading existing data from disk. |
| `Task OpenAsync()` | Opens asynchronously. |
| `void Close()` | Saves dirty data and releases the underlying target. |
| `ISaveTarget? GetSaveTarget()` | Returns the underlying `ISaveTarget` after `Open()`. |
| `Task<ISaveTarget?> GetSaveTargetAsync()` | Returns the target asynchronously. |
| `void Save(string key, object value)` | Write a value. |
| `Task SaveAsync(string key, object value)` | Write a value asynchronously. |
| `void Save<T>(string key, T value)` | Write a strongly typed value. |
| `Task SaveAsync<T>(string key, T value)` | Async variant. |
| `object? Load(string key)` | Read a value. |
| `Task<object?> LoadAsync(string key)` | Read asynchronously. |
| `T? Load<T>(string key)` | Read a strongly typed value. |
| `Task<T?> LoadAsync<T>(string key)` | Async variant. |
| `void Clear()` | Delete all data for this slot. |
| `Task ClearAsync()` | Async variant. |
| `void UpdateModifiedState(bool resetCreated = false)` | Update `Modified` (and optionally `Created`) to `DateTime.Now`. |
| `bool Equals(SaveSlot? other)` | Compare by `Id`. |
| `void Dispose()` | Calls `Close()`. |

---

### EmptySaveSlot

**Namespace:** `WaggleBum.WagSave.Core.SaveSlots`

A placeholder slot used in static-layout slot lists. `IsEmpty` is always `true`. It has no underlying storage and all save/load methods are no-ops.

```csharp
public class EmptySaveSlot : SaveSlot
{
    public EmptySaveSlot() : base(isEmpty: true) { }
}
```

---

### SaveSlotManager

**Namespace:** `WaggleBum.WagSave.Core.SaveSlots`
**Implements:** `ISaveManager`, `IDisposable`

Central manager for the slot list. On construction it loads the existing slot list from disk. On `Dispose` it flushes any changes.

**Constructor**

```csharp
public SaveSlotManager(SaveSlotsSettings settings)
```

**Properties**

| Property | Description |
|---|---|
| `SaveSlot[] Slots { get; }` | All slots, including `EmptySaveSlot` placeholders in static mode. |
| `int Count { get; }` | Number of non-empty, non-temporary slots. |
| `int Capacity { get; }` | Configured maximum. `0` = unlimited. |
| `bool IsAtCapacity { get; }` | Whether the non-temporary slot count has reached `Capacity`. |
| `event OnSlotListChangedHandler? OnSlotListChanged` | Raised whenever a slot is added, deleted, or overwritten. |

**Methods**

| Method | Description |
|---|---|
| `SaveSlot? AddNewSlot(SaveSlotType slotType = Manual, int atIndex = 0)` | Add a new slot. Returns `null` at capacity when `OverwriteAtCapacity` is `false`. |
| `Task<SaveSlot?> AddNewSlotAsync(SaveSlotType slotType, int atIndex)` | Async variant. |
| `SaveSlot? OverwriteSlot(SaveSlotType type, int atIndex)` | Replace an existing slot, deleting its data file. |
| `Task<SaveSlot?> OverwriteSlotAsync(SaveSlotType type, int atIndex)` | Async variant. |
| `SaveSlot? GetSlot(string id)` | Find a slot by GUID. Returns `null` if not found. |
| `SaveSlot? GetSlot(int slotIndex)` | Find a slot by list index. |
| `SaveSlot? GetLatestSlot()` | Return the slot with the most recent `Modified` timestamp. |
| `SaveSlot[] GetSlots(bool includeEmptySlots = false)` | All slots, optionally including empty placeholders. |
| `SaveSlot[] GetSlots(SaveSlotType type, bool includeEmptySlots = true)` | Slots of a specific type. |
| `Dictionary<SaveSlotType, List<SaveSlot>> GetSlotsOrderedByType()` | Group slots by `SaveSlotType`. |
| `int GetSlotIndex(string id)` | Index of a slot by GUID. Returns `-1` if not found. |
| `void FlushSlotList()` | Immediately persist the slot list metadata to disk. |
| `void Close()` | Flush and release all resources. |
| `void Dispose()` | Calls `Close()`. |
| `void DeleteSlot(string id)` | Delete a slot by GUID. |
| `Task DeleteSlotAsync(string id)` | Async variant. |
| `void DeleteSlot(int slotIndex)` | Delete a slot by index. |
| `Task DeleteSlotAsync(int slotIndex)` | Async variant. |
| `void DeleteAllSlots()` | Delete all non-temporary slots and their data files. |
| `Task DeleteAllSlotsAsync()` | Async variant. |
| `Task LoadAsync()` | Reload the slot list from disk. |

---

### SaveSlotsSettings

**Namespace:** `WaggleBum.WagSave.Core.SaveSlots`

Configuration passed to `SaveSlotManager`.

**Constructor**

```csharp
public SaveSlotsSettings(
    string            slotListDestinationId,
    string            slotDestinationId,
    SaveSlotListType  listType             = SaveSlotListType.Dynamic,
    int               capacity             = 0,
    bool              overwriteAtCapacity  = true,
    string?           saveTargetFileBasePath = null)
```

**Public fields**

| Field | Type | Default | Description |
|---|---|---|---|
| `IsEnabled` | `bool` | `false` | Whether the slot system is active. Set to `true` before use. |
| `IncludeScreenshotThumbnail` | `bool` | `false` | Capture a screenshot on save (Unity-side only). |
| `SlotListDestinationId` | `string` | — | Destination ID for the slot list metadata file. |
| `SlotDestinationId` | `string` | — | Destination ID for individual slot data files. |
| `ListType` | `SaveSlotListType` | `Dynamic` | `Static` or `Dynamic` list layout. |
| `Capacity` | `int` | `0` | Max slot count. `0` = unlimited. |
| `OverwriteAtCapacity` | `bool` | `true` | Overwrite oldest auto-save when full. |
| `SlotListFileName` | `string` | `"SlotList"` | File name (without extension) of the slot list file. |
| `SlotListFileExtension` | `string` | `"slots"` | Extension for the slot list file. |
| `SlotFileNameExtension` | `string` | `"slot"` | Extension for individual slot files. |
| `SlotsFolderName` | `string` | `"SaveSlots"` | Folder under `BasePath` where slots are stored. |
| `GetEmptySaveSlot` | `Func<SaveSlot, SaveSlot>?` | `null` | Factory for customizing empty placeholder slots. `[NonSerialized]` |
| `GetNewSaveSlot` | `Func<SaveSlotType, SaveSlot, SaveSlot>?` | `null` | Factory for customizing newly created slots. `[NonSerialized]` |

**Methods**

| Method | Description |
|---|---|
| `string? GetSaveTargetFileBasePath()` | Returns the base path provided at construction, or `null`. |
| `SaveTargetSettings GetSlotTargetSettings()` | Build settings for an individual slot's data file. |
| `SaveTargetSettings GetSlotListTargetSettings()` | Build settings for the slot list metadata file. |
| `void ResetToDefaults()` | Reset to dynamic, unlimited, binary indexed defaults. |

---

## Save Targets

### SaveTargetDestination

**Namespace:** `WaggleBum.WagSave.Core.SaveTargets`

Factory and registry for `ISaveTarget` implementations. Provides seven built-in destinations and an extension point for custom ones.

**Built-in static instances**

| Property | ID string | Type |
|---|---|---|
| `SaveTargetDestination.JsonFile` | `"wagsave_json"` | `JsonFile` |
| `SaveTargetDestination.BinaryFile` | `"wagsave_binary"` | `BinaryFile` |
| `SaveTargetDestination.TextFile` | `"wagsave_text"` | `TextFile` |
| `SaveTargetDestination.JsonIndexedFile` | `"wagsave_json_indexed"` | `JsonIndexedFile` |
| `SaveTargetDestination.BinaryIndexedFile` | `"wagsave_binary_indexed"` | `BinaryIndexedFile` |
| `SaveTargetDestination.TextIndexedFile` | `"wagsave_text_indexed"` | `TextIndexedFile` |
| `SaveTargetDestination.Memory` | `"wagsave_memory"` | `MemorySaveTarget` |
| `SaveTargetDestination.Default` | — | Same as `BinaryIndexedFile` |

**Instance members** (read-only on built-in instances)

| Member | Type | Description |
|---|---|---|
| `Id` | `string` | Unique identifier. Use when constructing `SaveTargetSettings`. |
| `Name` | `string` | Display name. |
| `GroupName` | `string?` | Category (e.g., `"File"`, `"System"`). |
| `Description` | `string?` | Human-readable description. |
| `SaveTargetType` | `Type` | The concrete `ISaveTarget` type this destination creates. |
| `Flags` | `SaveTargetDestinationFlags` | Capability flags. |

**Static methods**

| Method | Description |
|---|---|
| `ISaveTarget GetSaveTarget(SaveTargetSettings settings)` | Create and `Load()` a target. Returns a ready-to-use `ISaveTarget`. |
| `Task<ISaveTarget> GetSaveTargetAsync(SaveTargetSettings settings)` | Create and load asynchronously. |
| `SaveTargetDestination FromId(string id)` | Resolve by ID. Falls back to `Default` if not found (logs an error). |
| `SaveTargetDestination Create(string id, string name, Type saveTargetType, string? groupName = null, string? description = null)` | Register a custom destination. The `saveTargetType` must implement `ISaveTarget`. |

**Static properties**

| Property | Description |
|---|---|
| `SaveTargetDestination[] All` | All built-in + custom destinations. |
| `List<string> GroupNames` | Distinct group names across all destinations. |

**Extension event**

```csharp
public static event OnGetCustomSaveTargetDestinationsHandler? OnGetCustomSaveTargetDestinations;
```

Subscribe to this event to expose custom destinations to the registry. See [Extending WagSave](extending.md#custom-save-target).

---

### SaveTargetDestinationFlags

**Namespace:** `WaggleBum.WagSave.Core.SaveTargets`

Capability flags for a destination.

| Field | Description |
|---|---|
| `bool IsFileOutput` | Whether the destination writes to the file system. |
| `bool IsUnity` | Unity-specific destination. |
| `bool IsUnreal` | Unreal Engine-specific destination. |
| `bool IsCloud` | Cloud storage destination. |

---

### MemorySaveTarget

**Namespace:** `WaggleBum.WagSave.Core.SaveTargets`
**Inherits:** `SaveTarget`
**Implements:** `IEnumerable<(string Key, object Value)>`, `ISaveTarget`

In-process key-value store. `Save()` and `Load()` are no-ops. Data is lost when the object is disposed.

**Constructors**

```csharp
MemorySaveTarget()                                       // Empty dictionary
MemorySaveTarget(Dictionary<string, object> saveData)    // Pre-populated
MemorySaveTarget(SaveTargetSettings settings)            // Settings ignored; empty dictionary
```

**Additional members**

| Member | Description |
|---|---|
| `int Count { get; }` | Number of stored entries. |
| `event OnDataChangedHandler? OnDataChanged` | Raised on `AddOrUpdate` or `Remove`. |
| `IEnumerator<(string Key, object Value)> GetEnumerator()` | Enumerate all key-value pairs. |

---

### JsonFile / BinaryFile / TextFile

**Namespace:** `WaggleBum.WagSave.Core.SaveTargets.File`
**Inherits:** `FileSaveTarget`

Concrete in-memory-buffered file targets. The entire file is loaded into a dictionary on `Load()` and the entire dictionary is written back on `Save()`.

**Constructor** (all three have the same signature)

```csharp
public JsonFile(SaveTargetSettings settings)
public BinaryFile(SaveTargetSettings settings)
public TextFile(SaveTargetSettings settings)
```

**File formats:**
- `JsonFile` — UTF-8 JSON. Each entry is `{"key": {"format": "TypeName", "value": "serializedValue"}}`. Optional pretty-printing via `settings.File.Json.PrettyPrint`.
- `BinaryFile` — Binary: entry count (int32), then for each entry: key (string), type name (string), serialized value (string).
- `TextFile` — ASCII text. One entry per line: `key=typeName:serializedValue`. Complex objects are JSON-encoded within the value.

---

### JsonIndexedFile / BinaryIndexedFile / TextIndexedFile

**Namespace:** `WaggleBum.WagSave.Core.SaveTargets.IndexedFile`
**Inherits:** `IndexedFileSaveTarget`

Concrete indexed file targets. A `SaveFileIndex` records the byte offset and size of each entry so individual values can be read and written without loading the full file.

**Constructor** (all three have the same signature)

```csharp
public JsonIndexedFile(SaveTargetSettings settings)
public BinaryIndexedFile(SaveTargetSettings settings)
public TextIndexedFile(SaveTargetSettings settings)
```

---

## Abstract Base Classes

### SaveTarget (abstract)

**Namespace:** `WaggleBum.WagSave.Core.Abstracts.SaveTargets`
**Implements:** `ISaveTarget`

Root abstract class. Defines the full `ISaveTarget` contract as abstract members plus one utility method.

```csharp
public static string GetFormattedKey(string key, string? groupName)
```

Returns `"{groupName}:{key}"` when `groupName` is non-empty, or just `key` otherwise. Uses this internally; you rarely need to call it directly.

---

### FileSaveTarget (abstract)

**Namespace:** `WaggleBum.WagSave.Core.Abstracts.SaveTargets`
**Inherits:** `MemorySaveTarget`

Abstract base for file-backed targets. Manages the dirty flag, signing on dispose, and a finalizer safety net.

**Key behavior:**
- `Load()` calls `LoadSaveData()` and resets `IsDirty` to `false`.
- `AddOrUpdate()` and `Remove()` set `IsDirty = true`.
- `Dispose()` saves and signs the file when `IsDirty` is `true`.
- A finalizer calls `Save()` in a try/catch as a last resort.

**Members you implement**

```csharp
protected abstract Dictionary<string, object> LoadSaveData();
protected abstract Task<Dictionary<string, object>> LoadSaveDataAsync();
```

**Protected members available to subclasses**

| Member | Description |
|---|---|
| `bool IsDirty` | Whether unsaved changes exist. |
| `SaveTargetSettings Settings` | Configuration for this target. |
| `FileInfo SaveFile` | Resolved `FileInfo` from `Settings.File.GetFileInfo()`. |

See [Extending WagSave § Custom File Save Target](extending.md#custom-file-save-target) for a full implementation example.

---

### IndexedFileSaveTarget (abstract)

**Namespace:** `WaggleBum.WagSave.Core.Abstracts.SaveTargets`
**Inherits:** `SaveTarget`

Abstract base for indexed file targets. Uses a `SaveFileIndex` to track per-entry byte offsets and sizes. Each read/write operates directly on the file stream.

**Members you can override**

```csharp
protected virtual string GetFileHeader()
protected virtual string GetFileFooter()
protected virtual string GetFormattedValue(string key, string serializedValue)
protected virtual string GetSerializedValueFromFormattedValue(string formattedValue)
```

**Protected utility methods**

```csharp
protected void AdjustFileSize(long startOffset, int sizeDifference)
protected void AdjustFileSize(FileStream stream, long startOffset, int sizeDifference)
```

`AdjustFileSize` shifts the bytes after `startOffset` when an entry grows or shrinks, keeping the index consistent.

---

### TypeSerialization (abstract)

**Namespace:** `WaggleBum.WagSave.Core.Abstracts.Serialization`
**Implements:** `ITypeSerialization`

Abstract base class for type serializers. Handles null guards and logging; subclasses only implement the core logic.

**Constructor**

```csharp
protected TypeSerialization(Type serializationType)
```

**Methods you implement**

```csharp
protected abstract string? HandleSerialize(object obj);
protected abstract object? HandleDeserialize(string serializedObject, object? parentObject = null);
```

**Protected helpers**

| Method | Description |
|---|---|
| `T GetObject<T>(object obj)` | Safe-cast `obj` to `T`; throws `InvalidCastException` on failure. |
| `static string GetTypeName(Type type)` | Returns the portable type name (primitive name or `"{FullName},{AssemblyName}"`). |
| `static bool IsPrimitive(Type type)` | Returns `true` for C# primitive types, `string`, `decimal`, and nullable primitives. |

**Static helpers**

| Method | Description |
|---|---|
| `static Type GetTypeFromName(string typeName)` | Reconstruct a `Type` from a type name string. |
| `static string? GetTypeName(object? value)` | Get the portable type name from a value instance. |

---

## Settings

### SaveTargetSettings

**Namespace:** `WaggleBum.WagSave.Core.SaveTargets.Settings`

Top-level configuration for a save target. Pass to `SaveTargetDestination.GetSaveTarget()`.

```csharp
[Serializable]
public class SaveTargetSettings
```

| Field | Type | Default | Description |
|---|---|---|---|
| `TargetId` | `string` | `""` | Optional identifier for this settings instance. |
| `SaveTargetDestinationId` | `string` | `BinaryIndexedFile.Id` | Which destination to use. |
| `Options` | `SaveTargetOptions` | — | Encryption/compression settings. |
| `File` | `SaveTargetFileSettings` | — | File system settings. |

**Constructors**

```csharp
SaveTargetSettings()                                 // Default: BinaryIndexedFile
SaveTargetSettings(SaveTargetDestination destination) // Specific destination
```

**Methods**

| Method | Description |
|---|---|
| `SaveTargetDestination? GetDestination()` | Resolve the `SaveTargetDestination` by ID. |
| `void Validate()` | Validate that the destination exists and the file path is accessible. Throws on failure. |
| `void ResetToDefaults()` | Reset `SaveTargetDestinationId` to `BinaryIndexedFile`. |

---

### SaveTargetOptions

**Namespace:** `WaggleBum.WagSave.Core.SaveTargets.Settings`

Encryption and compression settings.

```csharp
[Serializable]
public class SaveTargetOptions
```

| Field | Type | Description |
|---|---|---|
| `EncryptData` | `bool` | Whether to encrypt data before writing. |
| `EncryptPublicKey` | `string?` | Base64-encoded RSA public key for encryption. |
| `EncryptPrivateKey` | `string?` | Base64-encoded RSA private key for decryption. **`[NonSerialized]`** — never persisted. |
| `CompressData` | `bool` | Whether to GZip-compress data before writing (and after decryption when reading). |

Compression is applied before encryption on write, and reversed (decrypt then decompress) on read.

---

### SaveTargetFileSettings

**Namespace:** `WaggleBum.WagSave.Core.SaveTargets.Settings`

File system settings for file-based targets.

```csharp
[Serializable]
public class SaveTargetFileSettings
```

| Member | Type | Description |
|---|---|---|
| `static BasePath` | `string?` | **Static.** Root directory for all save files. Defaults to the executing assembly's directory. Set this once at startup. |
| `Options` | `SaveTargetFileOptions` | File signing settings. |
| `Properties` | `SaveFileProperties` | File name, extension, and folder name. |
| `Json` | `JsonFileSettings` | JSON formatting. |
| `Indexed` | `SaveTargetIndexedFileSettings` | Indexed file settings. |

| Method | Description |
|---|---|
| `string GetSaveFilePath()` | Returns `{BasePath}/{FolderName}/{FileName}.{FileExtension}`. Sets `BasePath` to the assembly directory if empty. |
| `FileInfo GetFileInfo()` | Returns a `FileInfo`, creating the parent directory if it does not exist. |
| `void Validate()` | Ensures the directory is accessible. Throws `IOException` or `UnauthorizedAccessException` on failure. |

---

### SaveTargetFileOptions

**Namespace:** `WaggleBum.WagSave.Core.SaveTargets.Settings`

File integrity settings.

| Field | Type | Description |
|---|---|---|
| `SignFileOutput` | `bool` | Sign the file with HMAC-SHA256 on save; verify on load. |
| `SignFileSecretKey` | `string?` | Base64-encoded secret key for signing. |

---

### SaveFileProperties

**Namespace:** `WaggleBum.WagSave.Core.SaveTargets.Settings`

File naming configuration.

| Field | Type | Default | Description |
|---|---|---|---|
| `FileName` | `string` | `"Save"` | File name without extension. |
| `FileExtension` | `string` | `"sav"` | File extension without the leading dot. |
| `FolderName` | `string` | `""` | Subfolder under `BasePath`. Leave empty to save directly in `BasePath`. |

---

### JsonFileSettings

**Namespace:** `WaggleBum.WagSave.Core.SaveTargets.Settings`

JSON-specific formatting settings.

| Field | Type | Default | Description |
|---|---|---|---|
| `PrettyPrint` | `bool` | `false` | Indent and format the JSON output for readability. |

---

### SaveTargetIndexedFileSettings

**Namespace:** `WaggleBum.WagSave.Core.SaveTargets.Settings`

Settings specific to indexed file targets.

| Field | Type | Default | Description |
|---|---|---|---|
| `ValueSeparator` | `string` | `"|"` | Delimiter between the key and value in the file. Set to `","` automatically for `JsonIndexedFile`. |
| `BufferSize` | `int` | `4096` | File stream buffer size in bytes. |

---

## Serialization

### TypeSerializationFactory

**Namespace:** `WaggleBum.WagSave.Core.Serialization`

Static registry that maps types to `ITypeSerialization` handlers. Called automatically by all save targets when serializing and deserializing values. You do not normally call this directly unless registering custom serializers.

**Built-in type coverage**

| Category | Types |
|---|---|
| Primitives | `bool`, `byte`, `sbyte`, `short`, `ushort`, `int`, `uint`, `long`, `ulong`, `float`, `double`, `char`, `decimal`, `string`, nullable variants |
| Special | `DateTime`, `TimeSpan`, `Guid`, `BigInteger` |
| Collections | `Dictionary<K,V>`, `Stack<T>`, `Queue<T>`, `ArrayList`, 1-D arrays (via `IEnumerable`), multi-dimensional arrays |
| Tuples | `ValueTuple<...>`, `Tuple<...>` |
| Objects | Reflection-based `CustomObjectSerialization` (fallback) |

**Static methods**

| Method | Description |
|---|---|
| `void Set(Type type, ITypeSerialization serializer)` | Register or replace a serializer for `type`. Evicts any cached resolution. |
| `ITypeSerialization Get(Type type)` | Resolve the serializer for `type`. Checks built-in registry, then the `OnGetTypeSerialization` event, then falls back to `CustomObjectSerialization`. |

**Extension event**

```csharp
public static event OnGetTypeSerializationHandler? OnGetTypeSerialization;
```

Raised when `Get()` cannot find a built-in handler. Your handler should return a serializer or `null` to fall through to the default.

---

## Attributes

### WagSaveAttribute

**Namespace:** `WaggleBum.WagSave.Core.Attributes`
**Target:** `AttributeTargets.Class`

Marks a class for WagSave serialization.

```csharp
[WagSave]
public class PlayerProfile { ... }

[WagSave(uniqueInstanceId: "settings", includeWagSaveOnly: true)]
public class GameSettings { ... }
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `uniqueInstanceId` | `string?` | `null` | If set, the class is treated as a singleton. The ID is used as the storage key instead of a runtime-generated GUID. |
| `includeWagSaveOnly` | `bool` | `false` | When `true`, only members marked with `[WagSaveField]` are serialized. |

**Read-only properties**

| Property | Description |
|---|---|
| `string Id` | The resolved stable ID (either `uniqueInstanceId` or `RuntimeId`). |
| `bool IncludeWagSaveOnly` | Whether only `[WagSaveField]` members are serialized. |
| `string RuntimeId` | GUID-based runtime identifier, generated once per class. |
| `bool IsSingleInstance` | `true` when `uniqueInstanceId` was provided. |

---

### WagSaveFieldAttribute

**Namespace:** `WaggleBum.WagSave.Core.Attributes`
**Target:** `AttributeTargets.Property | AttributeTargets.Field`

Marks a field or property for inclusion and optionally overrides its storage key.

```csharp
[WagSaveField("vol_master")]
public float MasterVolume = 1.0f;
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `key` | `string?` | `null` | Custom storage key. If `null`, the member name is used. Specifying a stable key means renaming the C# member in future will not break existing save files. |

**Static method**

```csharp
static (bool isValid, string message) IsValidKeys(Type type)
```

Validates that no two `[WagSaveField]` members on `type` share the same key. Call this in unit tests to catch duplicates at development time.

---

## Enums

### SaveSlotType

**Namespace:** `WaggleBum.WagSave.Core.Enums`

| Value | Description |
|---|---|
| `Manual` | Created by explicit player action (save menu). |
| `Quick` | Created by a hotkey (e.g., F5). |
| `Auto` | Created automatically at checkpoints. |
| `Temporary` | Internal; excluded from `Count` and not shown in save menus. |

---

### SaveSlotListType

**Namespace:** `WaggleBum.WagSave.Core.Enums`

| Value | Description |
|---|---|
| `Dynamic` | The list grows and shrinks as slots are added or removed. |
| `Static` | The list is padded with `EmptySaveSlot` placeholders up to `Capacity`. |

---

### LogLevel

**Namespace:** `WaggleBum.WagSave.Core.Enums`

| Value | Description |
|---|---|
| `Debug` | Verbose diagnostics for development. |
| `Info` | Informational messages about normal operations. |
| `Warning` | Potential problems that did not prevent execution. |
| `Error` | Failures that were handled but indicate a problem. |
| `Critical` | Severe failures requiring immediate attention. |
| `None` | Disables all output. |

---

### SelectionViewType

**Namespace:** `WaggleBum.WagSave.Core.Enums`

| Value | Description |
|---|---|
| `Tree` | Hierarchical tree view (used by the Unity Editor inspector). |
| `List` | Flat list view. |

---

## Delegates

**Namespace:** `WaggleBum.WagSave.Core`

| Delegate | Signature | Used by |
|---|---|---|
| `OnSaveStartHandler` | `delegate void ()` | `ISaveSystem.OnSaveStart` |
| `OnSaveCompletedHandler` | `delegate void ()` | `ISaveSystem.OnSaveCompleted` |
| `OnProgressHandler` | `delegate void (int progress)` | `ISaveSystem.OnProgress` |
| `OnLoadStartHandler` | `delegate void ()` | `ISaveSystem.OnLoadStart` |
| `OnLoadCompletedHandler` | `delegate void ()` | `ISaveSystem.OnLoadCompleted` |
| `OnSlotListChangedHandler` | `delegate void ()` | `SaveSlotManager.OnSlotListChanged` |
| `OnDataChangedHandler` | `delegate void ()` | `MemorySaveTarget.OnDataChanged` |
| `OnGetTypeSerializationHandler` | `delegate ITypeSerialization (Type type)` | `TypeSerializationFactory.OnGetTypeSerialization` |
| `OnGetCustomSaveTargetDestinationsHandler` | `delegate SaveTargetDestination[] ()` | `SaveTargetDestination.OnGetCustomSaveTargetDestinations` |

---

## Exceptions

**Namespace:** `WaggleBum.WagSave.Core.Exceptions`

The library follows a create → log → throw pattern. All exceptions are logged before being thrown.

```
Exception
  └── WaggleBumException
        └── WagSaveException
              └── SaveTargetException
                    └── TamperedSaveTargetException
```

| Type | Thrown when |
|---|---|
| `WaggleBumException` | Base class for all WaggleBum library exceptions. |
| `WagSaveException` | Base class for WagSave-specific errors. |
| `SaveTargetException` | A save target operation fails (e.g., cannot open a slot). |
| `TamperedSaveTargetException` | `Load()` is called on a signed file that fails HMAC verification. |

---

## Logger

**Namespace:** `WaggleBum.WagSave.Core.Logging`

`Logger` is a static class. Configure it once at startup.

**Static properties**

| Property | Type | Default | Description |
|---|---|---|---|
| `Configuration` | `ILoggerConfiguration?` | `null` | Platform backend. All output is dropped when `null`. |
| `LogThreshold` | `LogLevel` | `LogLevel.Info` | Messages below this level are not forwarded to `Configuration`. |
| `LogToFileEnabled` | `bool` | `false` | Whether to also write to a log file. |
| `LogFilePath` | `string` | `""` | Path to the log file. Only used when `LogToFileEnabled` is `true`. |
| `FileLogThreshhold` | `LogLevel` | `LogLevel.Warning` | Messages below this level are not written to the log file. |

**Static methods**

```csharp
static void Log(Exception ex)
static void Log(string message,
                LogLevel level = LogLevel.Info,
                [CallerMemberName] string callerMethod = "",
                [CallerFilePath]   string callerFile   = "")
```

The caller information (`callerMethod`, `callerFile`) is captured automatically by the compiler. You do not pass these arguments.

---

## Utilities

### Guard

**Namespace:** `WaggleBum.WagSave.Core.Utils`

Static defensive-check helpers used at public API entry points. Call these at the start of your own extension code for consistency.

| Method | Throws | When |
|---|---|---|
| `Guard.AgainstNull(object? value, string name)` | `ArgumentNullException` | `value` is `null` |
| `Guard.AgainstNullOrEmpty(string? value, string name)` | `ArgumentNullException` | `value` is `null` or empty |
| `Guard.AgainstInvalidKey(string key, string name)` | `ArgumentException` | `key` is null, empty, or contains invalid characters |
| `Guard.AgainstInvalidKeyGroupName(string groupName, string name)` | `ArgumentException` | `groupName` is invalid |
| `Guard.AgainstNumberNotInRange(long value, long min, long max, string name)` | `ArgumentOutOfRangeException` | `value` is not in `[min, max]` |

---

### CompressionHelper

**Namespace:** `WaggleBum.WagSave.Core.Utils`

GZip compression over Base64.

```csharp
static string CompressToBase64(string data)
static string DecompressFromBase64(string data)
```

Used internally when `SaveTargetOptions.CompressData` is `true`.

---

### DataEncryptor

**Namespace:** `WaggleBum.WagSave.Core.Utils`

RSA + AES hybrid encryption.

```csharp
static string Encrypt(string data, string publicKey)
static string Decrypt(string encryptedData, string privateKey)
```

`publicKey` and `privateKey` are Base64-encoded RSA key strings. Used internally when `SaveTargetOptions.EncryptData` is `true`.

---

### FileVerifier

**Namespace:** `WaggleBum.WagSave.Core.Utils`

HMAC-SHA256 file integrity signing and verification.

```csharp
static bool IsValid(FileInfo file, string secretKey)
static void SignFile(FileInfo file, string secretKey)
```

`secretKey` is a Base64-encoded secret. `SignFile` appends the signature to the file. `IsValid` returns `false` if the file has been tampered with or the signature is missing. Used internally when `SaveTargetFileOptions.SignFileOutput` is `true`.

---

### BoundedStack\<T\>

**Namespace:** `WaggleBum.WagSave.Core.Types`

A fixed-capacity stack with random-access read and overwrite.

```csharp
public class BoundedStack<T>
```

| Member | Description |
|---|---|
| `BoundedStack(int capacity)` | Create a stack with a fixed capacity. |
| `int Count { get; }` | Current number of items. |
| `int Capacity { get; }` | Maximum number of items. |
| `void Push(T item)` | Push an item. Oldest item is dropped when capacity is exceeded. |
| `T Pop()` | Remove and return the top item. |
| `T GetAt(int index)` | Return the item at `index` without removing it. |
| `void OverwriteAt(int index, T item)` | Replace the item at `index`. |
| `void RemoveAt(int index)` | Remove the item at `index`. |
| `void Resize(int newCapacity)` | Resize. Items beyond `newCapacity` are dropped from the bottom. |
| `void Clear()` | Remove all items. |
| `event Action<T[]>? OnItemsRemoved` | Raised with the removed items when capacity overflow occurs. |
