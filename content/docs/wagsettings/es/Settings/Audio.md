# Audio

WagSettings controla un `AudioMixer` desde tus ajustes, convirtiendo cada deslizador lineal de volumen en
los decibelios que un mezclador realmente espera. El volumen se aplica en vivo mientras el jugador arrastra
— la única forma sensata de elegir un nivel.

## Por qué importa la conversión

Los mezcladores trabajan en **decibelios**, que son logarítmicos. Los deslizadores son **lineales**. Pasa el
valor de un deslizador directamente a `AudioMixer.SetFloat` y obtienes el error clásico: la mitad inferior
del deslizador suena igual y todo cambio audible se apiña en la décima parte superior.

`AudioVolume` hace la conversión, `20·log₁₀(x)`, con un suelo en −80 dB:

| Deslizador | Decibelios |
|---|---|
| `1.0` | `0 dB` — volumen completo |
| `0.5` | `−6.02 dB` — la mitad de fuerte |
| `0.25` | `−12.04 dB` |
| `0.0` | `−80 dB` — silencio |

```csharp
float decibels = AudioVolume.LinearToDecibels(0.5f);   // -6.0206
float slider   = AudioVolume.DecibelsToLinear(-6.02f); //  0.5
```

Vive en `Runtime/Core` sin dependencia de `UnityEngine`, así que se puede usar y probar por sí solo.

## El camino rápido

Ejecuta **Tools → WaggleBum → WagSettings → Setup** con Audio marcado. Genera los cuatro ajustes de audio,
clona un mezclador con los grupos Master, Music y SFX con sus volúmenes ya expuestos, y los valores
predeterminados del aplicador coinciden con ambos. Añade un Audio Mixer Applier bajo el manager y asigna
`WagSettingsMixer`. Ver [Configuración](../Setup.md).

El resto de esta página es lo que eso hace por ti, para cuando quieras hacerlo de otra forma.

## Configurarlo a mano

**1. Expón los parámetros del mezclador.** En tu `AudioMixer`, selecciona un grupo, haz clic derecho en su
campo **Volume** del Inspector y elige **Expose 'Volume (of Group)' to script**. Luego, en el desplegable
**Exposed Parameters** de la ventana Audio Mixer, renómbralo a algo estable — `MasterVolume`,
`MusicVolume`, etcétera.

> Este es el paso que la gente olvida. Un parámetro sin exponer significa que el deslizador del jugador no
> hace nada en silencio, así que WagSettings lanza una excepción con el nombre del parámetro en lugar de
> fallar calladamente.

**2. Crea los ajustes.** Un `FloatSetting` por bus y, opcionalmente, un `BoolSetting` por interruptor de
silencio:

| Ajuste | Tipo | Clave | Predeterminado |
|---|---|---|---|
| Volumen general | `FloatSetting` | `audio.master` | `1` |
| Silencio general | `BoolSetting` | `audio.master.mute` | `false` |
| Volumen de música | `FloatSetting` | `audio.music` | `0.8` |
| Volumen de efectos | `FloatSetting` | `audio.sfx` | `1` |

Añádelos a tu `SettingsProfile`.

**3. Añade el aplicador.** *Add Component → WaggleBum → WagSettings → Audio Mixer Applier*. Siembra tres
buses al añadirse — general con silencio, música y efectos sin él — que son exactamente los ajustes de
arriba y los grupos que expone la plantilla de mezclador incluida, así que no hay nada que rellenar en el
caso común. Asigna tu mezclador y luego, por cada bus:

| Campo | Significado |
|---|---|
| **Volume Key** | Clave del ajuste float con el volumen 0–1 de este bus. **Vacío significa omitir este bus.** |
| **Mute Key** | Clave de un ajuste bool que silencia el bus. Vacío si el bus no tiene interruptor de silencio. |
| **Exposed Parameter** | El nombre que expusiste en el mezclador, p. ej. `MasterVolume`. |

Deja en blanco la clave de volumen de un bus que no uses y se omite. ¿Quieres buses de voz o de UI? Añade
un bus, dale un ajuste y expón el parámetro — el aplicador no siembra buses cuyos ajustes no existen,
porque `Attach` lanza una excepción con una clave ausente y un componente nuevo que lanza excepciones hasta
podarlo es un mal predeterminado.

**4. Ponlo bajo el WagSettings Manager.** El manager conecta cada aplicador que tiene debajo al arrancar; no
hay nada que llamar. Un aplicador que deba vivir en otro sitio: `WagSettings.Manager.Attach(applier)`.

## Silencio

El silencio lleva el bus a −80 dB **sin tocar el volumen guardado**, así que quitar el silencio restaura
exactamente el nivel que el jugador eligió. El ajuste de silencio persiste como cualquier otro, así que un
jugador que sale silenciado arranca silenciado.

## Qué lanza excepciones, y por qué

La mala configuración del audio es silenciosa por naturaleza — un deslizador que no hace nada parece un
juego roto en lugar de una configuración rota. Así que estas cosas son ruidosas:

| Situación | Resultado |
|---|---|
| Parámetro expuesto no encontrado en el mezclador | `InvalidOperationException` con el nombre del parámetro y cómo exponerlo |
| Un bus con clave de volumen pero sin parámetro expuesto | `InvalidOperationException` con el nombre del bus |
| Un bus que referencia una clave que no está en el perfil | `KeyNotFoundException` |
| Sin mezclador asignado | `InvalidOperationException` con el nombre del GameObject |
| Un bus con clave de volumen **vacía** | Se omite — es un proyecto que no usa ese bus, no un error |

## Modo de aplicación

El audio usa `Immediate` por defecto, para que el jugador oiga el cambio mientras arrastra. No hay buena
razón para diferir un cambio de volumen a un botón Aplicar — ver [Extensibilidad](../Extensibility.md)
para los modos.

## Añadir tu propio bus

Los buses son solo configuración. Añade una entrada, apúntala a un ajuste float y a un parámetro expuesto, y
funciona — sin código. Para controlar algo que no sea un parámetro de `AudioMixer`, escribe un aplicador:
ver [Extensibilidad](../Extensibility.md).
