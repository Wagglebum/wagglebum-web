# Controles

Reasignación con el nuevo Input System: teclado, ratón y mando, con reasignación interactiva, detección de
conflictos, restablecimiento a valores predeterminados, y opciones de sensibilidad e inversión.

## El paquete es opcional, y sigue siéndolo

La reasignación de controles necesita `com.unity.inputsystem`. La mayoría de proyectos de Unity no lo
tienen, y WagSettings debe instalarse limpiamente en todos — así que el código de reasignación vive en su
**propio ensamblado**, que Unity compila solo cuando el paquete está presente:

| Ensamblado | versionDefines | defineConstraints |
|---|---|---|
| `WagSettings.InputSystem` | `com.unity.inputsystem` → `WAGGLEBUM_INPUTSYSTEM_PRESENT` | igual |

Un `#if ENABLE_INPUT_SYSTEM` dentro del ensamblado principal **no** bastaría: el `#if` excluye el código,
pero `WagSettings.asmdef` seguiría teniendo que referenciar `Unity.InputSystem`, y una referencia a un
ensamblado ausente es un error de compilación. La puerta resuelve la referencia, no solo el código.

La consecuencia que merece conocerse: **el almacenamiento de reasignaciones y la detección de conflictos no
dependen del Input System** y viven en `Runtime/Core`. Funcionan, y se prueban, en proyectos sin el
paquete.

## Configurarlo

1. Instala **Input System** desde el Package Manager.
2. Crea un `StringSetting` con la clave `controls.rebinds` — **un ajuste guarda todas las reasignaciones**.
   Opcionalmente un `FloatSetting` en `controls.sensitivity` y un `BoolSetting` en `controls.invertY`.
3. Añádelos a tu `SettingsProfile`.
4. **Add Component → WaggleBum → WagSettings → Rebind Applier**, y asigna tu `InputActionAsset`.
5. Opcionalmente lista qué mapas de acciones pueden reasignar los jugadores — déjalo vacío para permitir
   todos.
6. Ponlo bajo el **WagSettings Manager**, que lo conecta al arrancar. El `QuickStartControls` del Quick
   Start muestra un botón de reasignación que lo usa.

## Reasignación interactiva

```csharp
applier.StartInteractiveRebind(
    "Gameplay/Jump", bindingIndex: 0,
    onComplete: conflicts =>
    {
        if (conflicts.Count > 0)
        {
            ShowWarning($"That control is already used by {conflicts[0].ActionName}.");
        }
    },
    onCancel: () => ShowMessage("Rebind cancelled."));
```

![Una fila de controles esperando una tecla durante una reasignación](../../Images/rebinding-listen.png)

El siguiente control que pulse el jugador se convierte en la asignación. <kbd>Esc</kbd> cancela.

Dos detalles de los que se ocupa el aplicador y que la reasignación hecha a mano suele pasar por alto:

- **La acción se desactiva durante la reasignación.** Una acción activada se traga justo la entrada que
  estás esperando, así que la primera pulsación se consume en lugar de capturarse. Después se reactiva solo
  si estaba activada al principio.
- **Una reasignación que se deja en marcha se cancela en `OnDisable`.** De lo contrario, cerrar el menú a
  mitad de una reasignación deja una operación escuchando cada tecla que el jugador pulse en el juego.

La reasignación se aplica tenga o no conflicto, y `onComplete` te dice con qué chocó. Así eliges la
política — avisar, intercambiar u ofrecer deshacer — en lugar de que se te imponga una.

> **Sobre la cobertura de pruebas:** la reasignación interactiva no puede completarse en CI sin cabeza — un
> `PerformInteractiveRebinding` a secas, sin código de WagSettings, arranca pero nunca coincide con una
> pulsación en cola, ni siquiera bajo el propio `InputTestFixture` de Unity. Todo lo que rodea ese paso
> propiedad de Unity está cubierto automáticamente: la operación arranca, la acción se silencia mientras
> escucha, cancelar restaura el estado anterior, y una reasignación completada llega al ajuste. La
> finalización en sí se verifica en la escena de verificación manual.

