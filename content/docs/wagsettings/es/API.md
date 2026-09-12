# API

El modelo central de WagSettings. Todo lo de esta página vive en el espacio de nombres
`WaggleBum.WagSettings` y, salvo los tipos de recurso ScriptableObject, no depende de `UnityEngine` — el
modelo es C# puro, así que puede probarse unitariamente de forma directa y extraerse más adelante.

## La API estática

La mayor parte del código de un juego necesita una línea, y es esta:

```csharp
using WaggleBum.WagSettings;

float master = WagSettings.Get<float>("audio.master");
WagSettings.Set("audio.master", 0.8f);                 // pending
WagSettings.Apply();                                    // committed and saved, in one batch
WagSettings.Definition<float>("audio.master").Changed += value => { };
```

| Miembro | Hace |
|---|---|
| `Get<T>(key)` | El valor pendiente |
| `Set<T>(key, value)` | Fija el valor pendiente; `true` si cambió |
| `Definition<T>(key)` | El `ISettingDefinition<T>` tras una clave, para su evento `Changed` |
| `Apply()` / `Revert()` / `ResetAll()` | Los comandos del registro |
| `IsDirty` | ¿Hay algo pendiente? |
| `Registry` | El registro en sí, para todo lo demás |
| `Manager` / `IsReady` | El `WagSettingsManager` en ejecución, o si hay uno |

Cada llamada resuelve al **`WagSettingsManager`** activo. Sin ninguno en ejecución, `Get` y las demás
**lanzan una excepción** que nombra las dos formas de arreglarlo — nunca devuelven un valor predeterminado
silencioso, porque un menú de ajustes que "funciona" sin guardar nada es el fallo que esto existe para
evitar. `IsReady` es la comprobación cuando no se quiere una excepción.

### `WagSettingsManager`

El único propietario del registro. Añade **WaggleBum → WagSettings → WagSettings Manager** a una escena y
asigna un perfil, o no asignes ninguno y usará el perfil predeterminado de una carpeta Resources. El manager:

- construye el registro a partir del perfil, de forma perezosa, para que un menú que se abre en `Awake`
  obtenga el mismo;
- **conecta cada `SettingApplierBase` que tiene debajo** en `Start`, sin nada que escribir;
- entrega su registro a cualquier menú que se abra — un menú con un manager en ejecución no crea el suyo;
- persiste entre cargas de escena por defecto, y un segundo manager avisa y se elimina a sí mismo.

`Attach(applier)` cubre un aplicador que vive en otro sitio; desconéctalo tú.

### `WagSettingsBootstrapper`

Si una escena no tiene manager y hay un `SettingsProfile` en una carpeta Resources, se crea uno tras
cargarse la primera escena — así los ajustes guardados se aplican antes del primer fotograma y la API
estática funciona sin colocar nada. La configuración genera en `Assets/WagSettings/Resources` exactamente
por esto. Sin perfil en Resources no ocurre nada. Con varios perfiles ahí, marca **Is Default** en el que
quieras; si ninguno lo tiene, avisa y toma el primero.

`WagSettings.Reset()` limpia el estado estático y se ejecuta antes de cada sesión de juego, así que Enter
Play Mode sin recarga de dominio no puede entregar a una sesión nueva el manager de la anterior. Las pruebas
lo llaman en su preparación.

## La forma del modelo

```
SettingsProfile  (asset)  ── CreateRegistry(store) ──▶  SettingsRegistry
      │                                                       │
      └─ SettingAsset ─┐                          holds       ▼
                       └──────────────────────▶  ISettingDefinition ──▶ ISettingsStore
                                                       ▲
                             SettingDefinition<T> (plain C#, does the work)
```

Un ajuste lleva tres valores, y la diferencia entre ellos es todo el modelo:

