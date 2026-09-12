# Configuración

La configuración lleva un proyecto de la nada a un perfil de ajustes generado en una sola sesión.

**Tools → WaggleBum → WagSettings → Setup** — la página Configuración de [la ventana del editor](EditorWindow.md).
Las elecciones, la vista previa y Generar están en ella; lo que tiene el proyecto, y lo que queda por
hacer después, están en la página **Resumen** contigua. Esta página cubre ambas.

## Una pantalla, no una secuencia de pasos

Hay pocas elecciones como para verlas todas a la vez, cada una tiene un valor predeterminado derivado de lo
que el proyecto realmente tiene, y la vista previa se actualiza según cambian. Eso significa que **la
consecuencia de una elección es visible mientras la tomas**, no varios clics después.

![La página Configuración: categorías, menú y persistencia, vista previa y Generar](../Images/editor-window-setup.png)

También está pensada para **volver a abrirse**. La generación es idempotente, así que volver dentro de tres
meses para añadir una categoría es el caso normal, no un reinicio. Un asistente implica un solo intento;
esto es un panel al que regresas.

Además, todo se informa a la vez. Un flujo por pasos te muestra el primer problema y oculta el segundo
hasta que resuelves el primero; una sola pantalla puede permitirse listar todos los motivos por los que se
rechaza generar.

## Proyecto — en la página Resumen

Resumen empieza mirando lo que el proyecto realmente tiene, y dice qué significa cada hallazgo para la
configuración que estás a punto de generar.

![La sección Proyecto con un aviso y su botón Package Manager](../Images/summary-project-checks.png)

| Comprobación | Qué informa |
|---|---|
| Versión de Unity | Si el editor es 2022.3 o posterior |
| Render pipeline | Built-in, URP, HDRP o personalizado — y qué ajustes gráficos hace disponibles |
| Framework de UI | Si UI Toolkit y uGUI están disponibles |
| Input System | Si la reasignación de controles está disponible |
| TextMeshPro | Si el menú uGUI puede usar texto TMP |
| Persistencia | Si WagSave está instalado, o los ajustes usarán PlayerPrefs |

### La gravedad se elige con cuidado

WagSettings funciona por sí solo, así que **casi nada de un proyecto puede bloquear de verdad la
configuración**. Un paquete ausente cuesta una función, no el menú.

- **Correcto** — nada que hacer.
- **Aviso** — falta algo, pero la configuración continúa. Sin Input System no hay reasignación; todo lo
  demás funciona.
- **Bloqueo** — no habría nada que generar. Solo dos cosas cuentan: un editor anterior a 2022.3, y no
  tener ni UI Toolkit ni uGUI, lo que no deja forma alguna de construir un menú.

**Los avisos nunca desactivan Generar.** Marcar paquetes opcionales como bloqueos te entrenaría para
ignorar esta sección, que es justo cuando se pasa por alto un bloqueo real.

No tener WagSave es **correcto**, no una carencia: funcionar por sí solo sobre PlayerPrefs es el diseño.
Instálalo después y los ajustes se actualizan solos sin cambiar nada aquí.

### Arreglos con un clic

Un hallazgo que puede arreglarse lleva un botón que instala el paquete a través del Package Manager. La
pantalla vuelve a analizar cuando termina la instalación, porque la comprobación solo tiene sentido cuando
existen los ensamblados del nuevo paquete.

Un bloqueo siempre ofrece una salida — un bloqueo sin arreglo sería un callejón sin salida, y hay una
prueba que verifica que el bloqueo de framework de UI ofrece su instalación. La página Resumen muestra la
instalación en curso.

**Volver a analizar refresca lo que el proyecto tiene, no lo que decidiste.** Instalar un paquete y volver
a analizar no deshará tus elecciones en silencio.

## Ajustes a generar

Cada categoría se convierte en un grupo de recursos de ajuste y en una pestaña del menú. Todas las
categorías están activas por defecto, salvo Controles cuando falta el Input System — generar una sección
de reasignación que no puede funcionar sería peor que omitirla.

| Categoría | Ajustes |
|---|---|
| Audio | Volumen general, de música y de efectos, silencio |
| Pantalla | Ancho, alto, frecuencia de actualización, modo de ventana, VSync |
| Gráficos | Nivel de calidad, gamma, resplandor, oclusión ambiental, desenfoque de movimiento |
| Accesibilidad | Escala de UI, ajuste para daltonismo, reducir movimiento, tamaño y fondo de subtítulos |
| Controles | Reasignaciones, sensibilidad, invertir Y |

