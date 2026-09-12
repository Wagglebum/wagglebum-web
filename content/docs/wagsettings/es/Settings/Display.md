# Pantalla

Resolución, frecuencia de actualización, modo de ventana, VSync y elección de monitor. Se aplican con el
**botón Aplicar**, no mientras el jugador recorre un desplegable — redimensionar una ventana a mitad de un
desplazamiento es la clase de cosa que hace que un menú de ajustes parezca roto.

## La resolución se guarda como resolución, no como índice

La mayoría de menús de ajustes guardan "el tercer elemento del desplegable". WagSettings guarda el ancho, el
alto y la frecuencia reales, porque un índice significa otra cosa en cuanto cambia el hardware:

- el jugador acopla un portátil o desconecta un monitor externo
- mueve un guardado a otra máquina, o a una portátil
- una actualización de controlador cambia qué modos se informan

Un índice que apuntaba a 1920×1080 ahora apunta a 800×600. Los valores reales sobreviven a todo eso.

La contrapartida es que un modo guardado puede no existir en la máquina que tienes delante.
`DisplayModeMatcher` lo resuelve: **las dimensiones en píxeles dominan, la frecuencia desempata**, y gana
el modo admitido más cercano. Un juego nunca debe negarse a arrancar por una resolución, así que esto
**avisa en lugar de lanzar una excepción** — ver *Qué lanza excepciones, y qué solo avisa* más abajo.

```csharp
var desired  = new DisplayMode(1600, 900, 60);          // not supported here
var resolved = DisplayModeMatcher.FindNearest(applier.AvailableModes, desired);  // 1920 x 1080 @ 60 Hz
```

Una frecuencia guardada de `0` significa **"la más alta que ofrece esta pantalla"**, que es el valor
predeterminado correcto para un juego que nunca se ha configurado.

## Los ajustes

Cada clave es opcional. Deja una vacía y el aplicador no gestiona ese aspecto, así que un proyecto que solo
quiera un interruptor de modo de ventana puede tener exactamente eso.

| Ajuste | Tipo | Clave | Notas |
|---|---|---|---|
| Ancho | `IntSetting` | `display.width` | Píxeles. Necesita también una clave de alto. |
| Alto | `IntSetting` | `display.height` | Píxeles. Necesita también una clave de ancho. |
| Frecuencia de actualización | `IntSetting` | `display.refreshRate` | Hz. `0` significa la más alta disponible. |
| Modo de ventana | `IntSetting` / `EnumSetting` | `display.windowMode` | `0` ventana, `1` sin bordes, `2` pantalla completa. |
| VSync | `IntSetting` / `EnumSetting` | `display.vsync` | `0` apagado, `1` cada refresco, `2` cada dos refrescos. Acotado a 0–2. |
| Monitor | `IntSetting` | `display.monitor` | Índice de pantalla desde cero. **Opcional**: la clave del aplicador está vacía por defecto, porque mover la ventana entre monitores es lo bastante disruptivo como para ser una elección, y la configuración no la genera. |

`WindowMode` es una enumeración de WagSettings en lugar del `FullScreenMode` de Unity: estas tres son las
opciones que los jugadores entienden, la numeración es estable entre versiones de Unity, y el valor va a
los datos guardados.

## Configurarlo

1. Crea los ajustes de arriba y añádelos a tu `SettingsProfile`.
2. **Add Component → WaggleBum → WagSettings → Resolution Applier**. Las claves vienen rellenas con los
   nombres convencionales; deja en blanco las que no quieras gestionar.
3. Ponlo bajo el **WagSettings Manager**, que lo conecta al arrancar. O ejecuta la configuración con
   Pantalla marcada y sáltate los pasos 1 y 2.

## El desplegable de resolución

