# 出力フォーマット

WagSave は複数のセーブバックエンドをサポートしています。エディタウィンドウの **Save Output** で WagSave アセットごとに 1 つのフォーマットを選択します。フォーマットの切り替えにコードの変更は一切不要です。

---

## 利用可能なフォーマット

### ファイルベースのフォーマット

| フォーマット | インデックスバリアント | 説明 |
|---|---|---|
| Binary | あり | コンパクトなバイナリシリアライゼーション。リリース向けに推奨。 |
| JSON | あり | 人間が読める JSON。開発中に推奨。 |
| Text | あり | プレーンテキストのキーバリュー出力。 |
| PlayerPrefs | なし | Unity 組み込みのキーバリューストア。設定データや WebGL に適しています。 |

**インデックスバリアント**はセーブデータを複数のインデックスファイルに分割します。これにより、セーブ全体をロードせずに部分的な読み書きが可能になり、大規模なセーブデータセットでのパフォーマンスが向上します。

### クラウド・プラットフォームフォーマット

| フォーマット | 必要な SDK | 説明 |
|---|---|---|
| Unity Cloud Save | Unity Gaming Services | Unity がホストするクラウドバックエンドにセーブします。 |
| Steam Cloud Save | Steamworks SDK | Steam Remote Storage 経由でセーブします。 |

どちらのクラウドフォーマットも**条件付きコンパイル**されます。必要な SDK がプロジェクトにない場合、そのフォーマットはドロップダウンに表示されず、コンパイルエラーも発生しません。

---

## Unity Cloud Save のセットアップ

Unity Cloud Save には追加パッケージと実行時の一度限りの初期化が必要です。WagSave はスレッド管理を自動的に行うため、以下の手順以外に追加コードは必要ありません。

### 1 — 必要なパッケージのインストール

**Window > Package Manager** を開き、**Unity Registry** に切り替えて次の 2 つのパッケージをインストールします。

| パッケージ | パッケージ ID |
|---|---|
| Authentication | `com.unity.services.authentication` |
| Cloud Save | `com.unity.services.cloudsave` |

`com.unity.services.core` は依存関係として自動的に追加されます。

`com.unity.services.cloudsave` がプロジェクトに存在すると、スクリプティングシンボル `CLOUD_SAVE_ENABLED` が自動的に有効になり、フォーマットドロップダウンに **Unity Cloud Save** が表示されます。手動でシンボルを設定する必要はありません。

### 2 — Unity Gaming Services へのプロジェクトの紐づけ

1. **Edit > Project Settings > Services** を開きます。
2. サインインして Unity Cloud プロジェクトに紐づけます（必要に応じてダッシュボードで作成します）。
3. プロジェクト ID と組織 ID がプロジェクト設定に書き込まれます。

### 3 — 実行時の初期化

**任意のセーブ・ロード操作の前に、起動時に一度だけ**以下を呼び出してください。`Start()` メソッドや専用のブートストラッパーが適切な場所です。

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

> `UnityServices.InitializeAsync()` が完了する前にセーブまたはロードが呼び出された場合、WagSave はエラーをログに記録し、操作が失敗します。ゲームプレイを開始する前に必ず初期化を待機してください。

`SignInAnonymouslyAsync` はテストに適しています。リリースゲームでは、選択したサインイン方法（Steam、Google、Apple ID、ユーザー名とパスワードなど）に置き換えてください。

### 4 — フォーマットの選択

WagSave エディタウィンドウで **Save Output** に移動し、フォーマットドロップダウンから **Unity Cloud Save** を選択します。

### 注意事項

- Cloud Save データは**認証済みプレイヤーごと**に保存されます。各プレイヤーは独立したデータバケットを持ちます。
- WagSave はすべてのキーに内部的にプレフィックスを付与するため、同じプロジェクト内に複数の WagSave アセットがあってもクラウドバケットでの衝突は発生しません。
- WagSave はすべての Cloud Save 操作をメインスレッドで自動的に実行します。追加のスレッド設定は不要です。

---

## Steam Cloud Save のセットアップ

Steam Cloud Save には Steamworks.NET パッケージとアクティブな Steam セッションが必要です。以下のセットアップが完了すれば、WagSave がすべての Steam Remote Storage 呼び出しを自動的に処理します。

### 1 — Steamworks 開発者アカウントとアプリの作成

