# Glosario

| Término | Significado |
|---|---|
| **Ajuste** | Un valor que el jugador puede cambiar: volumen general, modo de ventana, escala de la interfaz. Un `SettingAsset` en el proyecto; un `ISettingDefinition` en tiempo de ejecución. |
| **Clave** | El nombre de almacenamiento estable de un ajuste, `categoria.nombre` — `audio.master`. El prefijo es la pestaña, el resto la etiqueta. Permanente una vez publicado. |
| **Perfil** | Un recurso `SettingsProfile`: la lista de ajustes que expone un juego, en el orden del menú, y qué almacén los persiste. El predeterminado vive en una carpeta Resources. |
| **Registro** | Un `SettingsRegistry`: los ajustes de un perfil cargados desde un almacén, con valores pendientes, seguimiento de cambios y los comandos Aplicar / Deshacer / Restablecer. |
| **Manager** | El componente de escena `WagSettingsManager` que posee el registro, conecta los aplicadores que tiene debajo y respalda la API estática. Uno por juego. |
| **API estática** | `WagSettings.Get / Set / Apply` y compañía — la forma de una línea de leer y escribir ajustes desde cualquier script, a través del manager. |
| **Valor pendiente** | Lo que el jugador ha elegido pero aún no ha aplicado. `Value` en una definición. |
| **Línea base aplicada** | El último valor confirmado por Aplicar o cargado del almacén. |
| **Sucio (dirty)** | Un ajuste cuyo valor pendiente difiere de su línea base. Aplicar y Deshacer se activan con él. |
| **Aplicar** | Confirmar todos los valores pendientes en el almacén en un solo lote. Lo que hacen el botón Aplicar y `WagSettings.Apply()`. |
| **Deshacer** | Descartar todos los valores pendientes, restaurando las líneas base. |
| **Restablecer** | Devolver cada ajuste a su valor predeterminado de autor, pendiente hasta que se aplique. |
| **Almacén** | Un `ISettingsStore`: donde persisten los valores. `PlayerPrefsStore` por defecto; `WagSaveStore` cuando WagSave está instalado. Las escrituras se acumulan; `Flush` confirma. |
| **Aplicador** | Un componente `SettingApplierBase` que convierte un valor en un efecto de Unity — volumen del mezclador, resolución de pantalla, nivel de calidad. Vive bajo el manager. |
| **Modo de aplicación** | Si un aplicador actúa en cada cambio (Immediate) o solo cuando el registro confirma (OnApply). |
| **Binder** | A lo que se vincula un control de UI: un `ISettingBinder` sobre una definición en UI Toolkit; un componente `…SettingBinder` sobre un control uGUI. |
| **Categoría** | La pestaña en la que cae un ajuste, según el prefijo de su clave. `SettingsMenuCategory` en tiempo de ejecución. |
| **Menú** | `WagSettingsMenu` (UI Toolkit) o `WagSettingsMenuUGUI`, ambos `ISettingsMenu`. Toman prestado el registro del manager. |
| **Configuración** | La página del editor que analiza el proyecto y genera los ajustes, el perfil y un mezclador en `Assets/WagSettings/Resources`. |
| **Manifiesto** | El registro de la configuración de lo que escribió y su huella, para que una nueva ejecución cree lo que falta y nunca sobrescriba lo que editaste. |
| **Modo de pantalla** | Un ancho, un alto y una frecuencia de actualización. El desplegable de resolución lista los que admite la pantalla. |
| **Locale** | Un código de idioma — `en`, `es`, `ja`, `ko`, `zh-CN`, `zh-TW`. El del menú lo elige el juego; el del editor, su página Ayuda. |
