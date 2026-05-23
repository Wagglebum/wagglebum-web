# 输出格式

WagSave 支持多种存档后端。切换格式无需更改任何代码。

## 可用格式

### 基于文件的格式

| 格式 | 是否有索引变体 | 说明 |
|---|---|---|
| Binary（二进制） | 是 | 紧凑的二进制序列化。推荐用于正式发布。 |
| JSON | 是 | 人类可读的 JSON。推荐在开发阶段使用。 |
| Text（文本） | 是 | 纯文本键值输出。 |
| PlayerPrefs | 否 | Unity 内置的键值存储。适合设置数据和 WebGL。 |

### 云端 / 平台格式

| 格式 | 所需 SDK | 说明 |
|---|---|---|
| Unity Cloud Save | Unity Gaming Services | 保存到 Unity 托管的云端后端。 |
| Steam Cloud Save | Steamworks SDK | 通过 Steam 远程存储进行保存。 |

两种云端格式均为**条件编译**。如果所需 SDK 不在项目中，该格式将不会出现在下拉菜单中，也不会产生编译错误。

---

## Unity Cloud Save 配置

Unity Cloud Save 需要额外的软件包和一次性的运行时初始化。WagSave 会自动处理所有线程管理，除以下步骤外无需额外代码。

### 1 — 安装所需软件包

打开 **Window > Package Manager**，切换到 **Unity Registry**，安装以下两个软件包：

| 软件包 | 软件包 ID |
|---|---|
| Authentication | `com.unity.services.authentication` |
| Cloud Save | `com.unity.services.cloudsave` |

`com.unity.services.core` 会作为依赖项自动安装。

将 `com.unity.services.cloudsave` 添加到项目后，`CLOUD_SAVE_ENABLED` 脚本定义符号将自动激活，格式下拉菜单中将出现 **Unity Cloud Save** 选项。无需手动配置该符号。

### 2 — 将项目连接到 Unity Gaming Services

1. 打开 **Edit > Project Settings > Services**。
2. 登录并关联 Unity Cloud 项目（如需要，可在控制台中新建）。
3. 项目 ID 和组织 ID 将被写入项目设置。

### 3 — 运行时初始化

在**任何保存或加载操作之前**，于启动时调用一次以下代码。`Start()` 方法或专用的引导程序均为合适位置：

```csharp
using Unity.Services.Authentication;
using Unity.Services.Core;

private async void Start()
{
    await UnityServices.InitializeAsync();

    if (!AuthenticationService.Instance.IsSignedIn)
        await AuthenticationService.Instance.SignInAnonymouslyAsync();
}
```

> 如果在 `UnityServices.InitializeAsync()` 完成之前触发保存或加载操作，WagSave 将记录错误且操作会失败。请务必在进入游戏流程前等待初始化完成。

`SignInAnonymouslyAsync` 适用于测试。正式发布的游戏请替换为所选的登录方式（Steam、Google、Apple ID、用户名/密码等）。

### 4 — 选择格式

在 WagSave 编辑器窗口中，前往 **Save Output** 并从格式下拉菜单中选择 **Unity Cloud Save**。

### 注意事项

- Cloud Save 数据按**已认证的玩家**单独存储，每位玩家拥有独立的数据桶。
- WagSave 会在内部为所有键添加命名空间前缀，因此同一项目中的多个 WagSave 资产不会在云端桶中产生冲突。
- WagSave 会自动在主线程上执行所有 Cloud Save 操作，无需额外的线程配置。

---

## Steam Cloud Save 配置

Steam Cloud Save 需要 Steamworks.NET 软件包和一个活跃的 Steam 会话。完成以下配置后，WagSave 将自动处理所有 Steam Remote Storage 调用。

### 1 — 创建 Steamworks 开发者账号和应用

