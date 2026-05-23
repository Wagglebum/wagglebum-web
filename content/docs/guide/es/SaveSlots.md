# Ranuras de Guardado

Las Ranuras de Guardado permiten a los jugadores mantener múltiples estados de guardado independientes — cada uno con su propio título, resumen, tiempo de juego, fecha de creación y miniatura de captura de pantalla opcional. Son gestionadas por el `SaveSlotManager`, accesible mediante `wagSave.SaveSlots`.

---

## Activar las Ranuras de Guardado

En la ventana del editor de WagSave, navega a **Save Slots** y activa el interruptor **Enable Save Slots**. Desde ahí configuras:

- **List Type** — Static o Dynamic (ver más abajo)
- **Capacity** — Número máximo de ranuras (1–500, o ilimitado para listas Dynamic)
- **Overwrite at Capacity** — Sobreescribe automáticamente la ranura más antigua cuando está lleno
- **Use Save Slot UI** — Muestra la interfaz integrada de selección de ranuras al guardar/cargar
- **Include Screenshot Thumbnail** — Captura una pantalla por ranura

---

## Tipos de Lista

### Static

Se crea de antemano un array fijo de ranuras. Los jugadores sobreescriben o eliminan ranuras existentes en lugar de crear nuevas. Ideal para menús de guardado clásicos de "ranura 1, ranura 2, ranura 3".

### Dynamic

Las ranuras se crean bajo demanda. Los nuevos guardados siempre añaden una ranura nueva hasta el límite de capacidad. Establece la capacidad en 0 (Infinita) para una lista ilimitada. Ideal para juegos donde el jugador guarda frecuentemente con un historial de estados.

---

## Interfaz de Ranuras Integrada

Cuando **Use Save Slot UI** está activado, llamar a `wagSave.Save()` o `wagSave.Load()` sin un argumento de ranura muestra automáticamente la interfaz integrada de selección de ranuras. El jugador selecciona o confirma una ranura y la operación continúa.

Para omitir la interfaz y controlar la selección de ranuras mediante código, pasa una ranura directamente:

```csharp
SaveSlot slot = wagSave.SaveSlots.AddNewSlot(SaveSlotType.Manual);
await wagSave.SaveAsync(slot);
```

---

## Trabajar con Ranuras Mediante Código

```csharp
using WaggleBum.WagSave;
using WaggleBum.WagSave.Core.SaveSlots;
using WaggleBum.WagSave.Core.Enums;

WagSave wagSave = WagSave.GetInstance();
SaveSlotManager slotManager = wagSave.SaveSlots;
```

### Crear una ranura y guardar en ella

```csharp
// Crear una nueva ranura Manual
SaveSlot slot = slotManager.AddNewSlot(SaveSlotType.Manual);
slot.Title   = "Capítulo 2";
slot.Summary = "Acabo de llegar al bosque";

await wagSave.SaveAsync(slot);
```

### Cargar desde una ranura

```csharp
// Obtener la ranura modificada más recientemente
SaveSlot latest = slotManager.GetLatestSlot();
if (latest != null)
{
    await wagSave.LoadAsync(latest);
}
```

### Sobreescribir una ranura

```csharp
// Sobreescribir la ranura en el índice 0 con un guardado Manual
SaveSlot slot = slotManager.OverwriteSlot(SaveSlotType.Manual, atIndex: 0);
await wagSave.SaveAsync(slot);
```

### Eliminar una ranura

```csharp
slotManager.DeleteSlot(slot);
```

### Iterar todas las ranuras

```csharp
foreach (SaveSlot slot in slotManager.Slots)
{
    if (!slot.IsEmpty)
    {
        Debug.Log($"[{slot.SlotNumber}] {slot.Title} — {slot.TotalPlaySeconds}s jugados");
    }
}
```

---

## Propiedades de SaveSlot

| Propiedad | Tipo | Descripción |
|---|---|---|
| `Id` | `string` | GUID estable para esta ranura. |
| `SlotNumber` | `int` | Número de visualización mostrado en la interfaz. |
| `Title` | `string` | Nombre de guardado visible para el jugador. Establecer antes de llamar a `Save`. |
| `Summary` | `string` | Breve descripción del estado del guardado. |
| `Type` | `SaveSlotType` | Manual, Quick, Auto o Temporary. |
| `TotalPlaySeconds` | `int` | Tiempo de juego acumulado en segundos. |
| `Created` | `DateTime` | Cuándo se creó la ranura por primera vez. |
| `Modified` | `DateTime` | Cuándo se escribió por última vez en la ranura. |
| `IsEmpty` | `bool` | True cuando no se han escrito datos de guardado en esta ranura. |

---

## Propiedades y Eventos de SaveSlotManager

| Miembro | Tipo | Descripción |
|---|---|---|
| `Slots` | `SaveSlot[]` | Todas las ranuras, incluyendo marcadores de posición vacíos. |
| `Count` | `int` | Número de ranuras no vacías y no temporales. |
| `Capacity` | `int` | Número máximo de ranuras. 0 significa ilimitado. |
| `IsAtCapacity` | `bool` | True cuando no se pueden crear más ranuras. |
| `OnSlotListChanged` | evento | Se activa cuando se añade, elimina o actualiza una ranura. |

```csharp
slotManager.OnSlotListChanged += () =>
{
    // Actualizar la interfaz de tu menú de guardado aquí
    RefreshSlotUI(slotManager.Slots);
};
```

---

## Tipos de Ranura

| Tipo | Descripción |
|---|---|
| `Manual` | Guardado iniciado por el jugador. Típico para guardados mediante menú. |
| `Quick` | Guardado rápido activado por una pulsación de tecla o el componente `WagSaveTrigger`. |
| `Auto` | Escrito por el sistema de guardado automático. |
| `Temporary` | Ranura transitoria excluida de la lista de ranuras persistentes. Útil para puntos de control. |

---

## Obtener la Ranura para una Operación Específica

WagSave proporciona funciones auxiliares para obtener la ranura correcta para guardar o cargar sin gestionar tú mismo la lógica de selección:

```csharp
// Obtener o crear la ranura apropiada para guardar (respeta la capacidad y los ajustes de sobreescritura)
SaveSlot saveSlot = wagSave.GetSaveSlotForSaving();
SaveSlot quickSlot = wagSave.GetSaveSlotForSaving(SaveSlotType.Quick);

// Obtener la ranura más apropiada para cargar
SaveSlot loadSlot = wagSave.GetSaveSlotForLoading();
```
