# Extensibilidad

WagSave está diseñado para ser extendido en cada capa. Puedes reemplazar el formato de serialización, intercambiar un nuevo backend de salida, anular la lógica de guardado/carga por completo, o engancharte al aprovisionamiento de claves de cifrado — todo sin modificar el código fuente del paquete.

---

## Anulación de Guardado y Carga

La forma más sencilla de tomar el control total del comportamiento de guardado y carga es mediante los eventos `OnSaveOverride` y `OnLoadOverride`. Cuando ambos están suscritos, WagSave omite su serialización de componentes predeterminada y delega completamente en tus manejadores.

Ambos eventos deben suscribirse juntos — suscribir solo uno lanza una `InvalidOperationException`.

```csharp
wagSave.OnSaveOverride += (slot, saveTarget) =>
{
    // Escribe lo que quieras en saveTarget
    saveTarget.AddOrUpdate("myKey", myCustomData);
    // saveTarget.Save() se llama automáticamente después de este manejador
};

wagSave.OnLoadOverride += (slot, saveTarget) =>
{
    // Lee desde saveTarget y aplica al estado de tu juego
    var data = saveTarget.Get<MyCustomData>("myKey");
    ApplyToGame(data);
};
```

El parámetro `saveTarget` es el backend de guardado configurado (Binary, JSON, etc.). Interactúas con él de la misma manera independientemente del formato activo:

```csharp
// Escribir un valor
saveTarget.AddOrUpdate("key", value);

// Leer un valor
var value = saveTarget.Get<MyType>("key");

// Volcar en disco / remoto
saveTarget.Save();
```

Este patrón es útil cuando tienes tu propio modelo de datos serializable que no se corresponde limpiamente con las rutas de reflexión de `WagSaveComponent`.

---

## Aprovisionamiento de Claves de Cifrado

Cuando **Encrypt Data** está activado, WagSave usa cifrado asimétrico. La clave pública se almacena en el asset WagSave. La clave privada nunca es almacenada por WagSave — la proporcionas en tiempo de ejecución mediante un evento:

```csharp
wagSave.OnGetEncryptionPrivateKey += () =>
{
    // Carga la clave privada desde donde la almacenes de forma segura —
    // un servidor remoto, un almacén de credenciales de plataforma, etc.
    return SecureKeyStorage.GetPrivateKey();
};
```

Alternativamente, asigna la clave directamente en la instancia antes del primer guardado o carga:

```csharp
wagSave.Settings.SaveTarget.Options.EncryptPrivateKey = SecureKeyStorage.GetPrivateKey();
```

El evento es preferido ya que difiere la obtención de la clave al momento de uso. Ambos enfoques son válidos.

> **Nota de seguridad:** No incrustes la clave privada como cadena de texto en tu código fuente ni la incluyas en texto plano dentro de tu compilación. Usa un almacén de credenciales de plataforma o cárgala desde un servidor en el primer lanzamiento.

---

## Formatos de Salida Personalizados

Crea un nuevo formato de salida implementando la interfaz `ISaveTarget` de `WaggleBum.WagSave.Core.Interfaces`. Una vez registrado, tu formato aparece junto a los formatos integrados en el desplegable del editor.

```csharp
using WaggleBum.WagSave.Core.Interfaces;
using WaggleBum.WagSave.Core.SaveTargets;

public class MyCustomSaveTarget : ISaveTarget
{
    public void AddOrUpdate(string key, object value, string group = null) { /* ... */ }
    public object Get(string key, string group = null)                      { /* ... */ }
    public T Get<T>(string key, string group = null)                        { /* ... */ }
    public void Save()                                                      { /* ... */ }
    public void Load()                                                      { /* ... */ }
    public void Dispose()                                                   { /* ... */ }
}
```

Regístralo con `SaveTargetDestination` para que WagSave pueda descubrirlo:

```csharp
SaveTargetDestination.Register(new SaveTargetDestination(
    id:          "my-custom-format",
    name:        "Mi Formato",
    description: "Un backend de guardado personalizado",
    groupName:   "Custom",
    factory:     settings => new MyCustomSaveTarget(settings)
));
```

Llama a `Register` una vez al inicio, por ejemplo en una clase `[InitializeOnLoad]` (editor) o un `RuntimeInitializeOnLoadMethod` (tiempo de ejecución).

---

## Serializadores Personalizados

Los serializadores integrados de WagSave (Binary, JSON, Text) pueden ser heredados y anulados para cambiar cómo se codifican los datos sin reemplazar todo el save target.

```csharp
using WaggleBum.WagSave.Core.Serialization;

public class MyJsonSerializer : JsonSerializer
{
    protected override string Serialize(object value)
    {
        // Lógica de serialización personalizada — por ejemplo, usar una biblioteca JSON diferente
        return MyJsonLibrary.Serialize(value);
    }

    protected override T Deserialize<T>(string data)
    {
        return MyJsonLibrary.Deserialize<T>(data);
    }
}
```

Inyecta tu serializador heredando el save target correspondiente y anulando `CreateSerializer`:

```csharp
public class MyJsonSaveTarget : JsonFileSaveTarget
{
    protected override ISerializer CreateSerializer() => new MyJsonSerializer();
}
```

Luego regístralo como formato personalizado tal como se muestra arriba.

---

## Interfaz de Indicador de Progreso Personalizada

Reemplaza el indicador de progreso integrado asignando tu propio prefab al campo `Progress Indicator Prefab` en el asset WagSave. El prefab debe tener un componente que implemente la interfaz `IProgressIndicator`:

```csharp
public interface IProgressIndicator
{
    void Show();
    void Hide();
    void SetProgress(int percent);
}
```

---

## Interfaz de Ranuras de Guardado Personalizada

Reemplaza el selector de ranuras integrado asignando tu propio prefab al campo `Save Slots UI Prefab` en el asset WagSave. Desactiva **Use Save Slot UI** y controla la selección de ranuras completamente mediante código si prefieres una implementación totalmente personalizada. Consulta [Ranuras de guardado](SaveSlots.md) para la API completa de `SaveSlotManager`.
