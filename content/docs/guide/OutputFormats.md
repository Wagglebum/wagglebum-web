# Output Formats

WagSave supports multiple save backends. You choose one format per WagSave asset in the editor window under **Save Output**. Switching formats requires no code changes.

---

## Available Formats

### File-Based Formats

| Format | Indexed Variant | Description |
|---|---|---|
| Binary | Yes | Compact binary serialization. Recommended for shipping. |
| JSON | Yes | Human-readable JSON. Recommended during development. |
| Text | Yes | Plain text key-value output. |
| PlayerPrefs | No | Unity's built-in key-value store. Good for settings and WebGL. |

**Indexed variants** split save data across multiple indexed files. This enables partial reads and writes without loading the entire save, which improves performance for large save datasets.

### Cloud / Platform Formats

| Format | Required SDK | Description |
|---|---|---|
| Unity Cloud Save | Unity Gaming Services | Saves to Unity's hosted cloud backend. |
| Steam Cloud Save | Steamworks SDK | Saves via Steam Remote Storage. |

Both cloud formats are **conditionally compiled**. If the required SDK is not in your project, the format will not appear in the dropdown and no compilation errors occur.

---

## Unity Cloud Save Setup

Unity Cloud Save requires additional packages and a one-time runtime initialization. WagSave handles all threading automatically — no extra code is needed beyond the steps below.

### 1 — Install the Required Packages

Open **Window > Package Manager**, switch to **Unity Registry**, and install both packages:

| Package | Package ID |
|---|---|
| Authentication | `com.unity.services.authentication` |
| Cloud Save | `com.unity.services.cloudsave` |

`com.unity.services.core` is pulled in automatically as a dependency.

Once `com.unity.services.cloudsave` is present in the project the `CLOUD_SAVE_ENABLED` scripting define is activated automatically and the **Unity Cloud Save** option appears in the format dropdown. No manual define configuration is needed.

### 2 — Link Your Project to Unity Gaming Services

1. Open **Edit > Project Settings > Services**.
2. Sign in and link to a Unity Cloud project (or create one in the dashboard).
3. This writes your Project ID and Organisation ID into your project settings.

### 3 — Initialize at Runtime

Call the following **once at startup, before any save or load operation**. A `Start()` method or a dedicated bootstrapper are both suitable locations:

```csharp
using Unity.Services.Authentication;
using Unity.Services.Core;

private async void Start()
{
    await UnityServices.InitializeAsync();

    if (!AuthenticationService.Instance.IsSignedIn)
        await AuthenticationService.Instance.SignInAnonymouslyAsync();
}
```

> If a save or load is triggered before `UnityServices.InitializeAsync()` has completed, WagSave will log an error and the operation will fail. Always await initialization before entering gameplay.

`SignInAnonymouslyAsync` is sufficient for testing. For a shipping game replace it with your chosen sign-in method (Steam, Google, Apple ID, username/password, etc.).

### 4 — Select the Format

In the WagSave editor window, go to **Save Output** and select **Unity Cloud Save** from the format dropdown.

### Notes

- Cloud Save data is stored **per authenticated player**. Each player has their own isolated data bucket.
- All keys are namespaced internally by WagSave, so multiple WagSave assets in the same project will not collide in the cloud bucket.
- WagSave runs all Cloud Save operations on the main thread automatically. No additional threading setup is required.

---

## Steam Cloud Save Setup

Steam Cloud Save requires the Steamworks.NET package and an active Steam session. WagSave handles all Steam Remote Storage calls automatically once the setup below is complete.

### 1 — Create a Steamworks Developer Account and App