1. [partner.steamgames.com](https://partner.steamgames.com) でアカウントを登録します。Steam 配信契約への同意と 100 ドルのアプリ料金（売上 1,000 ドル達成後に返金）が必要です。
2. Steamworks パートナーダッシュボードでアプリを作成します。**App ID** が発行されます。
3. Steamworks ダッシュボードで **App Admin → Cloud** に移動し、アプリの **Steam Cloud** を有効にします。ストレージクォータを設定します（デフォルトの 1 GB / 1,000 ファイルはほとんどのゲームで十分です）。

> 開発中は自分の App ID の代わりに App ID `480`（Valve の公開テストアプリ SpaceWar）を使用できます。

### 2 — Steamworks.NET のインストール

**Window > Package Manager** を開き、**+** をクリックして **Add package from git URL** を選択し、以下を入力します。

```
https://github.com/rlabrecque/Steamworks.NET.git?path=/com.rlabrecque.steamworks.net
```

または、[steamworks.github.io](https://steamworks.github.io) から `.unitypackage` をダウンロードし、**Assets > Import Package** でインポートします。

パッケージが存在すると、WagSave アセンブリ定義によって `STEAM_ENABLED` スクリプティングシンボルが自動的に有効になります。フォーマットドロップダウンに **Steam Cloud Save** が表示されます。手動でシンボルを設定する必要はありません。

### 3 — steam_appid.txt の追加

プロジェクトのルート（`Assets/` フォルダを含むフォルダ）に `steam_appid.txt` という名前のプレーンテキストファイルを作成します。内容は App ID のみを記述します。

```
480
```

リリース前に `480` を実際の App ID に置き換えてください。このファイルは Steam 外で実行する際に `SteamAPI.Init()` を成功させるために必要です。

### 4 — 実行時の SteamAPI 初期化

Steam セーブターゲットには、セーブまたはロード操作の前に `SteamAPI.Init()` の呼び出しが必要です。Steamworks.NET には、この目的のための `SteamManager` コンポーネントが付属しています。

1. 完全な Steamworks.NET `.unitypackage` をインポートした場合、`SteamManager` プレハブが含まれています — シーンにドラッグしてください。
2. Package Manager 経由でインストールした場合は、シーンの GameObject に `SteamManager` スクリプトを手動で追加してください（ソースは [Steamworks.NET リポジトリ](https://github.com/rlabrecque/Steamworks.NET) から入手できます）。
3. WagSave のセーブまたはロードが実行される前に初期化されるよう、`SteamManager` をシーン階層の早い段階に配置してください。

> Steam クライアントがマシン上で起動している必要があります。Steam が起動していない場合、`SteamAPI.IsSteamRunning()` が false を返し、WagSave はエラーをスローします。

### 5 — セーブプロファイルの設定

1. Project ウィンドウで WagSave アセットを選択します。
2. インスペクターでセーブプロファイルを開くか、新規作成します。
3. **Save Target Destination** ドロップダウンを **Steam Cloud Save** に設定します。
4. **Target ID** を設定します — これが Steam Cloud に保存されるファイル名になります。例えば、Target ID が `slot1` の場合、`slot1.wsav` というファイルが作成されます。

### 注意事項

- セーブファイルは `.wsav` ファイルとして Steam Cloud に保存され、ゲーム終了時に自動的に同期されます。
- Steam Cloud には 1 ファイルあたり 100 MB のサイズ制限があります。制限を超えた場合はエラーがログに記録されます。
- データはログイン中の Steam アカウントに紐づけられます。各 Steam ユーザーは独立したクラウドストレージを持ちます。
- すべてのキーはセーブターゲットごとに 1 つのファイルに保存されます。複数の WagSave アセットを使用する場合は、それぞれに一意の Target ID を設定してください。

---

## ファイルプロパティ

セーブスロットが**無効**のとき、すべてのファイルベースフォーマットに適用されます。**Save Output > File Properties** で設定します。

- **Folder** — `Application.persistentDataPath` 内のサブフォルダ名。デフォルトは WagSave アセット名。
- **Filename** — セーブファイルのベース名。
- **Extension** — ファイル拡張子（例：`sav`、`dat`、`json`）。

セーブスロットが有効の場合、各スロットが独自のファイルパスを管理します。フォルダは **Save Slots > Slots Folder** で設定します。

---

## 保護オプション

**Save Output > Protection** にあります。

### 暗号化

非対称（公開鍵・秘密鍵）暗号化を使用してセーブファイルを暗号化します。

1. **Encrypt Data** を有効にする — WagSave が自動的に鍵ペアを生成します。
2. **秘密鍵**を安全に保管します。生成時にダイアログで表示されますが、WagSave はディスクに保存しません。
3. 次の 2 つの方法のいずれかを使用して、実行時に秘密鍵を提供します。

   **オプション A — イベント（推奨）：** 最初のセーブまたはロードの前に `OnGetEncryptionPrivateKey` を購読します。

   ```csharp
   wagSave.OnGetEncryptionPrivateKey += () => LoadPrivateKeyFromSecureStorage();
   ```

   **オプション B — 直接設定：** インスタンスにキーを直接設定します。

   ```csharp
   wagSave.Settings.SaveTarget.Options.EncryptPrivateKey = LoadPrivateKeyFromSecureStorage();
   ```

   イベント方式はキーの取得を使用時まで遅らせることができるため推奨されますが、どちらの方法も有効です。

**Regenerate Keys** をクリックすると新しい鍵ペアが発行されます。**再生成後は既存のセーブファイルが読み取れなくなります。**

### ファイル署名

各セーブファイルに暗号化署名を付加します。WagSave はロード時に署名を検証し、改ざんされたファイルを拒否します。

1. **Sign Output File** を有効にする — 秘密鍵が生成されて WagSave アセットに保存されます。
2. **Regenerate Key** をクリックすると新しい署名シークレットが発行されます。既存の署名済みファイルは検証に失敗します。

> 署名は改ざんやファイルの破損を検出します。しかし、決意した利用者がファイルの内容を読むことを防ぐわけではありません。内容の秘匿には暗号化を使用してください。

### セーブファイルのバックアップ

各保存の前に、既存のセーブファイルのコピーを `.bak` 拡張子付きで作成します。保存に失敗した場合（暗号化エラー、ディスク書き込み失敗など）、バックアップから自動的に以前のファイルが復元されるため、プレイヤーが書き込み途中の壊れたセーブデータに遭遇することはありません。

1. **Save Output > Protection** にある **Backup Before Save** を有効にします。
2. バックアップはデータファイルと同じフォルダに、同じ名前 + `.bak` で書き込まれます。
3. 保存に成功するとバックアップは自動的に削除されます。保存に失敗した場合は、調査のためにディスク上に残ります。

> インデックス付きファイル形式では使用できません。インデックス付きターゲットは保存ごとに置換ファイルを生成するのではなく、データファイルへ逐次書き込みを行うため、保存前のバックアップでは完全な以前の状態を表せません。

---

## 圧縮

**Save Output > Options** にある **Compress Output** を有効にすると、セーブファイルを書き込む前に圧縮が適用されます。セーブとロード時にわずかな CPU オーバーヘッドが生じますが、ファイルサイズが削減されます。セーブデータが大きい場合に推奨します。

---

## JSON プリティプリント

JSON フォーマット選択時に **Pretty Print JSON** を有効にすると、出力にインデントが追加されてデバッグ時に人間が読みやすくなります。ファイルサイズが増加するため、リリースビルドでは無効にしてください。

---

## プログレス UI

**Use Progress UI** を有効にすると、セーブ・ロード操作中に組み込みのプログレスインジケータープレハブが表示されます。プレハブは WagSave アセットから参照されます。別のプレハブを割り当てることで独自のものに差し替えられます。

---

## フォーマットの選び方

| 状況 | 推奨フォーマット |
|---|---|
| デスクトップまたはコンソールゲームのリリース | Binary |
| セーブデータのデバッグ | JSON |
| WebGL またはシンプルなキーバリューデータ | PlayerPrefs |
| サーバーサイドプロファイルを持つオンラインゲーム | Unity Cloud Save |
| Steam ゲーム | Steam Cloud Save |

---

## フォーマットの切り替え

エディタウィンドウでフォーマットを変更してプレイを開始するだけです。コードの変更は不要です。旧フォーマットの既存セーブファイルは新フォーマットでは読み取れません。本番環境でフォーマットを切り替える際は、セーブデータのクリアまたは移行を確実に行ってください。
