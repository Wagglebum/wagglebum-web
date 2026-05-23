# Formatos de Salida

WagSave admite múltiples backends de guardado. Eliges un formato por asset WagSave en la ventana del editor en **Save Output**. Cambiar de formato no requiere cambios en el código.

---

## Formatos Disponibles

### Formatos Basados en Archivos

| Formato | Variante indexada | Descripción |
|---|---|---|
| Binary | Sí | Serialización binaria compacta. Recomendado para el lanzamiento. |
| JSON | Sí | JSON legible por humanos. Recomendado durante el desarrollo. |
| Text | Sí | Salida de texto plano clave-valor. |
| PlayerPrefs | No | Almacén clave-valor integrado de Unity. Ideal para configuraciones y WebGL. |

Las **variantes indexadas** dividen los datos de guardado en múltiples archivos indexados. Esto permite lecturas y escrituras parciales sin cargar todo el guardado, lo que mejora el rendimiento para conjuntos de datos de guardado grandes.

### Formatos Cloud / Plataforma

| Formato | SDK requerido | Descripción |
|---|---|---|
| Unity Cloud Save | Unity Gaming Services | Guarda en el backend en la nube alojado por Unity. |
| Steam Cloud Save | Steamworks SDK | Guarda a través de Steam Remote Storage. |

Ambos formatos en la nube están **compilados condicionalmente**. Si el SDK requerido no está en tu proyecto, el formato no aparecerá en el desplegable y no ocurrirán errores de compilación.

---

## Configuración de Unity Cloud Save

Unity Cloud Save requiere paquetes adicionales y una inicialización en tiempo de ejecución única. WagSave gestiona automáticamente el hilo de ejecución — no se necesita código adicional más allá de los pasos siguientes.

### 1 — Instalar los Paquetes Necesarios

Abre **Window > Package Manager**, cambia a **Unity Registry** e instala ambos paquetes:

| Paquete | ID del paquete |
|---|---|
| Authentication | `com.unity.services.authentication` |
| Cloud Save | `com.unity.services.cloudsave` |

`com.unity.services.core` se incluye automáticamente como dependencia.

Una vez que `com.unity.services.cloudsave` está presente en el proyecto, el símbolo de compilación `CLOUD_SAVE_ENABLED` se activa automáticamente y la opción **Unity Cloud Save** aparece en el desplegable de formatos. No se necesita configuración manual del símbolo.

### 2 — Vincular tu Proyecto a Unity Gaming Services

1. Abre **Edit > Project Settings > Services**.
2. Inicia sesión y vincula a un proyecto de Unity Cloud (o crea uno en el panel de control).
3. Esto escribe el ID del proyecto y el ID de la organización en la configuración del proyecto.

### 3 — Inicializar en Tiempo de Ejecución

Llama al siguiente código **una vez al inicio, antes de cualquier operación de guardado o carga**. Un método `Start()` o un bootstrapper dedicado son ubicaciones adecuadas:

```csharp
using Unity.Services.Authentication;
using Unity.Services.Core;

private async void Start()
{
    await UnityServices.InitializeAsync();

    if (!AuthenticationService.Instance.IsSignedIn)
        await AuthenticationService.Instance.SignInAnonymouslyAsync();
}
```

> Si se activa un guardado o carga antes de que `UnityServices.InitializeAsync()` haya completado, WagSave registrará un error y la operación fallará. Siempre espera la inicialización antes de comenzar el juego.

`SignInAnonymouslyAsync` es suficiente para pruebas. Para un juego en producción, reemplázalo con tu método de inicio de sesión elegido (Steam, Google, Apple ID, usuario/contraseña, etc.).

### 4 — Seleccionar el Formato

En la ventana del editor de WagSave, ve a **Save Output** y selecciona **Unity Cloud Save** en el desplegable de formatos.

### Notas

- Los datos de Cloud Save se almacenan **por jugador autenticado**. Cada jugador tiene su propio depósito de datos aislado.
- WagSave aplica un prefijo a todas las claves internamente, por lo que múltiples assets WagSave en el mismo proyecto no colisionarán en el depósito de la nube.
- WagSave ejecuta todas las operaciones de Cloud Save en el hilo principal automáticamente. No se requiere configuración adicional de hilos.

---

## Configuración de Steam Cloud Save

Steam Cloud Save requiere el paquete Steamworks.NET y una sesión de Steam activa. Una vez completada la configuración siguiente, WagSave gestionará automáticamente todas las llamadas a Steam Remote Storage.

