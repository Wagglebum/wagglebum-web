# Glossary

| Term | Meaning |
|---|---|
| **Setting** | One value a player can change: master volume, window mode, UI scale. A `SettingAsset` in the project; an `ISettingDefinition` at runtime. |
| **Key** | A setting's stable storage name, `category.name` — `audio.master`. The prefix is the tab, the rest the label. Permanent once shipped. |
| **Profile** | A `SettingsProfile` asset: the list of settings a game exposes, in menu order, and which store persists them. The default one lives in a Resources folder. |
| **Registry** | A `SettingsRegistry`: a profile's settings loaded from a store, with pending values, dirty tracking and the Apply / Revert / Reset commands. |
| **Manager** | The `WagSettingsManager` scene component that owns the registry, attaches the appliers under it, and backs the static API. One per game. |
| **Static API** | `WagSettings.Get / Set / Apply` and friends — the one-line way to read and write settings from any script, through the manager. |
| **Pending value** | What the player has chosen but not yet applied. `Value` on a definition. |
| **Applied baseline** | The last value committed by Apply or loaded from the store. |
| **Dirty** | A setting whose pending value differs from its baseline. Apply and Revert enable themselves on it. |
| **Apply** | Commit every pending value to the store in one batch. What the Apply button and `WagSettings.Apply()` do. |
| **Revert** | Discard every pending value, restoring the baselines. |
| **Reset** | Return every setting to its authored default, pending until applied. |
| **Store** | An `ISettingsStore`: where values persist. `PlayerPrefsStore` by default; `WagSaveStore` when WagSave is installed. Writes buffer; `Flush` commits. |
| **Applier** | A `SettingApplierBase` component that turns a value into a Unity effect — mixer volume, screen resolution, quality tier. Lives under the manager. |
| **Apply mode** | Whether an applier acts on every change (Immediate) or only when the registry commits (OnApply). |
| **Binder** | What a UI control binds to: an `ISettingBinder` over a definition in UI Toolkit; a `…SettingBinder` component on a uGUI control. |
| **Category** | The tab a setting lands in, from its key's prefix. `SettingsMenuCategory` at runtime. |
| **Menu** | Either `WagSettingsMenu` (UI Toolkit) or `WagSettingsMenuUGUI`, both `ISettingsMenu`. They borrow the manager's registry. |
| **Setup** | The editor page that scans the project, and generates settings, the profile and a mixer into `Assets/WagSettings/Resources`. |
| **Manifest** | Setup's record of what it wrote and its fingerprint, so a re-run creates what is missing and never overwrites what you edited. |
| **Display mode** | A width, height and refresh rate. The resolution dropdown lists the ones the display supports. |
| **Locale** | A language code — `en`, `es`, `ja`, `ko`, `zh-CN`, `zh-TW`. The menu's is chosen by the game; the editor's on its Help page. |
