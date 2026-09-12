# Localización

Dos cosas hablan el idioma del jugador — o del desarrollador: el menú de ajustes que incluye un juego y el
editor que usa un desarrollador. Son independientes, porque el jugador de un juego y su desarrollador no
son la misma persona.

## El menú, en el idioma del jugador

Ambos menús toman sus palabras de `SettingsMenuStrings`: el título, Aplicar / Deshacer / Restablecer, la
etiqueta de búsqueda, cada pestaña y la etiqueta de cada ajuste. Instala una tabla antes de que se abra el
menú:

```csharp
SettingsMenuLocalization.Apply("ja");   // en, es, ja, ko, zh-CN, zh-TW
```

![El menú de ajustes en japonés](../Images/menu-localized-ja.png)

Las tablas incluidas cubren los comandos, las cinco categorías generadas y todos los ajustes que genera la
configuración. Un menú ya abierto conserva las palabras con las que se construyó hasta que se vuelve a abrir.

Cada búsqueda lleva su propio respaldo en inglés, así que una entrada ausente muestra la palabra en inglés
— nunca una clave, nunca un espacio en blanco.

### Tus propios ajustes

Un ajuste que añadas tiene una etiqueta derivada de su clave — `gameplay.difficulty` se lee "Difficulty" —
en todos los idiomas hasta que indiques lo contrario. Añade entradas `Label.<clave>` en una tabla propia y
superponla a la incluida:

```csharp
LocalizationTable packaged = SettingsMenuLocalization.Load("ja")!;
LocalizationTable mine = LocalizationTable.Parse(myJson);    // { "Label": { "gameplay.difficulty": "難易度" } }
SettingsMenuLocalization.Merge(packaged, mine);
```

Una categoría propia es `Category.<Nombre>` de la misma forma. Donde ambas tablas tienen una clave, gana
la tuya.

El formato de archivo es el que usa el editor: un objeto JSON anidado de cadenas, aplanado a
`Seccion.Clave`. `LocalizationTable.Parse` lo lee y rechaza ruidosamente cualquier otra cosa, porque un
archivo que se carga a medias es un menú que se traduce a medias.

### Lo que no se traduce

Las opciones de enumeración — `Windowed`, `Borderless` — se escriben en el recurso `EnumSetting` y se
muestran tal cual. Escríbelas en el idioma en que publiques, o añade un ajuste por idioma; un esquema de
claves por opción aún no existe.

## El editor, en el idioma del desarrollador

La ventana del editor sigue el idioma elegido en su página **Ayuda**. Cada cadena que muestra proviene de
`Editor/Localization/<locale>.json`; el panel de documentación de cada página, de
`Editor/EditorWindow/Docs/<Pagina>.<locale>.md`. Hasta que elijas un idioma ahí, se usa el que tenía
WagSave, así que con ambos instalados eliges una sola vez. Donde falte una traducción, se muestra en inglés.

![La página Ayuda con el desplegable de idioma del editor abierto](../Images/help-language.png)

Las pruebas comparan cada locale incluido con el archivo en inglés: una clave o una página ausente en
cualquier idioma hace fallar la suite.

## Esta documentación

La documentación de usuario está en `Docs/<locale>/`, reflejando la estructura en inglés.
