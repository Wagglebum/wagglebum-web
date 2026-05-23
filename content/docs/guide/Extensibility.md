# Extensibility

WagSave is designed to be extended at every layer. You can replace the serialization format, swap in a new output backend, override save/load logic entirely, or hook into encryption key provisioning — all without modifying the package source.

---

## Save and Load Override

The simplest way to take full control of save and load behaviour is via the `OnSaveOverride` and `OnLoadOverride` events. When both are subscribed, WagSave skips its default component serialization and delegates entirely to your handlers.

Both events must be subscribed together — subscribing only one throws an `InvalidOperationException`.

```csharp
wagSave.OnSaveOverride += (slot, saveTarget) =>
{
    // Write whatever you want into saveTarget
    saveTarget.AddOrUpdate("myKey", myCustomData);
    // saveTarget.Save() is called automatically after this handler
};

wagSave.OnLoadOverride += (slot, saveTarget) =>
{
    // Read from saveTarget and apply to your game state
    var data = saveTarget.Get<MyCustomData>("myKey");
    ApplyToGame(data);
};
```

The `saveTarget` parameter is the configured save backend (Binary, JSON, etc.). You interact with it the same way regardless of which format is active:

```csharp
// Write a value
saveTarget.AddOrUpdate("key", value);

// Read a value
var value = saveTarget.Get<MyType>("key");

// Flush to disk / remote
saveTarget.Save();
```

This pattern is useful when you have your own serializable data model that does not map cleanly to `WagSaveComponent` reflection paths.

---

## Encryption Key Provisioning

When **Encrypt Data** is enabled, WagSave uses asymmetric encryption. The public key is stored in the WagSave asset. The private key is never stored by WagSave — you supply it at runtime via an event:

```csharp
wagSave.OnGetEncryptionPrivateKey += () =>
{
    // Load the private key from wherever you store it securely —
    // a remote server, a platform credential store, etc.
    return SecureKeyStorage.GetPrivateKey();
};
```

Alternatively, assign the key directly on the instance before the first save or load:

```csharp
wagSave.Settings.SaveTarget.Options.EncryptPrivateKey = SecureKeyStorage.GetPrivateKey();
```

The event is preferred as it defers key retrieval to the moment of use. Either approach is valid.

> **Security note:** Do not embed the private key as a plain string in your source code or ship it in plain text inside your build. Use a platform credential store or load it from a server on first launch.

---

## Custom Output Formats

Create a new output format by implementing the `ISaveTarget` interface from `WaggleBum.WagSave.Core.Interfaces`. Once registered, your format appears alongside the built-in formats in the editor dropdown.

```csharp
using WaggleBum.WagSave.Core.Interfaces;
using WaggleBum.WagSave.Core.SaveTargets;

public class MyCustomSaveTarget : ISaveTarget
{
    public void AddOrUpdate(string key, object value, string group = null) { /* ... */ }
    public object Get(string key, string group = null)                      { /* ... */ }
    public T Get<T>(string key, string group = null)                        { /* ... */ }
    public void Save()                                                      { /* ... */ }
    public void Load()                                                      { /* ... */ }
    public void Dispose()                                                   { /* ... */ }
}
```

Register it with `SaveTargetDestination` so WagSave can discover it:

```csharp
SaveTargetDestination.Register(new SaveTargetDestination(
    id:          "my-custom-format",
    name:        "My Format",
    description: "A custom save backend",
    groupName:   "Custom",
    factory:     settings => new MyCustomSaveTarget(settings)
));
```

Call `Register` once at startup, for example in an `[InitializeOnLoad]` class (editor) or a `RuntimeInitializeOnLoadMethod` (runtime).

---

## Custom Serializers

WagSave's built-in serializers (Binary, JSON, Text) can be subclassed and overridden to change how data is encoded without replacing the entire save target.

```csharp
using WaggleBum.WagSave.Core.Serialization;

public class MyJsonSerializer : JsonSerializer
{
    protected override string Serialize(object value)
    {
        // Custom serialization logic — e.g. use a different JSON library
        return MyJsonLibrary.Serialize(value);
    }

    protected override T Deserialize<T>(string data)
    {
        return MyJsonLibrary.Deserialize<T>(data);
    }
}
```

Inject your serializer by subclassing the corresponding save target and overriding `CreateSerializer`:

```csharp
public class MyJsonSaveTarget : JsonFileSaveTarget
{
    protected override ISerializer CreateSerializer() => new MyJsonSerializer();
}
```

Then register it as a custom format as shown above.

---

## Custom Progress Indicator UI

Replace the built-in progress indicator by assigning your own prefab to the `Progress Indicator Prefab` field on the WagSave asset. The prefab must have a component that implements the `IProgressIndicator` interface:

```csharp
public interface IProgressIndicator
{
    void Show();
    void Hide();
    void SetProgress(int percent);
}
```

---

## Custom Save Slot UI

Replace the built-in slot picker by assigning your own prefab to the `Save Slots UI Prefab` field on the WagSave asset. Disable **Use Save Slot UI** and control slot selection entirely in code if you prefer a fully custom implementation. See [Save Slots](SaveSlots.md) for the full `SaveSlotManager` API.
