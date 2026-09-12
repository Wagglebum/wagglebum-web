# Primeros pasos

> **Versión preliminar.** El tiempo de ejecución, los aplicadores, ambos menús, el editor, la configuración,
> el ejemplo Quick Start y la localización están listos. Faltan CI y la preparación para la tienda. Consulta
> [CHANGELOG.md](../../CHANGELOG.md).

## Requisitos

- Unity **2022.3** (2022 LTS) o posterior.
- Sin dependencias de paquete obligatorias.

Opcionales y detectados automáticamente:

- **WagSave** (`com.wagglebum.wagsave`) — mejora la persistencia a guardados versionados, sincronizados en
  la nube, cifrados y con varios perfiles. Instálalo y WagSettings lo usa automáticamente.
- **Input System** (`com.unity.inputsystem`) — necesario para la reasignación de controles.
- **uGUI** (`com.unity.ugui`) — el menú basado en componentes; presente en todas las plantillas de 2022 LTS.

## Instalación

### Desde un tarball o la Asset Store

Importa el paquete, o añádelo con **Window → Package Manager → + → Add package from tarball…**.

### Desde una copia local

Añade esto al `Packages/manifest.json` de tu proyecto, apuntando a la carpeta `WaggleBum/WagSettings`:

```json
{
  "dependencies": {
    "com.wagglebum.wagsettings": "file:../../wagsettings-unity/WaggleBum/WagSettings"
  }
}
```

## Verificar la instalación

Una vez importado el paquete, Unity lo compila y WagSettings publica el símbolo de scripting
`WAGGLEBUM_WAGSETTINGS` para el **destino de compilación activo**. Se vuelve a publicar en cada recarga de
dominio, así que cambiar de plataforma lo añade automáticamente al nuevo destino. Confirma la instalación
de dos formas:

1. **Package Manager** — WagSettings aparece en la lista de paquetes con la versión 0.9.0.
2. **Símbolos de scripting** — abre **Edit → Project Settings → Player → Other Settings → Scripting
   Define Symbols**; `WAGGLEBUM_WAGSETTINGS` está en la lista.

![El menú Tools → WaggleBum → WagSettings](../Images/tools-menu.png)

Ese símbolo es también la forma en que otros assets detectan WagSettings sin depender de él:

```csharp
#if WAGGLEBUM_WAGSETTINGS
    // WagSettings is installed.
#endif
```

## Pruébalo primero: el Quick Start

La forma más rápida de ver todo funcionando es el ejemplo incluido. Es exactamente lo que genera la pantalla
de configuración, más una escena a su alrededor, y hay uno por cada framework de UI:

```
WaggleBum/WagSettings/Sample Scenes/Quick Start/
├── Quick Start (UI Toolkit).unity
├── Quick Start (uGUI).unity
├── Settings/            23 setting assets, the profile, and the mixer setup cloned
├── Prefabs/             WagSettingsMenu (uGUI).prefab - the uGUI menu, ready to copy
├── QuickStartActions    a starter Input Actions asset with Jump, Interact and Fire
└── Scripts/             QuickStartDemo, and QuickStartControls when the Input System is installed
```

![La escena Quick Start en ejecución con el menú de ajustes abierto](../Images/quick-start-scene.png)

Abre cualquiera de las dos escenas y pulsa Play. Después:

1. **Baja Music.** El tono de 220 Hz del bus Music lo sigue en vivo; marca **Master Mute** y tanto él como
   el pitido de SFX se silencian. Eso es `AudioMixerApplier` escribiendo parámetros expuestos en el
   mezclador generado, en decibelios.
2. **Cambia Window Mode o la resolución y pulsa Aplicar.** El HUD de la esquina informa de lo que la
   pantalla hace realmente. Nada cambia hasta Aplicar: los ajustes de pantalla se aplican al confirmar,
   porque una resolución a medio escribir no debería redimensionar tu ventana.
3. **Marca Reduce Motion.** El cubo deja de girar. **Mueve UI Scale.** El menú y el HUD crecen.
4. **Pulsa Espacio.** El HUD cuenta un salto. Pulsa **Rebind Jump**, luego cualquier tecla, luego Aplicar
   — el HUD nombra el nuevo control, y vuelve tras detener y reiniciar Play. (Solo con Input System.)