## Detección de conflictos

```csharp
IReadOnlyList<BindingConflict> conflicts = applier.FindConflicts();
```

Dos asignaciones chocan cuando comparten una ruta de control **y podrían estar activas a la vez**. Esa
segunda mitad es lo que evita que la UI grite "¡que viene el lobo!":

| Situación | ¿Conflicto? | Por qué |
|---|:--:|---|
| `Gameplay/Jump` y `Gameplay/Interact` ambos en Espacio | ✅ | Mismo mapa, ambos activos |
| `Gameplay/Fire` y `Menu/Confirm` ambos en el botón izquierdo del ratón | ❌ | Los mapas nunca se activan juntos |
| Dos asignaciones en esquemas de control con nombre distintos | ❌ | Solo un esquema está activo a la vez |
| Una asignación **sin** esquema contra una con esquema | ✅ | Sin esquema significa siempre activa |
| La misma acción asignada dos veces a la misma tecla | ✅ | Redundante, y merece decírselo al jugador |
| Dos acciones ambas **sin asignar** | ❌ | Un control vacío no es un control |

La comparación de rutas ignora mayúsculas. Cada par en conflicto se informa una vez.

Para avisar **antes** de que el cambio se aplique, comprueba el candidato contra las asignaciones
existentes:

```csharp
var candidate = new InputBindingDescriptor("Gameplay", "Interact", 0, "<Keyboard>/space");
IReadOnlyList<InputBindingDescriptor> clashing =
    BindingConflictDetector.FindConflictsWith(applier.DescribeBindings(), candidate);
```

## Cómo se guardan las reasignaciones

Todas las reasignaciones van a **un** `StringSetting`, en un formato versionado de WagSettings en lugar del
JSON de asignaciones del Input System. Tres razones:

- se guarda en un ajuste normal, así que se guarda, aplica, deshace y sincroniza como todo lo demás
- puede leerse y probarse sin el paquete Input System
- lleva un número de versión, así que un cambio de formato futuro puede migrar en lugar de descartar los
  controles de un jugador

Las reasignaciones guardadas ilegibles **se restablecen a los valores predeterminados con un aviso** en
lugar de lanzar una excepción. Perder reasignaciones es malo; un juego que no arranca es peor. Lo mismo
vale por entrada: una reasignación que nombra una acción que desde entonces has renombrado o eliminado se
descarta con un aviso, y el resto sigue cargando.

Desasignar un control deliberadamente hace el viaje de ida y vuelta como desasignado — es una elección que
hizo el jugador, no datos que faltan.

## Restablecer

```csharp
applier.ResetAllBindings();          // everything back to the asset's authored bindings
applier.ResetBinding("Gameplay/Jump");
```

`ResetAllBindings` también limpia el ajuste guardado, así que el restablecimiento persiste en el siguiente
Aplicar.

## Sensibilidad e inversión

Se publican como `UnityEvent` en lugar de aplicarse, ya que lo que multiplica la "sensibilidad" es
específico del juego — conéctalos a tu controlador de cámara en el inspector. Mismo patrón que los
interruptores de [gráficos](Graphics.md) y [accesibilidad](Accessibility.md).

## Qué lanza excepciones, y qué solo avisa

| Situación | Resultado |
|---|---|
| Reasignar una acción que no existe en el asset | **Lanza** — una errata del desarrollador |
| Un índice de asignación que la acción no tiene | **Lanza** |
| Iniciar una reasignación sin asset asignado, o con otra ya en marcha | **Lanza** |
| Una clave que no está en el perfil | **Lanza** — `KeyNotFoundException` |
| Reasignaciones guardadas que no pueden leerse | **Avisa**, restablece a valores predeterminados |
| Una reasignación guardada de una acción renombrada o eliminada | **Avisa**, descarta esa, conserva el resto |
