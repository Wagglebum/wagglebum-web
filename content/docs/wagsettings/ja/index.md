# WagSettings ドキュメント

WagSettings は Unity 2022 LTS 以降向けの設定・オプションメニューシステムです。オーディオ、ディスプレイ、グラフィックス、
コントロールのリバインド、アクセシビリティの各設定を、すっきりしたランタイム API の背後に提供し、動作するメニューを
生成する単一画面のセットアップを備えています。

![Summary ページを表示したエディターウィンドウ: レール、ページ、ドキュメントペイン](../Images/editor-window-summary.png)

## はじめに

- [チートシート](Cheatsheet.md) — すべてを 1 ページに。
- [はじめよう](GettingStarted.md) — パッケージをインストールして設定メニューを動かす。
- [エディターウィンドウ](EditorWindow.md) — レール、ページ、ドキュメントペイン、言語。
- [セットアップ](Setup.md) — Setup ページと生成されるもの。
- [Quick Start サンプル](GettingStarted.md) — UI フレームワークごとのシーンが `Sample Scenes/Quick Start` に。「はじめよう」で順に解説します。

## リファレンス

- [API](API.md) — ランタイム API の全体。
- [永続化](Persistence.md) — 設定がどう保存されるか、WagSave があると何が有効になるか。
- [拡張性](Extensibility.md) — 独自の設定とアプライヤーの追加。
- [ローカライズ](Localization.md) — メニューはプレイヤーの言語で、エディターはあなたの言語で。
- [用語集](Glossary.md) — このドキュメントで使う用語。

## 設定カテゴリ

- [オーディオ](Settings/Audio.md)
- [ディスプレイ](Settings/Display.md)
- [グラフィックス](Settings/Graphics.md)
- [アクセシビリティ](Settings/Accessibility.md)
- [コントロール](Settings/Controls.md)

他の言語: [English](../index.md) · [Español](../es/index.md) · [한국어](../ko/index.md) · [简体中文](../zh-CN/index.md) · [繁體中文](../zh-TW/index.md)

このパッケージはプレリリースです。実装済みの内容は [CHANGELOG.md](../../CHANGELOG.md) を参照してください。

## アーキテクチャの概観

WagSettings は厳密に下方向のみの依存を持つ 5 つの層です。UI は永続化に触れず、永続化は UI を知りません。

| 層 | フォルダー | 責務 |
|---|---|---|
| 5 | `Runtime/UI/` | レジストリにバインドし、何も所有しない UI Toolkit と uGUI のビュー |
| 4 | `Runtime/Appliers/` | 設定値を Unity 上の効果に変える |
| 3 | `Runtime/Core/` | `SettingDefinition<T>`、`SettingsRegistry`、`ISettingsStore`、`Guard` — `UnityEngine` なし |
| — | `WagSettings.cs`、`WagSettingsManager.cs` | 静的 API と、レジストリを所有するシーンコンポーネント |
| 3 | `Runtime/Definitions/` | ScriptableObject の設定アセットと `SettingsProfile` |
| 2 | `Runtime/Persistence/` | `ISettingsStore` の実装とストアファクトリ |
| — | `WagSave/` | WagSave がインストールされているときだけコンパイルされる、任意の WagSave ベースのストア |

設定の追加とは、`SettingDefinition` アセットを 1 つとアプライヤーを 1 つ追加することです。ほかは何も変わりません。
