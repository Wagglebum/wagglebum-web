# Persistencia

WagSettings guarda a través de una pequeña interfaz, `ISettingsStore`. De fábrica usa `PlayerPrefsStore`,
que funciona en cualquier proyecto de Unity sin dependencias. Instala [WagSave](https://www.wagglebum.com)
y la persistencia se mejora sola — versionada, sincronizada en la nube, cifrada, con varios perfiles — sin
nada que conectar.

## Cómo funciona el guardado

No se escribe nada mientras el jugador arrastra un deslizador. Un ajuste guarda un valor **pendiente**; el
almacén solo se entera cuando el registro aplica:

```csharp
master.Set(0.5f);      // nothing touches disk
registry.Apply();      // writes dirty settings, then Flush() — once
```

`Apply()` escribe solo los ajustes que realmente están sucios y llama a `Flush()` **exactamente una vez**.
Un menú con cuarenta ajustes cuesta una confirmación, que es lo que hace práctico un almacén respaldado por
disco o por red.

`Revert()` descarta los valores pendientes sin llegar nunca al almacén. Eso es lo que hace que un botón
Cancelar sea honesto en lugar de una segunda escritura.

### Acumulado, no invisible

`Save` y `Delete` acumulan hasta `Flush`, pero `Has` y `Load` leen esas escrituras acumuladas superpuestas
al estado confirmado — quien llama siempre ve sus propias escrituras. `Flush` cambia la **durabilidad**, no
la visibilidad.

```csharp
store.Save("audio.master", 0.5f);
store.Load("audio.master", 0f);   // 0.5 — your own write
// another store instance still reads the old value until Flush()
```

## Elegir un almacén

Un `SettingsProfile` registra qué backend quiere, y `SettingsStoreFactory` lo resuelve:

| `StoreKind` | Resultado |
|---|---|
| `Automatic` *(predeterminado)* | WagSave cuando está instalado, si no PlayerPrefs |
| `PlayerPrefs` | Siempre PlayerPrefs, incluso con WagSave instalado |

```csharp
ISettingsStore store = SettingsStoreFactory.Create(profile.StoreKind);
using SettingsRegistry registry = profile.CreateRegistry(store);
```

`SettingsStoreFactory.Create()` sin argumento devuelve un `PlayerPrefsStore`. Ese valor predeterminado es
por lo que WagSettings no necesita configuración para funcionar.

## PlayerPrefsStore

El predeterminado. Simple, síncrono y presente en todas partes.

**Tipos admitidos.** PlayerPrefs en sí solo guarda `int`, `float` y `string`, así que este almacén admite
esos más `bool` y enumeraciones, que asigna a `int`:

| Tipo de ajuste | Se guarda como |
|---|---|
| `bool` | `int` — `0` o `1` |
| `int` | `int` |
| `float` | `float` |
| `string` | `string` — un valor nulo se guarda vacío, ya que PlayerPrefs no tiene nulo |
| enum / `EnumSetting` | `int` — el valor subyacente |

Cualquier otra cosa lanza `NotSupportedException` **en la llamada a `Save`**, no en silencio al vaciar, para
que el fallo apunte al código que lo causó. Usa `PlayerPrefsStore.IsSupportedType(type)` para comprobarlo
antes.

**Espacio de nombres de claves.** Cada clave se escribe con un prefijo, `WagSettings.` por defecto, así que
un ajuste llamado `audio.master` se guarda como `WagSettings.audio.master` y nunca puede chocar con las
entradas PlayerPrefs de tu propio juego.

```csharp
var store = new PlayerPrefsStore("MyGame.Settings.");
```

> Cambiar el prefijo tras publicar deja huérfano cada valor guardado, exactamente igual que cambiar una clave.

**Lo que no te da.** Ni versionado ni migración, ni sincronización en la nube, ni cifrado, ni perfiles, y
PlayerPrefs se guarda en claro — en Windows en el registro, en macOS en un plist — así que los jugadores
pueden editarlo trivialmente. Para ajustes suele estar bien. Si no lo está, para eso existe WagSave.

## Qué se activa con WagSave

Instala `com.wagglebum.wagsave` y WagSettings lo detecta en tiempo de compilación mediante el símbolo
`WAGGLEBUM_WAGSAVE_PRESENT`. El ensamblado `WagSettings.WagSave` — que Unity omite por completo cuando
WagSave no está — registra un almacén respaldado por WagSave en `SettingsStoreFactory` al iniciar. Los
perfiles en `Automatic` lo adoptan sin cambiar código por tu parte.

![La comprobación de persistencia indicando que WagSave fue detectado](../Images/summary-wagsave-detected.png)

| | PlayerPrefs | WagSave |
|---|---|---|
| Funciona sin dependencias | ✅ | — |
| Versionado y migración al actualizar | ❌ | ✅ |
| Sincronización en la nube entre dispositivos | ❌ | ✅ |
| Cifrado y firma | ❌ | ✅ |
| Varios perfiles | ❌ | ✅ |
| Elección de formato (binario / JSON / texto) | ❌ | ✅ |
| Tipos más allá de los primitivos | ❌ | ✅ |

### Cómo se conecta

No hay nada que activar. `WagSettings.WagSave` es un ensamblado que Unity compila **solo** cuando
`com.wagglebum.wagsave` está instalado, así que el mero hecho de que su arranque se ejecute es la
detección — sin comprobación de versión, sin reflexión, sin ajuste. Instala WagSave y la persistencia se
mejora sola; quítalo y el ensamblado desaparece junto con el registro, dejando el valor predeterminado de
PlayerPrefs.

Un perfil en `PlayerPrefs` sigue obteniendo PlayerPrefs. Elegir un almacén explícitamente es una decisión
que el paquete no anula.

### Qué saber del almacén de WagSave

**Los ajustes viven en su propio grupo de WagSave**, `WagSettings` por defecto, así que se mantienen
separables de los datos de guardado de tu juego y pueden inspeccionarse con las herramientas de WagSave.

**Las escrituras se agrupan.** La API de tiempo de ejecución de WagSave confirma en cada llamada a `Save`,
así que este almacén acumula y escribe solo en `Flush` — que el registro llama una vez por Aplicar, solo
para los ajustes sucios. Un menú de cuarenta ajustes donde el jugador cambió dos cuesta dos escrituras, no
cuarenta. Hay una prueba que verifica exactamente eso.

**Borrar escribe un nulo.** La API pública de WagSave no tiene eliminación, así que una clave borrada se
guarda como nulo, que se lee como ausente. El mismo resultado desde el punto de vista de quien llama, y
mantiene a WagSettings fuera de las interioridades de WagSave.

**Un valor guardado como otro tipo sigue leyéndose.** Un ajuste que era `int` y ahora es `float` se
convierte en lugar de fallar. Un valor que de verdad no puede leerse recurre al valor predeterminado y
avisa — el jugador pierde un ajuste, no la capacidad de arrancar.

## Escribir tu propio almacén

Implementa `ISettingsStore` y regístralo:

```csharp
SettingsStoreFactory.RegisterProvider(() => new MyStore());
```

Regístralo antes de que algo construya un registro — un `[RuntimeInitializeOnLoadMethod]` es el sitio
habitual. El último registro gana, `ClearProvider()` restaura el valor predeterminado de PlayerPrefs, y un
proveedor que devuelve nulo lanza una excepción en lugar de recurrir en silencio a otra cosa, ya que unos
ajustes que dejan de persistir en silencio son peores que un fallo ruidoso.

El único contrato que importa: **`Save` y `Delete` acumulan, `Flush` confirma.** Un almacén que confirma en
cada escritura convierte un Aplicar en cuarenta viajes de ida y vuelta.

Ver [Extensibilidad](Extensibility.md) para el recorrido completo.
