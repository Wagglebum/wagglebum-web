# WagSave Core — Documentation

`WaggleBum.WagSave.Core` is a platform-agnostic save game library for .NET Standard 2.1. It provides a slot-based save system, pluggable storage backends, and a type serialization framework — all with zero hard Unity dependencies.

---

## Documentation

| Document | Contents |
|---|---|
| [Getting Started](getting-started.md) | Adding the DLL, configuring the logger, first save/load |
| [API Reference](api-reference.md) | Every public type, method, property, and enum |
| [Extending WagSave](extending.md) | Custom type serializers, custom save targets, custom `ISaveSystem` |

---

## Namespace Map

| Namespace | Contents |
|---|---|
| `WaggleBum.WagSave.Core` | Top-level delegates and constants |
| `WaggleBum.WagSave.Core.Interfaces` | `ISaveSystem`, `ISaveTarget`, `ISaveManager`, `ITypeSerialization`, `ILoggerConfiguration`, `ISaveTargetSettings` |
| `WaggleBum.WagSave.Core.Abstracts.SaveTargets` | `SaveTarget`, `FileSaveTarget`, `IndexedFileSaveTarget` |
| `WaggleBum.WagSave.Core.Abstracts.Serialization` | `TypeSerialization`, `ObjectSerialization` |
| `WaggleBum.WagSave.Core.Attributes` | `[WagSave]`, `[WagSaveField]` |
| `WaggleBum.WagSave.Core.Enums` | `SaveSlotType`, `SaveSlotListType`, `LogLevel`, `SelectionViewType` |
| `WaggleBum.WagSave.Core.Exceptions` | `WaggleBumException`, `WagSaveException`, `SaveTargetException`, `TamperedSaveTargetException` |
| `WaggleBum.WagSave.Core.Logging` | `Logger` (static) |
| `WaggleBum.WagSave.Core.SaveSlots` | `SaveSlot`, `SaveSlotManager`, `SaveSlotsSettings`, `EmptySaveSlot` |
| `WaggleBum.WagSave.Core.SaveTargets` | `MemorySaveTarget`, `SaveTargetDestination`, `SaveTargetDestinationFlags` |
| `WaggleBum.WagSave.Core.SaveTargets.File` | `JsonFile`, `BinaryFile`, `TextFile` |
| `WaggleBum.WagSave.Core.SaveTargets.IndexedFile` | `JsonIndexedFile`, `BinaryIndexedFile`, `TextIndexedFile` |
| `WaggleBum.WagSave.Core.SaveTargets.Settings` | `SaveTargetSettings`, `SaveTargetOptions`, `SaveTargetFileSettings`, `SaveTargetFileOptions`, `SaveFileProperties`, `JsonFileSettings`, `SaveTargetIndexedFileSettings` |
| `WaggleBum.WagSave.Core.Serialization` | `TypeSerializationFactory` |
| `WaggleBum.WagSave.Core.Types` | `BoundedStack<T>` |
| `WaggleBum.WagSave.Core.Utils` | `Guard`, `CompressionHelper`, `DataEncryptor`, `FileVerifier` |

---

## Assembly Details

| Property | Value |
|---|---|
| Assembly | `WaggleBum.WagSave.Core` |
| Target framework | `netstandard2.1` |
| Language version | C# 9 |
| Nullable reference types | Enabled |
| External dependency | `Newtonsoft.Json 13.0.3` |

---

## Architecture at a Glance

```
Your Application
│
├── ISaveSystem (bring your own implementation)
│     └── SaveSlotManager  ←  manages slot list metadata
│           └── SaveSlot[]
│                 └── ISaveTarget  ←  the actual storage
│                       ├── MemorySaveTarget        (in-process only)
│                       ├── FileSaveTarget          (full-buffer file I/O)
│                       │     ├── JsonFile
│                       │     ├── BinaryFile
│                       │     └── TextFile
│                       └── IndexedFileSaveTarget   (random-access file I/O)
│                             ├── JsonIndexedFile
│                             ├── BinaryIndexedFile
│                             └── TextIndexedFile
│
├── TypeSerializationFactory  ←  serialize/deserialize any value
│     └── ITypeSerialization / TypeSerialization (abstract)
│
└── Logger (static)  ←  plug in your platform's logging backend
```
