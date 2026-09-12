# 显示

分辨率、刷新率、窗口模式、VSync 和显示器选择。这些在 **Apply 按钮**时应用，而不是在玩家滚动下拉时 — 滚动中途
调整窗口大小正是让设置菜单显得坏掉的那种事。

## 分辨率作为分辨率存储，而不是索引

大多数设置菜单存储"下拉中的第三项"。WagSettings 存储实际的宽度、高度和刷新率，因为硬件一变，索引就意味着别的
东西：

- 玩家给笔记本接上底座，或拔掉外接显示器
- 他们把存档移到另一台机器，或移到掌机
- 驱动更新改变了报告的模式

曾指向 1920×1080 的索引现在指向 800×600。实际值经得起这一切。

代价是存储的模式可能在你面前的机器上不存在。`DisplayModeMatcher` 解决这个问题：**像素尺寸优先，刷新率决胜**，
最接近的受支持模式胜出。游戏绝不能因为分辨率而拒绝启动，所以这会**警告而不是抛出** — 见下文*什么会抛出，什么
只是警告*。

```csharp
var desired  = new DisplayMode(1600, 900, 60);          // not supported here
var resolved = DisplayModeMatcher.FindNearest(applier.AvailableModes, desired);  // 1920 x 1080 @ 60 Hz
```

存储的刷新率 `0` 表示**"该显示器提供的最高值"**，这是从未配置过的游戏的正确默认值。

## 设置

每个键都是可选的。留空一个，应用器就不管理那个方面，所以只想要窗口模式开关的项目可以恰好只有它。

| 设置 | 类型 | 键 | 说明 |
|---|---|---|---|
| 宽度 | `IntSetting` | `display.width` | 像素。也需要高度键。 |
| 高度 | `IntSetting` | `display.height` | 像素。也需要宽度键。 |
| 刷新率 | `IntSetting` | `display.refreshRate` | Hz。`0` 表示可用的最高值。 |
| 窗口模式 | `IntSetting` / `EnumSetting` | `display.windowMode` | `0` 窗口，`1` 无边框，`2` 全屏。 |
| VSync | `IntSetting` / `EnumSetting` | `display.vsync` | `0` 关，`1` 每次垂直消隐，`2` 每隔一次。钳制到 0–2。 |
| 显示器 | `IntSetting` | `display.monitor` | 从零开始的显示器索引。**可选启用**：应用器的键默认为空，因为在显示器之间移动窗口的干扰足以让它成为一个选择，初始设置也不生成它。 |

`WindowMode` 是 WagSettings 的枚举而非 Unity 的 `FullScreenMode`：这三个是玩家理解的选项，编号跨 Unity 版本稳定，
并且值会进入存档数据。

## 设置它

1. 创建上面的设置并加入你的 `SettingsProfile`。
2. **Add Component → WaggleBum → WagSettings → Resolution Applier**。键已预填为约定名称；把你不想管理的留空。
3. 放在 **WagSettings Manager** 之下，它启动时会连接。或者勾选 Display 运行初始设置，跳过第 1、2 步。

## 分辨率下拉

两种菜单都把宽度、高度和刷新率显示为**一个列出显示器支持模式的下拉** — `1920 × 1080 @ 144 Hz`、
`1920 × 1080 @ 60 Hz` 等，最宽的在前。那是 `ResolutionBinder`，三个设置之上的复合体。菜单向
`ScreenModes.Query()` 询问硬件能做什么，把列表交给 `SettingBinderFactory.CreateAll(registry, modes)`，它把三个
折叠成一个绑定器，站在配置中 `display.width` 原来的位置。搜索 "resolution" 能找到它。

![列出显示器模式的分辨率下拉框](../../Images/resolution-dropdown.png)

玩家看到的是一个选择。存储看到的仍然是三个数字，这正是上一节的要点：存储的模式列表索引在下一台显示器上意味着
别的东西；`1920 × 1080` 不会。

如果存储的值与显示器能做的任何模式都不匹配 — 一个从更大显示器带过来的设置 — 下拉会以 **Custom: 2560 × 1440 @
165 Hz** 打头，而不是悄悄吸附，应用器在应用时仍会选择最接近的模式。选择任何真实模式，自定义条目就消失。

配置中没有 `display.refreshRate` 设置时，列表只有尺寸，按刷新率重复的项会合并。

### 当平台不报告任何模式时

有些平台返回空的 `Screen.resolutions` — **macOS 编辑器就是**，WebGL 也是。放任不管会让下拉无物可提供，应用器
无物可吸附，并且在编辑器里你永远看不到分辨率变化。所以 `ScreenModes.Query()` 回退到不大于当前显示器的常见 16:9
和 16:10 尺寸，各自使用显示器的刷新率，显示器本身排在首位。在报告模式的平台上的构建使用真实列表；回退只是让你
能在原本无反应的地方试用菜单。

### 手动完成

如果你不用任一菜单，同样的部件归你使用：

```csharp
var binder = new ResolutionBinder(width, height, refreshRate, ScreenModes.Query());

foreach (string option in binder.Options) { /* add to your control */ }
binder.Select(index);                       // writes width, height and refresh rate
```

或者从 `applier.AvailableModes`（同一个列表）自己写各部分：

```csharp
width.Set(mode.Width);
height.Set(mode.Height);
refreshRate.Set(mode.RoundedRefreshRate);
```

应用器的列表是缓存的；如果游戏运行时接入了显示器，调用 `RefreshAvailableModes()`。

## 什么会抛出，什么只是警告

显示设置是最可能在玩家无过错的情况下出错的，所以这种划分是有意的：**开发者错误抛出，硬件不匹配警告。**

| 情况 | 结果 |
|---|---|
| 设了宽度键没设高度键，或反之 | **抛出** — 只有开发者能修的配置错误 |
| 配置中不存在的键 | **抛出** — `KeyNotFoundException` |
| 存储的模式此显示器不支持 | **警告**，应用最接近的受支持模式 |
| 存储的窗口模式不是可识别的值 | **警告**，回退到窗口模式 |
| 选择的显示器未连接 | **警告**，窗口留在原处 |
| 平台根本不报告模式 | **警告**，不动分辨率 |

订阅警告以在开发期间看到它们：

```csharp
WagSettingsLog.WarningLogged += message => Debug.LogWarning(message);
```

## 应用模式

默认为 `OnApply`。改为 `Immediate` 意味着分辨率输入框的每次按键都会调整窗口大小，这很少是你想要的 — 见
[扩展性](../Extensibility.md)。

注意 VSync 和显示器选择按同一节奏应用。如果你希望 VSync 即时切换，给它一个单独的、设为 `Immediate` 的应用器。