La fila de cada categoría muestra cuántos ajustes añade, así que el tamaño del resultado es visible antes
de generar en lugar de después.

## Menú y persistencia

| Elección | Predeterminado | A qué afecta |
|---|---|---|
| Framework de UI | UI Toolkit si está disponible, si no uGUI | Qué componente de menú te indican añadir los pasos finales |
| Persistencia | Automatic | Se escribe en el perfil generado |
| Mezclador de audio | Crear desde la plantilla | Si se genera un mezclador — solo se muestra con Audio marcado |

`Automatic` resuelve a WagSave cuando está instalado y a PlayerPrefs cuando no, así que normalmente no hay
nada que elegir aquí. `PlayerPrefs` fuerza el almacén simple incluso en un proyecto que tiene WagSave.

### El mezclador de audio

Los deslizadores de volumen necesitan un `AudioMixer` con parámetros expuestos que controlar, y exponer
parámetros es el paso que la gente olvida. Así que la configuración incluye una **plantilla de mezclador** —
grupos Master, Music y SFX con `MasterVolume`, `MusicVolume` y `SfxVolume` expuestos — y la clona en la
carpeta generada como `WagSettingsMixer.mixer`.

La plantilla, los ajustes de audio generados y los buses predeterminados de `AudioMixerApplier` están
escritos para coincidir, y una prueba los mantiene unidos. Añade un Audio Mixer Applier, asigna el
mezclador generado, y cada bus predeterminado encuentra su ajuste y su parámetro sin teclear nada.

**Usar un mezclador existente** no escribe nada. El mezclador es tuyo; expón `MasterVolume`, `MusicVolume`
y `SfxVolume` en él, o renombra los buses del aplicador a lo que ya exponga. Elegir esto sin escoger un
mezclador es una de las cosas que Generar rechaza.

El clon se rastrea como cualquier otro recurso generado: una nueva ejecución lo omite, una edición que
hagas en la ventana del mezclador se conserva, y una plantilla más nueva en una versión posterior del
paquete aparece como actualización — aplicada solo a un clon que no hayas tocado.

`AudioMixer` no tiene API pública de creación, por eso esto es un clon y no una construcción. La plantilla
se escribe una vez y se confirma en el repositorio; el paquete solo la copia.

## Qué se rechaza, y por qué

Generar está desactivado mientras se cumpla cualquiera de estas condiciones, y **todos** los motivos
pendientes se listan sobre el botón:

- **Framework de UI** — elegir uGUI sin el paquete instalado. El menú no podría abrirse.
- **Categorías** — no seleccionar ninguna, o seleccionar Controles sin el Input System.
- **Mezclador de audio** — "usar un mezclador existente" sin elegir uno.
- **Proyecto** — un bloqueo, lo que significa que no habría nada que generar.

La persistencia nunca rechaza: `Automatic` ya recurre a PlayerPrefs.

Generar también está desactivado cuando la vista previa dice que no hay nada que hacer, porque todos los
recursos ya están al día.

## Vista previa y generar

**No se escribe nada hasta que hayas visto exactamente qué ocurriría.** La vista previa lista cada recurso
y lo que le pasaría, y se actualiza al cambiar una elección:

```
Into Assets/WagSettings/Resources

Create   Assets/WagSettings/Resources/AudioMaster.asset
Update   Assets/WagSettings/Resources/WagSettingsProfile.asset
Skip     Assets/WagSettings/Resources/AudioMusic.asset  (already up to date)
Keep     Assets/WagSettings/Resources/AudioSfx.asset  (edited since it was generated)
```

![La vista previa con lo que Generar creará, actualizará y conservará](../Images/setup-preview-plan.png)

El resumen de una línea junto al botón Generar siempre es visible, así que el detalle puede quedar plegado
hasta que lo quieras.

### Volver a ejecutar es seguro

La configuración mantiene un **manifiesto de generación** que registra cada recurso producido y una huella
de lo que escribió. Eso le permite distinguir tres casos:

| Situación | Qué ocurre |
|---|---|
| El recurso no existe | **Crear** |
| La configuración lo hizo y nadie lo ha tocado | **Actualizar** si los ajustes cambiaron, **Omitir** si no |
| La configuración lo hizo y se ha editado desde entonces | **Conservar** — se deja exactamente como está |
| Ya hay otra cosa en esa ruta | **Conservar** — no le corresponde a la configuración sobrescribirla |

Así que generar de nuevo tras añadir una categoría crea solo los recursos nuevos. **Un valor predeterminado
generado que hayas afinado a mano nunca se descarta.** Borra un recurso generado y la configuración ofrece
crearlo de nuevo.

### Si la generación falla

