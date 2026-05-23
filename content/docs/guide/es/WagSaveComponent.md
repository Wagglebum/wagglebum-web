# Componente WagSave

`WagSaveComponent` es un MonoBehaviour que marca un GameObject para su participación en el sistema WagSave. Cuando se activa un guardado, WagSave encuentra todas las instancias de `WagSaveComponent` en cada escena cargada y captura los valores de sus campos y propiedades configurados. Al cargar, esos valores se restauran.

---

## Añadir el Componente

Añade `WagSaveComponent` a cualquier GameObject cuyo estado quieras persistir:

```
Add Component > WaggleBum > WagSave > WagSave
```

O mediante código:

```csharp
gameObject.AddComponent<WagSaveComponent>();
```

Solo se permite un `WagSaveComponent` por GameObject (se aplica `DisallowMultipleComponent`).

---

## Configurar Qué Se Guarda

`WagSaveComponent` no guarda todo — tú seleccionas exactamente qué campos y propiedades incluir. Esto se hace a través de la ventana del editor de WagSave.

1. Abre `Window > WagSave > Editor`
2. Navega a **Scene Content**
3. Encuentra el GameObject en la lista y haz clic en **Configure**

El editor abre una vista en árbol de todos los componentes del GameObject. Expande cualquier componente para ver sus campos y propiedades disponibles, luego marca los que quieras incluir.

> **Consejo:** Usa el control deslizante de profundidad para controlar cuántos niveles de profundidad se expande el árbol de componentes por defecto.

### ¿Qué se puede guardar?

WagSave usa reflexión para leer y escribir valores. Cualquier campo o propiedad que sea:
- Un tipo primitivo (`int`, `float`, `bool`, `string`)
- Un tipo de valor de Unity (`Vector2`, `Vector3`, `Quaternion`, `Color`)
- Una struct o clase serializable

...puede seleccionarse para guardar.

---

## Soporte de Prefabs

Para prefabs, configura el `WagSaveComponent` en el **asset de prefab** en lugar de en instancias individuales de la escena. De este modo, todas las instancias comparten la misma configuración de guardado.

1. Abre `Window > WagSave > Editor`
2. Navega a **Prefabs**
3. Encuentra el prefab y haz clic en **Configure**

El GUID del asset de prefab se almacena en `prefabId` del componente, lo que permite a WagSave reinstanciar el prefab correcto al cargar una escena que tenía objetos generados dinámicamente.

> **Nota:** Si una instancia de escena tiene un `WagSaveComponent` con anulaciones, los cambios en el asset de prefab no afectarán a esa instancia.

---

## Identidad en la Escena

Cada `WagSaveComponent` se identifica mediante:

| Propiedad | Descripción |
|---|---|
| `componentId` | GUID estable asignado cuando el componente se configura por primera vez en el editor. Persiste entre sesiones. |
| `sceneId` | Hash de la ruta del asset de la escena. Delimita los datos de guardado a la escena correcta. |
| `runtimeId` | Generado en tiempo de ejecución (`Start`). Diferencia múltiples instancias del mismo prefab generadas en una sesión. |
| `prefabId` | GUID del asset de prefab de origen. Usado para reinstanciar prefabs al cargar. |

Estos IDs se asignan todos automáticamente — no necesitas establecerlos manualmente.

---

## Objetos Dinámicos (Prefabs Instanciados en Tiempo de Ejecución)

WagSave gestiona prefabs instanciados dinámicamente. Cuando se guarda una instancia de prefab, su `prefabId` y `runtimeId` se almacenan junto con los datos. Al cargar, usa `WagSaveComponent.InstantiatePrefabById` para recrear el objeto:

```csharp
// Instanciar un prefab guardado por su prefabId almacenado
GameObject go = WagSaveComponent.InstantiatePrefabById(savedPrefabId);
```

> **Requisito en tiempo de ejecución:** Los prefabs deben estar en una carpeta `Resources` para que `InstantiatePrefabById` funcione en compilaciones. En el editor, se usa `AssetDatabase` y no se necesita carpeta `Resources`.

---

## Leer y Escribir Valores Mediante Código

En la mayoría de los casos no necesitarás llamar a estos directamente — `WagSave.Save()` y `WagSave.Load()` gestionan todo. Pero el componente expone estos métodos si necesitas control manual:

```csharp
var component = GetComponent<WagSaveComponent>();

// Obtener la instantánea actual de todas las rutas de guardado seleccionadas
GameObjectData data = component.GetSaveItemData();

// Escribir un valor de vuelta a una ruta específica
component.SetSelectionValue("componentId.p|health", 75);
```

---

## Inspeccionar Componentes en el Depurador

Mientras estás en el Modo de Reproducción, abre `Window > WagSave > Editor` y navega a **Debugger**. El panel **Save Content** lista cada `WagSaveComponent` en la escena activa, cuántos elementos de guardado están configurados en cada uno, y proporciona botones **Configure** y **Focus**.
