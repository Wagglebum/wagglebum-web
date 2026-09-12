# 접근성

UI 배율, 색맹 보정, 모션 줄이기, 자막 크기와 배경. 이들은 **즉시** 적용됩니다 — 색맹 프리셋이나 텍스트 크기를
고르는 사람은 판단하려면 효과를 봐야 하고, 그것을 Apply 버튼 뒤에 숨기면 설정은 거의 쓸모없어집니다.

## 색맹 보정

서로 다른 두 변환은 혼동하기 쉽고, 잘못된 것을 출시하는 것은 아무것도 출시하지 않는 것보다 나쁩니다.

| | 하는 일 | 대상 |
|---|---|---|
| **시뮬레이션** | 색각 이상이 *어떻게 보이는지* 보여줌 | **당신**, UI 미리보기용 |
| **달토니제이션** | 정보를 플레이어가 *구별할 수 있는* 채널로 옮김 | **플레이어** |

이미 그 색각 이상을 가진 사람에게 시뮬레이션 행렬을 적용하는 것은 누구에게도 도움이 되지 않습니다 — 화면을
더 나쁘게 만들 뿐입니다. 출시할 것은 `GetDaltonizationMatrix`입니다.

```csharp
ColorMatrix correction = ColorblindCorrection.GetDaltonizationMatrix(ColorblindPreset.Deuteranopia);
```

시뮬레이션 행렬은 널리 쓰이는 Viénot–Brettel–Mollon 근사입니다. 달토니제이션은 거기서 `I + E·(I − S)`로
유도되며, `E`가 시뮬레이션 오차를 재분배합니다 — 그래서 적-녹 단서가 청-황 단서가 됩니다.

| 프리셋 | 영향 | 대략 |
|---|---|---|
| `Protanopia` | 적색 감도 | 남성의 1% |
| `Deuteranopia` | 녹색 감도 | 남성의 6% — 가장 흔함 |
| `Tritanopia` | 청색 감도 | 드묾, 남녀 동일 |
| `Achromatopsia` | 색각 없음 | 매우 드묾 |

**Achromatopsia는 의도적으로 항등 행렬을 반환합니다.** 색각이 없으면 정보를 옮길 채널이 없으므로 오차 재분배는
이미지를 왜곡할 뿐입니다. 대신 대비와 형태로 처리하세요.

> 이들은 근사이지 임상 도구가 아닙니다. 도움이 되지만, 형태, 패턴, 위치, 텍스트로도 정보를 전달하는 것을
> **대체하지 않습니다**. 빨간색과 초록색 마커를 구별할 수 없는 플레이어에게는 색상 이상의 차이가 필요합니다.

## 설정

모든 키는 선택 사항입니다. 하나를 비워 두면 그 측면은 관리되지 않습니다.

| 설정 | 타입 | 키 | 범위 |
|---|---|---|---|
| UI 배율 | `FloatSetting` | `accessibility.uiScale` | 0.5–2로 제한 |
| 색맹 프리셋 | `IntSetting` / `EnumSetting` | `accessibility.colorblindPreset` | `ColorblindPreset` |
| 모션 줄이기 | `BoolSetting` | `accessibility.reduceMotion` | |
| 자막 배율 | `FloatSetting` | `accessibility.subtitleScale` | 0.5–3으로 제한 |
| 자막 배경 | `FloatSetting` | `accessibility.subtitleBackground` | 불투명도 0–1로 제한 |

모든 것은 UI에 닿기 전에 제한되며, `NaN`도 포함됩니다. `NaN`은 전파되지 않고 합리적인 기본값으로 폴백합니다.
오래된 빌드의 저장값이나 손으로 편집한 세이브가 플레이어를 읽을 수도 닫을 수도 없는 인터페이스에 남겨 두어서는
절대 안 됩니다.

자막은 UI보다 넓은 범위 (최대 3×)를 갖습니다. 자막 가독성은 종종 가장 많이 요청되는 접근성 기능이고, 화면에
맞는 메뉴는 소파에서 읽을 수 있는 대사보다 낮은 기준이기 때문입니다.

## 배선하기

값은 **게시되지, 강제되지 않습니다**. UI 배율은 uGUI `CanvasScaler`, UI Toolkit 패널, 맞춤 HUD에 각각 다른
의미이므로, 각 값은 `UnityEvent`로 발생하고 전역 셰이더 값으로 설정됩니다. 인스펙터에서 배선하세요.

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

보정 행렬은 전체 화면 효과가 직접 읽을 수 있도록 전역 셰이더 행렬, 기본으로 `_WagSettingsColorblindMatrix`에도
업로드됩니다. 모션 줄이기는 `_WagSettingsReduceMotion`을 1 또는 0으로 설정합니다. 두 속성 이름 모두 구성할 수
있습니다.

**모션 줄이기**는 의도적으로 게시된 플래그일 뿐입니다 — 무엇이 과도한 모션인지는 게임마다 다릅니다. 카메라
흔들림, 스크린 스페이스 블러, 패럴랙스, 큰 UI 전환, 자동 재생 컷신 움직임이 흔한 용의자입니다.

## 설정하기

1. 원하는 설정을 만들고 `SettingsProfile`에 추가합니다.
2. **Add Component → WaggleBum → WagSettings → Accessibility Applier**.
3. 각 이벤트를 UI에 배선합니다.
4. **WagSettings Manager** 아래에 둡니다. 매니저가 시작할 때 연결합니다.

## 예외를 던지는 것과 경고만 하는 것

| 상황 | 결과 |
|---|---|
| 프로필에 없는 키 | **예외** — `KeyNotFoundException` |
| 알려진 값이 아닌 저장된 프리셋 | **경고**, 보정을 적용하지 않음 |
| `NaN`을 포함한 범위 밖의 모든 값 | 조용히 **제한** — 이는 정상이지 오류가 아님 |

## 적용 모드

기본은 `Immediate`이며, 그대로 두어야 합니다. 모드는 [확장성](../Extensibility.md)을 참고하세요.
