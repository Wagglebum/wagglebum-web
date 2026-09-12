# ローカライズ

プレイヤーの — あるいは開発者の — 言語で話すものが 2 つあります。ゲームが同梱する設定メニューと、開発者が使う
エディターです。ゲームのプレイヤーとゲームの開発者は同じ人ではないので、この 2 つは別々です。

## メニューをプレイヤーの言語で

どちらのメニューも文言を `SettingsMenuStrings` から取ります。タイトル、Apply / Revert / Reset、検索ラベル、
すべてのタブ、すべての設定のラベルです。メニューが開く前にテーブルをインストールしてください。

![日本語の設定メニュー](../Images/menu-localized-ja.png)

```csharp
SettingsMenuLocalization.Apply("ja");   // en, es, ja, ko, zh-CN, zh-TW
```

同梱のテーブルは、コマンド、生成される 5 つのカテゴリ、そしてセットアップが生成するすべての設定をカバーします。
すでに開いているメニューは、開き直すまで構築時の文言を保持します。

すべての検索は英語のフォールバックを自前で持つので、項目が欠けていれば英語の文言が表示されます — キーが出ることも、
空白になることもありません。

### 独自の設定

あなたが追加した設定は、別途指定するまでどの言語でもキーから導かれたラベル — `gameplay.difficulty` なら
「Difficulty」 — を持ちます。独自のテーブルに `Label.<key>` の項目を追加し、同梱のテーブルに重ねてください。

```csharp
LocalizationTable packaged = SettingsMenuLocalization.Load("ja")!;
LocalizationTable mine = LocalizationTable.Parse(myJson);    // { "Label": { "gameplay.difficulty": "難易度" } }
SettingsMenuLocalization.Merge(packaged, mine);
```

独自のカテゴリも同様に `Category.<Name>` です。両方のテーブルに同じキーがあれば、あなたのものが優先されます。

ファイル形式はエディターが使うものと同じです。文字列のネストした JSON オブジェクトを `Section.Key` に平坦化した
ものです。`LocalizationTable.Parse` がこれを読み、それ以外は大きな音を立てて拒否します。半分だけ読み込めた
ファイルは、半分だけ翻訳されたメニューになるからです。

### 翻訳されないもの

列挙オプション — `Windowed`、`Borderless` — は `EnumSetting` アセット上で記述され、記述どおりに表示されます。
出荷する言語で記述するか、言語ごとに設定を用意してください。オプション単位のキー方式はまだありません。

## エディターを開発者の言語で

エディターウィンドウは **Help** ページで選んだ言語に従います。表示するすべての文字列は
`Editor/Localization/<locale>.json` から、各ページのドキュメントペインは
`Editor/EditorWindow/Docs/<Page>.<locale>.md` から来ます。そこで言語を選ぶまでは WagSave に設定された言語が
使われるので、両方をインストールしていれば一度選ぶだけで済みます。翻訳が欠けている箇所は英語で表示されます。

![エディター言語のドロップダウンを開いた Help ページ](../Images/help-language.png)

テストは同梱のすべてのロケールを英語ファイルと突き合わせます。どの言語でもキーやページが欠けていればスイートが
失敗します。

## このドキュメント

ユーザードキュメントは `Docs/<locale>/` 以下にあり、英語のレイアウトを鏡写しにしています。
