# The Editor Window

**Tools → WaggleBum → WagSettings → Editor**

One window, the same shape as WagSave's, so a developer with both learns one layout.

```
┌────────────────────┬──────────────────────────────────────────────┐
│ [logo] WagSettings │ Setup                                 [Docs] │
│────────────────────│──────────────────────────────────────────────│
│ ▸ Summary          │  the page                     │ its docs,    │
│   Setup            │                               │ in your      │
│   Settings Profile │                               │ language     │
│   Debugger         │                               │              │
│   Help             │                               │              │
│ v0.9.0             │                               │              │
└────────────────────┴───────────────────────────────┴──────────────┘
```

![The editor window on the Summary page: rail, page, docs pane](Images/editor-window-summary.png)

- **The rail** on the left lists the pages. The one you were on last time is the one you get.
- **The docs pane** on the right explains the page you are looking at. Drag it wider or narrower, or
  turn it off with **Docs** in the header; both are remembered.
- **Summary** is status: what the project has, whether what setup would generate is already in place,
  and what is left to do by hand. Nothing on it changes the project.
- **Setup** is the choices: what to generate, the preview, Generate. *Tools → WaggleBum → WagSettings →
  Setup* opens the editor on this page, so every link you had still works. Generating moves you to
  Summary.
- **Settings Profile** is where "add your own setting" lives: which profile is default, every setting in it with
  its key, kind, default and range, reorder and remove, and **Add Setting**, a dialog that creates a new
  setting asset next to the profile with its key checked as you type. The profile you pick is remembered.
  See [Extensibility](Extensibility.md).
- **Debugger** is live in play mode: every setting's pending value, Apply / Revert / Reset, and which
  appliers the manager attached. It polls four times a second and redraws only when something moved.
- **Help** has the version, the cheatsheet, both Quick Start scenes, and the editor's language.

![The Settings Profile page listing every setting in the profile](Images/settings-profile-page.png)

![The Debugger in Play mode with a pending value shown bold](Images/debugger-play-mode.png)

## First run

A project with no `SettingsProfile` at all sees a single screen instead of the rail: the logo, a
sentence, and **Run Setup**. A rail of pages about settings that do not exist yet would be noise.

## Language

The editor follows the language chosen on the Help page. Until one is chosen, it follows the language
WagSave was set to, so with both installed you pick once. Where a translation is missing, English is
shown — a string that has not been translated yet appears in English, never as a blank or a key.

![The Help page with the editor language dropdown open](Images/help-language.png)

## For the curious

Each page is an `EditorContent`; the rail is `EditorPages`; what the window remembers is
`EditorWindowState` over an `IEditorPreferences` seam; a page's docs are `EditorDocs`, which tries
`<Page>.<locale>.md`, then `.en.md`, then `.md`; strings come from `WagSettingsL10n` over
`Editor/Localization/<locale>.json`. All of those are plain classes with tests. The window itself is
the one thing that has to be looked at.