La generación se ejecuta como una sola transacción de `AssetDatabase`. Si algo lanza una excepción a
medias, cada recurso creado en esa ejecución se borra antes de que aflore el error — un proyecto generado a
medias es peor que ninguno. La transacción se cierra en un `finally`, así que un fallo no puede dejar la
base de datos de recursos pausada durante el resto de la sesión.

Los recursos creados se registran con `Undo`, así que <kbd>Ctrl</kbd>+<kbd>Z</kbd> funciona.

### Por qué la carpeta generada es una carpeta Resources

`Assets/WagSettings/Resources` no es un accidente de nombre. Un `SettingsProfile` en una carpeta Resources
es lo que `WagSettingsBootstrapper` busca al iniciar, así que un proyecto que ha ejecutado la configuración
obtiene un `WagSettingsManager` en ejecución — y una API estática funcional — sin colocar nada en ninguna
escena. El perfil generado se marca como **Is Default** para que gane si otro perfil comparte la carpeta.
El manifiesto de generación, que es contabilidad del editor, se marca para no incluirse en las
compilaciones.

### Después de ejecutarlo

El editor pasa a **Resumen**, que muestra lo que se escribió, con botones al perfil generado, la carpeta
generada, la escena Quick Start y la chuleta. Los pasos que quedan por hacer a mano están en el panel de
documentación de esa página, así que siempre están ahí cuando vuelvas. Vuelve a Configuración para
ajustar y generar de nuevo.

![La página Resumen tras generar, con sus botones de acceso directo](../Images/summary-after-generate.png)

## Aún no se genera

La configuración genera **recursos de ajuste, el perfil que los contiene y el mezclador de audio**. Aún no
crea un InputActionAsset ni aplica un preajuste visual, así que no se muestran controles para ellos. La
regla `StyleRule`, la mitad de acciones de entrada de `WiringRule` y sus campos del modelo existen listos
para cuando la generación los respete.

Conecta las acciones de entrada a mano por ahora; ver [Controles](Settings/Controls.md).

## Llegar a Configuración

| Ruta | Cuándo |
|---|---|
| **Tools → WaggleBum → WagSettings → Setup** | En cualquier momento — abre el editor en la página Configuración |
| La página **Configuración** en el carril del editor | Siempre que el editor esté abierto |
| Overlay de la vista Scene | Activa "WagSettings" en el menú de overlays de la vista Scene |
| Automáticamente, una vez | La primera vez que el editor carga tras la instalación |

### Sobre abrirse a sí misma

La configuración se ofrece **una vez** y nunca más. Un asset que reabre una ventana en cada recarga de
dominio acaba desinstalado, así que la respuesta se recuerda en cuanto aparece — cerrarla de inmediato
cuenta como haber sido ofrecida.

La marca se guarda por versión del paquete, así que una actualización mayor puede presentarse de nuevo. Si
no se puede determinar la versión, nunca se abre sola, porque una versión contra la que no puede registrar
significaría preguntar en cada recarga.

El overlay de la vista Scene está **oculto por defecto**. Un paquete que se planta permanentemente en la
vista Scene de alguien se ha extralimitado; está en el menú de overlays para quien lo quiera.

## Cómo está construida

Las páginas son cascarones sobre una única `SetupSession`, compartida para que cambiar entre Resumen y
Configuración no pierda ni el análisis ni una elección. Lo que el proyecto tiene es `EnvironmentDetector`,
lo que elegiste es `SetupModel`, si puede generarse es `SetupValidation` sobre una lista de `ISetupRule`, y
lo que se escribiría es `SettingsGenerator` — todas clases simples sin dependencia de la ventana del
editor, así que cada regla se prueba directamente.

Una regla responde `IsSatisfied(model, out reason)`. No posee UI, y por eso la misma condición que atenúa
el botón Generar es una aserción de dos líneas en una prueba.

La detección lee hechos en bruto a través de `IEnvironmentProbe`, y por eso un escenario como "HDRP sin
Input System en un editor no compatible" es una prueba de dos líneas en lugar de un proyecto entero. Cada
paquete opcional se encuentra buscando un tipo por nombre en lugar de referenciarlo: referenciar URP o el
Input System aquí haría que la configuración no compilara justo en el proyecto al que existe para ayudar.

La página Configuración separa reconstruir sus controles de refrescar lo que se deriva de ellos: la sesión
emite `Scanned` aparte de `Changed`, así que marcar una casilla nunca reconstruye la casilla que se está
marcando — el menú de ajustes aprendió esa lección a las malas cuando reconstruir cada fila tiraba el foco
a mitad de un arrastre.
