# 本地化

有两样东西说着玩家的 — 或开发者的 — 语言：游戏附带的设置菜单，以及开发者使用的编辑器。二者是分开的，因为游戏的
玩家和游戏的开发者不是同一个人。

## 菜单，用玩家的语言

两种菜单的文字都来自 `SettingsMenuStrings`：标题、Apply / Revert / Reset、搜索标签、每个页签，以及每个设置的标签。
在菜单打开前安装一张表：

```csharp
SettingsMenuLocalization.Apply("ja");   // en, es, ja, ko, zh-CN, zh-TW
```

![日语的设置菜单](../Images/menu-localized-ja.png)

随包提供的表覆盖命令、五个生成的分类，以及初始设置生成的每一个设置。已经打开的菜单会保留构建时的文字，直到重新
打开。

每次查找都自带英文回退，所以缺失的条目会显示英文 — 从不显示键，从不留空。

### 你自己的设置

你添加的设置在所有语言中都有一个从键派生的标签 — `gameplay.difficulty` 显示为 "Difficulty" — 直到你另行指定。在你
自己的表中添加 `Label.<key>` 条目，叠加到随包的表上：

```csharp
LocalizationTable packaged = SettingsMenuLocalization.Load("ja")!;
LocalizationTable mine = LocalizationTable.Parse(myJson);    // { "Label": { "gameplay.difficulty": "難易度" } }
SettingsMenuLocalization.Merge(packaged, mine);
```

你自己的分类同样是 `Category.<Name>`。两张表都有的键，以你的为准。

文件格式与编辑器使用的相同：嵌套的字符串 JSON 对象，扁平化为 `Section.Key`。`LocalizationTable.Parse` 读取它，并对
其他任何内容大声拒绝，因为半加载的文件就是半翻译的菜单。

### 不翻译的内容

枚举选项 — `Windowed`、`Borderless` — 在 `EnumSetting` 资源上编写，并按编写的原样显示。请用你发行的语言编写，或者
每种语言添加一个设置；按选项的键方案尚未加入。

## 编辑器，用开发者的语言

编辑器窗口遵循在 **Help** 页面选择的语言。它显示的每个字符串都来自 `Editor/Localization/<locale>.json`；每个页面的
文档面板来自 `Editor/EditorWindow/Docs/<Page>.<locale>.md`。在那里选择语言之前，使用 WagSave 所设置的语言，因此两者都
安装时只需选一次。缺少翻译的地方显示英文。

![打开了编辑器语言下拉框的 Help 页面](../Images/help-language.png)

测试把每个随包语言与英文文件对照：任何语言缺少一个键或一个页面，测试套件都会失败。

## 本文档

用户文档位于 `Docs/<locale>/` 下，镜像英文的布局。
