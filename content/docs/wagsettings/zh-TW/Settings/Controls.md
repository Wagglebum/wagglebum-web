# 控制

在新 Input System 上的重新繫結：鍵盤、滑鼠與遊戲手把，帶互動式重新繫結、衝突偵測、恢復預設，以及靈敏度與反轉
選項。

## 該套件是選用的，並且保持選用

控制重新繫結需要 `com.unity.inputsystem`。大多數 Unity 專案沒有它，而 WagSettings 必須能乾淨地安裝進所有專案 —
所以重新繫結程式碼位於它**自己的組件**中，Unity 只在該套件存在時才編譯它：

| 組件 | versionDefines | defineConstraints |
|---|---|---|
| `WagSettings.InputSystem` | `com.unity.inputsystem` → `WAGGLEBUM_INPUTSYSTEM_PRESENT` | 相同 |

主組件內的 `#if ENABLE_INPUT_SYSTEM` **不夠**：`#if` 排除了程式碼，但 `WagSettings.asmdef` 仍然必須參考
`Unity.InputSystem`，而缺少的組件參考是編譯錯誤。這道門解決的是參考，不只是程式碼。

值得知道的後果：**重新繫結儲存與衝突偵測不相依 Input System**，位於 `Runtime/Core`。它們在沒有該套件的專案中運作，
並且經過測試。

## 設定它

1. 從 Package Manager 安裝 **Input System**。
2. 建立一個鍵為 `controls.rebinds` 的 `StringSetting` — **一項設定保存所有重新繫結**。可選地在
   `controls.sensitivity` 建立一個 `FloatSetting`，在 `controls.invertY` 建立一個 `BoolSetting`。
3. 把它們加入你的 `SettingsProfile`。
4. **Add Component → WaggleBum → WagSettings → Rebind Applier**，並指定你的 `InputActionAsset`。
5. 可選地列出玩家可以重新繫結哪些動作對應 — 留空則允許全部。
6. 放在 **WagSettings Manager** 之下，它啟動時會連接。Quick Start 的 `QuickStartControls` 展示了一個驅動它的重新
   繫結按鈕。

## 互動式重新繫結

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

![重新繫結時等待按鍵的控制列](../../Images/rebinding-listen.png)

玩家接下來按的控制鍵成為繫結。<kbd>Esc</kbd> 取消。

套用器處理的、手寫重新繫結通常遺漏的兩個細節：

- **重新繫結期間動作被停用。** 已啟用的動作會吞掉你正在等待的那個輸入，所以第一次按鍵被消耗而不是被擷取。之後
  只有在它一開始就是啟用的情況下才會重新啟用。
- **未完成的重新繫結在 `OnDisable` 時取消。** 否則在重新繫結中途關閉選單會留下一個監聽玩家在遊戲中按下的每個鍵的
  作業。

無論是否衝突，重新繫結都會套用，`onComplete` 告訴你它與什麼衝突。這樣策略由你選擇 — 警告、交換或提供復原 — 而
不是被強加一種。

> **關於測試涵蓋率：**互動式重新繫結無法在無頭 CI 中完成 — 一個不涉及任何 WagSettings 程式碼的裸
> `PerformInteractiveRebinding` 會啟動，但即使在 Unity 自己的 `InputTestFixture` 下也永遠不會比對到排隊的按鍵。
> 這個 Unity 擁有的步驟兩側的一切都自動涵蓋：作業啟動、監聽時動作被靜音、取消恢復先前狀態、完成的重新繫結到達
> 設定。完成本身在手動驗證場景中驗證。

## 衝突偵測

```csharp
IReadOnlyList<BindingConflict> conflicts = applier.FindConflicts();
```

兩個繫結在共用控制路徑**並且可能同時處於作用中**時衝突。後半句就是阻止 UI 喊「狼來了」的東西：

| 情況 | 衝突？ | 原因 |
|---|:--:|---|
| `Gameplay/Jump` 與 `Gameplay/Interact` 都在空白鍵上 | ✅ | 同一對應，都作用中 |
| `Gameplay/Fire` 與 `Menu/Confirm` 都在滑鼠左鍵上 | ❌ | 對應從不同時啟用 |
| 不同具名控制配置中的兩個繫結 | ❌ | 一次只有一個配置作用中 |
| **沒有**配置的繫結對上有配置的繫結 | ✅ | 沒有配置意味著始終作用中 |
| 同一動作兩次繫結到同一鍵 | ✅ | 冗餘，值得告訴玩家 |
| 兩個都**未繫結**的動作 | ❌ | 空控制不是控制 |

路徑比較忽略大小寫。每對衝突回報一次。

要在更改落地**之前**警告，把候選者與現有繫結對照：

```csharp
var candidate = new InputBindingDescriptor("Gameplay", "Interact", 0, "<Keyboard>/space");
IReadOnlyList<InputBindingDescriptor> clashing =
    BindingConflictDetector.FindConflictsWith(applier.DescribeBindings(), candidate);
```

## 重新繫結如何儲存

所有重新繫結進入**一個** `StringSetting`，採用帶版本的 WagSettings 格式，而不是 Input System 的繫結 JSON。三個
原因：

- 它存在普通設定中，所以像其他一切一樣儲存、套用、還原與同步
- 它可以在沒有 Input System 套件的情況下讀取與測試
- 它帶有版本號，所以未來的格式變更可以遷移而不是丟棄玩家的控制設定

無法讀取的儲存重新繫結**帶著警告恢復預設**而不是擲回。失去重新繫結不好；無法啟動的遊戲更糟。逐條也是如此：指向
你後來重新命名或移除的動作的重新繫結會帶著警告丟棄，其餘仍然載入。

有意解除繫結的控制會以未繫結的形式往返 — 那是玩家做出的選擇，不是缺少的資料。

## 重設

```csharp
applier.ResetAllBindings();          // everything back to the asset's authored bindings
applier.ResetBinding("Gameplay/Jump");
```

`ResetAllBindings` 也會清除儲存的設定，所以重設在下次 Apply 時持久化。

## 靈敏度與反轉

這些作為 `UnityEvent` 發布而不是套用，因為「靈敏度」乘的是什麼因遊戲而異 — 在檢視器中把它們接到你的攝影機
控制器。與[圖形](Graphics.md)與[無障礙](Accessibility.md)開關的模式相同。

## 什麼會擲回，什麼只是警告

| 情況 | 結果 |
|---|---|
| 重新繫結資源中不存在的動作 | **擲回** — 開發者打錯字 |
| 動作沒有的繫結索引 | **擲回** |
| 未指定資源或已有一個在執行時啟動重新繫結 | **擲回** |
| 設定檔中不存在的鍵 | **擲回** — `KeyNotFoundException` |
| 無法讀取的儲存重新繫結 | **警告**，恢復預設 |
| 已重新命名或移除的動作的儲存重新繫結 | **警告**，丟棄那一條，保留其餘 |
