# WagSave Documentation

WagSave is a production-ready save system for Unity 2022 LTS and above. It handles serialization, file I/O, encryption, compression, save slots, autosave, and cloud backends — all configured through a Unity editor window with no code required to get started.

**Namespace:** `WaggleBum.WagSave`
**Unity Version:** 2022.3 LTS+
**Publisher:** WaggleBum

---

## Editor Language

The WagSave editor supports multiple languages. To change the display language:

1. Open **Edit > Preferences** (Windows / Linux) or **Unity > Preferences** (macOS).
2. Select **WagSave** from the left-hand panel.
3. Use the **Locale** dropdown to choose your preferred language.
4. Close and reopen the Unity editor for the change to take effect.

**Available languages:**

- English
- Español (Spanish)
- 日本語 (Japanese)
- 한국어 (Korean)
- 中文（简体）(Simplified Chinese)
- 中文（繁體）(Traditional Chinese)

---

## In This Documentation

| Document | Description |
|---|---|
| [Quick Start](#quick-start) | Get started with simple instructions |
| [Getting Started](GettingStarted.md) | Installation, setup, and your first save/load |
| [WagSave Component](WagSaveComponent.md) | Marking GameObjects for saving |
| [API Reference](API.md) | Full save/load API, events, and properties |
| [Save Slots](SaveSlots.md) | Multi-slot save system |
| [Autosave](Autosave.md) | Interval-based automatic saving |
| [Output Formats](OutputFormats.md) | Formats, file settings, encryption, compression |
| [WagSave Trigger](WagSaveTrigger.md) | Physics-based save trigger component |
| [Extensibility](Extensibility.md) | Custom formats, serializers, and save overrides |

---

## Quick Start

### Key / Value
The following code snippet is for basic saving and loading without needing to configure a WagSave instance for your project.  A default instance will be created with the default settings.  To configure your save output and to use any of the advanced features follow the instructions of the quick start for the WagSave instance.

The following code sample can be see in use in the provided Quick Start sample scene in the package.
```csharp
        void Update()
        {
            var kb = Keyboard.current;
            if (kb == null) return;

            // Move Player
            var h = (kb.rightArrowKey.isPressed ? 1f : 0f) - (kb.leftArrowKey.isPressed ? 1f : 0f);
            var v = (kb.upArrowKey.isPressed ? 1f : 0f) - (kb.downArrowKey.isPressed ? 1f : 0f);
            transform.Translate(new Vector3(h, 0f, v) * (moveSpeed * Time.deltaTime));

            // Save Player Position
            if (kb.sKey.wasPressedThisFrame)
            {
                WagSave.Save("playerPosition", transform.position);
            }

            // Load Player Position
            if (kb.lKey.wasPressedThisFrame)
            {
                transform.position = WagSave.Load<Vector3>("playerPosition");
            }
        }
```

---

### WagSave Instance (Recommended)
Open the WagSave editor window in Unity from the menu <b>Window -> WagSave -> Editor</b>
Using the editor interface helps to expose available features and options you can configure in your project.

- Open the WagSave editor and create an instance in the Resources folder of your project.
- Configure your instance for you project with options and features available.
- Use the editor to add WagSaveComponents to Game Objects in your project and select the properties to save.
- Implement the code below to save and load your content.  Optionally you can add save triggers, autosave, and/or save slots without writing any code. 

```csharp
using WaggleBum.WagSave;

// Save all WagSaveComponents in the scene
var wagSave = WagSave.GetInstance();
wagSave.Save();

// Load them back
wagSave.Load();
```


## Architecture Overview

WagSave is built around three concepts:

**The WagSave ScriptableObject** is the central manager. Create one (or more) via `Assets > Create > WaggleBum > WagSave`. All configuration — output format, slots, autosave, encryption — lives here. At runtime it is loaded from a `Resources` folder.

**WagSaveComponent** is a MonoBehaviour you add to any GameObject whose state should be saved. You select exactly which fields and properties to include using the WagSave editor window. No serialization code required.

**Save Targets** are the pluggable output backends (Binary file, JSON file, PlayerPrefs, Steam Cloud, Unity Cloud). Swap formats in the editor without touching your game code.

---

*WagSave is developed and maintained by WaggleBum. Available on the Unity Asset Store.*
