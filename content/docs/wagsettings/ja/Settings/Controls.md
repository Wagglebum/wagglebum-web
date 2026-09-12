# コントロール

新しい Input System でのリバインド: キーボード、マウス、ゲームパッド。対話的なリバインド、競合検出、既定への
リセット、感度と反転のオプション付き。

## パッケージは任意で、任意のまま

コントロールのリバインドには `com.unity.inputsystem` が必要です。ほとんどの Unity プロジェクトにはなく、WagSettings
はそのすべてにきれいにインストールされなければなりません — そこでリバインドのコードは**独自のアセンブリ**にあり、
パッケージがあるときだけ Unity がコンパイルします。

| アセンブリ | versionDefines | defineConstraints |
|---|---|---|
| `WagSettings.InputSystem` | `com.unity.inputsystem` → `WAGGLEBUM_INPUTSYSTEM_PRESENT` | 同じ |

メインアセンブリ内の `#if ENABLE_INPUT_SYSTEM` では**不十分**です。`#if` はコードを除外しますが、`WagSettings.asmdef` は
依然として `Unity.InputSystem` を参照しなければならず、存在しないアセンブリ参照はコンパイルエラーです。ゲートは
コードだけでなく参照を解決します。

知っておく価値のある帰結: **リバインドの保存と競合検出は Input System に依存せず**、`Runtime/Core` にあります。
パッケージのないプロジェクトでも動き、テストされています。

## セットアップ

1. Package Manager から **Input System** をインストールする。
2. キー `controls.rebinds` の `StringSetting` を作る — **1 つの設定がすべてのリバインドを保持します**。任意で
   `controls.sensitivity` の `FloatSetting` と `controls.invertY` の `BoolSetting`。
3. `SettingsProfile` に追加する。
4. **Add Component → WaggleBum → WagSettings → Rebind Applier** を追加し、`InputActionAsset` を割り当てる。
5. 任意で、プレイヤーがリバインドできるアクションマップを列挙する — 空ならすべて許可。
6. **WagSettings Manager** の下に置く。マネージャーが起動時に接続します。Quick Start の `QuickStartControls` に、
   これを駆動するリバインドボタンがあります。

## 対話的なリバインド

```csharp
applier.StartInteractiveRebind(
    "Gameplay/Jump", bindingIndex: 0,
    onComplete: conflicts =>
    {
        if (conflicts.Count > 0)
        {
            ShowWarning($"That control is already used by {conflicts[0].ActionName}.");
        }
    },
    onCancel: () => ShowMessage("Rebind cancelled."));
```

![リバインド中にキー入力を待つコントロール行](../../Images/rebinding-listen.png)

プレイヤーが次に押したコントロールがバインディングになります。<kbd>Esc</kbd> でキャンセル。

手作りのリバインドが通常見落とし、アプライヤーが処理する 2 つの細部:

- **リバインド中はアクションが無効になります。** 有効なアクションは、まさに待っている入力を飲み込むので、最初の
  押下は捕捉されずに消費されます。その後、最初から有効だった場合にだけ再び有効になります。
- **動いたままのリバインドは `OnDisable` でキャンセルされます。** さもないと、リバインド中にメニューを閉じると、
  ゲーム内でプレイヤーが押すすべてのキーを聴く操作が残ります。

リバインドは競合の有無にかかわらず適用され、`onComplete` が何と衝突したかを伝えます。こうして方針 — 警告、交換、
取り消しの提供 — はあなたが選ぶのであって、押し付けられません。

> **テストカバレッジについて:** 対話的なリバインドはヘッドレス CI では完了できません — WagSettings のコードを一切
> 含まない素の `PerformInteractiveRebinding` でさえ、Unity 自身の `InputTestFixture` の下でも開始はするものの
> キューに入れたキー押下に決して一致しません。Unity が所有するその手順の両側はすべて自動的にカバーされます。
> 操作が始まる、聴いている間アクションがミュートされる、キャンセルで前の状態が復元される、完了したリバインドが
> 設定に届く。完了そのものは手動検証シーンで検証されています。

## 競合検出

```csharp
IReadOnlyList<BindingConflict> conflicts = applier.FindConflicts();
```

2 つのバインディングは、コントロールパスを共有し**かつ同時にアクティブになりうる**ときに衝突します。後半が、UI が
オオカミ少年になるのを防ぎます。

| 状況 | 競合? | 理由 |
|---|:--:|---|
| `Gameplay/Jump` と `Gameplay/Interact` の両方が Space | ✅ | 同じマップ、両方アクティブ |
| `Gameplay/Fire` と `Menu/Confirm` の両方が左マウス | ❌ | マップが一緒に有効になることはない |
| 異なる名前付きコントロールスキームの 2 つのバインディング | ❌ | 一度にアクティブなスキームは 1 つ |
| スキーム**なし**のバインディングとスキームありのもの | ✅ | スキームなしは常にアクティブ |
| 同じアクションが同じキーに 2 回バインド | ✅ | 冗長であり、プレイヤーに伝える価値がある |
| 両方とも**未バインド**の 2 つのアクション | ❌ | 空のコントロールはコントロールではない |

パスの比較は大文字小文字を無視します。競合する各ペアは一度だけ報告されます。

変更が着地する**前**に警告するには、候補を既存のバインディングと照合してください。

```csharp
var candidate = new InputBindingDescriptor("Gameplay", "Interact", 0, "<Keyboard>/space");
IReadOnlyList<InputBindingDescriptor> clashing =
    BindingConflictDetector.FindConflictsWith(applier.DescribeBindings(), candidate);
```

## リバインドの保存方法

すべてのリバインドは **1 つ**の `StringSetting` に、Input System のバインディング JSON ではなくバージョン付きの
WagSettings 形式で入ります。3 つの理由:

- 通常の設定に保存されるので、ほかのすべてと同様に保存、適用、取り消し、同期される
- Input System パッケージなしで読め、テストできる
- バージョン番号を持つので、将来の形式変更でプレイヤーのコントロールを破棄せず移行できる

読めない保存済みリバインドは例外を投げずに**警告付きで既定にリセット**されます。リバインドを失うのは悪い。
起動しないゲームはもっと悪い。項目ごとにも同じです。その後リネームや削除したアクションを名指しするリバインドは
警告付きで落とされ、残りは読み込まれます。

意図的にコントロールを未バインドにしたものは未バインドとして往復します — それはプレイヤーの選択であり、欠けた
データではありません。

## リセット

```csharp
applier.ResetAllBindings();          // everything back to the asset's authored bindings
applier.ResetBinding("Gameplay/Jump");
```

`ResetAllBindings` は保存された設定もクリアするので、リセットは次の Apply で永続化されます。

## 感度と反転

「感度」が何を掛けるかはゲーム固有なので、これらは適用されるのではなく `UnityEvent` として公開されます —
インスペクターでカメラコントローラーに配線してください。[グラフィックス](Graphics.md)と
[アクセシビリティ](Accessibility.md)のトグルと同じパターンです。

## 例外を投げるもの、警告だけのもの

| 状況 | 結果 |
|---|---|
| アセットに存在しないアクションのリバインド | **例外** — 開発者のタイポ |
| アクションが持たないバインディングインデックス | **例外** |
| アセット未割り当て、または別のものが動作中のリバインド開始 | **例外** |
| プロファイルにないキー | **例外** — `KeyNotFoundException` |
| 読めない保存済みリバインド | **警告**し、既定にリセット |
| リネームまたは削除されたアクションの保存済みリバインド | **警告**し、それを落とし、残りを保持 |
