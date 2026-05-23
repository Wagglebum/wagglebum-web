# Getting Started

This guide walks you through installing WagSave, creating your first save asset, and performing a basic save and load.

---

## 1. Create a WagSave Asset

In the Project window, right-click and choose:

```
Assets > Create > WaggleBum > WagSave > WagSave (Save System)
```

This creates a `WagSave` ScriptableObject. Name it something meaningful — for example `GameSave` or `SaveProfile`.

You can open the WagSave editor window at any time from the Unity menu bar:

```
Window > WagSave
```

Select your asset from the dropdown at the top of the window.

---

## 2. Move It to a Resources Folder

WagSave uses `Resources.Load` to find the asset at runtime in builds. Place the asset inside a folder named `WagSave` that is itself inside a `Resources` folder anywhere in your project:

```
Assets/
  Resources/
    WagSave/
      GameSave.asset   ← your WagSave asset goes here
```

> **Important:** If the asset is not inside a `Resources/WagSave/` folder, `WagSave.GetInstance()` will return `null` in builds (the Unity Editor uses `AssetDatabase` instead and will work regardless of location).

---

## 3. Open the WagSave Editor Window

```
Window > WagSave
```

The editor window is where all configuration happens — output format, save slots, autosave, encryption, logging, and more. Select your asset from the dropdown at the top.

---

## 4. Choose an Output Format

In the editor window, go to **Save Output** and choose a category and format:

| Category | Format | Best For |
|---|---|---|
| File | Binary | Shipping — compact and fast |
| File | JSON | Debugging — human readable |
| File | Text | Simple key-value data |
| Platform | PlayerPrefs | Small settings data, WebGL |
| Platform | Unity Cloud Save | Online multiplayer games |
| Platform | Steam Cloud Save | Steam games with Steamworks SDK |

For most projects, **Binary** is the recommended starting point.

---

## 5. Add WagSaveManager to Your Scene

`WagSaveManager` is a MonoBehaviour that drives the autosave timer and scene-change logic. Add it to a GameObject in your scene (typically a persistent manager object).

```
Add Component > WaggleBum > WagSave > WagSave Manager
```

You only need one `WagSaveManager` in any scene that uses autosave. It finds the active `WagSave` instance automatically at runtime.

---

## 6. Mark GameObjects for Saving

Add a `WagSaveComponent` to any GameObject whose state you want to save:

```
Add Component > WaggleBum > WagSave > WagSave
```

Then open the WagSave editor window, navigate to **Scene Content**, find the GameObject, and click **Configure** to select which fields and properties to include.

See [WagSave Component](WagSaveComponent.md) for a full walkthrough.

---

## 7. Save and Load

### Via code

```csharp
using WaggleBum.WagSave;

public class GameManager : MonoBehaviour
{
    private WagSave _wagSave;

    private void Start()
    {
        _wagSave = WagSave.GetInstance();
    }

    public void SaveGame()
    {
        _wagSave.Save();
    }

    public void LoadGame()
    {
        _wagSave.Load();
    }
}
```

### Key-value saves (no WagSaveComponent required)

For simple values that don't belong to a specific GameObject:

```csharp
// Save
WagSave.Save("currentLevel", 5);
WagSave.Save("playerName", "Alex");

// Load
int level = WagSave.Load<int>("currentLevel");
string name = WagSave.Load<string>("playerName");
```

---

## 8. Async Saves (recommended for large scenes)

For scenes with many objects, use the async variants to avoid frame hitches:

```csharp
public async void SaveGame()
{
    await _wagSave.SaveAsync();
}

public async void LoadGame()
{
    await _wagSave.LoadAsync();
}
```

Serialization and file I/O run on a background thread. Unity API calls (reading component values) still happen on the main thread before the background work begins.

---

## Next Steps

- [Configure which fields are saved → WagSave Component](WagSaveComponent.md)
- [Set up multiple save slots → Save Slots](SaveSlots.md)
- [Set up autosave → Autosave](Autosave.md)
- [Enable encryption or compression → Output Formats](OutputFormats.md)
