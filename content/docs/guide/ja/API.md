# API リファレンス

特に断りのない限り、すべての型は `WaggleBum.WagSave` 名前空間に属します。

```csharp
using WaggleBum.WagSave;
using WaggleBum.WagSave.Core.SaveSlots; // SaveSlot, SaveSlotManager
using WaggleBum.WagSave.Core.Enums;    // SaveSlotType, LogLevel
```

---

## インスタンスの取得

```csharp
// アクティブな（または唯一の）WagSave インスタンスを取得する
WagSave wagSave = WagSave.GetInstance();

// ID を指定して特定のインスタンスを取得する（複数インスタンスがある場合に便利）
WagSave wagSave = WagSave.GetInstance("my-instance-id");

// プロジェクト内のすべてのインスタンスを取得する
WagSave[] all = WagSave.GetAllInstances();
```

ビルドの実行時、`GetInstance` は `Resources/WagSave/` から読み込みます。エディタでは `AssetDatabase` を使用します。インスタンスが見つからない場合は `null` が返され、警告がログに出力されます。

---

## コンポーネントのセーブ・ロード

これらのメソッドは、現在ロードされているすべてのシーンにわたって `WagSaveComponent` のインスタンスをセーブ・ロードします。

### 同期

```csharp
// すべてのコンポーネントをセーブする — 特定のスロットを指定することもできる
wagSave.Save();
wagSave.Save(slot);

// すべてのコンポーネントをロードする — 特定のスロットを指定することもできる
wagSave.Load();
wagSave.Load(slot);
```

### 非同期（推奨）

シリアライゼーションとファイル入出力はバックグラウンドスレッドで実行されます。Unity API の呼び出しはメインスレッド上に留まります。

```csharp
await wagSave.SaveAsync();
await wagSave.SaveAsync(slot);

await wagSave.LoadAsync();
await wagSave.LoadAsync(slot);
```

### セーブスロット有効時の動作

セーブスロットが有効で `slot` 引数が指定されていない場合:
- **Use Save Slot UI** がオンの場合、組み込みのスロット選択 UI が自動的に表示されます。
- **Use Save Slot UI** がオフの場合、設定に基づいて WagSave が自動的にスロットを選択します。

UI とスロット選択を完全にバイパスするには、明示的に `slot` を渡してください。

---

## キーバリューのセーブ・ロード

特定の GameObject に紐付かない個別の値をセーブするために使用します。

```csharp
// 静的な利便メソッド — アクティブな WagSave インスタンスを使用する
WagSave.Save("score", 9500);
WagSave.Save("playerName", "Alex", groupName: "player");

// 型付きロード
int score = WagSave.Load<int>("score");
string name = WagSave.Load<string>("playerName", groupName: "player");

// 型なしロード
object raw = WagSave.Load("score");
```

オプションの `groupName` パラメーターはキーを名前空間に分離してキーの衝突を防ぎます。オプションの `instanceId` パラメーターは複数インスタンスが存在する場合に特定の WagSave インスタンスを対象とします。

---

## オートセーブ

```csharp
// オートセーブを即時実行する（同期）
wagSave.AutoSave();

// オートセーブを即時実行する（非同期）
await wagSave.AutoSaveAsync();

// オートセーブタイマーを一時停止する
wagSave.PauseAutoSave();

// 一時停止したオートセーブタイマーを再開する（カウントダウンをリセット）
wagSave.ResumeAutoSave();

// 一時停止せずにオートセーブのカウントダウンをリセットする
wagSave.ResetAutoSaveTimer();

// 次のオートセーブで使用するスロットを固定する
wagSave.SetAutoSaveSlot(slot);

// 固定スロットを解除して自動選択に戻す
wagSave.ClearAutoSaveSlot();
```

オートセーブタイマー自体は `WagSaveManager`（シーンに必要な MonoBehaviour）によって駆動されます。詳細は [オートセーブ](Autosave.md) を参照してください。

---

## プロパティ

