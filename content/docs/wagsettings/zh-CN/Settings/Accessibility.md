# 无障碍

UI 缩放、色盲校正、减少动态效果，以及字幕大小和背景。这些**立即**应用 — 选择色盲预设或文字大小的人必须看到
效果才能判断，把它藏在 Apply 按钮后面会让设置几乎无法使用。

## 色盲校正

两种不同的变换很容易混淆，而发行错的那个比什么都不发行更糟：

| | 它做什么 | 给谁用 |
|---|---|---|
| **模拟** | 展示某种色觉缺陷*看起来的样子* | **你**，预览你的 UI |
| **Daltonization** | 把信息移到玩家*能*分辨的通道 | **玩家** |

对已经有该缺陷的人应用模拟矩阵帮不了任何人 — 只会让他们的屏幕更糟。`GetDaltonizationMatrix` 才是该发行的：

```csharp
ColorMatrix correction = ColorblindCorrection.GetDaltonizationMatrix(ColorblindPreset.Deuteranopia);
```

模拟矩阵是广泛使用的 Viénot–Brettel–Mollon 近似。Daltonization 由它们导出为 `I + E·(I − S)`，其中 `E` 重新分配
模拟误差 — 于是红绿线索变成蓝黄线索。

| 预设 | 影响 | 大约 |
|---|---|---|
| `Protanopia` | 红色敏感度 | 1% 的男性 |
| `Deuteranopia` | 绿色敏感度 | 6% 的男性 — 最常见 |
| `Tritanopia` | 蓝色敏感度 | 罕见，男女相同 |
| `Achromatopsia` | 无色觉 | 非常罕见 |

**Achromatopsia 有意返回单位矩阵。** 没有色觉就没有可以把信息移进去的通道，所以重新分配误差只会扭曲图像。改用
对比度和形状来处理。

> 这些是近似，不是临床仪器。它们有帮助，但**不能替代**同时通过形状、图案、位置和文字传达信息。无法分辨你的
> 红色和绿色标记的玩家需要它们在色相之外有所不同。

## 设置

每个键都是可选的；留空一个，那个方面就不受管理。

| 设置 | 类型 | 键 | 范围 |
|---|---|---|---|
| UI 缩放 | `FloatSetting` | `accessibility.uiScale` | 钳制 0.5–2 |
| 色盲预设 | `IntSetting` / `EnumSetting` | `accessibility.colorblindPreset` | `ColorblindPreset` |
| 减少动态效果 | `BoolSetting` | `accessibility.reduceMotion` | |
| 字幕缩放 | `FloatSetting` | `accessibility.subtitleScale` | 钳制 0.5–3 |
| 字幕背景 | `FloatSetting` | `accessibility.subtitleBackground` | 不透明度钳制 0–1 |

一切在到达你的 UI 之前都被钳制，包括 `NaN`，它回退到合理的默认值而不是传播。来自旧构建的存储值或手动编辑的
存档绝不能让玩家面对一个无法阅读或关闭的界面。

字幕的范围比 UI 更宽（最高 3×），因为字幕易读性常常是最受请求的无障碍功能，而能放进屏幕的菜单比能从沙发上
读到的对白门槛更低。

## 接线

值是**发布的，不是强加的**。UI 缩放对 uGUI 的 `CanvasScaler`、UI Toolkit 面板和定制 HUD 意味着不同的东西，所以
每个值都作为 `UnityEvent` 触发并设为全局着色器值。在检查器中接线：

```csharp
public void SetUiScale(float scale)
{
    _canvasScaler.scaleFactor = scale;
}

public void SetColorblindPreset(ColorblindPreset preset)
{
    _correctionVolume.weight = preset == ColorblindPreset.None ? 0f : 1f;
}
```

校正矩阵也上传到一个全局着色器矩阵，默认为 `_WagSettingsColorblindMatrix`，供全屏效果直接读取。减少动态效果
把 `_WagSettingsReduceMotion` 设为 1 或 0。两个属性名都可配置。

**减少动态效果**有意只是一个发布的标志 — 什么算过多的动态效果因游戏而异。镜头抖动、屏幕空间模糊、视差、大型 UI
过渡和自动播放的过场镜头运动是常见嫌疑对象。

## 设置它

1. 创建你想要的设置并加入你的 `SettingsProfile`。
2. **Add Component → WaggleBum → WagSettings → Accessibility Applier**。
3. 把每个事件接到你的 UI。
4. 放在 **WagSettings Manager** 之下，它启动时会连接。

## 什么会抛出，什么只是警告

| 情况 | 结果 |
|---|---|
| 配置中不存在的键 | **抛出** — `KeyNotFoundException` |
| 存储的预设不是已知值 | **警告**，不应用校正 |
| 任何超出范围的值，包括 `NaN` | 静默**钳制** — 这是正常的，不是错误 |

## 应用模式

默认为 `Immediate`，你应该保持这样。模式见[扩展性](../Extensibility.md)。
