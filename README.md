# TUAPP+

Aplicación de seguimiento de entrenamientos con Angular + Tailwind CSS en frontend y PHP + MariaDB en backend, ejecutada con Docker Compose.

## Servicios

- TUAPP+: http://localhost:4200
- API: http://localhost:8080/api/health
- phpMyAdmin: http://localhost:8081
- MariaDB: accesible internamente desde Docker como `db:3306` (no se publica el puerto 3306 en el host).

## phpMyAdmin

Puedes gestionar la base de datos desde phpMyAdmin sin cambiar MariaDB por MySQL. phpMyAdmin es compatible con MariaDB.

Datos:

- Servidor: `db`
- Usuario de aplicación: `tuapp`
- Contraseña: `tuapp_secret`
- Base de datos: `tuapp`

Para administración completa también puedes usar:

- Usuario: `root`
- Contraseña: `root_secret_change_me`

## Modelo de datos simplificado

La base de datos utiliza cuatro tablas principales:

- `users`: usuarios.
- `exercises`: catálogo de ejercicios.
- `workouts`: una fila por sesión de entrenamiento.
- `workout_sets`: cada serie realizada, enlazando directamente la sesión con el ejercicio.

Se eliminó la tabla intermedia `workout_exercises`. Ahora la relación es mucho más fácil de entender desde phpMyAdmin:

`users → workouts → workout_sets ← exercises`

`workout_sets` contiene `workout_id`, `exercise_id`, `exercise_order`, `set_number`, `weight_kg` y `repetitions`.

### Migración automática

Si ya tienes una base de datos de una versión anterior con `workout_exercises`, el backend detecta ese esquema y migra automáticamente los datos al modelo simplificado al realizar la primera petición. No es necesario borrar el volumen para conservar los entrenamientos existentes.

## Login demo

- Email: `demo@tuapp.local`
- Contraseña: `Demo1234!`

## Arranque

```powershell
docker compose down
docker compose up --build -d
```

No uses `docker compose down -v` si quieres conservar los datos de MariaDB.

Si quieres empezar deliberadamente desde cero:

```powershell
docker compose down -v
docker compose up --build -d
```

## Funcionalidad actual

- Login con sesión PHP.
- Dashboard con volumen por día y repeticiones por ejercicio/día.
- Los gráficos incluyen automáticamente entrenamientos registrados durante el día actual.
- Resumen visible del entrenamiento de hoy.
- Página de último entrenamiento, mostrando el de hoy si existe y, si no, el último disponible.
- Registro de entrenamientos con ejercicios agrupados por grupo muscular y series ilimitadas.
- Catálogo de ejercicios.
- Interfaz responsive y minimalista.
- Navegación horizontal bajo el header con estado inactivo, hover y página activa.
