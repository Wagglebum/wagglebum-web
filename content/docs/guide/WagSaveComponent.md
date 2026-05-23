# WagSave Component

`WagSaveComponent` is a MonoBehaviour that marks a GameObject for participation in the WagSave system. When a save is triggered, WagSave finds all `WagSaveComponent` instances across every loaded scene and captures the values of their configured fields and properties. On load, those values are written back.

---

## Adding the Component

Add `WagSaveComponent` to any GameObject whose state you want to persist:

```
Add Component > WaggleBum > WagSave > WagSave
```

Or in code:

```csharp
gameObject.AddComponent<WagSaveComponent>();
```

Only one `WagSaveComponent` is allowed per GameObject (`DisallowMultipleComponent` is enforced).

---

## Configuring What Gets Saved

`WagSaveComponent` does not save everything — you select exactly which fields and properties to include. This is done through the WagSave editor window.

1. Open `Window > WagSave > Editor`
2. Navigate to **Scene Content**
3. Find the GameObject in the list and click **Configure**

The editor opens a tree view of all components on the GameObject. Expand any component to see its available fields and properties, then check the ones you want to include.

> **Tip:** Use the depth slider to control how many levels deep the component tree expands by default.

### What can be saved?

WagSave uses reflection to read and write values. Any field or property that is:
- A primitive type (`int`, `float`, `bool`, `string`)
- A Unity value type (`Vector2`, `Vector3`, `Quaternion`, `Color`)
- A serializable struct or class

...can be selected for saving.

---

## Prefab Support

For prefabs, configure the `WagSaveComponent` on the **prefab asset** rather than individual scene instances. This way all instances share the same save configuration.

1. Open `Window > WagSave > Editor`
2. Navigate to **Prefabs**
3. Find the prefab and click **Configure**

The prefab asset's GUID is stored in `prefabId` on the component, allowing WagSave to re-instantiate the correct prefab when loading a scene that had dynamically spawned objects.

> **Note:** If a scene instance has an overridden `WagSaveComponent`, changes to the prefab asset will not affect that instance.

---

## Scene Identity

Each `WagSaveComponent` is identified by:

| Property | Description |
|---|---|
| `componentId` | Stable GUID assigned when the component is first configured in the editor. Persists across sessions. |
| `sceneId` | Hash of the scene's asset path. Scopes save data to the correct scene. |
| `runtimeId` | Generated at runtime (`Start`). Disambiguates multiple instances of the same prefab spawned in a session. |
| `prefabId` | GUID of the source prefab asset. Used to re-instantiate prefabs on load. |

These IDs are all assigned automatically — you do not need to set them.

---

## Dynamic Objects (Runtime-Spawned Prefabs)

WagSave handles dynamically instantiated prefabs. When a prefab instance is saved, its `prefabId` and `runtimeId` are stored alongside the data. On load, use `WagSaveComponent.InstantiatePrefabById` to recreate the object:

```csharp
// Spawn a saved prefab by its stored prefabId
GameObject go = WagSaveComponent.InstantiatePrefabById(savedPrefabId);
```

> **Runtime requirement:** Prefabs must be in a `Resources` folder for `InstantiatePrefabById` to work in builds. In the editor, `AssetDatabase` is used and no `Resources` folder is needed.

---

## Reading and Writing Values in Code

In most cases you won't need to call these directly — `WagSave.Save()` and `WagSave.Load()` handle everything. But the component exposes these methods if you need manual control:

```csharp
var component = GetComponent<WagSaveComponent>();

// Get the current snapshot of all selected save paths
GameObjectData data = component.GetSaveItemData();

// Write a value back to a specific path
component.SetSelectionValue("componentId.p|health", 75);
```

---

## Inspecting Components in the Debugger

While in Play Mode, open `Window > WagSave > Editor` and navigate to **Debugger**. The **Save Content** panel lists every `WagSaveComponent` in the active scene, how many save items are configured on each, and provides **Configure** and **Focus** buttons.
