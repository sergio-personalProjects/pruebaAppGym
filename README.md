# TUAPP+

TUAPP+ es una aplicación web para registrar entrenamientos de fuerza, consultar el historial y seguir la evolución del volumen de entrenamiento. Permite elegir ejercicios de una biblioteca o preparar rutinas reutilizables mediante planes personalizados.

## Acceso a la aplicación

Una vez abierta la aplicación:

1. Selecciona **Registrarse** en la pantalla de inicio de sesión.
2. Introduce tu nombre, email y una contraseña de al menos 8 caracteres; confirma la contraseña y crea la cuenta.
3. Al iniciar sesión accederás al resumen. Desde la navegación puedes abrir **Entrenamiento anterior**, **Registrar entrenamiento**, **Planes Workouts** y **Ejercicios**.
4. Usa **Salir** para cerrar la sesión.

Las cuentas y los entrenamientos pertenecen a cada usuario. Para proteger tus datos, utiliza una contraseña propia y no compartas tus credenciales.

## Funcionalidades

### Resumen y progreso

- Consulta las sesiones registradas durante el día, su duración y el volumen movido.
- Revisa el historial de entrenamientos, agrupado por fecha, y abre una sesión para ver sus detalles.
- Consulta gráficos de progreso, incluidos el volumen por día y las repeticiones por ejercicio y día.

### Registrar un entrenamiento

1. Abre **Registrar entrenamiento**.
2. Elige añadir ejercicios manualmente o cargar uno de tus planes guardados.
3. Selecciona los ejercicios y registra, para cada serie, el peso en kilogramos y las repeticiones.
4. Utiliza el temporizador de la sesión y guarda el entrenamiento al terminar.

Al seleccionar un ejercicio, la pantalla muestra el último registro disponible de ese ejercicio para que puedas consultarlo como referencia. Las sesiones guardadas aparecen en el resumen y en el historial.

### Planes personalizados

En **Planes Workouts** puedes crear rutinas con un nombre y una selección ordenada de ejercicios. También puedes editar o eliminar los planes guardados. El plan guarda los ejercicios, no las series, el peso ni las repeticiones: esos datos se añaden al registrar cada sesión. Al elegir un plan en el formulario de entrenamiento, se cargan automáticamente sus ejercicios.

### Biblioteca de ejercicios

En **Ejercicios** puedes explorar el catálogo, organizado por grupo muscular: pecho, hombro, espalda, pierna, bíceps y tríceps. Los ejercicios incluyen una breve descripción e ilustración.

### Entrenamiento anterior

Esta sección muestra la sesión más reciente; si has entrenado hoy, muestra primero una sesión de hoy. Puedes consultar su fecha, hora de inicio, duración, ejercicios, series, pesos y repeticiones.

## Tecnologías y servicios

- **Frontend:** Angular 20, TypeScript, Tailwind CSS y JavaScript.
- **API y lógica de servidor:** PHP 8.3 sobre Apache, con PDO para el acceso a datos.
- **Base de datos:** MariaDB. Guarda las cuentas, el catálogo de ejercicios, los planes y las sesiones con sus series.
- **Contenedores/servidores web:** hay Dockerfiles para el frontend (construcción con Node.js 22 y publicación mediante Nginx) y el backend (PHP con Apache).

La interfaz consume la API bajo la ruta `/api`. El despliegue debe conectar esa ruta con el backend y configurar el acceso de la API a MariaDB.
