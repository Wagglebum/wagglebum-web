# WagSettings Cheatsheet

One page. Everything else is in [the docs](index.md).

## Zero to menu

**Tools → WaggleBum → WagSettings → Setup**, tick the categories, press **Generate**. You get setting
assets, a `SettingsProfile` holding them, and an `AudioMixer` with Master, Music and SFX exposed, all under
`Assets/WagSettings/Resources/`. Re-running is safe: it creates what is missing and never overwrites an
asset you have edited.

Then, in your menu scene:

| UI Toolkit | uGUI |
|---|---|
| A **UI Document**, then **Settings Menu (UI Toolkit)** on it. Assign the profile, `WagSettingsMenu.uxml`, `WagSettingsMenu.uss`; set the Panel Settings theme to `WagSettingsUI.tss`. | Copy `Sample Scenes/Quick Start/Prefabs/WagSettingsMenu (uGUI).prefab`, point it at your profile. |

Press Play. The profile is in Resources, so a **WagSettings Manager** is created at startup and the menu
shows its profile. To choose where the manager lives — and to give appliers a home — add
*WaggleBum → WagSettings → WagSettings Manager* to the scene yourself.

## Keys

`category.name`. The part before the dot is the tab; the part after becomes the label.

```
audio.master   audio.music   audio.sfx   audio.master.mute
display.width  display.height  display.refreshRate  display.windowMode  display.vsync
graphics.qualityTier  graphics.gamma  graphics.renderScale  graphics.bloom  graphics.ambientOcclusion  graphics.motionBlur
accessibility.uiScale  accessibility.colorblindPreset  accessibility.reduceMotion  accessibility.subtitleScale  accessibility.subtitleBackground
controls.rebinds  controls.sensitivity  controls.invertY
```

Those are what setup generates and what every applier binds by default. Add your own with
**Assets → Create → WaggleBum → WagSettings → …**, then add the asset to the profile.

## Read and write in code

```csharp
using WaggleBum.WagSettings;

float master = WagSettings.Get<float>("audio.master");
WagSettings.Set("audio.master", 0.8f);                       // pending - the game does not change yet
WagSettings.Definition<float>("audio.master").Changed += value => { };

WagSettings.IsDirty;        // anything pending?
WagSettings.Apply();        // write every pending value to the store, in one batch
WagSettings.Revert();       // throw pending values away
WagSettings.ResetAll();     // authored defaults, pending until applied
```

That works anywhere a `WagSettingsManager` is running — one you placed, or the one created at startup
because the profile is in a Resources folder. With none, every call throws and says what to add.
`WagSettings.Registry` is the registry itself when you want more than the facade offers.

## Appliers

An applier turns a value into a Unity effect. Add the component **under the WagSettings Manager** and
assign what it drives — the manager attaches everything under it when it starts. Nothing to write.

| Applier | Drives | Applies |
|---|---|---|
| Audio Mixer Applier | exposed parameters on the assigned `AudioMixer` | live |
| Resolution Applier | `Screen` resolution, window mode, VSync | on Apply |
| Quality Applier | quality tier, gamma, render scale, post-effect toggles | live |
| Accessibility Applier | UI scale, colourblind matrix, reduce motion, subtitles — as events and shader globals | live |
| Rebind Applier | an `InputActionAsset`'s binding overrides *(Input System)* | live |

`Attach` throws on a key the registry does not hold. Blank a key on the applier to skip it. An applier
that must live elsewhere: `WagSettings.Manager.Attach(applier)`.

## Binders (uGUI)

Put the binder on the control and set its key. It finds the menu on a parent.

| Control | Binder |
|---|---|
| `Slider` | Slider Setting Binder |
| `Toggle` | Toggle Setting Binder |
| `Dropdown` | Dropdown Setting Binder — options come from the `EnumSetting`, or from the display for `display.resolution` |
| `InputField` | Input Field Setting Binder |
| `Button` | Settings Command Button — Apply, Revert or Reset |
| `InputField` | Settings Search Binder |

UI Toolkit needs none of this: rows are built from the profile.

## Where things are

| | |
|---|---|
| Generated assets | `Assets/WagSettings/Resources/` |
| The sample | `WaggleBum/WagSettings/Sample Scenes/Quick Start/` — a scene per UI framework |
| The uGUI menu prefab | `…/Quick Start/Prefabs/WagSettingsMenu (uGUI).prefab` |
| Menu styling | `Runtime/UI/UIToolkit/WagSettingsMenu.uss` and the variables in `WagSettingsUI.tss` |
| Setup | Tools → WaggleBum → WagSettings → Setup |
| The manager | *WaggleBum → WagSettings → WagSettings Manager*, or created at startup from Resources |

## When it throws

Loudly and on purpose: a binder on a key the profile lacks, an applier on a key the registry lacks, an
unexposed mixer parameter, an empty slot in a profile. Each names the key. A control that silently does
nothing is worse than a failure that says why.