### 1 — Crear una Cuenta de Desarrollador de Steamworks y una App

1. Regístrate en [partner.steamgames.com](https://partner.steamgames.com). Es necesario aceptar el Acuerdo de Distribución de Steam y pagar una tarifa de $100 por la app (reembolsable tras alcanzar $1,000 en ventas).
2. Crea una app en el panel de control de socios de Steamworks. Recibirás un **App ID**.
3. En el panel de Steamworks, ve a **App Admin → Cloud** y activa **Steam Cloud** para la app. Establece una cuota de almacenamiento (el valor predeterminado de 1 GB / 1,000 archivos es suficiente para la mayoría de los juegos).

> Durante el desarrollo puedes usar el App ID `480` (la app de prueba pública de Valve, SpaceWar) en lugar de tu propio App ID.

### 2 — Instalar Steamworks.NET

Abre **Window > Package Manager**, haz clic en **+** y selecciona **Add package from git URL**, luego introduce:

```
https://github.com/rlabrecque/Steamworks.NET.git?path=/com.rlabrecque.steamworks.net
```

Alternativamente, descarga el `.unitypackage` desde [steamworks.github.io](https://steamworks.github.io) e impórtalo mediante **Assets > Import Package**.

Una vez que el paquete está presente, la definición de ensamblado de WagSave activa automáticamente el símbolo de compilación `STEAM_ENABLED`. La opción **Steam Cloud Save** aparecerá en el desplegable de formatos. No se necesita configuración manual del símbolo.

### 3 — Añadir steam_appid.txt

Crea un archivo de texto plano llamado `steam_appid.txt` en la raíz del proyecto (la misma carpeta que contiene `Assets/`). Su único contenido debe ser tu App ID:

```
480
```

Reemplaza `480` con tu App ID real antes de lanzar el juego. Este archivo es necesario para que `SteamAPI.Init()` tenga éxito cuando se ejecuta fuera de Steam.

### 4 — Inicializar SteamAPI en Tiempo de Ejecución

El destino de guardado de Steam requiere que se llame a `SteamAPI.Init()` antes de cualquier operación de guardado o carga. Steamworks.NET incluye un componente `SteamManager` listo para usar.

1. Si importaste el `.unitypackage` completo de Steamworks.NET, el prefab `SteamManager` está incluido — arrástralo a tu escena.
2. Si instalaste mediante Package Manager, añade un script `SteamManager` a un GameObject en tu escena manualmente (el código fuente está disponible en el [repositorio de Steamworks.NET](https://github.com/rlabrecque/Steamworks.NET)).
3. Coloca `SteamManager` al inicio de la jerarquía de tu escena para garantizar que se inicialice antes de que se active cualquier operación de guardado o carga de WagSave.

> Steam también debe estar en ejecución en la máquina. Si el cliente de Steam no está abierto, `SteamAPI.IsSteamRunning()` devolverá false y WagSave lanzará un error.

### 5 — Configurar un Perfil de Guardado

1. Selecciona tu asset WagSave en la ventana Project.
2. En el Inspector, abre o crea un perfil de guardado.
3. Establece el desplegable **Save Target Destination** en **Steam Cloud Save**.
4. Establece un **Target ID** — este se convierte en el nombre del archivo almacenado en Steam Cloud. Por ejemplo, un Target ID de `slot1` crea un archivo llamado `slot1.wsav`.

### Notas

- Los archivos de guardado se almacenan en Steam Cloud como archivos `.wsav` y se sincronizan automáticamente al salir del juego.
- Steam Cloud tiene un límite de tamaño de 100 MB por archivo. Se registrará un error si se supera este límite.
- Los datos están vinculados a la cuenta de Steam con la sesión iniciada. Cada usuario de Steam tiene su propio almacenamiento en la nube aislado.
- Todas las claves se almacenan en un único archivo por destino de guardado. Si usas varios assets WagSave, asigna a cada uno un Target ID único.

---

## Propiedades de Archivo

Aplica a todos los formatos basados en archivos cuando las Ranuras de Guardado están **desactivadas**. Configura en **Save Output > File Properties**:

- **Folder** — Nombre de la subcarpeta dentro de `Application.persistentDataPath`. Por defecto es el nombre del asset WagSave.
- **Filename** — Nombre base del archivo de guardado.
- **Extension** — Extensión del archivo (por ejemplo `sav`, `dat`, `json`).

Cuando las Ranuras de Guardado están activadas, cada ranura gestiona su propia ruta de archivo. La carpeta se configura en **Save Slots > Slots Folder**.

---

## Opciones de Protección

Se encuentran en **Save Output > Protection**.

### Cifrado

Cifra el archivo de guardado usando cifrado asimétrico (clave pública/privada).

1. Activa **Encrypt Data** — WagSave genera un par de claves automáticamente.
2. Guarda tu **clave privada** de forma segura. Un diálogo la presenta en el momento de la generación — no se almacena en disco por WagSave.
3. Proporciona la clave privada en tiempo de ejecución usando uno de estos dos enfoques:

   **Opción A — Evento (recomendado):** Suscríbete a `OnGetEncryptionPrivateKey` antes del primer guardado o carga:

   ```csharp
   wagSave.OnGetEncryptionPrivateKey += () => LoadPrivateKeyFromSecureStorage();
   ```

   **Opción B — Configuración directa:** Asigna la clave directamente en la instancia:

   ```csharp
   wagSave.Settings.SaveTarget.Options.EncryptPrivateKey = LoadPrivateKeyFromSecureStorage();
   ```

   El evento es preferido ya que difiere la obtención de la clave al momento de uso. Ambos enfoques son válidos.

Haz clic en **Regenerate Keys** para emitir un nuevo par de claves. **Los archivos de guardado existentes se vuelven ilegibles** después de la regeneración.

### Firma de Archivo

Añade una firma criptográfica a cada archivo de guardado. WagSave verifica la firma al cargar y rechaza los archivos manipulados.

1. Activa **Sign Output File** — se genera una clave secreta y se almacena en el asset WagSave.
2. Haz clic en **Regenerate Key** para emitir un nuevo secreto de firma. Los archivos firmados existentes fallarán en la verificación.

> La firma detecta la manipulación y la corrupción de archivos. No impide que un usuario determinado lea el contenido del archivo — usa el Cifrado para eso.

### Copia de Seguridad del Archivo de Guardado

Crea una copia del archivo de guardado existente con la extensión `.bak` antes de cada guardado. Si el guardado falla (error de cifrado, fallo de escritura en disco, etc.) el archivo anterior se restaura automáticamente desde la copia de seguridad, por lo que el jugador nunca acaba con un guardado a medias o corrupto.

1. Activa **Backup Before Save** en **Save Output > Protection**.
2. La copia de seguridad se escribe en la misma carpeta que el archivo de datos con el mismo nombre más `.bak`.
3. Tras un guardado exitoso, la copia de seguridad se elimina automáticamente. Tras un guardado fallido, la copia se conserva en disco para su inspección.

> No está disponible para los formatos de archivo indexados. Los destinos indexados escriben de forma incremental sobre el archivo de datos en lugar de producir un único archivo de reemplazo por guardado, por lo que una copia previa al guardado no representaría un estado anterior completo.

---

## Compresión

Activa **Compress Output** en **Save Output > Options** para aplicar compresión al archivo de guardado antes de escribirlo. Reduce el tamaño del archivo a costa de una pequeña sobrecarga de CPU al guardar y cargar. Recomendado cuando los datos de guardado son grandes.

---

## JSON con Formato Legible

Activa **Pretty Print JSON** cuando el formato JSON está seleccionado. Añade sangría a la salida, haciéndola legible por humanos para depuración. Aumenta el tamaño del archivo y debe desactivarse para las compilaciones de lanzamiento.

---

## Interfaz de Progreso

Activa **Use Progress UI** para mostrar el indicador de progreso integrado durante las operaciones de guardado y carga. El prefab se referencia en el asset WagSave. Puedes reemplazarlo con el tuyo propio asignando un prefab diferente.

---

## Elegir un Formato

| Situación | Formato recomendado |
|---|---|
| Lanzar un juego de escritorio o consola | Binary |
| Depurar datos de guardado | JSON |
| WebGL o datos simples de clave-valor | PlayerPrefs |
| Juego en línea con perfiles del lado del servidor | Unity Cloud Save |
| Juego de Steam | Steam Cloud Save |

---

## Cambiar de Formato

Cambia el formato en la ventana del editor y pulsa Play. No se necesitan cambios en el código. Los archivos de guardado existentes en el formato anterior no serán legibles por el nuevo formato — asegúrate de borrar o migrar los datos de guardado al cambiar en producción.
