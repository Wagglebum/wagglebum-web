# Localization

Two things speak the player's — or the developer's — language: the settings menu a game ships, and the
editor a developer uses. They are separate, because the game's player and the game's developer are not
the same person.

## The menu, in the player's language

Both menus draw their words from `SettingsMenuStrings`: the title, Apply / Revert / Reset, the search
label, every tab, and every setting's label. Install a table before the menu opens:

```csharp
SettingsMenuLocalization.Apply("ja");   // en, es, ja, ko, zh-CN, zh-TW
```

![The settings menu in Japanese](Images/menu-localized-ja.png)

The packaged tables cover the commands, the five generated categories, and every setting setup
generates. A menu already open keeps the words it was built with until it is reopened.

Every lookup carries its own English fallback, so a missing entry shows the English word — never a
key, never a blank.

### Your own settings

A setting you added has a label derived from its key — `gameplay.difficulty` reads "Difficulty" — in
every language until you say otherwise. Add `Label.<key>` entries in a table of your own and lay it
over the packaged one:

```csharp
LocalizationTable packaged = SettingsMenuLocalization.Load("ja")!;
LocalizationTable mine = LocalizationTable.Parse(myJson);    // { "Label": { "gameplay.difficulty": "難易度" } }
SettingsMenuLocalization.Merge(packaged, mine);
```

A category of your own is `Category.<Name>` the same way. Where both tables have a key, yours wins.

The file format is the one the editor uses: a nested JSON object of strings, flattened to
`Section.Key`. `LocalizationTable.Parse` reads it and rejects anything else loudly, because a file that
half-loads is a menu that half-translates.

### What is not translated

Enum options — `Windowed`, `Borderless` — are authored on the `EnumSetting` asset and shown as authored.
Author them in the language you ship, or add a setting per language; a per-option key scheme is not in yet.

## The editor, in the developer's language

The editor window follows the language chosen on its **Help** page. Every string it shows comes from
`Editor/Localization/<locale>.json`; every page's docs pane from `Editor/EditorWindow/Docs/<Page>.<locale>.md`.
Until a language is chosen there, the one WagSave was set to is used, so with both installed you pick
once. Where a translation is missing, English is shown.

![The Help page with the editor language dropdown open](Images/help-language.png)

Tests hold every shipped locale to the English file: a key or a page missing from any language fails
the suite.

## These docs

The user documentation is under `Docs/<locale>/`, mirroring the English layout.
