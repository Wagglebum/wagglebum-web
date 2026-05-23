# Referencia de API

Todos los tipos viven en el espacio de nombres `WaggleBum.WagSave` salvo que se indique lo contrario.

```csharp
using WaggleBum.WagSave;
using WaggleBum.WagSave.Core.SaveSlots; // SaveSlot, SaveSlotManager
using WaggleBum.WagSave.Core.Enums;    // SaveSlotType, LogLevel
```

---

## Obtener una Instancia

```csharp
// Obtener la instancia activa (o única) de WagSave
WagSave wagSave = WagSave.GetInstance();

// Obtener una instancia específica por su ID (útil cuando existen múltiples instancias)
WagSave wagSave = WagSave.GetInstance("my-instance-id");

// Obtener todas las instancias del proyecto
WagSave[] all = WagSave.GetAllInstances();
```

En tiempo de ejecución en compilaciones, `GetInstance` carga desde `Resources/WagSave/`. En el editor usa `AssetDatabase`. Si no se encuentra ninguna instancia, se devuelve `null` y se registra una advertencia.

---

## Guardar / Cargar Componentes

Estos métodos guardan y cargan todas las instancias de `WagSaveComponent` en cada escena actualmente cargada.

### Síncrono

```csharp
// Guardar todos los componentes — opcionalmente en una ranura específica
wagSave.Save();
wagSave.Save(slot);

// Cargar todos los componentes — opcionalmente desde una ranura específica
wagSave.Load();
wagSave.Load(slot);
```

### Asíncrono (recomendado)

La serialización y la entrada/salida de archivos se ejecutan en un hilo secundario. Las llamadas a la API de Unity permanecen en el hilo principal.

```csharp
await wagSave.SaveAsync();
await wagSave.SaveAsync(slot);

await wagSave.LoadAsync();
await wagSave.LoadAsync(slot);
```

### Comportamiento cuando las Ranuras de Guardado están activadas

Cuando las Ranuras de Guardado están activadas y no se proporciona ningún argumento `slot`:
- Si **Use Save Slot UI** está activado, la interfaz de selección de ranuras integrada se muestra automáticamente.
- Si **Use Save Slot UI** está desactivado, WagSave selecciona una ranura automáticamente según tu configuración.

Pasa un `slot` explícito para omitir la interfaz y la selección de ranuras por completo.

---

## Guardar / Cargar Clave-Valor

Para guardar valores individuales que no están vinculados a un GameObject específico.

```csharp
// Conveniencia estática — usa la instancia activa de WagSave
WagSave.Save("score", 9500);
WagSave.Save("playerName", "Alex", groupName: "player");

// Carga con tipo
int score = WagSave.Load<int>("score");
string name = WagSave.Load<string>("playerName", groupName: "player");

// Carga sin tipo
object raw = WagSave.Load("score");
```

El parámetro opcional `groupName` agrupa las claves por espacio de nombres para evitar colisiones. El parámetro opcional `instanceId` apunta a una instancia específica de WagSave cuando existen varias.

---

## Guardado Automático

```csharp
// Disparar un guardado automático inmediatamente (síncrono)
wagSave.AutoSave();

// Disparar un guardado automático inmediatamente (asíncrono)
await wagSave.AutoSaveAsync();

// Pausar el temporizador de guardado automático
wagSave.PauseAutoSave();

// Reanudar un temporizador de guardado automático pausado (reinicia la cuenta atrás)
wagSave.ResumeAutoSave();

// Reiniciar la cuenta atrás del guardado automático sin pausar
wagSave.ResetAutoSaveTimer();

// Fijar una ranura específica para el próximo guardado automático
wagSave.SetAutoSaveSlot(slot);

// Limpiar la ranura fijada para que el guardado automático seleccione automáticamente de nuevo
wagSave.ClearAutoSaveSlot();
```

El temporizador de guardado automático es controlado por `WagSaveManager` — un MonoBehaviour que debe estar presente en la escena. Consulta [Guardado automático](Autosave.md).

---

## Propiedades

