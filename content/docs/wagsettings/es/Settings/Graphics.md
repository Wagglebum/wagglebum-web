# Gráficos

Nivel de calidad, gamma, escala de renderizado, interruptores de efectos de posprocesado y escalado por
hardware. Se aplican con el **botón Aplicar** — un cambio de nivel de calidad reasigna los render targets,
algo que no quieres que ocurra mientras alguien recorre un desplegable.

## Conciencia de pipeline

WagSettings funciona en el pipeline Built-in, URP y HDRP, y **no** referencia ninguno de ellos. Referenciar
URP significaría que WagSettings se niega a compilar en un proyecto Built-in — inaceptable para un asset
que tiene que funcionar en todas partes.

En su lugar, el pipeline se identifica por el nombre de tipo del asset activo:

```csharp
RenderPipelineKind kind = applier.Pipeline;   // BuiltIn, Universal, HighDefinition or Custom
```

Un pipeline programable no reconocido se informa como `Custom` en lugar de `BuiltIn`, así que nunca se le
ofrecen funciones que quizá no tenga.

### Qué admite cada pipeline

| Función | Built-in | URP | HDRP | Custom |
|---|:--:|:--:|:--:|:--:|
| Nivel de calidad | ✅ | ✅ | ✅ | ✅ |
| Gamma | ✅ | ✅ | ✅ | ✅ |
| Escala de renderizado | ❌ | ✅ | ❌ | ❌ |
| Resplandor / AO / desenfoque de movimiento | ✅ | ✅ | ✅ | ✅ |
| Escalado (DLSS / FSR) | ❌ | ✅ | ✅ | ❌ |

La escala de renderizado es una propiedad del asset de URP; HDRP tiene resolución dinámica en su lugar. El
escalado necesita un pipeline programable.

**Una función no disponible se omite con un aviso, nunca con una excepción.** Un proyecto que distribuye un
menú de ajustes entre pipelines, o que cambia de pipeline más tarde, sigue funcionando. Pregunta antes de
mostrarla:

```csharp
renderScaleSlider.SetEnabled(applier.SupportsFeature(GraphicsFeature.RenderScale));
```

El aviso se emite una vez por función, no en cada aplicación.

## Los ajustes

Cada clave es opcional; deja una vacía y ese aspecto queda sin gestionar.

| Ajuste | Tipo | Clave | Notas |
|---|---|---|---|
| Nivel de calidad | `IntSetting` | `graphics.qualityTier` | Índice en Project Settings → Quality. Acotado a lo que define el proyecto. |
| Gamma | `FloatSetting` | `graphics.gamma` | Publicado como float global de shader. |
| Escala de renderizado | `FloatSetting` | `graphics.renderScale` | Solo URP. Acotado a 0.1–2. |
| Escalado | `IntSetting` / `EnumSetting` | `graphics.upscaling` | Tus propios valores; emitido como evento. **Opcional**: la clave está vacía por defecto, porque los escaladores disponibles dependen del pipeline. |
| Resplandor | `BoolSetting` | `graphics.bloom` | |
| Oclusión ambiental | `BoolSetting` | `graphics.ambientOcclusion` | |
| Desenfoque de movimiento | `BoolSetting` | `graphics.motionBlur` | |

## Efectos de posprocesado: WagSettings publica, tú aplicas

El resplandor vive en un **perfil de Volume** de URP o HDRP, o en la pila de posprocesado del pipeline
Built-in. Meterse en cualquiera de ellos significa una dependencia dura de un paquete que tu proyecto quizá
no tenga. Así que WagSettings publica el valor de dos formas y te deja conectarlo:

1. **Un float global de shader**, puesto a `1` o `0` — para shaders que lo leen directamente.
2. **Un `UnityEvent<bool>`**, conectado en el inspector a tu componente Volume, capa de posprocesado, o un
   método propio.

```csharp
public void SetBloom(bool enabled)
{
    if (_volume.profile.TryGet(out Bloom bloom))
    {
        bloom.active = enabled;
    }
}
```

Suelta ese método en el evento del interruptor en el inspector y listo. Lo mismo vale para el escalado: el
valor elegido se emite como evento para la configuración DLSS o FSR de tu pipeline.

Es un intercambio deliberado — un poco de conexión a cambio de un asset que se instala en cualquier
proyecto.

## Gamma

La gamma se publica como float global de shader, `_WagSettingsGamma` por defecto, porque no hay un control
de gamma independiente del pipeline. Léelo en tu shader de gradación de color, o pásalo a una anulación
`LiftGammaGain` de URP/HDRP con el mismo patrón de eventos. El nombre de la propiedad es configurable.

## Configurarlo

1. Crea los ajustes que quieras y añádelos a tu `SettingsProfile`.
2. **Add Component → WaggleBum → WagSettings → Quality Applier**. Siembra los interruptores de resplandor,
   oclusión ambiental y desenfoque de movimiento al añadirse.
3. Conecta el evento de cada interruptor a lo que posea el efecto.
4. Ponlo bajo el **WagSettings Manager**, que lo conecta al arrancar.

## Qué lanza excepciones, y qué solo avisa

| Situación | Resultado |
|---|---|
| Un interruptor que referencia una clave que no está en el perfil | **Lanza** — `KeyNotFoundException` |
| Nivel de calidad fuera de los niveles del proyecto | **Acotado** — un nivel guardado de una compilación con más niveles no debe hacer caer el juego |
| Escala de renderizado fuera de 0.1–2 | **Acotado** |
| Una función que el pipeline no tiene | **Avisa una vez**, se omite |
| Escala de renderizado en un asset de pipeline sin propiedad `renderScale` | **Avisa una vez**, se omite |

## Modo de aplicación

`OnApply` por defecto. Si quieres que la gamma se previsualice en vivo, dale su propio `QualityApplier` en
`Immediate` con solo la clave de gamma rellena — ver [Extensibilidad](../Extensibility.md).
