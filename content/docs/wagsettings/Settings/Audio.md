# Audio

WagSettings drives an `AudioMixer` from your settings, converting each linear volume slider into the
decibels a mixer actually expects. Volume applies live as the player drags — the only sensible way to
choose a level.

## Why the conversion matters

Mixers work in **decibels**, which are logarithmic. Sliders are **linear**. Feed a slider value straight
into `AudioMixer.SetFloat` and you get the classic bug: the bottom half of the slider sounds identical
and every audible change crowds into the top tenth.

`AudioVolume` does the mapping, `20·log₁₀(x)`, with a floor at −80 dB:

| Slider | Decibels |
|---|---|
| `1.0` | `0 dB` — full volume |
| `0.5` | `−6.02 dB` — half as loud |
| `0.25` | `−12.04 dB` |
| `0.0` | `−80 dB` — silence |

```csharp
float decibels = AudioVolume.LinearToDecibels(0.5f);   // -6.0206
float slider   = AudioVolume.DecibelsToLinear(-6.02f); //  0.5
```

It lives in `Runtime/Core` with no `UnityEngine` dependency, so it is usable and testable on its own.

## The quick way

Run **Tools → WaggleBum → WagSettings → Setup** with Audio ticked. It generates the four audio settings,
clones a mixer with Master, Music and SFX groups and their volumes already exposed, and the applier's
defaults match both. Add an Audio Mixer Applier under the manager and assign `WagSettingsMixer`. See
[Setup](../Setup.md).

The rest of this page is what that does for you, for when you want to do it differently.

## Setting it up by hand

**1. Expose the mixer parameters.** In your `AudioMixer`, select a group, right-click its **Volume**
field in the Inspector and choose **Expose 'Volume (of Group)' to script**. Then in the Audio Mixer
window's **Exposed Parameters** dropdown, rename it to something stable — `MasterVolume`, `MusicVolume`,
and so on.

> This step is the one people miss. An unexposed parameter means the player's slider silently does
> nothing, so WagSettings throws with the parameter name rather than failing quietly.

**2. Create the settings.** A `FloatSetting` per bus, and optionally a `BoolSetting` per mute toggle:

| Setting | Type | Key | Default |
|---|---|---|---|
| Master volume | `FloatSetting` | `audio.master` | `1` |
| Master mute | `BoolSetting` | `audio.master.mute` | `false` |
| Music volume | `FloatSetting` | `audio.music` | `0.8` |
| SFX volume | `FloatSetting` | `audio.sfx` | `1` |

Add them to your `SettingsProfile`.

**3. Add the applier.** *Add Component → WaggleBum → WagSettings → Audio Mixer Applier*. It seeds three
buses when first added — master with a mute, music and SFX without — which are exactly the settings above
and the groups the packaged mixer template exposes, so nothing needs filling in for the common case.
Assign your mixer, then for each bus:

| Field | Meaning |
|---|---|
| **Volume Key** | Key of the float setting holding this bus's 0–1 volume. **Empty means skip this bus.** |
| **Mute Key** | Key of a bool setting muting the bus. Empty if the bus has no mute toggle. |
| **Exposed Parameter** | The name you exposed on the mixer, e.g. `MasterVolume`. |

Blank the volume key of a bus you don't use and it is skipped. Want voice or UI buses? Add a bus, give it
a setting and expose the parameter — the applier does not seed buses whose settings do not exist, because
`Attach` throws on a missing key and a fresh component that throws until pruned is a bad default.

**4. Put it under the WagSettings Manager.** The manager attaches every applier under it when it starts;
there is nothing to call. An applier that has to live elsewhere: `WagSettings.Manager.Attach(applier)`.

## Mute

Mute drives the bus to −80 dB **without touching the stored volume**, so unmuting restores exactly the
level the player chose. The mute setting persists like any other, so a player who quits muted starts
muted.

## What throws, and why

Audio misconfiguration is silent by nature — a slider that does nothing looks like a broken game rather
than a broken setup. So these are loud:

| Situation | Result |
|---|---|
| Exposed parameter not found on the mixer | `InvalidOperationException` naming the parameter and how to expose it |
| A bus with a volume key but no exposed parameter | `InvalidOperationException` naming the bus |
| A bus referencing a key not in the profile | `KeyNotFoundException` |
| No mixer assigned | `InvalidOperationException` naming the GameObject |
| A bus with an **empty** volume key | Skipped — this is a project not using that bus, not an error |

## Apply mode

Audio defaults to `Immediate`, so the player hears the change while dragging. There is no good reason to
defer a volume change to an Apply button — see [Extensibility](../Extensibility.md) for the modes.

## Adding your own bus

Buses are just configuration. Add an entry, point it at a float setting and an exposed parameter, and it
works — no code. To drive something that isn't an `AudioMixer` parameter, write an applier: see
[Extensibility](../Extensibility.md).
