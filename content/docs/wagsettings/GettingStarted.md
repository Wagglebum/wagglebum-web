# Getting Started

> **Pre-release.** The runtime, appliers, both menus, the editor, setup, the Quick Start sample and
> localization are in. CI and store preparation are still to come. See [CHANGELOG.md](../CHANGELOG.md).

## Requirements

- Unity **2022.3** (2022 LTS) or newer.
- No required package dependencies.

Optional, and auto-detected:

- **WagSave** (`com.wagglebum.wagsave`) — upgrades persistence to versioned, cloud-synced, encrypted,
  multi-profile saves. Install it and WagSettings uses it automatically.
- **Input System** (`com.unity.inputsystem`) — required for control rebinding.
- **uGUI** (`com.unity.ugui`) — the component-based menu; present in every 2022 LTS template.

## Install

### From a tarball or the Asset Store

Import the package, or add it via **Window → Package Manager → + → Add package from tarball…**.

### From a local checkout

Add this to your project's `Packages/manifest.json`, pointing at the `WaggleBum/WagSettings` folder:

```json
{
  "dependencies": {
    "com.wagglebum.wagsettings": "file:../../wagsettings-unity/WaggleBum/WagSettings"
  }
}
```

## Verify the install

Once the package is imported, Unity compiles it and WagSettings publishes the scripting define
`WAGGLEBUM_WAGSETTINGS` for the **active build target**. It is re-published on every domain reload, so
switching platform adds it to the newly selected target automatically. Confirm the install two ways:

1. **Package Manager** — WagSettings appears in the package list at version 0.9.0.
2. **Scripting defines** — open **Edit → Project Settings → Player → Other Settings → Scripting
   Define Symbols**; `WAGGLEBUM_WAGSETTINGS` is listed.

![The Tools → WaggleBum → WagSettings menu](Images/tools-menu.png)

That define is also how other assets detect WagSettings without taking a hard dependency on it:

```csharp
#if WAGGLEBUM_WAGSETTINGS
    // WagSettings is installed.
#endif
```

## Try it first: the Quick Start

The fastest way to see everything working is the shipped sample. It is exactly what the setup screen
generates, plus a scene around it, and there is one for each UI framework:

```
WaggleBum/WagSettings/Sample Scenes/Quick Start/
├── Quick Start (UI Toolkit).unity
├── Quick Start (uGUI).unity
├── Settings/            23 setting assets, the profile, and the mixer setup cloned
├── Prefabs/             WagSettingsMenu (uGUI).prefab - the uGUI menu, ready to copy
├── QuickStartActions    a starter Input Actions asset with Jump, Interact and Fire
└── Scripts/             QuickStartDemo, and QuickStartControls when the Input System is installed
```

![The Quick Start scene running, with the settings menu open](Images/quick-start-scene.png)

Open either scene and press Play. Then:

1. **Drag Music down.** The 220 Hz tone on the Music bus follows it live; tick **Master Mute** and both it
   and the SFX blip go silent. That is `AudioMixerApplier` writing exposed parameters on the generated
   mixer, in decibels.
2. **Change Window Mode or the resolution and press Apply.** The HUD in the corner reports what the screen
   is actually doing. Nothing changes until Apply — display settings apply on commit, because a half-typed
   resolution should not resize your window.
3. **Tick Reduce Motion.** The cube stops turning. **Drag UI Scale.** The menu and the HUD both grow.
4. **Press Space.** The HUD counts a jump. Press **Rebind Jump**, then any key, then Apply — the HUD names
   the new control, and it comes back after you stop and restart Play. (Input System only.)
5. **Type in the search box.** Tabs and rows that do not match disappear; clear it and they return.
6. **Press Reset to Defaults, then Revert.** Reset is cancellable until applied.

Stop Play, press Play again: whatever you applied is still there. That is `PlayerPrefsStore`, or
`WagSaveStore` if WagSave is installed.

There is no wiring code in the sample. The **WagSettings Manager** on the Quick Start object owns the
registry and attaches the appliers under it; both menus borrow that registry. `QuickStartDemo.cs` reads
settings back the way a game script would — `WagSettings.Get<float>("audio.master")` — and everything
else in it exists so the effect of a setting is obvious in a demo.

## Using the API

```csharp
using WaggleBum.WagSettings;

float master = WagSettings.Get<float>("audio.master");
WagSettings.Set("audio.master", 0.8f);   // pending
WagSettings.Apply();                      // committed and saved, in one batch
```

That resolves to the running **`WagSettingsManager`** — the component that owns the registry and attaches
every applier under it. Setup puts the profile in `Assets/WagSettings/Resources`, so a manager is
created at startup with nothing placed in a scene; add one yourself to choose where it lives. With none
running, the calls throw and say what to add.

The [cheatsheet](Cheatsheet.md) has the rest on one page; [API](API.md) has all of it, including the
registry underneath for code that wants more than the facade.

## Dropping in a settings menu

The fastest route to a working menu, no code required:

1. Create your settings (**Assets → Create → WaggleBum → WagSettings**) and add them to a
   `SettingsProfile`.
