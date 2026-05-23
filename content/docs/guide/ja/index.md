# WagSave ドキュメント

WagSave は Unity 2022 LTS 以降向けのプロダクション品質のセーブシステムです。シリアライゼーション、ファイル入出力、暗号化、圧縮、セーブスロット、オートセーブ、クラウドバックエンドを一通りサポートし、コードなしで始められる Unity エディタウィンドウですべての設定が完結します。

**名前空間:** `WaggleBum.WagSave`
**Unity バージョン:** 2022.3 LTS+
**パブリッシャー:** WaggleBum

---

## エディタ言語

WagSave エディタは複数の言語に対応しています。表示言語を変更するには:

1. **Edit > Preferences**（Windows / Linux）または **Unity > Preferences**（macOS）を開きます。
2. 左側のパネルから **WagSave** を選択します。
3. **Locale** ドロップダウンで希望の言語を選択します。
4. 変更を反映するには、Unity エディタを閉じて再度開いてください。

**利用可能な言語:**

- English（英語）
- Español（スペイン語）
- 日本語 (Japanese)
- 한국어（韓国語）
- 中文（简体）（中国語簡体字）
- 中文（繁體）（中国語繁体字）

---

## ドキュメント一覧

| ドキュメント | 説明 |
|---|---|
| [クイックスタート](#クイックスタート) | 簡単な手順ですぐに始める |
| [はじめに](GettingStarted.md) | インストール、セットアップ、最初のセーブ・ロード |
| [WagSave コンポーネント](WagSaveComponent.md) | セーブ対象となる GameObject のマーキング |
| [API リファレンス](API.md) | セーブ・ロード API、イベント、プロパティの全一覧 |
| [セーブスロット](SaveSlots.md) | マルチスロットのセーブシステム |
| [オートセーブ](Autosave.md) | インターバルベースの自動セーブ |
| [出力フォーマット](OutputFormats.md) | フォーマット、ファイル設定、暗号化、圧縮 |
| [WagSave トリガー](WagSaveTrigger.md) | 物理ベースのセーブトリガーコンポーネント |
| [拡張性](Extensibility.md) | カスタムフォーマット、シリアライザー、セーブオーバーライド |

---

## クイックスタート

### キー / バリュー
以下のコードスニペットは、WagSave インスタンスを設定することなく基本的なセーブとロードを行うためのものです。デフォルト設定でインスタンスが自動的に作成されます。セーブ出力の設定や高度な機能を使用するには、WagSave インスタンスのクイックスタート手順に従ってください。

以下のコードサンプルは、パッケージに含まれるクイックスタートサンプルシーンで実際に使用されています。
```csharp
        void Update()
        {
            var kb = Keyboard.current;
            if (kb == null) return;

            // Move Player
            var h = (kb.rightArrowKey.isPressed ? 1f : 0f) - (kb.leftArrowKey.isPressed ? 1f : 0f);
            var v = (kb.upArrowKey.isPressed ? 1f : 0f) - (kb.downArrowKey.isPressed ? 1f : 0f);
            transform.Translate(new Vector3(h, 0f, v) * (moveSpeed * Time.deltaTime));

            // Save Player Position
            if (kb.sKey.wasPressedThisFrame)
            {
                WagSave.Save("playerPosition", transform.position);
            }

            // Load Player Position
            if (kb.lKey.wasPressedThisFrame)
            {
                transform.position = WagSave.Load<Vector3>("playerPosition");
            }
        }
```

---

### WagSave インスタンス（推奨）
Unity のメニュー <b>Window -> WagSave -> Editor</b> から WagSave エディタウィンドウを開きます。
エディタのインターフェースにより、プロジェクトで設定可能な機能やオプションが確認できます。

- WagSave エディタを開き、プロジェクトの Resources フォルダにインスタンスを作成します。
- 利用可能なオプションと機能でインスタンスをプロジェクト向けに設定します。
- エディタを使用してプロジェクトの GameObject に WagSaveComponent を追加し、セーブするプロパティを選択します。
- 以下のコードを実装してコンテンツをセーブ・ロードします。コードを書かずにセーブトリガー、オートセーブ、セーブスロットを追加することもできます。

```csharp
using WaggleBum.WagSave;

// シーン内のすべての WagSaveComponent をセーブする
var wagSave = WagSave.GetInstance();
wagSave.Save();

// ロードする
wagSave.Load();
```

---

## アーキテクチャ概要

WagSave は 3 つの概念を中心に構築されています。

**WagSave ScriptableObject** は中央マネージャーです。`Assets > Create > WaggleBum > WagSave` から 1 つ以上作成できます。出力フォーマット、スロット、オートセーブ、暗号化などすべての設定はここに集約されます。実行時は `Resources` フォルダから読み込まれます。

**WagSaveComponent** は、状態をセーブしたい任意の GameObject に追加する MonoBehaviour です。WagSave エディタウィンドウを使って、含めるフィールドやプロパティを正確に選択できます。シリアライゼーションコードは不要です。

**Save Targets** は差し替え可能な出力バックエンドです（Binary ファイル、JSON ファイル、PlayerPrefs、Steam Cloud、Unity Cloud）。エディタでフォーマットを切り替えるだけで、ゲームコードの変更は一切不要です。

---

*WagSave は WaggleBum によって開発・メンテナンスされています。Unity Asset Store にて提供中。*
