# オートセーブ

WagSave のオートセーブシステムは、設定可能なインターバルで自動的にセーブを実行します。タイマーは `WagSaveManager`（オートセーブを使用するシーンに存在している必要がある MonoBehaviour）によって駆動されます。

---

## セットアップ

### 1. エディタでオートセーブを有効にする

WagSave エディタウィンドウで **Autosave** に移動して次を設定します。
- **Enable Autosave** を有効にする
- **Interval (Seconds)** を設定する — セーブが発火する間隔
- **Enabled Scenes** にシーンを追加する — オートセーブはリストに含まれるシーンでのみ実行されます

### 2. シーンに WagSaveManager を追加する

`WagSaveManager` はタイマーのカウントダウンとセーブの発火を担う MonoBehaviour です。シーンの永続的な GameObject に追加してください。

```
Add Component > WaggleBum > WagSave > WagSave Manager
```

`WagSaveManager` は `Start` でアクティブな `WagSave` インスタンスを自動的に検索します。コードで接続する必要はありません。

---

## 有効なシーン

オートセーブは、アクティブなシーンが **Enabled Scenes** リストに含まれている場合にのみ発火します。プレイヤーがリストにないシーンにいる場合、タイマーは自動的に一時停止されます。これにより、メニュー、ローディング画面、カットシーン専用シーンでのオートセーブを防ぎます。

エディタウィンドウの **Autosave > Enabled Scenes** で設定します。シーンアセットをリストにドラッグしてください。

---

## オートセーブとセーブスロット

セーブスロットが有効の場合、各オートセーブは `SaveSlotType.Auto` タイプのスロットに書き込まれます。

**Use Latest Slot**（エディタウィンドウの **Autosave** で設定）:
- **オン** — オートセーブは最後に変更されたスロットを上書きします。プレイヤーの最後の手動セーブが最新の状態に保たれます。
- **オフ** — オートセーブごとに新しい `Auto` スロットが作成されます。オートセーブの履歴を保持したい場合に便利です。

特定のスロットをオートセーブ用に固定することもできます。

```csharp
SaveSlot checkpoint = wagSave.SaveSlots.AddNewSlot(SaveSlotType.Auto);
wagSave.SetAutoSaveSlot(checkpoint);

// 後で解除して自動選択に戻す
wagSave.ClearAutoSaveSlot();
```

---

## 実行時のタイマー制御

```csharp
WagSave wagSave = WagSave.GetInstance();

// オートセーブタイマーを一時停止する（カットシーンやポーズメニュー中など）
wagSave.PauseAutoSave();

// 一時停止したタイマーを再開する — カウントダウンを全インターバル分にリセット
wagSave.ResumeAutoSave();

// 一時停止せずにカウントダウンをリセットする（手動セーブの後など）
wagSave.ResetAutoSaveTimer();
```

### タイマーイベントへの反応

```csharp
// プレイヤーにカウントダウンを表示する
wagSave.OnAutoSaveTimer += (secondsRemaining, interval) =>
{
    float progress = (float)secondsRemaining / interval;
    autosaveProgressBar.value = progress;
};

wagSave.OnAutosavePause  += () => Debug.Log("オートセーブ一時停止");
wagSave.OnAutosaveResume += () => Debug.Log("オートセーブ再開");
```

---

## 手動でオートセーブをトリガーする

`AutoSave()` または `AutoSaveAsync()` をいつでも呼び出すことで、タイマーの状態に関係なくオートセーブを即時実行できます。スロット選択ロジック（最新か新規か）は引き続き適用されます。

```csharp
// 即時トリガー — プレイヤーがチェックポイントを通過したときなど
wagSave.AutoSave();

// または非同期で:
await wagSave.AutoSaveAsync();
```

---

## オートセーブイベントの購読

```csharp
wagSave.OnSaveStart     += () => ShowAutosaveIndicator();
wagSave.OnSaveCompleted += () => HideAutosaveIndicator();
wagSave.OnError         += (msg, ex) => Debug.LogError($"オートセーブ失敗: {msg}");
```

これらは手動セーブでも使用される同じイベントです。`OnSaveStart` と `OnSaveCompleted` はセーブの種類に関係なく、すべてのセーブで発火します。

---

## よくあるパターン

### メニュー表示中にオートセーブを一時停止する

```csharp
private void OpenPauseMenu()
{
    WagSave.GetInstance().PauseAutoSave();
    pauseMenuUI.SetActive(true);
}

private void ClosePauseMenu()
{
    pauseMenuUI.SetActive(false);
    WagSave.GetInstance().ResumeAutoSave();
}
```

### 手動セーブの後にカウントダウンをリセットする

プレイヤーが手動でセーブした直後にオートセーブが発火しないようにします。

```csharp
public async void OnSaveButtonPressed()
{
    var wagSave = WagSave.GetInstance();
    await wagSave.SaveAsync();
    wagSave.ResetAutoSaveTimer();
}
```
