# Setup

Setup takes a project from nothing to a generated settings profile in one sitting.

**Tools → WaggleBum → WagSettings → Setup** — the Setup page of [the editor window](EditorWindow.md).
The choices, the preview and Generate are on it; what the project has, and what is left to do
afterwards, are on the **Summary** page beside it. This page covers both.

## One screen, not a sequence of steps

There are few enough choices to see at once, every one has a default derived from what the project
actually has, and the preview updates as they change. That means **the consequence of a choice is visible
while you make it**, rather than several clicks later.

![The Setup page: categories, menu and persistence choices, preview and Generate](Images/editor-window-setup.png)

It is also meant to be **reopened**. Generation is idempotent, so coming back in three months to add a
category is the normal case, not a restart. A wizard implies one shot; this is a panel you return to.

Everything reports at once, too. A stepped flow shows you the first problem and hides the second until
the first is solved; one screen can afford to list every reason generating is refused.

## Project — on the Summary page

Summary starts by looking at what the project actually has, and says what each finding means for the
setup you are about to generate.

![The Project section with a warning and its Package Manager button](Images/summary-project-checks.png)

| Check | What it reports |
|---|---|
| Unity version | Whether the editor is 2022.3 or newer |
| Render pipeline | Built-in, URP, HDRP or custom — and which graphics settings that makes available |
| UI framework | Whether UI Toolkit and uGUI are available |
| Input System | Whether control rebinding is available |
| TextMeshPro | Whether the uGUI menu can use TMP text |
| Persistence | Whether WagSave is installed, or settings will use PlayerPrefs |

### Severity is chosen carefully

WagSettings stands alone, so **almost nothing about a project can genuinely block setup**. A missing
package costs a feature, not the menu.

- **Pass** — nothing to do.
- **Warning** — something is missing, but setup continues. No Input System means no rebinding; everything
  else works.
- **Blocker** — there would be nothing to generate. Only two things qualify: an editor older than 2022.3,
  and having neither UI Toolkit nor uGUI, which leaves no way to build a menu at all.

**Warnings never disable Generate.** Marking optional packages as blockers would train you to ignore this
section, which is exactly when a real blocker gets missed.

Not having WagSave is a **pass**, not a shortcoming — standing alone on PlayerPrefs is the design. Install
it later and settings upgrade themselves with nothing to change here.

### One-click fixes

A finding that can be fixed carries a button that installs the package through the Package Manager. The
screen re-scans when the install finishes, because the check is only meaningful once the new package's
assemblies exist.

A blocker always offers a way forward — a blocker with no fix would be a dead end, and there is a test
asserting the UI-framework blocker offers its install. The Summary page shows the install in progress.

**Re-scanning refreshes what the project has, not what you decided.** Installing a package and re-scanning
will not quietly undo your choices.

## Settings to generate

Each category becomes a group of setting assets and a tab in the menu. Every category is on by default,
except Controls when the Input System is absent — generating a rebinding section that cannot work would be
worse than leaving it out.

| Category | Settings |
|---|---|
| Audio | Master, music and SFX volume, mute |
| Display | Width, height, refresh rate, window mode, VSync |
| Graphics | Quality tier, gamma, bloom, ambient occlusion, motion blur |
| Accessibility | UI scale, colourblind preset, reduce motion, subtitle scale and background |
| Controls | Rebinds, sensitivity, invert Y |

The row for each category shows how many settings it adds, so the size of the result is visible before
generating rather than after.

## Menu and persistence

| Choice | Default | What it affects |
|---|---|---|
| UI framework | UI Toolkit when available, otherwise uGUI | Which menu component the finished steps tell you to add |
| Persistence | Automatic | Written into the generated profile |
| Audio mixer | Create from the template | Whether a mixer is generated — shown only while Audio is ticked |

`Automatic` resolves to WagSave when it is installed and PlayerPrefs when it is not, so there is normally
nothing to choose here. `PlayerPrefs` forces the simple store even in a project that has WagSave.

### The audio mixer

Volume sliders need an `AudioMixer` with exposed parameters to drive, and exposing parameters is the step
people miss. So setup ships a **mixer template** — Master, Music and SFX groups with `MasterVolume`,
`MusicVolume` and `SfxVolume` exposed — and clones it into the generated folder as `WagSettingsMixer.mixer`.

The template, the generated audio settings and `AudioMixerApplier`'s default buses are written to agree,
and a test holds them together. Add an Audio Mixer Applier, assign the generated mixer, and every default
bus finds its setting and its parameter with nothing typed by hand.

**Use an existing mixer** writes nothing. The mixer is yours; expose `MasterVolume`, `MusicVolume` and
`SfxVolume` on it, or rename the applier's buses to whatever it already exposes. Choosing this without
picking a mixer is one of the things Generate refuses.

The clone is tracked like every other generated asset: a re-run skips it, an edit you make in the mixer
window is kept, and a newer template in a later package version shows as an update — only ever applied to
a clone you have not touched.

`AudioMixer` has no public creation API, which is why this is a clone rather than a build. The template
is authored once and committed; the package only copies it.

## What is refused, and why

Generate is disabled while any of these hold, and **every** unmet reason is listed above the button:

