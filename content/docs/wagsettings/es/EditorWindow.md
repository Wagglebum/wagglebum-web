# La ventana del editor

**Tools → WaggleBum → WagSettings → Editor**

Una sola ventana, con la misma forma que la de WagSave, para que quien tenga ambos aprenda un solo diseño.

```
┌────────────────────┬──────────────────────────────────────────────┐
│ [logo] WagSettings │ Configuración                         [Docs] │
│────────────────────│──────────────────────────────────────────────│
│ ▸ Resumen          │  la página                    │ su documen-  │
│   Configur.        │                               │ tación, en   │
│   Perfil de ajustes│                               │ tu idioma    │
│   Depurador        │                               │              │
│   Ayuda            │                               │              │
│ v0.9.0             │                               │              │
└────────────────────┴───────────────────────────────┴──────────────┘
```

![La ventana del editor en la página Resumen: barra lateral, página y panel de documentación](../Images/editor-window-summary.png)

- **El carril** de la izquierda lista las páginas. La última en la que estuviste es la que se abre.
- **El panel de documentación** de la derecha explica la página que estás viendo. Arrástralo para hacerlo
  más ancho o más estrecho, o desactívalo con **Docs** en la cabecera; ambas cosas se recuerdan.
- **Resumen** es estado: qué tiene el proyecto, si lo que generaría la configuración ya está en su sitio, y
  qué queda por hacer a mano. Nada en ella cambia el proyecto.
- **Configuración** son las elecciones: qué generar, la vista previa, Generar. *Tools → WaggleBum →
  WagSettings → Setup* abre el editor en esta página, así que cualquier enlace que tuvieras sigue
  funcionando. Generar te lleva a Resumen.
- **Perfil de ajustes** es donde vive "añade tu propio ajuste": qué perfil es el predeterminado, cada ajuste con su
  clave, tipo, valor predeterminado y rango, reordenar y quitar, y **Añadir ajuste**, un diálogo que crea un
  nuevo recurso de ajuste junto al perfil comprobando la clave mientras escribes. Ver [Extensibilidad](Extensibility.md).
- **Depurador** funciona en vivo en modo de juego: el valor pendiente de cada ajuste, Aplicar / Deshacer /
  Restablecer, y qué aplicadores conectó el manager. Consulta cuatro veces por segundo y solo se redibuja
  cuando algo cambió.
- **Ayuda** tiene la versión, la chuleta, ambas escenas Quick Start y el idioma del editor.

![La página Perfil de ajustes con cada ajuste del perfil](../Images/settings-profile-page.png)

![El Depurador en modo de juego con un valor pendiente en negrita](../Images/debugger-play-mode.png)

## Primera ejecución

Un proyecto sin ningún `SettingsProfile` ve una única pantalla en lugar del carril: el logo, una frase y
**Ejecutar configuración**. Un carril de páginas sobre ajustes que aún no existen sería ruido.

## Idioma

El editor sigue el idioma elegido en la página Ayuda. Hasta que se elija uno, sigue el idioma configurado
en WagSave, así que con ambos instalados eliges una sola vez. Donde falte una traducción, se muestra en
inglés: una cadena aún sin traducir aparece en inglés, nunca en blanco ni como clave.

![La página Ayuda con el desplegable de idioma del editor abierto](../Images/help-language.png)

## Para curiosos

Cada página es un `EditorContent`; el carril es `EditorPages`; lo que la ventana recuerda es
`EditorWindowState` sobre una costura `IEditorPreferences`; la documentación de una página es
`EditorDocs`, que prueba `<Pagina>.<locale>.md`, luego `.en.md`, luego `.md`; las cadenas provienen de
`WagSettingsL10n` sobre `Editor/Localization/<locale>.json`. Todo eso son clases simples con pruebas. La
ventana en sí es lo único que hay que mirar.
