# Documentación de WagSettings

WagSettings es un sistema de menú de ajustes y opciones para Unity 2022 LTS y posteriores. Ofrece ajustes
de audio, pantalla, gráficos, reasignación de controles y accesibilidad tras una API de tiempo de ejecución
limpia, con una configuración de una sola pantalla que genera un menú funcional por ti.

![La ventana del editor en la página Resumen: barra lateral, página y panel de documentación](../Images/editor-window-summary.png)

## Empieza aquí

- [Chuleta](Cheatsheet.md) — todo en una página.
- [Primeros pasos](GettingStarted.md) — instala el paquete y pon en marcha un menú de ajustes.
- [La ventana del editor](EditorWindow.md) — el carril, las páginas, el panel de documentación, el idioma.
- [Configuración](Setup.md) — la página Configuración y lo que genera.
- [Ejemplo Quick Start](GettingStarted.md) — una escena por framework de UI, en `Sample Scenes/Quick Start`; Primeros pasos la recorre.

## Referencia

- [API](API.md) — la superficie de la API de tiempo de ejecución.
- [Persistencia](Persistence.md) — cómo se guardan los ajustes y qué se activa con WagSave.
- [Extensibilidad](Extensibility.md) — añadir tus propios ajustes y aplicadores.
- [Localización](Localization.md) — el menú en el idioma del jugador, el editor en el tuyo.
- [Glosario](Glossary.md) — términos usados en toda esta documentación.

## Categorías de ajustes

- [Audio](Settings/Audio.md)
- [Pantalla](Settings/Display.md)
- [Gráficos](Settings/Graphics.md)
- [Accesibilidad](Settings/Accessibility.md)
- [Controles](Settings/Controls.md)

También en: [English](../index.md) · [日本語](../ja/index.md) · [한국어](../ko/index.md) · [简体中文](../zh-CN/index.md) · [繁體中文](../zh-TW/index.md)

Este paquete es una versión preliminar; consulta [CHANGELOG.md](../../CHANGELOG.md) para ver qué ha llegado.

## La arquitectura de un vistazo

WagSettings son cinco capas con dependencias estrictamente descendentes. La UI nunca toca la persistencia
y la persistencia nunca sabe nada de la UI.

| Capa | Carpeta | Responsabilidad |
|---|---|---|
| 5 | `Runtime/UI/` | Vistas UI Toolkit y uGUI que se vinculan al registro y no poseen nada |
| 4 | `Runtime/Appliers/` | Convierten el valor de un ajuste en un efecto de Unity |
| 3 | `Runtime/Core/` | `SettingDefinition<T>`, `SettingsRegistry`, `ISettingsStore`, `Guard` — sin `UnityEngine` |
| — | `WagSettings.cs`, `WagSettingsManager.cs` | La API estática y el componente de escena que posee el registro |
| 3 | `Runtime/Definitions/` | Los recursos ScriptableObject de ajustes y `SettingsProfile` |
| 2 | `Runtime/Persistence/` | Implementaciones de `ISettingsStore` y la fábrica de almacenes |
| — | `WagSave/` | El almacén opcional respaldado por WagSave, compilado solo cuando WagSave está instalado |

Añadir un ajuste significa añadir un recurso `SettingDefinition` y un aplicador. Nada más cambia.
