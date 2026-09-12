# Extensibilidad

Añadir un ajuste toca un recurso y una lista. Está en el menú la próxima vez que pulses Play. El código
entra en juego solo cuando el valor tiene que *hacer* algo, e incluso entonces suele ser una línea.

## Añadir un ajuste

**El camino corto:** la página **Perfil de ajustes** del editor (*Tools → WaggleBum → WagSettings → Editor*), **Añadir
ajuste**. En el diálogo elige un tipo, escribe una clave — comprobada mientras escribes —, fija un valor
predeterminado y, para un deslizador, un rango, y pulsa **Crear**. El recurso se crea junto al perfil y se
añade a él. Listo; pulsa Play.

![El diálogo Añadir ajuste con una clave escrita y el recurso que creará](../Images/add-setting-dialog.png)

**A mano:**

**1. Crea el recurso.** *Assets → Create → WaggleBum → WagSettings →* el tipo que necesites:

| Tipo | Control en el menú | Campos que importan |
|---|---|---|
| Float Setting | deslizador | **Key**, **Default**, **Minimum**, **Maximum** |
| Int Setting | deslizador de números enteros | **Key**, **Default**, **Minimum**, **Maximum** |
| Bool Setting | interruptor | **Key**, **Default** |
| Enum Setting | desplegable con las **Options** que listes | **Key**, **Default** (un índice), **Options** |
| String Setting | campo de texto | **Key**, **Default** |

![El menú Assets → Create → WaggleBum → WagSettings](../Images/create-setting-menu.png)

La clave es `categoria.nombre`: la parte anterior al punto es la **pestaña**, la posterior se convierte en
la **etiqueta**. `gameplay.difficulty` cae en una pestaña Gameplay como "Difficulty";
`gameplay.cameraShake` se lee "Camera Shake". Una clave sin punto cae en General.

> La clave es la clave de almacenamiento. Cambiarla tras publicar deja huérfano el valor guardado de cada
> jugador, así que trátala como permanente. Las claves no pueden contener `"` `\` `{` `}` `,` `:` ni
> caracteres de control.

**2. Añádelo al `SettingsProfile`.** Suelta el recurso en la lista del perfil — el que generó la
configuración en `Assets/WagSettings/Resources`, o el tuyo. El orden en la lista es el orden en el menú.
Volver a ejecutar la configuración más tarde conserva lo que añadiste a mano; solo reemplaza las entradas
que escribió ella misma.

![Un SettingsProfile en el Inspector con su lista de ajustes](../Images/profile-inspector.png)

**3. Pulsa Play.** En el menú UI Toolkit la fila ya está: pestaña correcta, control correcto, etiqueta
correcta, y Aplicar / Deshacer / Restablecer, búsqueda, marcado de cambios y persistencia ya funcionan para
ella.

**En el menú uGUI**, las filas se colocan a mano, así que añade una: duplica una fila existente del prefab
(`Sample Scenes/Quick Start/Prefabs/WagSettingsMenu (uGUI).prefab` tiene una de cada tipo), ponla en el
panel de categoría correcto y fija la **Key** del binder. Esa es toda la diferencia entre los dos
frameworks — ver [Primeros pasos](GettingStarted.md).

### Leerlo

Desde cualquier sitio, una vez que hay un `WagSettingsManager` en ejecución:

```csharp
int difficulty = WagSettings.Get<int>("gameplay.difficulty");                 // the pending value
WagSettings.Definition<int>("gameplay.difficulty").Changed += value => { };   // Set, Revert, Reset
```

Para la mayoría de ajustes de juego eso es todo el código que hay: léelo donde importe, o reacciona al
evento. El resto de esta página es para valores que tienen que controlar el propio Unity.

### El inspector comprueba la clave mientras la escribes

Una clave mal formada, si no, solo falla cuando el ajuste se *usa* por primera vez — a menudo en otra
escena, otro día, muy lejos de donde se cometió el error. El inspector la informa de inmediato:

| | Se informa como | Ejemplos |
|---|---|---|
| No se puede usar | **Error** | vacía, un carácter prohibido, espacios al principio o al final |
| Funciona, pero es poco convencional | **Aviso** | sin prefijo de categoría, mayúsculas como `Audio.Master`, una parte vacía entre puntos |

![El Inspector señalando una clave mal formada en un recurso de ajuste](../Images/inspector-key-check.png)

Los avisos son consejo, no obstáculo — una clave sin categoría sigue funcionando, solo que cae en "General".

### Ver el valor actual

El inspector muestra solo los campos de autor cuando no estás jugando, porque el valor actual es estado de
tiempo de ejecución y deliberadamente nunca se guarda en el recurso — las elecciones del jugador
pertenecen a sus datos guardados, no a un archivo que tú distribuyes.

Entra en modo de juego y el inspector muestra el valor en vivo, si tiene cambios sin aplicar, y botones
para deshacer o restablecerlo. Un recurso cuyo Default sigue diciendo `0.8` mientras el juego claramente
está en `0.25` funciona correctamente.

## Escribir un aplicador

Un aplicador convierte un valor en un efecto de Unity siguiendo un calendario — en vivo mientras el jugador
arrastra, o solo cuando pulsa Aplicar. Conoce `UnityEngine`; el núcleo no. Deriva de `SettingApplierBase`
y aporta dos cosas: qué ajustes rastreas y cómo los aplicas.

```csharp
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Audio;
using WaggleBum.WagSettings;

