# 在地化

有兩樣東西說著玩家的 — 或開發者的 — 語言：遊戲附帶的設定選單，以及開發者使用的編輯器。兩者是分開的，因為遊戲的
玩家和遊戲的開發者不是同一個人。

## 選單，用玩家的語言

兩種選單的文字都來自 `SettingsMenuStrings`：標題、Apply / Revert / Reset、搜尋標籤、每個索引標籤，以及每項設定的
標籤。在選單開啟前安裝一張表：

```csharp
SettingsMenuLocalization.Apply("ja");   // en, es, ja, ko, zh-CN, zh-TW
```

![日語的設定選單](../Images/menu-localized-ja.png)

隨套件提供的表涵蓋命令、五個產生的分類，以及初始設定產生的每一項設定。已經開啟的選單會保留建立時的文字，直到重新
開啟。

每次查詢都自帶英文備援，所以缺少的項目會顯示英文 — 從不顯示鍵，從不留空。

### 你自己的設定

你加入的設定在所有語言中都有一個從鍵衍生的標籤 — `gameplay.difficulty` 顯示為 "Difficulty" — 直到你另行指定。在
你自己的表中加入 `Label.<key>` 項目，疊加到隨套件的表上：

```csharp
LocalizationTable packaged = SettingsMenuLocalization.Load("ja")!;
LocalizationTable mine = LocalizationTable.Parse(myJson);    // { "Label": { "gameplay.difficulty": "難易度" } }
SettingsMenuLocalization.Merge(packaged, mine);
```

你自己的分類同樣是 `Category.<Name>`。兩張表都有的鍵，以你的為準。

檔案格式與編輯器使用的相同：巢狀的字串 JSON 物件，攤平為 `Section.Key`。`LocalizationTable.Parse` 讀取它，並對
其他任何內容大聲拒絕，因為半載入的檔案就是半翻譯的選單。

### 不翻譯的內容

列舉選項 — `Windowed`、`Borderless` — 在 `EnumSetting` 資源上撰寫，並依撰寫的原樣顯示。請用你發行的語言撰寫，或
每種語言加入一項設定；逐選項的鍵方案尚未加入。

## 編輯器，用開發者的語言

編輯器視窗遵循在 **Help** 頁面選擇的語言。它顯示的每個字串都來自 `Editor/Localization/<locale>.json`；每個頁面的
文件窗格來自 `Editor/EditorWindow/Docs/<Page>.<locale>.md`。在那裡選擇語言之前，使用 WagSave 所設定的語言，因此
兩者都安裝時只需選一次。缺少翻譯的地方顯示英文。

![開啟了編輯器語言下拉選單的 Help 頁面](../Images/help-language.png)

測試把每個隨套件語言與英文檔案對照：任何語言缺少一個鍵或一個頁面，測試套組都會失敗。

## 本文件

使用者文件位於 `Docs/<locale>/` 下，鏡射英文的配置。