1. Register at [partner.steamgames.com](https://partner.steamgames.com). This requires agreeing to the Steam Distribution Agreement and paying a $100 app fee (refunded after $1,000 in sales).
2. Create an app in the Steamworks partner dashboard. You will receive an **App ID**.
3. In the Steamworks dashboard go to **App Admin → Cloud** and enable **Steam Cloud** for the app. Set a storage quota (the default of 1 GB / 1,000 files is sufficient for most games).

> During development you can use App ID `480` (Valve's public SpaceWar test app) in place of your own App ID to avoid needing a published app.

### 2 — Install Steamworks.NET

Open **Window > Package Manager**, click **+** and select **Add package from git URL**, then enter:

```
https://github.com/rlabrecque/Steamworks.NET.git?path=/com.rlabrecque.steamworks.net
```

Alternatively, download the `.unitypackage` from [steamworks.github.io](https://steamworks.github.io) and import it via **Assets > Import Package**.

Once the package is present the `STEAM_ENABLED` scripting define is activated automatically by the WagSave assembly definition. The **Steam Cloud Save** option will appear in the format dropdown. No manual define configuration is needed.

### 3 — Add steam_appid.txt

Create a plain text file named `steam_appid.txt` in the root of your project (the same folder that contains `Assets/`). Its only content should be your App ID:

```
480
```

Replace `480` with your real App ID before shipping. This file is required for `SteamAPI.Init()` to succeed when running outside of Steam.

### 4 — Initialize SteamAPI at Runtime

The Steam save target requires `SteamAPI.Init()` to be called before any save or load operation. Steamworks.NET ships a ready-made `SteamManager` component for this purpose.

1. If you imported the full Steamworks.NET `.unitypackage`, the `SteamManager` prefab is included — drag it into your scene.
2. If you installed via Package Manager, add a `SteamManager` script to a GameObject in your scene manually (the source is available in the [Steamworks.NET repository](https://github.com/rlabrecque/Steamworks.NET)).
3. Place `SteamManager` early in your scene hierarchy to ensure it initializes before any WagSave save or load is triggered.

> Steam must also be running on the machine. If the Steam client is not open, `SteamAPI.IsSteamRunning()` will return false and WagSave will throw an error.

### 5 — Configure a Save Profile

1. Select your WagSave asset in the Project window.
2. In the Inspector, open or create a save profile.
3. Set the **Save Target Destination** dropdown to **Steam Cloud Save**.
4. Set a **Target ID** — this becomes the filename stored in Steam Cloud. For example a Target ID of `slot1` creates a file named `slot1.wsav`.

### Notes

- Save files are stored in Steam Cloud as `.wsav` files and sync automatically when the game exits.
- Steam Cloud has a per-file size limit of 100 MB. An error will be logged if this limit is exceeded.
- Data is tied to the logged-in Steam account. Each Steam user has their own isolated cloud storage.
- All keys are stored in a single file per save target. If you use multiple WagSave assets, give each a unique Target ID.

---

## File Properties

Applies to all file-based formats when Save Slots are **disabled**. Configure in **Save Output > File Properties**:

- **Folder** — Subfolder name within `Application.persistentDataPath`. Defaults to the WagSave asset name.
- **Filename** — Base name of the save file.
- **Extension** — File extension (e.g. `sav`, `dat`, `json`).

When Save Slots are enabled, each slot manages its own file path. The folder is configured under **Save Slots > Slots Folder**.

---

## Protection Options

Found in **Save Output > Protection**.

### Encryption

Encrypts the save file using asymmetric (public/private key) encryption.

1. Enable **Encrypt Data** — WagSave generates a key pair automatically.
2. Store your **private key** securely. A dialog presents it at generation time — it is not stored on disk by WagSave.
3. Supply the private key at runtime using one of two approaches:

   **Option A — Event (recommended):** Subscribe to `OnGetEncryptionPrivateKey` before the first save or load:

   ```csharp
   wagSave.OnGetEncryptionPrivateKey += () => LoadPrivateKeyFromSecureStorage();
   ```

   **Option B — Direct setting:** Assign the key directly to the instance:

   ```csharp
   wagSave.Settings.SaveTarget.Options.EncryptPrivateKey = LoadPrivateKeyFromSecureStorage();
   ```

   The event is preferred as it defers key retrieval to the moment of use. Either approach is valid.

Click **Regenerate Keys** to issue a new key pair. **Existing save files become unreadable** after regeneration.

### File Signing

Adds a cryptographic signature to each save file. WagSave verifies the signature on load and rejects tampered files.

1. Enable **Sign Output File** — a secret key is generated and stored in the WagSave asset.
2. Click **Regenerate Key** to issue a new signing secret. Existing signed files will fail verification.

> Signing detects tampering and file corruption. It does not prevent a determined user from reading the file contents — use Encryption for that.

### Save File Backup

Creates a copy of the existing save file with a `.bak` extension before each save. If the save fails (encryption error, disk write failure, etc.) the previous file is automatically restored from the backup, so the player never ends up with a half-written or corrupted save.

1. Enable **Backup Before Save** under **Save Output > Protection**.
2. The backup is written to the same folder as the data file using the same name plus `.bak`.
3. After a successful save the backup is removed automatically. After a failed save the backup is left on disk so it can be inspected.

> Not available for indexed file formats. Indexed targets write incrementally to the data file in place rather than producing a single replacement file per save, so a pre-save backup would not represent a complete prior state.

---

## Compression

Enable **Compress Output** under **Save Output > Options** to apply compression to the save file before writing. Reduces file size at the cost of a small CPU overhead on save and load. Recommended when save data is large.

---

## JSON Pretty Print

Enable **Pretty Print JSON** when the JSON format is selected. Adds indentation to the output, making it human-readable for debugging. Increases file size and should be disabled for shipping builds.

---

## Progress UI

Enable **Use Progress UI** to display the built-in progress indicator prefab during save and load operations. The prefab is referenced on the WagSave asset. You can replace it with your own by assigning a different prefab.

---

## Choosing a Format

| Situation | Recommended Format |
|---|---|
| Shipping a desktop or console game | Binary |
| Debugging save data | JSON |
| WebGL or simple key-value data | PlayerPrefs |
| Online game with server-side profiles | Unity Cloud Save |
| Steam game | Steam Cloud Save |

---

## Switching Formats

Change the format in the editor window and hit Play. No code changes are needed. Existing save files in the old format will not be readable by the new format — ensure you clear or migrate save data when switching in production.