1. 在 [partner.steamgames.com](https://partner.steamgames.com) 注册账号。需要同意 Steam 发行协议并支付 100 美元的应用费（销售额达到 1,000 美元后退款）。
2. 在 Steamworks 合作伙伴控制台创建应用，您将获得一个 **App ID**。
3. 在 Steamworks 控制台前往 **App Admin → Cloud**，为应用启用 **Steam Cloud**，并设置存储配额（默认 1 GB / 1,000 个文件对大多数游戏已足够）。

> 开发阶段可使用 App ID `480`（Valve 的公共测试应用 SpaceWar）代替您自己的 App ID。

### 2 — 安装 Steamworks.NET

打开 **Window > Package Manager**，点击 **+** 选择 **Add package from git URL**，输入：

```
https://github.com/rlabrecque/Steamworks.NET.git?path=/com.rlabrecque.steamworks.net
```

也可从 [steamworks.github.io](https://steamworks.github.io) 下载 `.unitypackage`，通过 **Assets > Import Package** 导入。

软件包安装后，WagSave 程序集定义会自动激活 `STEAM_ENABLED` 脚本定义符号，格式下拉菜单中将出现 **Steam Cloud Save** 选项。无需手动配置该符号。

### 3 — 添加 steam_appid.txt

在项目根目录（包含 `Assets/` 文件夹的目录）创建名为 `steam_appid.txt` 的纯文本文件，内容仅填写您的 App ID：

```
480
```

发布前请将 `480` 替换为您的真实 App ID。在 Steam 外部运行时，此文件是 `SteamAPI.Init()` 成功的必要条件。

### 4 — 运行时初始化 SteamAPI

Steam 存档目标要求在任何存档或读档操作之前调用 `SteamAPI.Init()`。Steamworks.NET 附带了专用的 `SteamManager` 组件。

1. 如果导入了完整的 Steamworks.NET `.unitypackage`，其中包含 `SteamManager` 预制体——将其拖入场景即可。
2. 如果通过 Package Manager 安装，请手动将 `SteamManager` 脚本添加到场景中的 GameObject 上（源码可在 [Steamworks.NET 仓库](https://github.com/rlabrecque/Steamworks.NET) 获取）。
3. 将 `SteamManager` 放在场景层级的较早位置，确保在任何 WagSave 存档或读档触发之前完成初始化。

> 机器上必须运行 Steam 客户端。如果 Steam 未启动，`SteamAPI.IsSteamRunning()` 将返回 false，WagSave 会抛出错误。

### 5 — 配置存档配置文件

1. 在 Project 窗口中选择您的 WagSave 资产。
2. 在 Inspector 中打开或创建一个存档配置文件。
3. 将 **Save Target Destination** 下拉菜单设置为 **Steam Cloud Save**。
4. 设置 **Target ID**——这将成为存储在 Steam Cloud 中的文件名。例如，Target ID 为 `slot1` 时，将创建名为 `slot1.wsav` 的文件。

### 注意事项

- 存档文件以 `.wsav` 格式保存到 Steam Cloud，游戏退出时自动同步。
- Steam Cloud 每个文件的大小上限为 100 MB，超出时将记录错误日志。
- 数据绑定到已登录的 Steam 账号，每位 Steam 用户拥有独立的云端存储空间。
- 每个存档目标的所有键值存储在单个文件中。若使用多个 WagSave 资产，请为每个资产设置唯一的 Target ID。

---

## 文件属性

- **Folder（文件夹）** — `Application.persistentDataPath` 下的子文件夹。
- **Filename（文件名）** — 存档文件的基础名称。
- **Extension（扩展名）** — 文件扩展名（例如 `sav`、`dat`、`json`）。

## 保护选项

### 加密

1. 启用 **Encrypt Data**
2. 将你的**私钥**安全存储。
3. 在运行时使用以下两种方式之一提供私钥：

   **方式 A — 事件（推荐）：** 在第一次存档或读档之前订阅 `OnGetEncryptionPrivateKey`：

   ```csharp
   wagSave.OnGetEncryptionPrivateKey += () => LoadPrivateKeyFromSecureStorage();
   ```

   **方式 B — 直接设置：** 直接在实例上设置密钥：

   ```csharp
   wagSave.Settings.SaveTarget.Options.EncryptPrivateKey = LoadPrivateKeyFromSecureStorage();
   ```

   事件方式更推荐，因为它将密钥获取推迟到实际使用时。两种方式均有效。

### 文件签名

1. 启用 **Sign Output File**
2. 点击 **Regenerate Key** 生成新的签名密钥。

> 签名用于检测篡改行为。若要保护文件内容，请使用加密。

### 存档文件备份

在每次保存之前创建现有存档文件的副本（扩展名为 `.bak`）。如果保存失败（加密错误、磁盘写入失败等），将自动从备份还原先前的文件，从而避免玩家遇到写到一半的损坏存档。

1. 在 **Save Output > Protection** 中启用 **Backup Before Save**。
2. 备份会写入与数据文件相同的文件夹，文件名相同并加上 `.bak`。
3. 保存成功后，备份会自动移除。保存失败后，备份会保留在磁盘上以便检查。

> 索引文件格式不可用。索引目标会对数据文件进行就地增量写入，而不是每次保存生成单个替换文件，因此保存前的备份无法代表完整的先前状态。

## 压缩

启用 **Compress Output** 以减小文件大小。

## JSON 美化输出

启用 **Pretty Print JSON** 可在调试期间获得人类可读的输出格式。

## 格式选择建议

| 场景 | 推荐格式 |
|---|---|
| 发布桌面端或主机端游戏 | Binary（二进制） |
| 调试存档数据 | JSON |
| WebGL 或简单键值数据 | PlayerPrefs |
| 带服务器端档案的在线游戏 | Unity Cloud Save |
| Steam 游戏 | Steam Cloud Save |

## 切换格式

在编辑器中更改格式后点击 Play 即可生效。旧格式的现有存档文件将无法被新格式读取。
