# Documentación de WagSave

WagSave es un sistema de guardado listo para producción para Unity 2022 LTS y versiones superiores. Gestiona la serialización, entrada/salida de archivos, cifrado, compresión, ranuras de guardado, guardado automático y backends en la nube — todo configurado a través de una ventana del editor de Unity sin necesidad de código para comenzar.

**Espacio de nombres:** `WaggleBum.WagSave`
**Versión de Unity:** 2022.3 LTS+
**Editor:** WaggleBum

---

## Idioma del Editor

El editor de WagSave es compatible con varios idiomas. Para cambiar el idioma de visualización:

1. Abre **Edit > Preferences** (Windows / Linux) o **Unity > Preferences** (macOS).
2. Selecciona **WagSave** en el panel izquierdo.
3. Usa el menú desplegable **Locale** para elegir tu idioma preferido.
4. Cierra y vuelve a abrir el editor de Unity para que el cambio surta efecto.

**Idiomas disponibles:**

- English (Inglés)
- Español (Spanish)
- 日本語 (Japonés)
- 한국어 (Coreano)
- 中文（简体）(Chino simplificado)
- 中文（繁體）(Chino tradicional)

---

## En Esta Documentación

| Documento | Descripción |
|---|---|
| [Inicio Rápido](#inicio-rápido) | Comenzar con instrucciones simples |
| [Primeros pasos](GettingStarted.md) | Instalación, configuración y tu primer guardado/carga |
| [Componente WagSave](WagSaveComponent.md) | Marcar GameObjects para el guardado |
| [Referencia de API](API.md) | API completa de guardado/carga, eventos y propiedades |
| [Ranuras de guardado](SaveSlots.md) | Sistema de guardado con múltiples ranuras |
| [Guardado automático](Autosave.md) | Guardado automático basado en intervalos |
| [Formatos de salida](OutputFormats.md) | Formatos, configuración de archivos, cifrado, compresión |
| [WagSave Trigger](WagSaveTrigger.md) | Componente de activador de guardado basado en física |
| [Extensibilidad](Extensibility.md) | Formatos personalizados, serializadores y anulaciones de guardado |

---

## Inicio Rápido

### Clave / Valor
El siguiente fragmento de código es para guardar y cargar datos básicos sin necesidad de configurar una instancia de WagSave para tu proyecto. Se creará una instancia predeterminada con la configuración por defecto. Para configurar la salida de guardado y usar las funciones avanzadas, sigue las instrucciones del inicio rápido para la instancia de WagSave.

El siguiente ejemplo de código puede verse en uso en la escena de muestra de inicio rápido incluida en el paquete.
```csharp
        void Update()
        {
            var kb = Keyboard.current;
            if (kb == null) return;

            // Move Player
            var h = (kb.rightArrowKey.isPressed ? 1f : 0f) - (kb.leftArrowKey.isPressed ? 1f : 0f);
            var v = (kb.upArrowKey.isPressed ? 1f : 0f) - (kb.downArrowKey.isPressed ? 1f : 0f);
            transform.Translate(new Vector3(h, 0f, v) * (moveSpeed * Time.deltaTime));

            // Save Player Position
            if (kb.sKey.wasPressedThisFrame)
            {
                WagSave.Save("playerPosition", transform.position);
            }

            // Load Player Position
            if (kb.lKey.wasPressedThisFrame)
            {
                transform.position = WagSave.Load<Vector3>("playerPosition");
            }
        }
```

---

### Instancia de WagSave (Recomendado)
Abre la ventana del editor de WagSave en Unity desde el menú <b>Window -> WagSave -> Editor</b>.
La interfaz del editor ayuda a exponer las funciones y opciones disponibles que puedes configurar en tu proyecto.

- Abre el editor de WagSave y crea una instancia en la carpeta Resources de tu proyecto.
- Configura tu instancia para tu proyecto con las opciones y funciones disponibles.
- Usa el editor para añadir WagSaveComponents a los GameObjects de tu proyecto y seleccionar las propiedades a guardar.
- Implementa el código a continuación para guardar y cargar tu contenido. Opcionalmente puedes añadir disparadores de guardado, guardado automático y/o ranuras de guardado sin escribir código.

```csharp
using WaggleBum.WagSave;

// Guardar todos los WagSaveComponents de la escena
var wagSave = WagSave.GetInstance();
wagSave.Save();

// Cargarlos de vuelta
wagSave.Load();
```

---

## Resumen de Arquitectura

WagSave se construye en torno a tres conceptos:

**El ScriptableObject WagSave** es el gestor central. Crea uno (o más) mediante `Assets > Create > WaggleBum > WagSave`. Toda la configuración — formato de salida, ranuras, guardado automático, cifrado — reside aquí. En tiempo de ejecución se carga desde una carpeta `Resources`.

**WagSaveComponent** es un MonoBehaviour que añades a cualquier GameObject cuyo estado deba guardarse. Seleccionas exactamente qué campos y propiedades incluir usando la ventana del editor de WagSave. No se requiere código de serialización.

**Save Targets** son los backends de salida intercambiables (archivo binario, archivo JSON, PlayerPrefs, Steam Cloud, Unity Cloud). Cambia de formato en el editor sin tocar el código de tu juego.

---

*WagSave es desarrollado y mantenido por WaggleBum. Disponible en Unity Asset Store.*