| | Significado |
|---|---|
| `DefaultValue` | El valor predeterminado de autor. `ResetToDefault()` lo restaura. |
| `Value` | El valor **pendiente** — lo que el usuario ha puesto ahora mismo. |
| *línea base aplicada* | El último valor confirmado por `Apply()` o cargado del almacén. |

`IsDirty` es simplemente `Value != línea base`. Eso es lo que permite que un botón Aplicar se encienda,
que un botón Cancelar funcione, y una confirmación por lotes en una sola escritura.

## `SettingDefinition<T>`

El ajuste en C# puro. Constrúyelo con una clave y un valor predeterminado.

```csharp
var master = new SettingDefinition<float>("audio.master", 0.8f);

master.Changed += volume => mixer.SetFloat("MasterVolume", AudioVolume.LinearToDecibels(volume));
master.Set(0.5f);          // raises Changed, IsDirty becomes true
```

| Miembro | Notas |
|---|---|
| `Key`, `DefaultValue`, `ValueType` | Identidad inmutable. |
| `Value` / `Set(T)` | `Set` devuelve si el valor se movió. Escribir el mismo valor no hace nada ni emite nada, así que los aplicadores nunca se despiertan sin motivo. |
| `Changed` | `SettingChangedHandler<T>` — tipado, para aplicadores y UI. |
| `ValueChanged` | `Action` sin tipo, usado por el registro para rastrear el estado sucio. |
| `IsDirty` | El valor pendiente difiere de la línea base aplicada. |
| `Apply()` | Adopta el valor pendiente como línea base. |
| `Revert()` | Restaura la línea base. Emite `Changed` si el valor se mueve. |
| `ResetToDefault()` | Restaura el valor predeterminado de autor. Deja el ajuste **sucio**, así que un restablecimiento sigue siendo cancelable. |
| `LoadFrom(store)` / `SaveTo(store)` | Lee/escribe un único valor. `SaveTo` **no** vacía. |

La igualdad usa `EqualityComparer<T>.Default` a menos que pases un comparador al constructor — útil para
ajustes `float` donde quieres una tolerancia en lugar de igualdad exacta.

### `ISettingDefinition<T>`

`SettingDefinition<T>` y los tipos de recurso ScriptableObject implementan ambos `ISettingDefinition<T>`,
que lleva `Value`, `Set`, `DefaultValue` y `Changed`. Vincula la UI y los aplicadores a **esta interfaz**,
no a la clase concreta, para que un ajuste funcione igual tanto si se creó como recurso como si se
construyó en código — `SettingsRegistry.Get<T>` la devuelve exactamente por eso.

## `SettingsRegistry`

Todos los ajustes en un lugar, vinculados a un almacén. A esto se vincula la UI.

```csharp
using var registry = new SettingsRegistry(store);
registry.Register(master);

registry.IsDirty;          // false — Register loaded the persisted value
master.Set(0.5f);
registry.IsDirty;          // true
registry.Apply();          // writes dirty settings, flushes once
```

| Miembro | Notas |
|---|---|
| `Register(definition)` | Añade el ajuste **y carga su valor persistido**, así que un registro nuevo está limpio. Lanza excepción con una clave duplicada. |
| `Unregister(key)` / `Clear()` | Quita ajustes y desconecta las suscripciones del registro. |
| `Get<T>(key)` | Búsqueda tipada, devuelve `ISettingDefinition<T>`. Lanza `KeyNotFoundException` si falta, `InvalidCastException` si el tipo no coincide. |
| `TryGet` / `Contains` | Búsquedas que no lanzan. |
| `Definitions` | Ajustes registrados en orden de registro — el orden en que la UI los presenta. |
| `IsDirty` | True cuando algún ajuste tiene cambios sin aplicar. |
| `DirtyStateChanged` | Se dispara solo en una **transición** limpio↔sucio, no en cada pulsación. |
| `Load()` | Vuelve a leer todo del almacén, descartando ediciones pendientes. |
| `Apply()` | Escribe los ajustes sucios, `Flush()` **una vez**, los adopta como línea base. Devuelve cuántos se escribieron. Los ajustes limpios nunca se reescriben. |
| `Revert()` | Descarta las ediciones pendientes. |
| `ResetAll()` | Restaura cada valor predeterminado, dejando el registro sucio. |
| `Dispose()` | Desconecta cada suscripción. |

