# 图形

画质等级、伽马、渲染缩放、后期效果开关和硬件超采样。这些在 **Apply 按钮**时应用 — 画质等级变化会重新分配
渲染目标，你不希望它在有人滚动下拉时发生。

## 管线感知

WagSettings 在 Built-in 管线、URP 和 HDRP 上工作，并且**不**引用其中任何一个。引用 URP 意味着 WagSettings 在
Built-in 项目中拒绝编译 — 对一个必须处处可用的资源来说不可接受。

管线改由活动资源的类型名识别：

```csharp
RenderPipelineKind kind = applier.Pipeline;   // BuiltIn, Universal, HighDefinition or Custom
```

无法识别的可编程管线报告为 `Custom` 而不是 `BuiltIn`，所以它永远不会被提供它可能没有的功能。

### 各管线支持什么

| 功能 | Built-in | URP | HDRP | Custom |
|---|:--:|:--:|:--:|:--:|
| 画质等级 | ✅ | ✅ | ✅ | ✅ |
| 伽马 | ✅ | ✅ | ✅ | ✅ |
| 渲染缩放 | ❌ | ✅ | ❌ | ❌ |
| 泛光 / AO / 运动模糊 | ✅ | ✅ | ✅ | ✅ |
| 超采样 (DLSS / FSR) | ❌ | ✅ | ✅ | ❌ |

渲染缩放是 URP 资源属性；HDRP 有动态分辨率作为替代。超采样需要可编程管线。

**不可用的功能会带着警告跳过，绝不抛出异常。** 跨管线发行同一个设置菜单、或以后切换管线的项目继续工作。显示
之前先问：

```csharp
renderScaleSlider.SetEnabled(applier.SupportsFeature(GraphicsFeature.RenderScale));
```

警告每个功能只触发一次，而不是每次应用都触发。

## 设置

每个键都是可选的；留空一个，那个方面就不受管理。

| 设置 | 类型 | 键 | 说明 |
|---|---|---|---|
| 画质等级 | `IntSetting` | `graphics.qualityTier` | Project Settings → Quality 的索引。钳制到项目定义的范围。 |
| 伽马 | `FloatSetting` | `graphics.gamma` | 作为全局着色器 float 发布。 |
| 渲染缩放 | `FloatSetting` | `graphics.renderScale` | 仅 URP。钳制到 0.1–2。 |
| 超采样 | `IntSetting` / `EnumSetting` | `graphics.upscaling` | 你自己的值；以事件触发。**可选启用**：键默认为空，因为可用的超采样器取决于管线。 |
| 泛光 | `BoolSetting` | `graphics.bloom` | |
| 环境光遮蔽 | `BoolSetting` | `graphics.ambientOcclusion` | |
| 运动模糊 | `BoolSetting` | `graphics.motionBlur` | |

## 后期效果：WagSettings 发布，你来应用

泛光位于 URP 或 HDRP 的 **Volume 配置**中，或 Built-in 管线的后期处理堆栈中。伸手进任何一个都意味着对你的项目
可能没有的包的硬依赖。所以 WagSettings 以两种方式发布值，让你来连接：

1. **一个全局着色器 float**，设为 `1` 或 `0` — 供直接读取它的着色器使用。
2. **一个 `UnityEvent<bool>`**，在检查器中接到你的 Volume 组件、后期处理层或你自己的方法。

```csharp
public void SetBloom(bool enabled)
{
    if (_volume.profile.TryGet(out Bloom bloom))
    {
        bloom.active = enabled;
    }
}
```

在检查器中把那个方法拖到开关的事件上就完成了。超采样也一样：选中的值作为事件触发，供你管线的 DLSS 或 FSR
配置使用。

这是有意的取舍 — 用一点接线换取一个能安装进任何项目的资源。

## 伽马

伽马作为全局着色器 float 发布，默认为 `_WagSettingsGamma`，因为没有与管线无关的伽马控制。在你的调色着色器中
读取它，或通过同样的事件模式把它喂给 URP/HDRP 的 `LiftGammaGain` 覆盖。属性名可配置。

## 设置它

1. 创建你想要的设置并加入你的 `SettingsProfile`。
2. **Add Component → WaggleBum → WagSettings → Quality Applier**。首次添加时它预置泛光、环境光遮蔽和运动模糊开关。
3. 把每个开关的事件接到拥有该效果的东西上。
4. 放在 **WagSettings Manager** 之下，它启动时会连接。

## 什么会抛出，什么只是警告

| 情况 | 结果 |
|---|---|
| 引用配置中不存在的键的开关 | **抛出** — `KeyNotFoundException` |
| 超出项目级别的画质等级 | **钳制** — 来自有更多级别的构建的存储等级绝不能导致崩溃 |
| 超出 0.1–2 的渲染缩放 | **钳制** |
| 管线没有的功能 | **警告一次**，跳过 |
| 在没有 `renderScale` 属性的管线资源上的渲染缩放 | **警告一次**，跳过 |

## 应用模式

默认为 `OnApply`。如果你想让伽马实时预览，给它一个单独的、设为 `Immediate` 且只填了伽马键的 `QualityApplier` —
见[扩展性](../Extensibility.md)。