| Propiedad | Tipo | Descripción |
|---|---|---|
| `IsSaving` | `bool` | True mientras una operación de guardado está en progreso. |
| `IsLoading` | `bool` | True mientras una operación de carga está en progreso. |
| `Progress` | `int` | Progreso de la operación actual, 0–100. |
| `Settings` | `WagSaveSettings` | Acceso a todos los ajustes de configuración. |
| `SaveSlots` | `SaveSlotManager` | El gestor de ranuras de guardado. Consulta [Ranuras de guardado](SaveSlots.md). |
| `IsSaveOverrideEnabled` | `bool` | True cuando tanto `OnSaveOverride` como `OnLoadOverride` están suscritos. |
| `DebugLogLevel` | `LogLevel` | Severidad mínima de registro escrita en la Consola de Unity. |
| `LogToFileEnabled` | `bool` | Cuando es true, la salida de registro también se escribe en un archivo. |
| `InstanceCount` | `int` | Número de assets WagSave encontrados en el proyecto. |

---

## Eventos

Suscríbete a eventos en la instancia de WagSave para reaccionar a los cambios en el ciclo de vida de guardado/carga.

```csharp
private void OnEnable()
{
    var wagSave = WagSave.GetInstance();
    wagSave.OnSaveStart     += HandleSaveStart;
    wagSave.OnSaveCompleted += HandleSaveCompleted;
    wagSave.OnLoadStart     += HandleLoadStart;
    wagSave.OnLoadCompleted += HandleLoadCompleted;
    wagSave.OnProgress      += HandleProgress;
    wagSave.OnError         += HandleError;
}

private void OnDisable()
{
    var wagSave = WagSave.GetInstance();
    if (wagSave == null) return;
    wagSave.OnSaveStart     -= HandleSaveStart;
    wagSave.OnSaveCompleted -= HandleSaveCompleted;
    wagSave.OnLoadStart     -= HandleLoadStart;
    wagSave.OnLoadCompleted -= HandleLoadCompleted;
    wagSave.OnProgress      -= HandleProgress;
    wagSave.OnError         -= HandleError;
}

private void HandleSaveStart()    { Debug.Log("Guardado iniciado"); }
private void HandleSaveCompleted(){ Debug.Log("Guardado completado"); }
private void HandleLoadStart()    { Debug.Log("Carga iniciada"); }
private void HandleLoadCompleted(){ Debug.Log("Carga completada"); }
private void HandleProgress(int percent) { Debug.Log($"Progreso: {percent}%"); }
private void HandleError(string message, Exception ex) { Debug.LogError(message); }
```

### Referencia Completa de Eventos

| Evento | Firma | Se activa cuando |
|---|---|---|
| `OnSaveStart` | `() => void` | Inmediatamente antes de que comience un guardado. |
| `OnSaveCompleted` | `() => void` | Después de que un guardado finaliza con éxito. |
| `OnLoadStart` | `() => void` | Inmediatamente antes de que comience una carga. |
| `OnLoadCompleted` | `() => void` | Después de que una carga finaliza con éxito. |
| `OnProgress` | `(int percent) => void` | Periódicamente durante el guardado o la carga con una finalización de 0–100. |
| `OnError` | `(string msg, Exception ex) => void` | Cuando ocurre un error de guardado o carga. |
| `OnAutoSaveTimer` | `(int secondsRemaining, int interval) => void` | Cada fotograma durante una cuenta atrás de guardado automático activa. |
| `OnAutosavePause` | `() => void` | Cuando el guardado automático se pausa. |
| `OnAutosaveResume` | `() => void` | Cuando el guardado automático se reanuda. |
| `OnAutosaveTimerReset` | `() => void` | Cuando la cuenta atrás del guardado automático se reinicia. |
| `OnGetEncryptionPrivateKey` | Ver [Extensibilidad](Extensibility.md) | Cuando un guardado cifrado necesita la clave privada. |
| `OnSaveOverride` | Ver [Extensibilidad](Extensibility.md) | Serialización personalizada — reemplaza la lógica de guardado predeterminada. |
| `OnLoadOverride` | Ver [Extensibilidad](Extensibility.md) | Deserialización personalizada — reemplaza la lógica de carga predeterminada. |

---

## Múltiples Instancias

Si tu proyecto tiene más de un asset WagSave (por ejemplo, perfiles separados para datos de juego y configuración), marca uno como **Active** en el editor o llama:

```csharp
wagSave.SetActive(); // marca esta instancia como activa, desactiva todas las demás
```

`GetInstance()` sin argumentos devuelve la instancia activa. Para obtener una específica:

```csharp
WagSave settingsSave = WagSave.GetInstance("settings-instance-id");
```

El ID de instancia se muestra en el encabezado de la ventana del editor de WagSave y se almacena en el asset.