5. **Escribe en el cuadro de búsqueda.** Las pestañas y filas que no coinciden desaparecen; bórralo y vuelven.
6. **Pulsa Reset to Defaults y luego Revert.** Restablecer se puede cancelar hasta que se aplica.

Detén Play, vuelve a pulsar Play: lo que aplicaste sigue ahí. Eso es `PlayerPrefsStore`, o `WagSaveStore`
si WagSave está instalado.

No hay código de conexión en el ejemplo. El **WagSettings Manager** del objeto Quick Start posee el
registro y conecta los aplicadores que tiene debajo; ambos menús toman prestado ese registro.
`QuickStartDemo.cs` lee los ajustes como lo haría un script del juego — `WagSettings.Get<float>("audio.master")`
— y todo lo demás que contiene existe para que el efecto de un ajuste sea evidente en una demo.

## Usar la API

```csharp
using WaggleBum.WagSettings;

float master = WagSettings.Get<float>("audio.master");
WagSettings.Set("audio.master", 0.8f);   // pending
WagSettings.Apply();                      // committed and saved, in one batch
```

Eso resuelve al **`WagSettingsManager`** en ejecución: el componente que posee el registro y conecta todos
los aplicadores que tiene debajo. La configuración pone el perfil en `Assets/WagSettings/Resources`, así que
se crea un manager al iniciar sin colocar nada en una escena; añade uno tú mismo para decidir dónde vive.
Sin ninguno en ejecución, las llamadas lanzan una excepción que dice qué añadir.

La [chuleta](Cheatsheet.md) tiene el resto en una página; [API](API.md) lo tiene todo, incluido el registro
subyacente para el código que quiera más que la fachada.

## Colocar un menú de ajustes

La ruta más rápida a un menú funcional, sin código:

1. Crea tus ajustes (**Assets → Create → WaggleBum → WagSettings**) y añádelos a un `SettingsProfile`.
2. Crea un GameObject **UI Document** (*GameObject → UI Toolkit → UI Document*).
3. Añádele **WaggleBum → WagSettings → Settings Menu (UI Toolkit)**.
4. Asigna `WagSettingsMenu.uxml` y `WagSettingsMenu.uss` de `WaggleBum/WagSettings/Runtime/UI/UIToolkit/`
   como shell y estilos.
5. En los **Panel Settings** del UI Document, pon el tema `WagSettingsUI.tss` de la misma carpeta.
6. Asegúrate de que hay un **WagSettings Manager** en ejecución: colocado en la escena con tu perfil, o
   creado al iniciar porque el perfil está en una carpeta Resources. El menú muestra el perfil del manager;
   asigna un perfil al propio menú solo cuando no haya manager.

![El menú de ajustes de UI Toolkit en modo de juego](../Images/menu-uitoolkit.png)

Pulsa Play. Obtienes una pestaña por categoría, una fila por ajuste, un campo de búsqueda y botones
Aplicar / Deshacer / Restablecer que solo se activan cuando harían algo.

### Qué obtienes

- **Una pestaña por categoría**, en el orden en que aparecen los ajustes en tu perfil — ese orden es una
  decisión de diseño, así que no se reordena alfabéticamente.
- **El control adecuado por ajuste**: un interruptor para un bool, un desplegable para un `EnumSetting`, un
  deslizador para un `FloatSetting` o `IntSetting` con rango, un campo de texto en otro caso — y **un
  desplegable de resolución** con los modos que admite la pantalla, en lugar de `display.width`,
  `display.height` y `display.refreshRate`.
- **Navegación con mando y teclado.** Arriba y abajo mueven entre filas, izquierda y derecha cambian de
  pestaña, y el foco empieza en la primera fila en lugar de en ninguna parte. Hay un anillo de foco
  visible, porque un jugador sin puntero no tiene otra forma de saber dónde está.
- **Marcado de cambios** tanto en la fila como en su pestaña, para que un cambio en una pestaña que no
  estás mirando siga siendo visible.
- **Los ajustes no disponibles siguen visibles**, atenuados y con un tooltip que explica por qué: ocultarlos
  deja al jugador buscando una opción de la que ha leído.