2. Create a **UI Document** GameObject (*GameObject → UI Toolkit → UI Document*).
3. Add **WaggleBum → WagSettings → Settings Menu (UI Toolkit)** to it.
4. Assign `WagSettingsMenu.uxml` and `WagSettingsMenu.uss` from
   `WaggleBum/WagSettings/Runtime/UI/UIToolkit/` as the shell and styles.
5. On the UI Document's **Panel Settings**, set the theme to `WagSettingsUI.tss` from the same folder.
6. Make sure a **WagSettings Manager** is running — placed in the scene with your profile, or created at
   startup because the profile is in a Resources folder. The menu shows the manager's profile; assign a
   profile on the menu itself only when there is no manager.

![The UI Toolkit settings menu in Play mode](Images/menu-uitoolkit.png)

Press Play. You get a tab per category, a row per setting, a search field, and Apply / Revert / Reset
buttons that enable themselves only when they would do something.

### What you get

- **A tab per category**, in the order settings appear in your profile — that order is a design choice,
  so it is not re-sorted alphabetically.
- **The right control per setting**: a toggle for a bool, a dropdown for an `EnumSetting`, a slider for a
  `FloatSetting` or `IntSetting` with a range, a text field otherwise — and **one resolution dropdown**
  of the modes the display supports, standing in for `display.width`, `display.height` and
  `display.refreshRate`.
- **Controller and keyboard navigation.** Up and down move between rows, left and right switch tabs, and
  focus starts on the first row rather than nowhere. There is a visible focus ring, because a player
  without a pointer has nothing else to tell them where they are.
- **Dirty marking** on both the row and its tab, so a change in a tab you are not looking at is still
  visible.
- **Unavailable settings stay visible**, greyed out with a tooltip explaining why — hiding them leaves a
  player hunting for an option they read about.

### Restyling it

Appearance lives in `WagSettingsMenu.uss` and the theme variables in `WagSettingsUI.tss`:

```css
:root {
    --wag-surface: rgb(28, 30, 34);
    --wag-text: rgb(236, 238, 242);
    --wag-accent: rgb(74, 144, 226);
    --wag-focus: rgb(255, 196, 61);
}
```

Override those in your own theme and the menu follows, without editing the package.

## The uGUI route instead

If your project uses uGUI rather than UI Toolkit, the same model drives a component-based menu. The
uGUI layer lives in its own assembly that Unity compiles only when `com.unity.ugui` is installed, so a
UI Toolkit-only project never carries it.

![The uGUI settings menu in Play mode](Images/menu-ugui.png)

**Start from the prefab.** `Sample Scenes/Quick Start/Prefabs/WagSettingsMenu (uGUI).prefab` is a
complete menu for the generated profile — header with search, a tab strip, a scrolling page per
category with a row per setting, and the three command buttons — built entirely from the standard uGUI
controls, so restyling it is ordinary uGUI work. Copy it, point it at your profile, and delete or add
rows. To build one from scratch instead:

1. Put **Settings Menu (uGUI)** on the root of your menu Canvas. With a manager running it shows the
   manager's profile; assign one on the menu only when there is no manager.
2. On each control, add the matching binder and set its **Key**:

| Control | Component |
|---|---|
| `Slider` | Slider Setting Binder |
| `Toggle` | Toggle Setting Binder |
| `Dropdown` | Dropdown Setting Binder |
| `InputField` | Input Field Setting Binder |

3. For Apply / Revert / Reset, put **Settings Command Button** on each `Button` and choose its command.
   They grey themselves out when the command would do nothing.
4. For search, put **Settings Search Binder** on an `InputField`.
5. For tabs, put **Settings Category Panel** on each page with its category name, and **Settings Category
   Selector** on the tab strip with a button to use as a template.

Binders find the menu on a parent, so nothing needs wiring by hand beyond the key. A binder pointed at a
key that is not in the profile **throws** — a control that silently does nothing is worse than a loud
failure.

Each binder has an optional **Row** — the object holding both its label and its control. The category
panel shows and hides rows as the search filters settings in and out; leave Row empty and the control's
own object is what gets hidden.

The dropdown takes its options from the `EnumSetting`, and the slider takes its range from the setting,
so neither carries a second copy that can drift out of step with the asset.

### Labels

Binders optionally fill a `Text` with the setting's display name. TextMeshPro is a separate package in
2022 LTS, so the package does not depend on it; set TMP labels yourself, or leave the label unassigned
and author the text in your prefab.

### Doing it in code instead

```csharp
ISettingsStore store = SettingsStoreFactory.Create(profile.StoreKind);
using SettingsRegistry registry = profile.CreateRegistry(store);

var model = new SettingsMenuModel(registry, SettingBinderFactory.CreateAll(registry), ownsBinders: true);
using var view = new SettingsMenuView(shellUxml, model, ownsModel: true);

document.rootVisualElement.Add(view.Root);
view.FocusFirstRow();
```

`SettingsMenuView` is a plain class, not a component, so it can be built and inspected without a
UIDocument — which is how the menu is tested.

## Running the tests

The package ships EditMode and PlayMode test assemblies. With the package in a Unity project, open
**Window → General → Test Runner** and run the `WagSettings.Tests.EditMode` suite.
