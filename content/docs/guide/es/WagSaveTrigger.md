# WagSave Trigger

`WagSaveTrigger` es un MonoBehaviour que dispara automáticamente un guardado cuando un collider entra en su zona de activación. Es útil para sistemas de puntos de control, guardados automáticos basados en zonas y cualquier escenario donde el guardado deba ocurrir sin intervención del jugador.

---

## Configuración

1. Añade un componente `Collider` a un GameObject y configúralo como trigger (`Is Trigger = true` — `WagSaveTrigger` lo establece automáticamente).
2. Añade `WagSaveTrigger`:

```
Add Component > WaggleBum > WagSave > WagSave Trigger
```

`WagSaveTrigger` requiere un `Collider` y no compilará sin uno (se aplica `RequireComponent`).

---

## Ajustes del Inspector

| Campo | Descripción |
|---|---|
| **Target Layers** | Solo los objetos en estas capas activan un guardado. Por defecto todas las capas. |
| **Required Tag** | Si se establece, solo los objetos con esta etiqueta activan un guardado. Déjalo vacío para coincidir con cualquier etiqueta. |
| **Disable After First Hit** | Cuando está activado, el trigger se dispara una vez y luego se desactiva hasta que se llame a `ResetTrigger()`. |

---

## Eventos

| Evento | Descripción |
|---|---|
| `onTriggerEntered` | Se dispara cuando un collider válido entra en la zona. Pasa el `Collider`. |
| `onTriggerExited` | Se dispara cuando un collider válido sale de la zona. Pasa el `Collider`. |

Conéctalos en el Inspector o mediante código:

```csharp
var trigger = GetComponent<WagSaveTrigger>();

trigger.onTriggerEntered.AddListener(collider =>
{
    Debug.Log($"{collider.name} activó un guardado");
});
```

---

## Comportamiento al Guardar

Cuando ocurre una colisión válida, `WagSaveTrigger` llama a la instancia activa de `WagSave` automáticamente:

- Si el **Guardado automático está activado** → llama a `wagSave.AutoSave()`
- Si las **Ranuras de Guardado están activadas** (y el guardado automático está desactivado) → crea una ranura `Quick` y guarda en ella
- En caso contrario → llama a `wagSave.Save()`

No necesitas configurar esto — sigue lo que esté establecido en la instancia activa de `WagSave`.

---

## Restablecer un Trigger de Disparo Único

Cuando **Disable After First Hit** está activado, llama a `ResetTrigger()` para permitir que el trigger se dispare de nuevo:

```csharp
WagSaveTrigger trigger = GetComponent<WagSaveTrigger>();

// Reactivar después de volver desde un menú, cargar una escena, etc.
trigger.ResetTrigger();
```

Comprueba `IsDisabled` para saber si el trigger está actualmente inactivo:

```csharp
if (trigger.IsDisabled)
{
    // El trigger ya se ha disparado y está esperando ser restablecido
}
```

---

## Ejemplo: Punto de Control

Coloca un `WagSaveTrigger` en una ubicación de punto de control en tu nivel. Configúralo para:
- Apuntar solo a la capa `Player`
- Activar **Disable After First Hit** para que solo guarde una vez por visita
- Conectar `onTriggerEntered` para mostrar un mensaje de interfaz "Punto de control alcanzado"

```csharp
// Mostrar un mensaje cuando el jugador alcanza el punto de control
trigger.onTriggerEntered.AddListener(_ =>
{
    checkpointUI.ShowMessage("¡Punto de control alcanzado!");
});
```

Reactiva el trigger si el jugador puede repetir el área:

```csharp
private void OnLevelRestart()
{
    trigger.ResetTrigger();
}
```
