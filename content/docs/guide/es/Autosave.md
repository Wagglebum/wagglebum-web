# Guardado Automático

El sistema de guardado automático de WagSave dispara un guardado automáticamente en un intervalo configurable. El temporizador es controlado por `WagSaveManager`, un MonoBehaviour que debe estar presente en cualquier escena que use el guardado automático.

---

## Configuración

### 1. Activar el guardado automático en el editor

En la ventana del editor de WagSave, navega a **Autosave** y:
- Activa **Enable Autosave**
- Establece **Interval (Seconds)** — con qué frecuencia se dispara el guardado
- Añade escenas a **Enabled Scenes** — el guardado automático solo se ejecuta en las escenas listadas

### 2. Añadir WagSaveManager a la escena

`WagSaveManager` es el MonoBehaviour que realiza la cuenta atrás del temporizador y dispara el guardado. Añádelo a un GameObject persistente en tu escena:

```
Add Component > WaggleBum > WagSave > WagSave Manager
```

`WagSaveManager` encuentra la instancia activa de `WagSave` automáticamente en `Start`. No necesitas configurarlo mediante código.

---

## Escenas Habilitadas

El guardado automático solo se disparará cuando la escena activa esté en la lista **Enabled Scenes**. Si el jugador está en una escena que no está en la lista, el temporizador se pausa automáticamente. Esto evita guardados automáticos durante menús, pantallas de carga o escenas exclusivas de cinemáticas.

Configura esto en la ventana del editor en **Autosave > Enabled Scenes**. Arrastra los assets de escena a la lista.

---

## Guardado Automático y Ranuras de Guardado

Cuando las Ranuras de Guardado están activadas, cada guardado automático escribe en una ranura de tipo `SaveSlotType.Auto`.

**Use Latest Slot** (configurado en el editor en **Autosave**):
- **Activado** — el guardado automático sobreescribe la ranura modificada más recientemente. El último guardado manual del jugador se mantiene actualizado.
- **Desactivado** — se crea una nueva ranura `Auto` para cada guardado automático. Útil para mantener un historial de guardados automáticos progresivo.

También puedes fijar una ranura específica para el guardado automático:

```csharp
SaveSlot checkpoint = wagSave.SaveSlots.AddNewSlot(SaveSlotType.Auto);
wagSave.SetAutoSaveSlot(checkpoint);

// Limpiarla más tarde para volver a la selección automática
wagSave.ClearAutoSaveSlot();
```

---

## Controlar el Temporizador en Tiempo de Ejecución

```csharp
WagSave wagSave = WagSave.GetInstance();

// Pausar el temporizador de guardado automático (por ejemplo, durante una cinemática o menú de pausa)
wagSave.PauseAutoSave();

// Reanudar un temporizador pausado — reinicia la cuenta atrás al intervalo completo
wagSave.ResumeAutoSave();

// Reiniciar la cuenta atrás sin pausar (por ejemplo, después de un guardado manual)
wagSave.ResetAutoSaveTimer();
```

### Reaccionar a los eventos del temporizador

```csharp
// Mostrar una cuenta atrás al jugador
wagSave.OnAutoSaveTimer += (secondsRemaining, interval) =>
{
    float progress = (float)secondsRemaining / interval;
    autosaveProgressBar.value = progress;
};

wagSave.OnAutosavePause  += () => Debug.Log("Guardado automático pausado");
wagSave.OnAutosaveResume += () => Debug.Log("Guardado automático reanudado");
```

---

## Disparar el Guardado Automático Manualmente

Llama a `AutoSave()` o `AutoSaveAsync()` en cualquier momento para disparar un guardado automático inmediatamente, independientemente del estado del temporizador. La lógica de selección de ranura (la más reciente vs. nueva) sigue aplicándose.

```csharp
// Disparar inmediatamente — por ejemplo, cuando el jugador pasa un punto de control
wagSave.AutoSave();

// O de forma asíncrona:
await wagSave.AutoSaveAsync();
```

---

## Suscribirse a Eventos de Guardado Automático

```csharp
wagSave.OnSaveStart     += () => ShowAutosaveIndicator();
wagSave.OnSaveCompleted += () => HideAutosaveIndicator();
wagSave.OnError         += (msg, ex) => Debug.LogError($"Guardado automático fallido: {msg}");
```

Estos son los mismos eventos utilizados por los guardados manuales — `OnSaveStart` y `OnSaveCompleted` se disparan para cada guardado independientemente del tipo.

---

## Patrones Comunes

### Pausar el guardado automático durante un menú

```csharp
private void OpenPauseMenu()
{
    WagSave.GetInstance().PauseAutoSave();
    pauseMenuUI.SetActive(true);
}

private void ClosePauseMenu()
{
    pauseMenuUI.SetActive(false);
    WagSave.GetInstance().ResumeAutoSave();
}
```

### Reiniciar la cuenta atrás después de un guardado manual

Evita que el guardado automático se dispare inmediatamente después de que el jugador acaba de guardar manualmente:

```csharp
public async void OnSaveButtonPressed()
{
    var wagSave = WagSave.GetInstance();
    await wagSave.SaveAsync();
    wagSave.ResetAutoSaveTimer();
}
```
