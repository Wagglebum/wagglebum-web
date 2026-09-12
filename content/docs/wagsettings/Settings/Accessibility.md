# Accessibility

UI scale, colourblind correction, reduce motion, and subtitle size and background. These apply
**immediately** — someone choosing a colourblind preset or a text size has to see the effect to judge it,
and hiding that behind an Apply button makes the setting nearly unusable.

## Colourblind correction

Two different transforms are easy to confuse, and shipping the wrong one is worse than shipping nothing:

| | What it does | Who it's for |
|---|---|---|
| **Simulation** | Shows what a deficiency *looks like* | **You**, previewing your UI |
| **Daltonization** | Shifts information into channels the player *can* distinguish | **The player** |

Applying a simulation matrix to someone who already has that deficiency helps nobody — it just makes
their screen worse. `GetDaltonizationMatrix` is the one to ship:

```csharp
ColorMatrix correction = ColorblindCorrection.GetDaltonizationMatrix(ColorblindPreset.Deuteranopia);
```

The simulation matrices are the widely used Viénot–Brettel–Mollon approximations. Daltonization is
derived from them as `I + E·(I − S)`, where `E` redistributes the simulation error — so red-green cues
become blue-yellow cues.

| Preset | Affects | Roughly |
|---|---|---|
| `Protanopia` | Red sensitivity | 1% of men |
| `Deuteranopia` | Green sensitivity | 6% of men — the most common |
| `Tritanopia` | Blue sensitivity | Rare, men and women equally |
| `Achromatopsia` | No colour vision | Very rare |

**Achromatopsia deliberately returns identity.** With no colour vision there is no channel to move
information into, so redistributing the error would only distort the image. Handle it with contrast and
shape instead.

> These are approximations, not clinical instruments. They help, and they are **no substitute** for also
> conveying information through shape, pattern, position and text. A player who cannot distinguish your
> red and green markers needs them to differ in more than hue.

## The settings

Every key is optional; leave one empty and that aspect is unmanaged.

| Setting | Type | Key | Range |
|---|---|---|---|
| UI scale | `FloatSetting` | `accessibility.uiScale` | Clamped 0.5–2 |
| Colourblind preset | `IntSetting` / `EnumSetting` | `accessibility.colorblindPreset` | `ColorblindPreset` |
| Reduce motion | `BoolSetting` | `accessibility.reduceMotion` | |
| Subtitle scale | `FloatSetting` | `accessibility.subtitleScale` | Clamped 0.5–3 |
| Subtitle background | `FloatSetting` | `accessibility.subtitleBackground` | Clamped 0–1 opacity |

Everything is clamped before it reaches your UI, including `NaN`, which falls back to a sane default
rather than propagating. A stored value from an older build or a hand-edited save must never leave a
player with an interface they cannot read or dismiss.

Subtitles get a wider range than the UI (up to 3×) because subtitle legibility is often the single most
requested accessibility feature, and a menu that fits on screen is a lower bar than dialogue you can
read from a sofa.

## Wiring it up

Values are **published, not imposed**. UI scale means something different to a uGUI `CanvasScaler`, a UI
Toolkit panel and a bespoke HUD, so each value is raised as a `UnityEvent` and set as a global shader
value. Wire them in the inspector:

```csharp
public void SetUiScale(float scale)
{
    _canvasScaler.scaleFactor = scale;
}

public void SetColorblindPreset(ColorblindPreset preset)
{
    _correctionVolume.weight = preset == ColorblindPreset.None ? 0f : 1f;
}
```

The correction matrix is also uploaded to a global shader matrix, `_WagSettingsColorblindMatrix` by
default, for a full-screen effect to read directly. Reduce motion sets `_WagSettingsReduceMotion` to
1 or 0. Both property names are configurable.

**Reduce motion** is deliberately just a published flag — what counts as excessive motion is
game-specific. Camera shake, screen-space blur, parallax, large UI transitions and auto-play cutscene
movement are the usual suspects.

## Setting it up

1. Create the settings you want and add them to your `SettingsProfile`.
2. **Add Component → WaggleBum → WagSettings → Accessibility Applier**.
3. Wire each event to your UI.
4. Put it under the **WagSettings Manager**, which attaches it when it starts.

## What throws, and what only warns

| Situation | Result |
|---|---|
| A key not in the profile | **Throws** — `KeyNotFoundException` |
| A stored preset that isn't a known value | **Warns**, applies no correction |
| Any value out of range, including `NaN` | **Clamped** silently — this is normal, not an error |

## Apply mode

Defaults to `Immediate`, and you should keep it that way. See
[Extensibility](../Extensibility.md) for the modes.