### Cambiar el estilo

El aspecto vive en `WagSettingsMenu.uss` y en las variables del tema en `WagSettingsUI.tss`:

```css
:root {
    --wag-surface: rgb(28, 30, 34);
    --wag-text: rgb(236, 238, 242);
    --wag-accent: rgb(74, 144, 226);
    --wag-focus: rgb(255, 196, 61);
}
```

Sobrescríbelas en tu propio tema y el menú las sigue, sin editar el paquete.

## La ruta uGUI

Si tu proyecto usa uGUI en lugar de UI Toolkit, el mismo modelo impulsa un menú basado en componentes. La
capa uGUI vive en su propio ensamblado, que Unity compila solo cuando `com.unity.ugui` está instalado, así
que un proyecto solo con UI Toolkit nunca la carga.

![El menú de ajustes de uGUI en modo de juego](../Images/menu-ugui.png)

**Parte del prefab.** `Sample Scenes/Quick Start/Prefabs/WagSettingsMenu (uGUI).prefab` es un menú completo
para el perfil generado — cabecera con búsqueda, una tira de pestañas, una página con desplazamiento por
categoría con una fila por ajuste, y los tres botones de comando — construido íntegramente con los
controles estándar de uGUI, así que cambiar su estilo es trabajo uGUI normal. Cópialo, apúntalo a tu perfil
y quita o añade filas. Para construir uno desde cero:

1. Pon **Settings Menu (uGUI)** en la raíz del Canvas de tu menú. Con un manager en ejecución muestra el
   perfil del manager; asigna uno al menú solo cuando no haya manager.
2. En cada control, añade el binder correspondiente y fija su **Key**:

| Control | Componente |
|---|---|
| `Slider` | Slider Setting Binder |
| `Toggle` | Toggle Setting Binder |
| `Dropdown` | Dropdown Setting Binder |
| `InputField` | Input Field Setting Binder |

3. Para Aplicar / Deshacer / Restablecer, pon **Settings Command Button** en cada `Button` y elige su
   comando. Se atenúan solos cuando el comando no haría nada.
4. Para la búsqueda, pon **Settings Search Binder** en un `InputField`.
5. Para las pestañas, pon **Settings Category Panel** en cada página con el nombre de su categoría, y
   **Settings Category Selector** en la tira de pestañas con un botón que sirva de plantilla.

Los binders encuentran el menú en un padre, así que no hay que conectar nada a mano más allá de la clave.
Un binder que apunte a una clave que no está en el perfil **lanza una excepción**: un control que no hace
nada en silencio es peor que un fallo ruidoso.

Cada binder tiene un **Row** opcional: el objeto que contiene tanto su etiqueta como su control. El panel
de categoría muestra y oculta filas según la búsqueda filtra ajustes; deja Row vacío y lo que se oculta es
el propio objeto del control.

El desplegable toma sus opciones del `EnumSetting`, y el deslizador toma su rango del ajuste, así que
ninguno lleva una segunda copia que pueda desincronizarse del recurso.

### Etiquetas

Los binders rellenan opcionalmente un `Text` con el nombre visible del ajuste. TextMeshPro es un paquete
aparte en 2022 LTS, así que el paquete no depende de él; fija tú las etiquetas TMP, o deja la etiqueta sin
asignar y escribe el texto en tu prefab.

### Hacerlo desde código

```csharp
ISettingsStore store = SettingsStoreFactory.Create(profile.StoreKind);
using SettingsRegistry registry = profile.CreateRegistry(store);

var model = new SettingsMenuModel(registry, SettingBinderFactory.CreateAll(registry), ownsBinders: true);
using var view = new SettingsMenuView(shellUxml, model, ownsModel: true);

document.rootVisualElement.Add(view.Root);
view.FocusFirstRow();
```

`SettingsMenuView` es una clase simple, no un componente, así que puede construirse e inspeccionarse sin un
UIDocument — que es como se prueba el menú.

## Ejecutar las pruebas

El paquete incluye ensamblados de pruebas EditMode y PlayMode. Con el paquete en un proyecto de Unity, abre
**Window → General → Test Runner** y ejecuta la suite `WagSettings.Tests.EditMode`.
