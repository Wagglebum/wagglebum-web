# Primeros Pasos

Esta guía te lleva paso a paso por la instalación de WagSave, la creación de tu primer asset de guardado y la realización de un guardado y carga básicos.

---

## 1. Crear un Asset WagSave

En la ventana de Proyecto, haz clic derecho y elige:

```
Assets > Create > WaggleBum > WagSave > WagSave (Save System)
```

Esto crea un ScriptableObject `WagSave`. Ponle un nombre significativo — por ejemplo `GameSave` o `SaveProfile`.

También puedes abrir la ventana del editor de WagSave en cualquier momento desde la barra de menú de Unity:

```
Window > WagSave
```

Selecciona tu asset en el desplegable de la parte superior de la ventana.

---

## 2. Moverlo a una Carpeta Resources

WagSave usa `Resources.Load` para encontrar el asset en tiempo de ejecución en compilaciones. Coloca el asset dentro de una carpeta llamada `WagSave` que esté dentro de una carpeta `Resources` en cualquier parte de tu proyecto:

```
Assets/
  Resources/
    WagSave/
      GameSave.asset   ← tu asset WagSave va aquí
```

> **Importante:** Si el asset no está dentro de una carpeta `Resources/WagSave/`, `WagSave.GetInstance()` devolverá `null` en compilaciones (el Editor de Unity usa `AssetDatabase` en su lugar y funcionará independientemente de la ubicación).

---

## 3. Abrir la Ventana del Editor de WagSave

```
Window > WagSave
```

La ventana del editor es donde ocurre toda la configuración — formato de salida, ranuras de guardado, guardado automático, cifrado, registro y más. Selecciona tu asset en el desplegable de la parte superior.

---

## 4. Elegir un Formato de Salida

En la ventana del editor, ve a **Save Output** y elige una categoría y formato:

| Categoría | Formato | Ideal para |
|---|---|---|
| Archivo | Binary | Lanzamiento — compacto y rápido |
| Archivo | JSON | Depuración — legible por humanos |
| Archivo | Text | Datos simples de clave-valor |
| Plataforma | PlayerPrefs | Datos de configuración pequeños, WebGL |
| Plataforma | Unity Cloud Save | Juegos multijugador en línea |
| Plataforma | Steam Cloud Save | Juegos de Steam con el SDK de Steamworks |

Para la mayoría de los proyectos, **Binary** es el punto de partida recomendado.

---

## 5. Añadir WagSaveManager a tu Escena

`WagSaveManager` es un MonoBehaviour que controla el temporizador de guardado automático y la lógica de cambio de escena. Añádelo a un GameObject en tu escena (típicamente un objeto gestor persistente).

```
Add Component > WaggleBum > WagSave > WagSave Manager
```

Solo necesitas un `WagSaveManager` en cualquier escena que use el guardado automático. Encuentra la instancia activa de `WagSave` automáticamente en tiempo de ejecución.

---

## 6. Marcar GameObjects para Guardar

Añade un `WagSaveComponent` a cualquier GameObject cuyo estado quieras guardar:

```
Add Component > WaggleBum > WagSave > WagSave
```

Luego abre la ventana del editor de WagSave, navega a **Scene Content**, encuentra el GameObject en la lista y haz clic en **Configure** para seleccionar qué campos y propiedades incluir.

Consulta [Componente WagSave](WagSaveComponent.md) para un recorrido completo.

---

## 7. Guardar y Cargar

### Mediante código

```csharp
using WaggleBum.WagSave;

public class GameManager : MonoBehaviour
{
    private WagSave _wagSave;

    private void Start()
    {
        _wagSave = WagSave.GetInstance();
    }

    public void SaveGame()
    {
        _wagSave.Save();
    }

    public void LoadGame()
    {
        _wagSave.Load();
    }
}
```

### Guardados de clave-valor (no requiere WagSaveComponent)

Para valores simples que no pertenecen a un GameObject específico:

```csharp
// Guardar
WagSave.Save("currentLevel", 5);
WagSave.Save("playerName", "Alex");

// Cargar
int level = WagSave.Load<int>("currentLevel");
string name = WagSave.Load<string>("playerName");
```

---

## 8. Guardados Asíncronos (recomendado para escenas grandes)

Para escenas con muchos objetos, usa las variantes asíncronas para evitar interrupciones en los fotogramas:

```csharp
public async void SaveGame()
{
    await _wagSave.SaveAsync();
}

public async void LoadGame()
{
    await _wagSave.LoadAsync();
}
```

La serialización y la entrada/salida de archivos se ejecutan en un hilo secundario. Las llamadas a la API de Unity (lectura de valores de componentes) siguen ocurriendo en el hilo principal antes de que comience el trabajo en segundo plano.

---

## Próximos Pasos

- [Configurar qué campos se guardan → Componente WagSave](WagSaveComponent.md)
- [Configurar múltiples ranuras de guardado → Ranuras de guardado](SaveSlots.md)
- [Configurar el guardado automático → Guardado automático](Autosave.md)
- [Activar cifrado o compresión → Formatos de salida](OutputFormats.md)
