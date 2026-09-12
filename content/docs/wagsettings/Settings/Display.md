# Display

Resolution, refresh rate, window mode, VSync and monitor choice. These apply on the **Apply button**, not
while the player scrolls a dropdown — resizing a window mid-scroll is the kind of thing that makes a
settings menu feel broken.

## Resolution is stored as a resolution, not an index

Most settings menus store "the third item in the dropdown". WagSettings stores the actual width, height
and refresh rate, because an index means something different the moment the hardware changes:

- the player docks a laptop, or unplugs an external monitor
- they move a save to another machine, or to a handheld
- a driver update changes which modes are reported

An index that pointed at 1920×1080 now points at 800×600. Actual values survive all of that.

The trade-off is that a stored mode may not exist on the machine in front of you. `DisplayModeMatcher`
resolves that: **pixel dimensions dominate, refresh rate breaks ties**, and the closest supported mode
wins. A game must never refuse to start over a resolution, so this **warns rather than throws** — see
*What throws, and what only warns* below.

```csharp
var desired  = new DisplayMode(1600, 900, 60);          // not supported here
var resolved = DisplayModeMatcher.FindNearest(applier.AvailableModes, desired);  // 1920 x 1080 @ 60 Hz
```

A stored refresh rate of `0` means **"the highest this display offers"**, which is the right default for
a game that has never been configured.

## The settings

Every key is optional. Leave one empty and the applier does not manage that aspect, so a project wanting
only a window-mode toggle can have exactly that.

| Setting | Type | Key | Notes |
|---|---|---|---|
| Width | `IntSetting` | `display.width` | Pixels. Needs a height key too. |
| Height | `IntSetting` | `display.height` | Pixels. Needs a width key too. |
| Refresh rate | `IntSetting` | `display.refreshRate` | Hz. `0` means highest available. |
| Window mode | `IntSetting` / `EnumSetting` | `display.windowMode` | `0` windowed, `1` borderless, `2` fullscreen. |
| VSync | `IntSetting` / `EnumSetting` | `display.vsync` | `0` off, `1` every blank, `2` every second blank. Clamped to 0–2. |
| Monitor | `IntSetting` | `display.monitor` | Zero-based display index. **Opt-in**: the applier's key is empty by default, because moving the window between monitors is disruptive enough to be a choice, and setup does not generate it. |

`WindowMode` is a WagSettings enum rather than Unity's `FullScreenMode`: these three are the choices
players understand, the numbering is stable across Unity versions, and the value goes into save data.

## Setting it up

1. Create the settings above and add them to your `SettingsProfile`.
2. **Add Component → WaggleBum → WagSettings → Resolution Applier**. The keys are pre-filled with the
   conventional names; blank the ones you don't want managed.
3. Put it under the **WagSettings Manager**, which attaches it when it starts. Or run Setup with Display
   ticked and skip steps 1 and 2.

## The resolution dropdown

Both menus show width, height and refresh rate as **one dropdown of the modes the display supports** —
`1920 × 1080 @ 144 Hz`, `1920 × 1080 @ 60 Hz`, and so on, widest first. That is `ResolutionBinder`,
a composite over the three settings. The menu asks `ScreenModes.Query()` what the hardware can do and
hands the list to `SettingBinderFactory.CreateAll(registry, modes)`, which folds the three into one
binder standing where `display.width` was in the profile. Searching for "resolution" finds it.

![The resolution dropdown listing the display's modes](../Images/resolution-dropdown.png)

What the player sees is one choice. What the store sees is still three numbers, which is the point of
the section above: a stored index into a mode list means something different on the next monitor;
`1920 × 1080` does not.

If the stored values match nothing the display can do — a setting carried over from a larger monitor —
the dropdown leads with **Custom: 2560 × 1440 @ 165 Hz** rather than snapping silently, and the applier
still picks the nearest mode when it comes to apply. Choose any real mode and the custom entry goes.

Without a `display.refreshRate` setting in the profile, the list is sizes only and duplicates by rate
collapse.

### When the platform reports no modes

Some platforms return an empty `Screen.resolutions` — **the macOS Editor does**, and WebGL does. Left
alone that would give the dropdown nothing to offer and the applier nothing to snap to, and in the
Editor you would never see a resolution change. So `ScreenModes.Query()` falls back to the common 16:9
and 16:10 sizes no larger than the current display, each at its refresh rate, with the display itself
first. A build on a platform that reports modes uses the real list; the fallback is what lets you
exercise the menu where it would otherwise be inert.

### Doing it by hand

If you are not using either menu, the same pieces are yours:

```csharp
var binder = new ResolutionBinder(width, height, refreshRate, ScreenModes.Query());

foreach (string option in binder.Options) { /* add to your control */ }
binder.Select(index);                       // writes width, height and refresh rate
```

Or write the parts yourself from `applier.AvailableModes`, which is the same list:

```csharp
width.Set(mode.Width);
height.Set(mode.Height);
refreshRate.Set(mode.RoundedRefreshRate);
```

The applier's list is cached; call `RefreshAvailableModes()` if a display is plugged in while the game runs.

## What throws, and what only warns

Display settings are the ones most likely to be wrong through no fault of the player, so the split is
deliberate: **a developer mistake throws, a hardware mismatch warns.**

| Situation | Result |
|---|---|
| A width key set without a height key, or vice versa | **Throws** — a configuration error only the developer can fix |
| A key that isn't in the profile | **Throws** — `KeyNotFoundException` |
| Stored mode not supported by this display | **Warns**, applies the nearest supported mode |
| Stored window mode not a recognised value | **Warns**, falls back to windowed |
| Chosen monitor not connected | **Warns**, leaves the window where it is |
| Platform reports no modes at all | **Warns**, leaves the resolution alone |

Subscribe to warnings to see them during development:

```csharp
WagSettingsLog.WarningLogged += message => Debug.LogWarning(message);
```

## Apply mode

Defaults to `OnApply`. Changing it to `Immediate` means every keystroke in a resolution field resizes the
window, which is rarely what you want — see [Extensibility](../Extensibility.md).

Note that VSync and monitor choice apply on the same schedule. If you want VSync to toggle instantly,
give it its own applier set to `Immediate`.
