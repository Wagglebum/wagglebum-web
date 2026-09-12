# 그래픽

품질 티어, 감마, 렌더 스케일, 포스트 이펙트 토글, 하드웨어 업스케일링. 이들은 **Apply 버튼**에서 적용됩니다 —
품질 티어 변경은 렌더 타깃을 재할당하는데, 누군가 드롭다운을 스크롤하는 동안 일어나길 원하지 않는 일입니다.

## 파이프라인 인식

WagSettings는 Built-in 파이프라인, URP, HDRP에서 동작하며 그중 어느 것도 참조하지 **않습니다**. URP를 참조하면
WagSettings가 Built-in 프로젝트에서 컴파일을 거부한다는 뜻입니다 — 어디서나 동작해야 하는 에셋에는 용납할 수
없습니다.

대신 파이프라인은 활성 에셋의 타입 이름에서 식별됩니다.

```csharp
RenderPipelineKind kind = applier.Pipeline;   // BuiltIn, Universal, HighDefinition or Custom
```

인식되지 않는 스크립터블 파이프라인은 `BuiltIn`이 아닌 `Custom`으로 보고되므로 갖고 있지 않을 수 있는
기능이 제시되는 일은 없습니다.

### 각 파이프라인이 지원하는 것

| 기능 | Built-in | URP | HDRP | Custom |
|---|:--:|:--:|:--:|:--:|
| 품질 티어 | ✅ | ✅ | ✅ | ✅ |
| 감마 | ✅ | ✅ | ✅ | ✅ |
| 렌더 스케일 | ❌ | ✅ | ❌ | ❌ |
| 블룸 / AO / 모션 블러 | ✅ | ✅ | ✅ | ✅ |
| 업스케일링 (DLSS / FSR) | ❌ | ✅ | ✅ | ❌ |

렌더 스케일은 URP 에셋 속성입니다. HDRP에는 대신 동적 해상도가 있습니다. 업스케일링에는 스크립터블
파이프라인이 필요합니다.

**사용할 수 없는 기능은 경고와 함께 건너뛰며, 절대 예외가 아닙니다.** 파이프라인을 넘나들며 설정 메뉴
하나를 출시하거나 나중에 파이프라인을 바꾸는 프로젝트도 계속 동작합니다. 보여주기 전에 물어보세요.

```csharp
renderScaleSlider.SetEnabled(applier.SupportsFeature(GraphicsFeature.RenderScale));
```

경고는 기능마다 한 번 발생하지, 적용마다 발생하지 않습니다.

## 설정

모든 키는 선택 사항입니다. 하나를 비워 두면 그 측면은 관리되지 않습니다.

| 설정 | 타입 | 키 | 비고 |
|---|---|---|---|
| 품질 티어 | `IntSetting` | `graphics.qualityTier` | Project Settings → Quality의 인덱스. 프로젝트가 정의한 범위로 제한. |
| 감마 | `FloatSetting` | `graphics.gamma` | 전역 셰이더 float로 게시. |
| 렌더 스케일 | `FloatSetting` | `graphics.renderScale` | URP 전용. 0.1–2로 제한. |
| 업스케일링 | `IntSetting` / `EnumSetting` | `graphics.upscaling` | 자신만의 값. 이벤트로 발생. **옵트인**: 사용 가능한 업스케일러가 파이프라인에 따라 다르므로 키는 기본으로 비어 있음. |
| 블룸 | `BoolSetting` | `graphics.bloom` | |
| 앰비언트 오클루전 | `BoolSetting` | `graphics.ambientOcclusion` | |
| 모션 블러 | `BoolSetting` | `graphics.motionBlur` | |

## 포스트 이펙트: WagSettings가 게시하고, 당신이 적용

블룸은 URP나 HDRP의 **Volume 프로필**, 또는 Built-in 파이프라인의 포스트 프로세싱 스택에 있습니다. 그중
어느 것에 손을 뻗든 프로젝트에 없을 수 있는 패키지에 대한 강한 의존성이 됩니다. 그래서 WagSettings는 값을
두 가지 방식으로 게시하고 당신이 연결하게 합니다.

1. **전역 셰이더 float**, `1` 또는 `0`으로 설정 — 직접 읽는 셰이더용.
2. **`UnityEvent<bool>`**, 인스펙터에서 Volume 컴포넌트, 포스트 프로세싱 레이어, 또는 자신의 메서드에 배선.

```csharp
public void SetBloom(bool enabled)
{
    if (_volume.profile.TryGet(out Bloom bloom))
    {
        bloom.active = enabled;
    }
}
```

그 메서드를 인스펙터에서 토글의 이벤트에 놓으면 끝입니다. 업스케일링도 마찬가지입니다. 선택된 값은
파이프라인의 DLSS나 FSR 구성을 위해 이벤트로 발생합니다.

이것은 의도적인 트레이드입니다 — 약간의 배선을 대가로 어떤 프로젝트에도 설치되는 에셋을.

## 감마

파이프라인 독립적인 감마 제어가 없기 때문에 감마는 전역 셰이더 float, 기본으로 `_WagSettingsGamma`로
게시됩니다. 컬러 그레이딩 셰이더에서 읽거나, 같은 이벤트 패턴으로 URP/HDRP `LiftGammaGain` 오버라이드에
넘기세요. 속성 이름은 구성할 수 있습니다.

## 설정하기

1. 원하는 설정을 만들고 `SettingsProfile`에 추가합니다.
2. **Add Component → WaggleBum → WagSettings → Quality Applier**. 처음 추가될 때 블룸, 앰비언트 오클루전,
   모션 블러 토글을 시드합니다.
3. 각 토글의 이벤트를 효과를 소유한 것에 배선합니다.
4. **WagSettings Manager** 아래에 둡니다. 매니저가 시작할 때 연결합니다.

## 예외를 던지는 것과 경고만 하는 것

| 상황 | 결과 |
|---|---|
| 프로필에 없는 키를 참조하는 토글 | **예외** — `KeyNotFoundException` |
| 프로젝트의 레벨 밖의 품질 티어 | **제한** — 레벨이 더 많은 빌드에서 저장된 티어가 충돌을 일으켜서는 안 됨 |
| 0.1–2 밖의 렌더 스케일 | **제한** |
| 파이프라인에 없는 기능 | **한 번 경고**, 건너뜀 |
| `renderScale` 속성이 없는 파이프라인 에셋의 렌더 스케일 | **한 번 경고**, 건너뜀 |

## 적용 모드

기본은 `OnApply`입니다. 감마를 실시간으로 미리 보고 싶다면 감마 키만 채운 `Immediate`의 별도 `QualityApplier`를
주세요 — [확장성](../Extensibility.md)을 참고하세요.
