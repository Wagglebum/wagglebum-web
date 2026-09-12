# 音频

WagSettings 用你的设置驱动一个 `AudioMixer`，把每个线性音量滑块转换为混音器真正期望的分贝。音量在玩家拖动时
实时应用 — 这是选择音量的唯一合理方式。

## 转换为何重要

混音器以**分贝**工作，而分贝是对数的。滑块是**线性**的。把滑块值直接喂给 `AudioMixer.SetFloat`，你就得到经典
bug：滑块下半段听起来一模一样，所有可闻的变化都挤在顶端十分之一。

`AudioVolume` 做这个映射，`20·log₁₀(x)`，下限为 −80 dB：

| 滑块 | 分贝 |
|---|---|
| `1.0` | `0 dB` — 全音量 |
| `0.5` | `−6.02 dB` — 一半响度 |
| `0.25` | `−12.04 dB` |
| `0.0` | `−80 dB` — 静音 |

```csharp
float decibels = AudioVolume.LinearToDecibels(0.5f);   // -6.0206
float slider   = AudioVolume.DecibelsToLinear(-6.02f); //  0.5
```

它位于 `Runtime/Core`，不依赖 `UnityEngine`，所以可以独立使用和测试。

## 快捷方式

勾选 Audio 运行 **Tools → WaggleBum → WagSettings → Setup**。它生成四个音频设置，克隆一个带 Master、Music 和 SFX
组且其音量已公开的混音器，应用器的默认值与两者匹配。在管理器下添加一个 Audio Mixer Applier 并指定
`WagSettingsMixer`。见[初始设置](../Setup.md)。

本页的其余部分讲的是它替你做了什么，供你想以不同方式做时参考。

## 手动设置

**1. 公开混音器参数。** 在你的 `AudioMixer` 中选择一个组，在 Inspector 中右键它的 **Volume** 字段并选择
**Expose 'Volume (of Group)' to script**。然后在 Audio Mixer 窗口的 **Exposed Parameters** 下拉中，把它重命名为
稳定的名称 — `MasterVolume`、`MusicVolume` 等。

> 这一步是人们遗漏的。未公开的参数意味着玩家的滑块悄悄什么都不做，所以 WagSettings 会带着参数名抛出，而不是
> 静静失败。

**2. 创建设置。** 每条总线一个 `FloatSetting`，可选地每个静音开关一个 `BoolSetting`：

| 设置 | 类型 | 键 | 默认值 |
|---|---|---|---|
| 主音量 | `FloatSetting` | `audio.master` | `1` |
| 主静音 | `BoolSetting` | `audio.master.mute` | `false` |
| 音乐音量 | `FloatSetting` | `audio.music` | `0.8` |
| 音效音量 | `FloatSetting` | `audio.sfx` | `1` |

把它们加入你的 `SettingsProfile`。

**3. 添加应用器。** *Add Component → WaggleBum → WagSettings → Audio Mixer Applier*。首次添加时它预置三条总线 —
带静音的主总线、不带静音的音乐和音效 — 正是上面的设置以及随包混音器模板公开的组，所以常见情况下无需填写任何
东西。指定你的混音器，然后对每条总线：

| 字段 | 含义 |
|---|---|
| **Volume Key** | 持有该总线 0–1 音量的 float 设置的键。**留空表示跳过该总线。** |
| **Mute Key** | 使该总线静音的 bool 设置的键。总线没有静音开关时留空。 |
| **Exposed Parameter** | 你在混音器上公开的名称，例如 `MasterVolume`。 |

把不用的总线的音量键留空，它就会被跳过。想要语音或 UI 总线？添加一条总线，给它一个设置并公开参数 — 应用器
不会预置设置不存在的总线，因为 `Attach` 对缺失的键抛出，而一个直到被清理前都抛出的新组件是糟糕的默认值。

**4. 放在 WagSettings Manager 之下。** 管理器启动时连接其下的每个应用器；无需调用任何东西。必须放在别处的
应用器：`WagSettings.Manager.Attach(applier)`。

## 静音

静音把总线驱动到 −80 dB **而不触及存储的音量**，所以取消静音恰好恢复玩家选择的音量。静音设置像其他设置一样
持久化，所以静音状态退出的玩家以静音状态启动。

## 什么会抛出，以及为什么

音频配置错误天生是无声的 — 一个什么都不做的滑块看起来像坏掉的游戏而不是坏掉的配置。所以这些是响亮的：

| 情况 | 结果 |
|---|---|
| 混音器上找不到公开参数 | `InvalidOperationException`，指出参数及如何公开它 |
| 有音量键但没有公开参数的总线 | `InvalidOperationException`，指出总线 |
| 引用配置中不存在的键的总线 | `KeyNotFoundException` |
| 未指定混音器 | `InvalidOperationException`，指出 GameObject |
| 音量键为**空**的总线 | 跳过 — 这是项目不使用该总线，不是错误 |

## 应用模式

音频默认为 `Immediate`，所以玩家拖动时就能听到变化。没有好理由把音量变化推迟到 Apply 按钮 — 模式见
[扩展性](../Extensibility.md)。

## 添加你自己的总线

总线只是配置。添加一个条目，指向一个 float 设置和一个公开参数，它就能工作 — 无需代码。要驱动不是 `AudioMixer`
参数的东西，编写一个应用器：见[扩展性](../Extensibility.md)。