> El registro se suscribe a cada ajuste que contiene. **Deséchalo** (o llama a `Clear()`) cuando la escena
> o el perfil propietario desaparezca, o esas suscripciones lo mantendrán vivo a través de los recursos de
> ajuste.

### Agrupación

`Apply()` es lo único que llama a `Flush()`, y lo llama como máximo una vez. Eso importa porque un almacén
real puede tocar disco o red — un menú con cuarenta ajustes sigue costando una confirmación.

## La capa de vinculación

La UI se vincula a un modelo de vista, no al registro directamente. Tanto el menú UI Toolkit como el uGUI
pasan por el mismo, así que no pueden divergir — y todo el menú es comprobable sin instanciar un control.

### Etiquetas y categorías

Los ajustes llevan un `DisplayName` y una `Category`. Ninguno tiene que escribirse: se derivan de la
clave, así que un menú nunca muestra una clave en bruto.

| Clave | Etiqueta derivada | Categoría derivada |
|---|---|---|
| `audio.master` | Master | Audio |
| `display.windowMode` | Window Mode | Display |
| `accessibility.reduce_motion` | Reduce Motion | Accessibility |
| `simple` | Simple | General |

Escribir cualquiera de los dos en el recurso anula el valor derivado. La derivación es un respaldo, no una
política — todo lo que vea el jugador debería acabar escrito y localizado.

### `ISettingBinder`

Un ajuste tal como lo ve una vista: `DisplayName`, `Category`, `IsDirty`, `BoxedValue`, un evento
`Changed` y disponibilidad.

```csharp
var binder = (SettingBinding<float>)category.Settings[0];
binder.Set(0.5f);            // goes through the registry-tracked setting
```

**Las ediciones pasan por el ajuste que rastrea el registro, nunca por un atajo directo al almacén.** Una
vista que escribiera directamente en el almacén dejaría al botón Aplicar mintiendo sobre lo que está
pendiente.

**La disponibilidad** es cómo se presenta un ajuste que el hardware actual no puede respetar:

```csharp
binder.SetAvailability(
    applier.SupportsFeature(GraphicsFeature.RenderScale),
    "Render scale needs the Universal Render Pipeline.");
```

Un binder no disponible ignora las escrituras en lugar de lanzar excepciones, así que una vista que aún no
haya atenuado un control no puede hacer caer el menú. Atenúa el control y muestra `UnavailableReason` — **no
lo ocultes**, o el jugador buscará una opción de la que ha leído.

### `SettingsMenuModel`

```csharp
using var model = new SettingsMenuModel(registry, SettingBinderFactory.CreateAll(registry), ownsBinders: true);

model.SearchText = "volume";
foreach (SettingsMenuCategory category in model.Categories)
{
    foreach (ISettingBinder setting in category.Settings) { /* build a row */ }
}
```

| Miembro | Notas |
|---|---|
| `Categories` | Categorías coincidentes en orden de **autor**, no alfabético — el orden del perfil es una decisión de diseño. Las vacías se descartan. |
| `SearchText` | Coincide con etiqueta, categoría o clave, sin distinguir mayúsculas. Emite `Changed` una vez por cambio real. |
| `CanApply` / `CanRevert` | True mientras algo esté sucio. |
| `CanReset` | True solo cuando algo difiere de su valor predeterminado de autor — un Restablecer que no haría nada no debería invitar a un clic. |
| `Apply()` / `Revert()` / `ResetAll()` | Directo al registro; `Apply` devuelve cuántos se escribieron. |
| `Changed` | Cualquier cambio de valor, disponibilidad, búsqueda o estado sucio. |

