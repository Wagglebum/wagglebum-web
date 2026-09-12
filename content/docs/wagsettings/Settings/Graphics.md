# Graphics

Quality tier, gamma, render scale, post-effect toggles and hardware upscaling. These apply on the
**Apply button** — a quality-tier change reallocates render targets, which you don't want happening as
someone scrolls a dropdown.

## Pipeline awareness

WagSettings works on the Built-in pipeline, URP and HDRP, and it does **not** reference any of them.
Referencing URP would mean WagSettings refuses to compile in a Built-in project — unacceptable for an
asset that has to work everywhere.

Instead the pipeline is identified from the active asset's type name:

```csharp
RenderPipelineKind kind = applier.Pipeline;   // BuiltIn, Universal, HighDefinition or Custom
```

An unrecognised scriptable pipeline reports as `Custom` rather than `BuiltIn`, so it is never offered
features it may not have.

### What each pipeline supports

| Feature | Built-in | URP | HDRP | Custom |
|---|:--:|:--:|:--:|:--:|
| Quality tier | ✅ | ✅ | ✅ | ✅ |
| Gamma | ✅ | ✅ | ✅ | ✅ |
| Render scale | ❌ | ✅ | ❌ | ❌ |
| Bloom / AO / motion blur | ✅ | ✅ | ✅ | ✅ |
| Upscaling (DLSS / FSR) | ❌ | ✅ | ✅ | ❌ |

Render scale is a URP asset property; HDRP has dynamic resolution instead. Upscaling needs a scriptable
pipeline.

**An unavailable feature is skipped with a warning, never an exception.** A project that ships one
settings menu across pipelines, or switches pipeline later, keeps working. Ask before you show it:

```csharp
renderScaleSlider.SetEnabled(applier.SupportsFeature(GraphicsFeature.RenderScale));
```

The warning is raised once per feature, not on every apply.

## The settings

Every key is optional; leave one empty and that aspect is unmanaged.

| Setting | Type | Key | Notes |
|---|---|---|---|
| Quality tier | `IntSetting` | `graphics.qualityTier` | Index into Project Settings → Quality. Clamped to what the project defines. |
| Gamma | `FloatSetting` | `graphics.gamma` | Published as a global shader float. |
| Render scale | `FloatSetting` | `graphics.renderScale` | URP only. Clamped to 0.1–2. |
| Upscaling | `IntSetting` / `EnumSetting` | `graphics.upscaling` | Your own values; raised as an event. **Opt-in**: the key is empty by default, because the available upscalers depend on the pipeline. |
| Bloom | `BoolSetting` | `graphics.bloom` | |
| Ambient occlusion | `BoolSetting` | `graphics.ambientOcclusion` | |
| Motion blur | `BoolSetting` | `graphics.motionBlur` | |

## Post effects: WagSettings publishes, you apply

Bloom lives in a URP or HDRP **Volume profile**, or in the Built-in pipeline's post-processing stack.
Reaching into any of those means a hard dependency on a package your project may not have. So WagSettings
publishes the value two ways and lets you connect it:

1. **A global shader float**, set to `1` or `0` — for shaders that read it directly.
2. **A `UnityEvent<bool>`**, wired in the inspector to your Volume component, post-processing layer, or a
   method of your own.

```csharp
public void SetBloom(bool enabled)
{
    if (_volume.profile.TryGet(out Bloom bloom))
    {
        bloom.active = enabled;
    }
}
```

Drop that method onto the toggle's event in the inspector and you're done. The same applies to
upscaling: the chosen value is raised as an event for your pipeline's DLSS or FSR configuration.

This is a deliberate trade — a little wiring in exchange for an asset that installs into any project.

## Gamma

Gamma is published as a global shader float, `_WagSettingsGamma` by default, because there is no
pipeline-independent gamma control. Read it in your colour-grading shader, or feed it into a URP/HDRP
`LiftGammaGain` override through the same event pattern. The property name is configurable.

## Setting it up

1. Create the settings you want and add them to your `SettingsProfile`.
2. **Add Component → WaggleBum → WagSettings → Quality Applier**. It seeds bloom, ambient occlusion and
   motion blur toggles when first added.
3. Wire each toggle's event to whatever owns the effect.
4. Put it under the **WagSettings Manager**, which attaches it when it starts.

## What throws, and what only warns

| Situation | Result |
|---|---|
| A toggle referencing a key not in the profile | **Throws** — `KeyNotFoundException` |
| Quality tier outside the project's levels | **Clamped** — a stored tier from a build with more levels must not crash |
| Render scale outside 0.1–2 | **Clamped** |
| A feature the pipeline lacks | **Warns once**, skipped |
| Render scale on a pipeline asset with no `renderScale` property | **Warns once**, skipped |

## Apply mode

Defaults to `OnApply`. If you want gamma to preview live, give it its own `QualityApplier` set to
`Immediate` with only the gamma key filled in — see [Extensibility](../Extensibility.md).