Ambos menús muestran ancho, alto y frecuencia como **un único desplegable con los modos que admite la
pantalla** — `1920 × 1080 @ 144 Hz`, `1920 × 1080 @ 60 Hz`, etcétera, el más ancho primero. Eso es
`ResolutionBinder`, un compuesto sobre los tres ajustes. El menú pregunta a `ScreenModes.Query()` qué puede
hacer el hardware y pasa la lista a `SettingBinderFactory.CreateAll(registry, modes)`, que pliega los tres
en un binder colocado donde estaba `display.width` en el perfil. Buscar "resolution" lo encuentra.

![El desplegable de resolución con los modos de la pantalla](../../Images/resolution-dropdown.png)

Lo que el jugador ve es una elección. Lo que el almacén ve siguen siendo tres números, que es el sentido
de la sección anterior: un índice guardado en una lista de modos significa otra cosa en el siguiente
monitor; `1920 × 1080` no.

Si los valores guardados no coinciden con nada que la pantalla pueda hacer — un ajuste traído de un monitor
más grande — el desplegable encabeza con **Custom: 2560 × 1440 @ 165 Hz** en lugar de ajustarse en
silencio, y el aplicador sigue eligiendo el modo más cercano al aplicar. Elige cualquier modo real y la
entrada personalizada desaparece.

Sin un ajuste `display.refreshRate` en el perfil, la lista es solo de tamaños y los duplicados por
frecuencia se colapsan.

### Cuando la plataforma no informa de modos

Algunas plataformas devuelven un `Screen.resolutions` vacío — **el editor de macOS lo hace**, y WebGL
también. Sin más, eso dejaría al desplegable sin nada que ofrecer y al aplicador sin nada a lo que
ajustarse, y en el editor nunca verías un cambio de resolución. Así que `ScreenModes.Query()` recurre a
los tamaños 16:9 y 16:10 comunes no mayores que la pantalla actual, cada uno a su frecuencia, con la propia
pantalla primero. Una compilación en una plataforma que informa de modos usa la lista real; el respaldo es
lo que te permite ejercitar el menú donde de otro modo estaría inerte.

### Hacerlo a mano

Si no usas ninguno de los menús, las mismas piezas son tuyas:

```csharp
var binder = new ResolutionBinder(width, height, refreshRate, ScreenModes.Query());

foreach (string option in binder.Options) { /* add to your control */ }
binder.Select(index);                       // writes width, height and refresh rate
```

O escribe las partes tú mismo desde `applier.AvailableModes`, que es la misma lista:

```csharp
width.Set(mode.Width);
height.Set(mode.Height);
refreshRate.Set(mode.RoundedRefreshRate);
```

La lista del aplicador se guarda en caché; llama a `RefreshAvailableModes()` si se conecta una pantalla
mientras el juego se ejecuta.

## Qué lanza excepciones, y qué solo avisa

Los ajustes de pantalla son los que más probablemente están mal sin culpa del jugador, así que la división
es deliberada: **un error del desarrollador lanza una excepción, un desajuste de hardware avisa.**

| Situación | Resultado |
|---|---|
| Una clave de ancho sin clave de alto, o viceversa | **Lanza** — un error de configuración que solo el desarrollador puede arreglar |
| Una clave que no está en el perfil | **Lanza** — `KeyNotFoundException` |
| Modo guardado no admitido por esta pantalla | **Avisa**, aplica el modo admitido más cercano |
| Modo de ventana guardado con un valor no reconocido | **Avisa**, vuelve a modo ventana |
| Monitor elegido no conectado | **Avisa**, deja la ventana donde está |
| La plataforma no informa de ningún modo | **Avisa**, deja la resolución como está |

Suscríbete a los avisos para verlos durante el desarrollo:

```csharp
WagSettingsLog.WarningLogged += message => Debug.LogWarning(message);
```

## Modo de aplicación

`OnApply` por defecto. Cambiarlo a `Immediate` significa que cada pulsación en un campo de resolución
redimensiona la ventana, que rara vez es lo que quieres — ver [Extensibilidad](../Extensibility.md).

Ten en cuenta que VSync y la elección de monitor se aplican con el mismo calendario. Si quieres que VSync
cambie al instante, dale su propio aplicador en `Immediate`.
