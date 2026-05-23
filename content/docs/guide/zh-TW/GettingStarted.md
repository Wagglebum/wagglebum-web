# 快速入門

本指南將引導您完成 WagSave 的安裝、建立第一個存檔資源，以及執行基本的存檔與讀檔操作。

## 1. 建立 WagSave 資源

`Assets > Create > WaggleBum > WagSave > WagSave (Save System)`

這將建立一個 `WagSave` ScriptableObject。請為它取一個有意義的名稱，例如 `GameSave` 或 `SaveProfile`。

您也可以隨時透過 Unity 選單列開啟 WagSave 編輯器視窗：

```
Window > WagSave > Editor
```

在視窗頂部的下拉選單中選擇您的資源。

## 2. 將其移至 Resources 資料夾

```
Assets/
  Resources/
    WagSave/
      GameSave.asset   ← 您的 WagSave 資源放在這裡
```

> **重要：** 如果資源不在 `Resources/WagSave/` 資料夾內，在建置版本中 `WagSave.GetInstance()` 將會回傳 `null`。

## 3. 開啟 WagSave 編輯器視窗

`Window > WagSave > Editor`

## 4. 選擇輸出格式

| 類別 | 格式 | 適用情境 |
|---|---|---|
| 檔案 | Binary | 正式發行 — 體積小且速度快 |
| 檔案 | JSON | 除錯 — 人類可讀 |
| 檔案 | Text | 簡單的鍵值資料 |
| 平台 | PlayerPrefs | 小型設定資料、WebGL |
| 平台 | Unity Cloud Save | 線上多人遊戲 |
| 平台 | Steam Cloud Save | 使用 Steamworks SDK 的 Steam 遊戲 |

## 5. 將 WagSaveManager 加入場景

`Add Component > WaggleBum > WagSave > WagSave Manager`

## 6. 標記需要儲存的 GameObject

`Add Component > WaggleBum > WagSave > WagSave`

前往 **Scene Content** 並點擊 **Configure**。

完整操作說明請參閱 [WagSave 元件](WagSaveComponent.md)。

## 7. 存檔與讀檔

```csharp
using WaggleBum.WagSave;

public class GameManager : MonoBehaviour
{
    private WagSave _wagSave;

    private void Start() { _wagSave = WagSave.GetInstance(); }

    public void SaveGame() { _wagSave.Save(); }

    public void LoadGame() { _wagSave.Load(); }
}
```

鍵值存檔：

```csharp
// 存檔
WagSave.Save("currentLevel", 5);

// 讀檔
int level = WagSave.Load<int>("currentLevel");
```

## 8. 非同步存檔

```csharp
public async void SaveGame() { await _wagSave.SaveAsync(); }
public async void LoadGame() { await _wagSave.LoadAsync(); }
```

## 後續步驟

- [設定要儲存哪些欄位 → WagSave 元件](WagSaveComponent.md)
- [設定多個存檔槽位 → 存檔槽位](SaveSlots.md)
- [設定自動存檔 → 自動存檔](Autosave.md)
- [啟用加密或壓縮 → 輸出格式](OutputFormats.md)