`SettingBinderFactory` construye binders tipados para un registro entero, emparejando los tipos de valor
comunes directamente y recurriendo a reflexión para uno personalizado — así que añadir un tipo de ajuste no
significa editar un switch.

> En IL2CPP la vía por reflexión necesita que la instanciación genérica exista al compilar. El `link.xml`
> del paquete evita que se eliminen los constructores de `SettingBinding<T>`, pero para un tipo de valor
> propio, `SettingBinding<TuTipo>` debe aparecer además en algún sitio de tu código — basta un campo — para
> que el compilador AOT lo genere. Los cuatro tipos de valor integrados no necesitan nada.

> Desecha el modelo cuando el menú se cierre. Se suscribe al registro y a cada binder; `ownsBinders: true`
> desecha los binders con él.

## `ISettingsStore`

La costura de persistencia. `PlayerPrefsStore` es el predeterminado y `WagSaveStore` toma el relevo cuando
WagSave está instalado; ver [Persistencia](Persistence.md).

```csharp
public interface ISettingsStore
{
    bool Has(string key);
    T    Load<T>(string key, T fallback);
    void Save<T>(string key, T value);   // buffered
    void Flush();                        // commits the batch
    void Delete(string key);             // buffered
}
```

`Save` y `Delete` acumulan; solo `Flush` confirma.

## Recursos de ajuste

Envoltorios ScriptableObject para que los ajustes puedan escribirse y referenciarse como recursos. Cada uno
delega en un `SettingDefinition<T>` interno — el recurso es la superficie de autor, la definición hace el
trabajo.

`BoolSetting` · `IntSetting` · `FloatSetting` · `StringSetting` · `EnumSetting`

Créalos desde **Assets → Create → WaggleBum → WagSettings**. Cada recurso necesita una **Key** — una clave
vacía lanza una excepción en cuanto se usa el ajuste.

`EnumSetting` guarda el **índice** seleccionado de una lista de nombres de opción en lugar de una
enumeración de C#, así que un único tipo de recurso sirve para cada desplegable (modo de ventana, ajuste
de daltonismo, nivel de calidad) y la UI obtiene sus nombres visibles sin reflexión.

## `SettingsProfile`

Agrupa los ajustes que expone un juego y registra qué almacén los persiste.

```csharp
using SettingsRegistry registry = profile.CreateRegistry(store);
```

`CreateRegistry` registra cada ajuste en orden de autor. Un **hueco vacío en la lista lanza una excepción**
en lugar de omitirse — descartar un ajuste del menú en silencio en tiempo de ejecución es peor que un fallo
ruidoso.

`StoreKind` es `Automatic` (WagSave si está instalado, si no PlayerPrefs) o `PlayerPrefs`.
`SettingsStoreFactory` lo resuelve. `IsDefault` marca el perfil que usa el manager cuando varios comparten
una carpeta Resources.

## `Guard` y errores

Cada punto de entrada público valida a través de `Guard`, y cada error de WagSettings sigue un único
contrato: **crear → registrar → lanzar**.

```csharp
Guard.AgainstNull(store, nameof(store));
Guard.AgainstNullOrEmpty(value, nameof(value));
Guard.AgainstInvalidKey(key, nameof(key));
Guard.AgainstNumberNotInRange(value, 0, 10, nameof(value));
```

Una clave válida no está vacía ni es solo espacios, y no contiene `"` `\` `{` `}` `,` `:` ni caracteres de
control. Los puntos están permitidos y son el separador de grupo convencional: `audio.master`,
`display.window_mode`.

Suscríbete a `WagSettingsLog.ErrorLogged` para observar los fallos — se dispara inmediatamente **antes** de
lanzar la excepción, así que ves el error aunque algo aguas arriba lo capture.

```csharp
WagSettingsLog.ErrorLogged += exception => Debug.LogException(exception);
```
