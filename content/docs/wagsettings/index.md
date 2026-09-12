# WagSettings Documentation

WagSettings is a settings and options menu system for Unity 2022 LTS and above. It provides audio,
display, graphics, control-rebinding and accessibility settings behind a clean runtime API, with a
single-screen setup that generates a working menu for you.

![The editor window on the Summary page: rail, page, docs pane](Images/editor-window-summary.png)

## Start here

- [Cheatsheet](Cheatsheet.md) — everything on one page.
- [Getting Started](GettingStarted.md) — install the package and get a settings menu running.
- [The Editor Window](EditorWindow.md) — the rail, the pages, the docs pane, the language.
- [Setup](Setup.md) — the Setup page and what it generates.
- [Quick Start sample](GettingStarted.md) — a scene per UI framework, under `Sample Scenes/Quick Start`; Getting Started walks it.

## Reference

- [API](API.md) — the runtime API surface.
- [Persistence](Persistence.md) — how settings are saved, and what lights up with WagSave.
- [Extensibility](Extensibility.md) — adding your own settings and appliers.
- [Localization](Localization.md) — the menu in the player's language, the editor in yours.
- [Glossary](Glossary.md) — terms used throughout these docs.

## Settings categories

- [Audio](Settings/Audio.md)
- [Display](Settings/Display.md)
- [Graphics](Settings/Graphics.md)
- [Accessibility](Settings/Accessibility.md)
- [Controls](Settings/Controls.md)

Also in: [Español](es/index.md) · [日本語](ja/index.md) · [한국어](ko/index.md) · [简体中文](zh-CN/index.md) · [繁體中文](zh-TW/index.md)

This package is pre-release; see [CHANGELOG.md](../CHANGELOG.md) for what has landed.

## Architecture at a glance

WagSettings is five layers with strictly downward dependencies. UI never touches persistence, and
persistence never knows about UI.

| Layer | Folder | Responsibility |
|---|---|---|
| 5 | `Runtime/UI/` | UI Toolkit and uGUI views that bind to the registry and own nothing |
| 4 | `Runtime/Appliers/` | Turn a setting value into a Unity effect |
| 3 | `Runtime/Core/` | `SettingDefinition<T>`, `SettingsRegistry`, `ISettingsStore`, `Guard` — no `UnityEngine` |
| — | `WagSettings.cs`, `WagSettingsManager.cs` | The static API and the scene component that owns the registry |
| 3 | `Runtime/Definitions/` | The ScriptableObject setting assets and `SettingsProfile` |
| 2 | `Runtime/Persistence/` | `ISettingsStore` implementations and the store factory |
| — | `WagSave/` | The optional WagSave-backed store, compiled only when WagSave is installed |

Adding a setting means adding a `SettingDefinition` asset and one applier. Nothing else changes.