public sealed class MusicVolumeApplier : SettingApplierBase
{
    [SerializeField] private AudioMixer _mixer = null!;

    private ISettingDefinition<float> _music = null!;

    protected override void ResolveSettings(SettingsRegistry registry, IList<ISettingDefinition> tracked)
    {
        _music = Require<float>(registry, "audio.music");
        tracked.Add(_music);
    }

    public override void ApplyCurrentValues()
    {
        _mixer.SetFloat("MusicVolume", AudioVolume.LinearToDecibels(_music.Value));
    }
}
```

Pon el componente **bajo el WagSettings Manager**. El manager conecta todo lo que tiene debajo al
arrancar; no hay nada que llamar. (Un aplicador que deba vivir en otro sitio: `WagSettings.Manager.Attach(applier)`,
y desconéctalo tú.)

La clase base se encarga de las dos cosas que los aplicadores escritos a mano suelen hacer mal:

1. **Cada `+=` tiene su `-=`.** Los ajustes son ScriptableObjects, así que sobreviven a tu escena. Una
   suscripción que nunca liberas mantiene vivos el componente, su GameObject y todo lo que referencian a
   través de las cargas de escena. `Attach`/`Detach` y `OnEnable`/`OnDisable` de Unity están conectados
   por ti.
2. **El valor persistido se aplica al conectar.** Un aplicador que solo reacciona a `Changed` deja el juego
   funcionando con lo que se escribió en la escena hasta que el jugador vuelve a tocar un ajuste — un error
   que se esconde hasta que alguien recarga una escena.

La tercera regla sigue siendo tuya: **nunca escribas en el almacén desde un aplicador.** Los aplicadores
leen; el registro escribe, una vez, en `Apply()`.

`Require` lanza una excepción con una clave que el registro no contiene, nombrándola. Es deliberado: un
deslizador que no controla nada en silencio parece un juego roto en lugar de una configuración rota.

### Inmediato o al aplicar

El campo `Apply Mode` de cada aplicador decide cuándo actúa:

| Modo | Se dispara con | Úsalo para |
|---|---|---|
| `Immediate` *(predeterminado)* | cada cambio en un ajuste rastreado | cambios baratos que el jugador debe oír o ver mientras arrastra — volumen, escala de UI |
| `OnApply` | la confirmación del registro, vía `Apply()` o `Load()` | cualquier cosa cara o disruptiva — resolución, nivel de calidad, modo de ventana |

`OnApply` es lo que evita que un ajuste de resolución haga temblar la ventana mientras se recorre un
desplegable. Escucha `SettingsRegistry.Committed`, que se dispara tras un `Apply()` que escribió algo y
tras un `Load()` — ambos casos en que los valores confirmados cambiaron de verdad.

Ten en cuenta que `ApplyCurrentValues()` vuelve a aplicar **todos** los ajustes rastreados de un aplicador,
no solo el que cambió. Para el puñado de ajustes que posee un aplicador eso es más barato que enrutar
callbacks por ajuste, y mantiene el método como un sencillo "empuja el estado actual a Unity".

## Añadir un nuevo *tipo* de ajuste

Solo necesario para un valor que los tipos integrados no pueden expresar.

```csharp
[CreateAssetMenu(fileName = "New Vector2Setting", menuName = "WaggleBum/WagSettings/Vector2 Setting")]
public sealed class Vector2Setting : TypedSettingAsset<Vector2>
{
}
```

Esa es toda la implementación — `TypedSettingAsset<T>` aporta la clave, el valor predeterminado, el valor,
el evento de cambio y el seguimiento de cambios. El tipo debe ser serializable por Unity, y el almacén que
uses debe poder persistirlo (`PlayerPrefsStore` maneja los tipos primitivos; ver
[Persistencia](Persistence.md)).

Para una lista fija de opciones, prefiere `EnumSetting` a un tipo nuevo — guarda un índice más nombres
visibles y ya funciona con la UI de desplegable.

## Escribir un almacén

Implementa `ISettingsStore` para persistir en otro sitio — un archivo de guardado, un backend, un doble de
prueba.

```csharp
public sealed class MyStore : ISettingsStore
{
    public bool Has(string key)                  { ... }
    public T    Load<T>(string key, T fallback)  { ... }
    public void Save<T>(string key, T value)     { /* buffer, do not commit */ }
    public void Flush()                          { /* commit the whole batch */ }
    public void Delete(string key)               { /* buffer */ }
}
```

El único contrato que importa: **`Save` y `Delete` acumulan, `Flush` confirma.** El registro escribe cada
ajuste sucio y luego vacía exactamente una vez, así que un almacén que confirma por escritura convierte un
Aplicar en cuarenta viajes de ida y vuelta.

Prueba de ida y vuelta cualquier almacén que escribas — fijar, guardar, vaciar, recargar, comprobar — con
la misma forma que las pruebas de `Tests/EditMode`.