| プロパティ | 型 | 説明 |
|---|---|---|
| `IsSaving` | `bool` | セーブ操作が進行中の場合 true。 |
| `IsLoading` | `bool` | ロード操作が進行中の場合 true。 |
| `Progress` | `int` | 現在の操作の進行状況（0〜100）。 |
| `Settings` | `WagSaveSettings` | すべての設定への参照。 |
| `SaveSlots` | `SaveSlotManager` | セーブスロットマネージャー。詳細は [セーブスロット](SaveSlots.md) 参照。 |
| `IsSaveOverrideEnabled` | `bool` | `OnSaveOverride` と `OnLoadOverride` の両方が購読されている場合 true。 |
| `DebugLogLevel` | `LogLevel` | Unity コンソールに出力される最低ログ重大度。 |
| `LogToFileEnabled` | `bool` | true の場合、ログ出力をファイルにも書き出す。 |
| `InstanceCount` | `int` | プロジェクト内で見つかった WagSave アセットの数。 |

---

## イベント

WagSave インスタンスのイベントを購読することで、セーブ・ロードのライフサイクルの変化に反応できます。

```csharp
private void OnEnable()
{
    var wagSave = WagSave.GetInstance();
    wagSave.OnSaveStart     += HandleSaveStart;
    wagSave.OnSaveCompleted += HandleSaveCompleted;
    wagSave.OnLoadStart     += HandleLoadStart;
    wagSave.OnLoadCompleted += HandleLoadCompleted;
    wagSave.OnProgress      += HandleProgress;
    wagSave.OnError         += HandleError;
}

private void OnDisable()
{
    var wagSave = WagSave.GetInstance();
    if (wagSave == null) return;
    wagSave.OnSaveStart     -= HandleSaveStart;
    wagSave.OnSaveCompleted -= HandleSaveCompleted;
    wagSave.OnLoadStart     -= HandleLoadStart;
    wagSave.OnLoadCompleted -= HandleLoadCompleted;
    wagSave.OnProgress      -= HandleProgress;
    wagSave.OnError         -= HandleError;
}

private void HandleSaveStart()    { Debug.Log("セーブ開始"); }
private void HandleSaveCompleted(){ Debug.Log("セーブ完了"); }
private void HandleLoadStart()    { Debug.Log("ロード開始"); }
private void HandleLoadCompleted(){ Debug.Log("ロード完了"); }
private void HandleProgress(int percent) { Debug.Log($"進行状況: {percent}%"); }
private void HandleError(string message, Exception ex) { Debug.LogError(message); }
```

### イベント一覧

| イベント | シグネチャ | 発火タイミング |
|---|---|---|
| `OnSaveStart` | `() => void` | セーブが始まる直前。 |
| `OnSaveCompleted` | `() => void` | セーブが正常に完了した後。 |
| `OnLoadStart` | `() => void` | ロードが始まる直前。 |
| `OnLoadCompleted` | `() => void` | ロードが正常に完了した後。 |
| `OnProgress` | `(int percent) => void` | セーブまたはロード中に 0〜100 の進行状況とともに定期的に発火。 |
| `OnError` | `(string msg, Exception ex) => void` | セーブまたはロードのエラー発生時。 |
| `OnAutoSaveTimer` | `(int secondsRemaining, int interval) => void` | オートセーブカウントダウン中に毎フレーム発火。 |
| `OnAutosavePause` | `() => void` | オートセーブが一時停止されたとき。 |
| `OnAutosaveResume` | `() => void` | オートセーブが再開されたとき。 |
| `OnAutosaveTimerReset` | `() => void` | オートセーブのカウントダウンがリセットされたとき。 |
| `OnGetEncryptionPrivateKey` | [拡張性](Extensibility.md) 参照 | 暗号化されたセーブが秘密鍵を必要とするとき。 |
| `OnSaveOverride` | [拡張性](Extensibility.md) 参照 | カスタムシリアライゼーション — デフォルトのセーブロジックを置き換える。 |
| `OnLoadOverride` | [拡張性](Extensibility.md) 参照 | カスタムデシリアライゼーション — デフォルトのロードロジックを置き換える。 |

---

## 複数インスタンス

プロジェクトに複数の WagSave アセットがある場合（例：ゲームデータと設定データを別々に管理する場合）、エディタでいずれかを **Active** としてマークするか、次を呼び出します。

```csharp
wagSave.SetActive(); // このインスタンスをアクティブにし、他をすべて非アクティブにする
```

引数なしの `GetInstance()` はアクティブなインスタンスを返します。特定のインスタンスを取得するには次を使用します。

```csharp
WagSave settingsSave = WagSave.GetInstance("settings-instance-id");
```

インスタンス ID は WagSave エディタウィンドウのヘッダーに表示され、アセットに保存されています。