- **UI framework** — choosing uGUI without the package installed. The menu could not open.
- **Categories** — selecting nothing, or selecting Controls without the Input System.
- **Audio mixer** — "use an existing mixer" without choosing one.
- **Project** — a blocker, which means there would be nothing to generate at all.

Persistence never refuses: `Automatic` already falls back to PlayerPrefs.

Generate is also disabled when the preview says there is nothing to do, because every asset is already up
to date.

## Preview and generate

**Nothing is written until you have seen exactly what would happen.** The preview lists every asset and
what it would get, and updates as you change a choice:

```
Into Assets/WagSettings/Resources

Create   Assets/WagSettings/Resources/AudioMaster.asset
Update   Assets/WagSettings/Resources/WagSettingsProfile.asset
Skip     Assets/WagSettings/Resources/AudioMusic.asset  (already up to date)
Keep     Assets/WagSettings/Resources/AudioSfx.asset  (edited since it was generated)
```

![The preview listing what Generate will create, update and keep](Images/setup-preview-plan.png)

The one-line summary next to the Generate button is always visible, so the detail can stay folded away
until you want it.

### Re-running is safe

Setup keeps a **generation manifest** recording every asset it produced and a fingerprint of what it
wrote. That lets it tell three cases apart:

| Situation | What happens |
|---|---|
| The asset does not exist | **Create** |
| Setup made it and nobody has touched it | **Update** if the settings changed, **Skip** if not |
| Setup made it and it has since been edited | **Keep** — left exactly as it is |
| Something else is already at that path | **Keep** — not setup's to overwrite |

So generating again after adding a category creates only the new assets. **Hand-tuning a generated default
is never thrown away.** Delete a generated asset and setup offers to make it again.

### If generation fails

Generation runs as one `AssetDatabase` transaction. If anything throws part-way, every asset created in
that run is deleted before the error surfaces — a half-generated project is worse than none. The
transaction is closed in a `finally`, so a failure cannot leave the asset database paused for the rest of
the session.

Created assets are registered with `Undo`, so <kbd>Ctrl</kbd>+<kbd>Z</kbd> works.

### Why the generated folder is a Resources folder

`Assets/WagSettings/Resources` is not a naming accident. A `SettingsProfile` in a Resources folder is
what `WagSettingsBootstrapper` looks for at startup, so a project that has run setup gets a running
`WagSettingsManager` — and a working static API — with nothing placed in any scene. The generated
profile is flagged **Is Default** so it wins if another profile shares the folder. The generation
manifest, which is editor bookkeeping, is marked not to ship in builds.

### After it runs

The editor moves to **Summary**, which shows what was written, with buttons to the generated profile, the
generated folder, the Quick Start scene and the cheatsheet. The steps left to do by hand are in that
page's docs pane, so they are there whenever you come back. Come back to Setup to adjust and generate
again.

![The Summary page after a generation, with its shortcut buttons](Images/summary-after-generate.png)

## Not generated yet

Setup generates **setting assets, the profile that holds them, and the audio mixer**. It does not yet
create an InputActionAsset or apply a visual style preset, so no controls for those are shown. The
`StyleRule` rule, the input-actions half of `WiringRule`, and their model fields exist ready for when
generation honours them.

Wire input actions by hand for now; see [Controls](Settings/Controls.md).

## Getting to Setup

| Route | When |
|---|---|
| **Tools → WaggleBum → WagSettings → Setup** | Any time — opens the editor on the Setup page |
| The **Setup** page in the editor's rail | Whenever the editor is open |
| Scene view overlay | Enable "WagSettings" from the Scene view's overlay menu |
| Automatically, once | The first time the editor loads after installing |

### On opening itself

Setup offers itself **once** and then never again. An asset that reopens a window on every domain reload
gets uninstalled, so the answer is remembered the moment it appears — closing it immediately counts as
having been offered.

The mark is stored per package version, so a major upgrade may introduce itself once more. If the version
cannot be determined, it never opens itself at all, because a version it cannot record against would mean
asking on every reload.

The Scene view overlay is **hidden by default**. A package that plants itself permanently on someone's
Scene view has overstepped; it is there in the overlay menu for anyone who wants it.

## How it is put together

The pages are shells over one `SetupSession`, shared so switching between Summary and Setup loses
neither the scan nor a choice. What the project has is `EnvironmentDetector`, what you chose is `SetupModel`,
whether it can be generated is `SetupValidation` over a list of `ISetupRule`, and what would be written is
`SettingsGenerator` — all plain classes with no editor-window dependency, so every rule is tested
directly.

A rule answers `IsSatisfied(model, out reason)`. It owns no UI, which is why the same condition that greys
out the Generate button is a two-line assertion in a test.

Detection reads raw facts through `IEnvironmentProbe`, which is why a scenario like "HDRP with no Input
System on an unsupported editor" is a two-line test rather than a whole project. Every optional package is
found by looking for a type by name rather than by referencing it: referencing URP or the Input System
here would mean setup fails to compile in exactly the project it exists to help.

The Setup page separates rebuilding its controls from refreshing what follows from them: the session
raises `Scanned` apart from `Changed`, so ticking a box never rebuilds the box being ticked — the settings
menu learned that lesson the hard way when rebuilding every row threw away focus mid-drag.
