# Accesibilidad

Escala de UI, corrección para daltonismo, reducir movimiento, y tamaño y fondo de subtítulos. Se aplican
**de inmediato** — alguien que elige un ajuste de daltonismo o un tamaño de texto tiene que ver el efecto
para juzgarlo, y esconderlo tras un botón Aplicar hace el ajuste casi inutilizable.

## Corrección para daltonismo

Dos transformaciones distintas se confunden fácilmente, y distribuir la equivocada es peor que no
distribuir nada:

| | Qué hace | Para quién es |
|---|---|---|
| **Simulación** | Muestra cómo *se ve* una deficiencia | **Tú**, previsualizando tu UI |
| **Daltonización** | Desplaza la información a canales que el jugador *sí* puede distinguir | **El jugador** |

Aplicar una matriz de simulación a alguien que ya tiene esa deficiencia no ayuda a nadie — solo empeora su
pantalla. `GetDaltonizationMatrix` es la que hay que distribuir:

```csharp
ColorMatrix correction = ColorblindCorrection.GetDaltonizationMatrix(ColorblindPreset.Deuteranopia);
```

Las matrices de simulación son las aproximaciones ampliamente usadas de Viénot–Brettel–Mollon. La
daltonización se deriva de ellas como `I + E·(I − S)`, donde `E` redistribuye el error de simulación — así
que las señales rojo-verde se convierten en señales azul-amarillo.

| Ajuste | Afecta a | Aproximadamente |
|---|---|---|
| `Protanopia` | Sensibilidad al rojo | 1 % de los hombres |
| `Deuteranopia` | Sensibilidad al verde | 6 % de los hombres — la más común |
| `Tritanopia` | Sensibilidad al azul | Rara, hombres y mujeres por igual |
| `Achromatopsia` | Sin visión del color | Muy rara |

**Achromatopsia devuelve deliberadamente la identidad.** Sin visión del color no hay canal al que mover la
información, así que redistribuir el error solo distorsionaría la imagen. Trátala con contraste y forma.

> Son aproximaciones, no instrumentos clínicos. Ayudan, y **no sustituyen** a transmitir la información
> también mediante forma, patrón, posición y texto. Un jugador que no puede distinguir tus marcadores rojos
> y verdes necesita que difieran en algo más que el tono.

## Los ajustes

Cada clave es opcional; deja una vacía y ese aspecto queda sin gestionar.

| Ajuste | Tipo | Clave | Rango |
|---|---|---|---|
| Escala de UI | `FloatSetting` | `accessibility.uiScale` | Acotado 0.5–2 |
| Ajuste de daltonismo | `IntSetting` / `EnumSetting` | `accessibility.colorblindPreset` | `ColorblindPreset` |
| Reducir movimiento | `BoolSetting` | `accessibility.reduceMotion` | |
| Tamaño de subtítulos | `FloatSetting` | `accessibility.subtitleScale` | Acotado 0.5–3 |
| Fondo de subtítulos | `FloatSetting` | `accessibility.subtitleBackground` | Opacidad acotada 0–1 |

Todo se acota antes de llegar a tu UI, incluido `NaN`, que recurre a un valor sensato en lugar de
propagarse. Un valor guardado de una compilación anterior o de un guardado editado a mano nunca debe dejar
al jugador con una interfaz que no puede leer ni cerrar.

Los subtítulos tienen un rango más amplio que la UI (hasta 3×) porque la legibilidad de los subtítulos es a
menudo la función de accesibilidad más solicitada, y un menú que cabe en pantalla es un listón más bajo
que un diálogo que se pueda leer desde el sofá.

## Conectarlo

Los valores se **publican, no se imponen**. La escala de UI significa algo distinto para un `CanvasScaler`
de uGUI, un panel de UI Toolkit y un HUD a medida, así que cada valor se emite como `UnityEvent` y se fija
como valor global de shader. Conéctalos en el inspector:

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

La matriz de corrección también se sube a una matriz global de shader, `_WagSettingsColorblindMatrix` por
defecto, para que un efecto de pantalla completa la lea directamente. Reducir movimiento pone
`_WagSettingsReduceMotion` a 1 o 0. Ambos nombres de propiedad son configurables.

**Reducir movimiento** es deliberadamente solo una bandera publicada — qué cuenta como movimiento
excesivo es específico de cada juego. La sacudida de cámara, el desenfoque en espacio de pantalla, el
paralaje, las transiciones grandes de UI y el movimiento de cinemáticas automáticas son los sospechosos
habituales.

## Configurarlo

1. Crea los ajustes que quieras y añádelos a tu `SettingsProfile`.
2. **Add Component → WaggleBum → WagSettings → Accessibility Applier**.
3. Conecta cada evento a tu UI.
4. Ponlo bajo el **WagSettings Manager**, que lo conecta al arrancar.

## Qué lanza excepciones, y qué solo avisa

| Situación | Resultado |
|---|---|
| Una clave que no está en el perfil | **Lanza** — `KeyNotFoundException` |
| Un ajuste guardado que no es un valor conocido | **Avisa**, no aplica corrección |
| Cualquier valor fuera de rango, incluido `NaN` | **Acotado** en silencio — es normal, no un error |

## Modo de aplicación

`Immediate` por defecto, y deberías dejarlo así. Ver [Extensibilidad](../Extensibility.md) para los modos.
