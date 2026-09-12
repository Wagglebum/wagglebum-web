# Chuleta de WagSettings

Una página. Todo lo demás está en [la documentación](index.md).

## De cero a menú

**Tools → WaggleBum → WagSettings → Setup**, marca las categorías, pulsa **Generar**. Obtienes recursos de
ajuste, un `SettingsProfile` que los contiene y un `AudioMixer` con Master, Music y SFX expuestos, todo bajo
`Assets/WagSettings/Resources/`. Volver a ejecutarlo es seguro: crea lo que falta y nunca sobrescribe un
recurso que hayas editado.

Después, en la escena de tu menú:

| UI Toolkit | uGUI |
|---|---|
| Un **UI Document** y, sobre él, **Settings Menu (UI Toolkit)**. Asigna el perfil, `WagSettingsMenu.uxml`, `WagSettingsMenu.uss`; en Panel Settings pon el tema `WagSettingsUI.tss`. | Copia `Sample Scenes/Quick Start/Prefabs/WagSettingsMenu (uGUI).prefab` y apúntalo a tu perfil. |

Pulsa Play. El perfil está en Resources, así que al iniciar se crea un **WagSettings Manager** y el menú
muestra su perfil. Para decidir dónde vive el manager — y dar un hogar a los aplicadores — añade tú mismo
*WaggleBum → WagSettings → WagSettings Manager* a la escena.

## Claves

`categoria.nombre`. La parte anterior al punto es la pestaña; la posterior se convierte en la etiqueta.

```
audio.master   audio.music   audio.sfx   audio.master.mute
display.width  display.height  display.refreshRate  display.windowMode  display.vsync
graphics.qualityTier  graphics.gamma  graphics.renderScale  graphics.bloom  graphics.ambientOcclusion  graphics.motionBlur
accessibility.uiScale  accessibility.colorblindPreset  accessibility.reduceMotion  accessibility.subtitleScale  accessibility.subtitleBackground
controls.rebinds  controls.sensitivity  controls.invertY
```

Eso es lo que genera la configuración y lo que cada aplicador vincula por defecto. Añade los tuyos con
**Assets → Create → WaggleBum → WagSettings → …** y luego añade el recurso al perfil.

## Leer y escribir desde código

```csharp
using WaggleBum.WagSettings;

float master = WagSettings.Get<float>("audio.master");
WagSettings.Set("audio.master", 0.8f);                       // pending - the game does not change yet
WagSettings.Definition<float>("audio.master").Changed += value => { };

WagSettings.IsDirty;        // anything pending?
WagSettings.Apply();        // write every pending value to the store, in one batch
WagSettings.Revert();       // throw pending values away
WagSettings.ResetAll();     // authored defaults, pending until applied
```

Funciona en cualquier sitio donde haya un `WagSettingsManager` en ejecución: uno que hayas colocado, o el
que se crea al iniciar porque el perfil está en una carpeta Resources. Sin ninguno, cada llamada lanza una
excepción que dice qué añadir. `WagSettings.Registry` es el registro en sí cuando quieres más de lo que
ofrece la fachada.

## Aplicadores

Un aplicador convierte un valor en un efecto de Unity. Añade el componente **bajo el WagSettings Manager**
y asigna lo que controla — el manager conecta todo lo que tiene debajo al arrancar. Nada que escribir.

| Aplicador | Controla | Se aplica |
|---|---|---|
| Audio Mixer Applier | parámetros expuestos del `AudioMixer` asignado | en vivo |
| Resolution Applier | resolución de `Screen`, modo de ventana, VSync | al Aplicar |
| Quality Applier | nivel de calidad, gamma, escala de renderizado, interruptores de posprocesado | en vivo |
| Accessibility Applier | escala de UI, matriz de daltonismo, reducir movimiento, subtítulos — como eventos y globales de shader | en vivo |
| Rebind Applier | las sobrescrituras de asignación de un `InputActionAsset` *(Input System)* | en vivo |

`Attach` lanza una excepción con una clave que el registro no contiene. Deja en blanco una clave del
aplicador para omitirla. Un aplicador que deba vivir en otro sitio: `WagSettings.Manager.Attach(applier)`.

## Binders (uGUI)

Pon el binder en el control y fija su clave. Encuentra el menú en un padre.

| Control | Binder |
|---|---|
| `Slider` | Slider Setting Binder |
| `Toggle` | Toggle Setting Binder |
| `Dropdown` | Dropdown Setting Binder — las opciones vienen del `EnumSetting`, o de la pantalla para `display.resolution` |
| `InputField` | Input Field Setting Binder |
| `Button` | Settings Command Button — Aplicar, Deshacer o Restablecer |
| `InputField` | Settings Search Binder |

UI Toolkit no necesita nada de esto: las filas se construyen a partir del perfil.

## Dónde está cada cosa

| | |
|---|---|
| Recursos generados | `Assets/WagSettings/Resources/` |
| El ejemplo | `WaggleBum/WagSettings/Sample Scenes/Quick Start/` — una escena por framework de UI |
| El prefab del menú uGUI | `…/Quick Start/Prefabs/WagSettingsMenu (uGUI).prefab` |
| Estilo del menú | `Runtime/UI/UIToolkit/WagSettingsMenu.uss` y las variables en `WagSettingsUI.tss` |
| Configuración | Tools → WaggleBum → WagSettings → Setup |
| El manager | *WaggleBum → WagSettings → WagSettings Manager*, o se crea al iniciar desde Resources |

## Cuándo lanza excepciones

Ruidosamente y a propósito: un binder con una clave que el perfil no tiene, un aplicador con una clave que
el registro no tiene, un parámetro del mezclador sin exponer, un hueco vacío en un perfil. Cada uno nombra
la clave. Un control que no hace nada en silencio es peor que un fallo que explica por qué.
