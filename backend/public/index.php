<?php
declare(strict_types=1);

const GROUPS = ['pecho','hombro','espalda','pierna','biceps','triceps'];

date_default_timezone_set('Europe/Madrid');

$allowedOrigins = [
    'http://localhost:4200',
    'http://192.168.1.19:4200',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_name(getenv('SESSION_NAME') ?: 'TUAPPSESSID');

$secureCookie = filter_var(
    getenv('SESSION_COOKIE_SECURE') ?: 'false',
    FILTER_VALIDATE_BOOLEAN
);

session_set_cookie_params([
    'httponly' => true,
    'samesite' => 'Lax',
    'secure' => $secureCookie
]);

session_start();


/*
|--------------------------------------------------------------------------
| DATABASE
|--------------------------------------------------------------------------
*/

/**
 * Crea las tablas base cuando la base de datos gestionada está vacía.
 * Todas las operaciones son idempotentes: no eliminan ni reemplazan tablas existentes.
 */
function initializeBaseTables(PDO $pdo): void
{
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(190) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB");

    $pdo->exec("CREATE TABLE IF NOT EXISTS exercises (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        muscle_group ENUM('pecho','hombro','espalda','pierna','biceps','triceps') NOT NULL,
        name VARCHAR(150) NOT NULL,
        description VARCHAR(255) NULL,
        UNIQUE KEY uq_exercise_group_name (muscle_group, name)
    ) ENGINE=InnoDB");

    $pdo->exec("CREATE TABLE IF NOT EXISTS workouts (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        started_at DATETIME NOT NULL,
        duration_seconds INT UNSIGNED NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_workout_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_workout_user_started (user_id, started_at)
    ) ENGINE=InnoDB");

    $pdo->exec("CREATE TABLE IF NOT EXISTS workout_sets (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        workout_id BIGINT UNSIGNED NOT NULL,
        exercise_id INT UNSIGNED NOT NULL,
        exercise_order INT UNSIGNED NOT NULL DEFAULT 1,
        set_number INT UNSIGNED NOT NULL,
        weight_kg DECIMAL(7,2) NOT NULL,
        repetitions INT UNSIGNED NOT NULL,
        CONSTRAINT fk_set_workout FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
        CONSTRAINT fk_set_exercise FOREIGN KEY (exercise_id) REFERENCES exercises(id),
        INDEX idx_set_workout_order (workout_id, exercise_order, set_number),
        INDEX idx_set_exercise (exercise_id),
        UNIQUE KEY uq_workout_exercise_set (workout_id, exercise_order, set_number)
    ) ENGINE=InnoDB");

    $exerciseRows = [
        ['pecho','Press banca con barra','Press horizontal con barra'],
        ['pecho','Press inclinado con mancuernas','Press inclinado con mancuernas'],
        ['pecho','Aperturas con mancuernas','Aperturas en banco'],
        ['pecho','Fondos para pecho','Fondos con énfasis en pectoral'],
        ['pecho','Cruce de poleas','Cruce de poleas para pectoral'],
        ['hombro','Press militar','Press vertical con barra'],
        ['hombro','Press de hombros con mancuernas','Press sentado o de pie'],
        ['hombro','Elevaciones laterales','Abducción lateral del hombro'],
        ['hombro','Elevaciones frontales','Flexión frontal del hombro'],
        ['hombro','Pájaros / reverse fly','Trabajo de deltoides posterior'],
        ['espalda','Dominadas','Tracción vertical con el peso corporal'],
        ['espalda','Jalón al pecho','Tracción vertical en polea'],
        ['espalda','Remo con barra','Remo horizontal con barra'],
        ['espalda','Remo sentado en polea','Remo horizontal en polea'],
        ['espalda','Pullover en polea','Extensión de hombro en polea'],
        ['pierna','Sentadilla con barra','Sentadilla trasera con barra'],
        ['pierna','Prensa de piernas','Prensa inclinada/horizontal'],
        ['pierna','Peso muerto rumano','Bisagra de cadera con barra'],
        ['pierna','Extensión de cuádriceps','Extensión de rodilla en máquina'],
        ['pierna','Curl femoral','Flexión de rodilla en máquina'],
        ['pierna','Elevación de gemelos','Trabajo de pantorrilla'],
        ['biceps','Curl con barra','Flexión de codo con barra'],
        ['biceps','Curl con mancuernas','Curl alterno o simultáneo'],
        ['biceps','Curl martillo','Curl con agarre neutro'],
        ['biceps','Curl predicador','Curl en banco predicador'],
        ['triceps','Press cerrado','Press de banca con agarre cerrado'],
        ['triceps','Extensión de tríceps en polea','Pushdown en polea'],
        ['triceps','Extensión por encima de la cabeza','Extensión de codo en polea/mancuerna'],
        ['triceps','Fondos para tríceps','Fondos con énfasis en tríceps'],
        ['triceps','Rompecráneos','Extensión tumbado con barra'],
    ];

    $insertExercise = $pdo->prepare(
        'INSERT IGNORE INTO exercises (muscle_group, name, description) VALUES (?, ?, ?)'
    );
    foreach ($exerciseRows as $exercise) {
        $insertExercise->execute($exercise);
    }
}

function db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = getenv('DB_HOST') ?: '127.0.0.1';
    $port = getenv('DB_PORT') ?: '3306';
    $name = getenv('DB_NAME') ?: 'tuapp';
    $user = getenv('DB_USER') ?: 'tuapp';
    $pass = getenv('DB_PASSWORD') ?: 'tuapp_secret';

    $pdo = new PDO(
        "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );

    initializeBaseTables($pdo);
    migrateWorkoutTables($pdo);
    migratePlanTables($pdo);

    return $pdo;
}


/*
|--------------------------------------------------------------------------
| WORKOUT MIGRATION
|--------------------------------------------------------------------------
*/

function migrateWorkoutTables(PDO $pdo): void
{
    static $done = false;

    if ($done) {
        return;
    }

    $done = true;

    /*
     * Migrate the original two-level workout_exercises/workout_sets model
     * into one direct workout_sets table.
     *
     * Existing data is preserved automatically.
     */

    $old = $pdo->query("
        SELECT COUNT(*)
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
          AND table_name = 'workout_exercises'
    ")->fetchColumn();

    if (!(int)$old) {
        return;
    }

    $new = $pdo->query("
        SELECT COUNT(*)
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
          AND table_name = 'workout_sets_v2'
    ")->fetchColumn();

    if (!(int)$new) {

        $pdo->exec("
            CREATE TABLE workout_sets_v2 (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                workout_id BIGINT UNSIGNED NOT NULL,
                exercise_id INT UNSIGNED NOT NULL,
                exercise_order INT UNSIGNED NOT NULL DEFAULT 1,
                set_number INT UNSIGNED NOT NULL,
                weight_kg DECIMAL(7,2) NOT NULL,
                repetitions INT UNSIGNED NOT NULL,

                CONSTRAINT fk_set2_workout
                    FOREIGN KEY (workout_id)
                    REFERENCES workouts(id)
                    ON DELETE CASCADE,

                CONSTRAINT fk_set2_exercise
                    FOREIGN KEY (exercise_id)
                    REFERENCES exercises(id),

                INDEX idx_set2_workout_order (
                    workout_id,
                    exercise_order,
                    set_number
                ),

                INDEX idx_set2_exercise (
                    exercise_id
                ),

                UNIQUE KEY uq_workout_exercise_set2 (
                    workout_id,
                    exercise_order,
                    set_number
                )

            ) ENGINE=InnoDB
        ");

        $pdo->exec("
            INSERT INTO workout_sets_v2 (
                workout_id,
                exercise_id,
                exercise_order,
                set_number,
                weight_kg,
                repetitions
            )

            SELECT
                we.workout_id,
                we.exercise_id,
                we.exercise_order,
                ws.set_number,
                ws.weight_kg,
                ws.repetitions

            FROM workout_exercises we

            JOIN workout_sets ws
                ON ws.workout_exercise_id = we.id

            ORDER BY
                we.workout_id,
                we.exercise_order,
                ws.set_number
        ");
    }

    $pdo->exec("
        DROP TABLE IF EXISTS workout_sets
    ");

    $pdo->exec("
        DROP TABLE IF EXISTS workout_exercises
    ");

    $pdo->exec("
        RENAME TABLE workout_sets_v2 TO workout_sets
    ");
}


/*
|--------------------------------------------------------------------------
| BASIC HELPERS
|--------------------------------------------------------------------------
*/

function jsonInput(): array
{
    $raw = file_get_contents('php://input');

    if (!$raw) {
        return [];
    }

    $data = json_decode($raw, true);

    return is_array($data)
        ? $data
        : [];
}


function response(
    mixed $data,
    int $status = 200
): never {

    http_response_code($status);

    echo json_encode(
        $data,
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

    exit;
}


function requireAuth(): int
{
    if (empty($_SESSION['user_id'])) {
        response(
            [
                'message' => 'No autenticado'
            ],
            401
        );
    }

    return (int)$_SESSION['user_id'];
}


function validateDate(
    string $date
): bool {

    $d = DateTime::createFromFormat(
        'Y-m-d',
        $date
    );

    return $d &&
        $d->format('Y-m-d') === $date;
}


/*
|--------------------------------------------------------------------------
| PLANS
|--------------------------------------------------------------------------
*/

function migratePlanTables(PDO $pdo): void
{
    static $done = false;

    if ($done) {
        return;
    }

    $done = true;

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS workout_plans (

            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

            user_id INT UNSIGNED NOT NULL,

            name VARCHAR(100) NOT NULL,

            created_at DATETIME NOT NULL
                DEFAULT CURRENT_TIMESTAMP,

            CONSTRAINT fk_plan_user
                FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE,

            INDEX idx_plan_user_created (
                user_id,
                created_at
            )

        ) ENGINE=InnoDB
    ");


    $pdo->exec("
        CREATE TABLE IF NOT EXISTS workout_plan_exercises (

            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

            plan_id BIGINT UNSIGNED NOT NULL,

            exercise_id INT UNSIGNED NOT NULL,

            exercise_order INT UNSIGNED NOT NULL
                DEFAULT 1,

            CONSTRAINT fk_plan_exercise_plan
                FOREIGN KEY (plan_id)
                REFERENCES workout_plans(id)
                ON DELETE CASCADE,

            CONSTRAINT fk_plan_exercise_exercise
                FOREIGN KEY (exercise_id)
                REFERENCES exercises(id),

            INDEX idx_plan_exercise_order (
                plan_id,
                exercise_order
            ),

            UNIQUE KEY uq_plan_exercise (
                plan_id,
                exercise_id
            )

        ) ENGINE=InnoDB
    ");
}


function planById(
    int $planId,
    int $uid
): ?array {

    $s = db()->prepare("
        SELECT
            id,
            name,
            created_at

        FROM workout_plans

        WHERE
            id = ?
            AND user_id = ?

        LIMIT 1
    ");

    $s->execute([
        $planId,
        $uid
    ]);

    $plan = $s->fetch();

    if (!$plan) {
        return null;
    }


    $s = db()->prepare("
        SELECT
            e.id,
            e.muscle_group,
            e.name,
            e.description

        FROM workout_plan_exercises pe

        JOIN exercises e
            ON e.id = pe.exercise_id

        WHERE pe.plan_id = ?

        ORDER BY
            pe.exercise_order ASC
    ");

    $s->execute([
        $planId
    ]);


    return [

        'id' =>
            (int)$plan['id'],

        'name' =>
            $plan['name'],

        'created_at' =>
            $plan['created_at'],

        'exercises' =>
            $s->fetchAll()

    ];
}


function validatePlanPayload(
    array $data
): array {

    $name =
        trim(
            (string)($data['name'] ?? '')
        );

    $ids =
        $data['exercise_ids'] ?? [];


    if (
        $name === ''
        ||
        mb_strlen($name) < 2
    ) {

        response(
            [
                'message' =>
                    'El nombre del plan debe tener al menos 2 caracteres'
            ],
            422
        );

    }


    if (
        mb_strlen($name) > 100
    ) {

        response(
            [
                'message' =>
                    'El nombre del plan es demasiado largo'
            ],
            422
        );

    }


    if (
        !is_array($ids)
        ||
        count($ids) < 1
    ) {

        response(
            [
                'message' =>
                    'El plan debe tener al menos un ejercicio'
            ],
            422
        );

    }


    $clean = [];


    foreach ($ids as $id) {

        $id = (int)$id;


        if ($id <= 0) {

            response(
                [
                    'message' =>
                        'Ejercicio no válido'
                ],
                422
            );

        }


        if (
            in_array(
                $id,
                $clean,
                true
            )
        ) {

            response(
                [
                    'message' =>
                        'No puedes repetir un ejercicio dentro del mismo plan'
                ],
                422
            );

        }


        $clean[] = $id;

    }


    $pdo = db();


    $placeholders =
        implode(
            ',',
            array_fill(
                0,
                count($clean),
                '?'
            )
        );


    $q = $pdo->prepare("
        SELECT id
        FROM exercises
        WHERE id IN ($placeholders)
    ");


    $q->execute($clean);


    $valid =
        array_map(
            'intval',
            $q->fetchAll(
                PDO::FETCH_COLUMN
            )
        );


    if (
        count($valid)
        !==
        count($clean)
    ) {

        response(
            [
                'message' =>
                    'Uno de los ejercicios no existe'
            ],
            422
        );

    }


    return [
        $name,
        $clean
    ];
}


/*
|--------------------------------------------------------------------------
| DEMO DATA
|--------------------------------------------------------------------------
*/

function seedDemoData(
    int $userId
): void {

    $pdo = db();


    $stmt =
        $pdo->prepare(
            'SELECT COUNT(*) FROM workouts WHERE user_id=?'
        );

    $stmt->execute([
        $userId
    ]);


    if (
        (int)$stmt->fetchColumn() > 0
    ) {

        return;

    }


    $rows =
        $pdo
            ->query(
                'SELECT id,name FROM exercises'
            )
            ->fetchAll();


    $map = [];


    foreach ($rows as $e) {

        $map[
            $e['name']
        ] =
            (int)$e['id'];

    }


    $days = [

        [
            '2026-09-12 18:10:00',
            3300,

            [
                [
                    'Press banca con barra',
                    [
                        [60,10],
                        [65,8],
                        [65,8]
                    ]
                ],

                [
                    'Remo con barra',
                    [
                        [55,10],
                        [60,8],
                        [60,8]
                    ]
                ],

                [
                    'Curl con barra',
                    [
                        [25,10],
                        [27.5,8]
                    ]
                ]
            ]
        ],


        [
            '2026-09-14 19:00:00',
            3900,

            [
                [
                    'Press banca con barra',
                    [
                        [65,10],
                        [70,8],
                        [70,8]
                    ]
                ],

                [
                    'Jalón al pecho',
                    [
                        [55,12],
                        [60,10],
                        [60,8]
                    ]
                ],

                [
                    'Elevaciones laterales',
                    [
                        [8,12],
                        [8,12],
                        [10,10]
                    ]
                ]
            ]
        ],


        [
            '2026-09-15 18:30:00',
            3600,

            [
                [
                    'Sentadilla con barra',
                    [
                        [70,10],
                        [80,8],
                        [80,8]
                    ]
                ],

                [
                    'Peso muerto rumano',
                    [
                        [70,10],
                        [80,8],
                        [80,8]
                    ]
                ],

                [
                    'Extensión de tríceps en polea',
                    [
                        [25,12],
                        [30,10]
                    ]
                ]
            ]
        ]

    ];


    $pdo->beginTransaction();


    try {

        foreach (
            $days
            as [
                $startedAt,
                $duration,
                $items
            ]
        ) {

            $s = $pdo->prepare("
                INSERT INTO workouts(
                    user_id,
                    started_at,
                    duration_seconds
                )
                VALUES(?,?,?)
            ");

            $s->execute([
                $userId,
                $startedAt,
                $duration
            ]);


            $wid =
                (int)$pdo->lastInsertId();


            $order = 1;


            foreach (
                $items
                as [
                    $name,
                    $sets
                ]
            ) {

                if (
                    !isset(
                        $map[$name]
                    )
                ) {

                    continue;

                }


                $sid = 1;


                foreach (
                    $sets
                    as [
                        $weight,
                        $reps
                    ]
                ) {

                    $s = $pdo->prepare("
                        INSERT INTO workout_sets(
                            workout_id,
                            exercise_id,
                            exercise_order,
                            set_number,
                            weight_kg,
                            repetitions
                        )
                        VALUES(?,?,?,?,?,?)
                    ");


                    $s->execute([
                        $wid,
                        $map[$name],
                        $order,
                        $sid++,
                        $weight,
                        $reps
                    ]);

                }


                $order++;

            }

        }


        $pdo->commit();

    } catch (Throwable $e) {

        $pdo->rollBack();

    }

}


/*
|--------------------------------------------------------------------------
| WORKOUT DETAIL
|--------------------------------------------------------------------------
*/

function workoutById(
    int $workoutId
): ?array {

    $pdo = db();


    $stmt = $pdo->prepare("
        SELECT
            id,
            started_at,
            duration_seconds

        FROM workouts

        WHERE id = ?
    ");


    $stmt->execute([
        $workoutId
    ]);


    $base =
        $stmt->fetch();


    if (!$base) {

        return null;

    }


    $stmt = $pdo->prepare("
        SELECT
            ws.exercise_id,
            e.name AS exercise_name,
            e.muscle_group,
            ws.exercise_order,
            ws.set_number,
            ws.weight_kg,
            ws.repetitions

        FROM workout_sets ws

        JOIN exercises e
            ON e.id = ws.exercise_id

        WHERE ws.workout_id = ?

        ORDER BY
            ws.exercise_order,
            ws.set_number
    ");


    $stmt->execute([
        $workoutId
    ]);


    $rows =
        $stmt->fetchAll();


    $by = [];

    $volume = 0;

    $sets = 0;


    foreach ($rows as $r) {

        $key =
            (string)$r['exercise_id']
            . '-'
            . $r['exercise_order'];


        if (
            !isset(
                $by[$key]
            )
        ) {

            $by[$key] = [

                'exercise_id' =>
                    (int)$r['exercise_id'],

                'name' =>
                    $r['exercise_name'],

                'muscle_group' =>
                    $r['muscle_group'],

                'sets' => []

            ];

        }


        $w =
            (float)$r['weight_kg'];


        $rep =
            (int)$r['repetitions'];


        $by[$key]['sets'][] = [

            'set_number' =>
                (int)$r['set_number'],

            'weight_kg' =>
                $w,

            'repetitions' =>
                $rep

        ];


        $volume +=
            $w * $rep;


        $sets++;

    }


    return [

        'id' =>
            (int)$base['id'],

        'date' =>
            substr(
                $base['started_at'],
                0,
                10
            ),

        'started_at' =>
            $base['started_at'],

        'duration_seconds' =>
            (int)$base['duration_seconds'],

        'volume' =>
            round(
                $volume,
                2
            ),

        'sets' =>
            $sets,

        'exercises' =>
            array_values($by)

    ];
}


/*
|--------------------------------------------------------------------------
| NUEVO:
| ÚLTIMO ENTRENAMIENTO DE UN EJERCICIO CONCRETO
|--------------------------------------------------------------------------
*/

function previousExercise(
    int $userId,
    int $exerciseId
): ?array {

    $pdo = db();


    /*
     * Buscamos el entrenamiento más reciente
     * del usuario que contenga exactamente
     * el ejercicio solicitado.
     */

    $stmt = $pdo->prepare("
        SELECT
            w.id,
            w.started_at,
            ws.exercise_id,
            e.name AS exercise_name,
            e.muscle_group

        FROM workouts w

        JOIN workout_sets ws
            ON ws.workout_id = w.id

        JOIN exercises e
            ON e.id = ws.exercise_id

        WHERE
            w.user_id = ?
            AND ws.exercise_id = ?

        ORDER BY
            w.started_at DESC,
            w.id DESC

        LIMIT 1
    ");


    $stmt->execute([
        $userId,
        $exerciseId
    ]);


    $base =
        $stmt->fetch();


    if (!$base) {

        return null;

    }


    /*
     * Recuperamos todas las series
     * del ejercicio dentro de ese entrenamiento.
     */

    $stmt = $pdo->prepare("
        SELECT
            set_number,
            weight_kg,
            repetitions

        FROM workout_sets

        WHERE
            workout_id = ?
            AND exercise_id = ?

        ORDER BY
            set_number ASC
    ");


    $stmt->execute([
        $base['id'],
        $exerciseId
    ]);


    $sets =
        $stmt->fetchAll();


    return [

        'workout_id' =>
            (int)$base['id'],

        'date' =>
            substr(
                $base['started_at'],
                0,
                10
            ),

        'started_at' =>
            $base['started_at'],

        'exercise_id' =>
            (int)$base['exercise_id'],

        'name' =>
            $base['exercise_name'],

        'muscle_group' =>
            $base['muscle_group'],

        'sets' =>
            array_map(

                static function (
                    array $row
                ): array {

                    return [

                        'set_number' =>
                            (int)$row['set_number'],

                        'weight_kg' =>
                            (float)$row['weight_kg'],

                        'repetitions' =>
                            (int)$row['repetitions']

                    ];

                },

                $sets

            )

    ];
}


/*
|--------------------------------------------------------------------------
| WORKOUT SUMMARY
|--------------------------------------------------------------------------
*/

function workoutSummary(
    array $workout
): array {

    $groups = [];


    foreach (
        $workout['exercises']
        as $exercise
    ) {

        $group =
            $exercise['muscle_group'];


        if (
            !in_array(
                $group,
                $groups,
                true
            )
        ) {

            $groups[] =
                $group;

        }

    }


    return [

        'id' =>
            $workout['id'],

        'date' =>
            $workout['date'],

        'started_at' =>
            $workout['started_at'],

        'duration_seconds' =>
            $workout['duration_seconds'],

        'volume' =>
            $workout['volume'],

        'sets' =>
            $workout['sets'],

        'exercise_count' =>
            count(
                $workout['exercises']
            ),

        'muscle_groups' =>
            $groups

    ];
}


/*
|--------------------------------------------------------------------------
| ROUTING
|--------------------------------------------------------------------------
*/

$path =
    parse_url(
        $_SERVER['REQUEST_URI'],
        PHP_URL_PATH
    ) ?: '/';


$path =
    preg_replace(
        '#^/api#',
        '',
        $path
    );


$method =
    $_SERVER['REQUEST_METHOD'];


try {


    /*
    |--------------------------------------------------------------------------
    | HEALTH
    |--------------------------------------------------------------------------
    */

    if (
        $path === '/health'
        &&
        $method === 'GET'
    ) {

        response([
            'status' => 'ok',
            'app' => 'TUAPP+'
        ]);

    }


    /*
    |--------------------------------------------------------------------------
    | LOGIN
    |--------------------------------------------------------------------------
    */

    if (
        $path === '/auth/login'
        &&
        $method === 'POST'
    ) {

        $d =
            jsonInput();


        $email =
            trim(
                (string)(
                    $d['email']
                    ?? ''
                )
            );


        $password =
            (string)(
                $d['password']
                ?? ''
            );


        if (
            !filter_var(
                $email,
                FILTER_VALIDATE_EMAIL
            )
            ||
            $password === ''
        ) {

            response(
                [
                    'message' =>
                        'Email y contraseña son obligatorios'
                ],
                422
            );

        }


        $s =
            db()->prepare("
                SELECT
                    id,
                    name,
                    email,
                    password_hash

                FROM users

                WHERE email = ?

                LIMIT 1
            ");


        $s->execute([
            $email
        ]);


        $u =
            $s->fetch();


        if (
            !$u
            ||
            !password_verify(
                $password,
                $u['password_hash']
            )
        ) {

            response(
                [
                    'message' =>
                        'Credenciales incorrectas'
                ],
                401
            );

        }


        session_regenerate_id(
            true
        );


        $_SESSION['user_id'] =
            (int)$u['id'];


        response([
            'user' => [

                'id' =>
                    (int)$u['id'],

                'name' =>
                    $u['name'],

                'email' =>
                    $u['email']

            ]
        ]);

    }


    /*
    |--------------------------------------------------------------------------
    | CURRENT USER
    |--------------------------------------------------------------------------
    */

    if (
        $path === '/auth/me'
        &&
        $method === 'GET'
    ) {

        $uid =
            requireAuth();


        $s =
            db()->prepare("
                SELECT
                    id,
                    name,
                    email

                FROM users

                WHERE id = ?
            ");


        $s->execute([
            $uid
        ]);


        $u =
            $s->fetch();


        if (!$u) {

            session_destroy();


            response(
                [
                    'message' =>
                        'Usuario no encontrado'
                ],
                401
            );

        }


        response([
            'user' =>
                $u
        ]);

    }


    /*
    |--------------------------------------------------------------------------
    | LOGOUT
    |--------------------------------------------------------------------------
    */

    if (
        $path === '/auth/logout'
        &&
        $method === 'POST'
    ) {

        $_SESSION = [];


        if (
            ini_get(
                'session.use_cookies'
            )
        ) {

            $p =
                session_get_cookie_params();


            setcookie(
                session_name(),
                ' ',
                time() - 42000,
                $p['path'],
                $p['domain'] ?? '',
                (bool)$p['secure'],
                (bool)$p['httponly']
            );

        }


        session_destroy();


        response([
            'message' =>
                'Sesión cerrada'
        ]);

    }


    /*
    |--------------------------------------------------------------------------
    | REGISTER
    |--------------------------------------------------------------------------
    */

    if (
        $path === '/auth/register'
        &&
        $method === 'POST'
    ) {

        $d =
            jsonInput();


        $name =
            trim(
                (string)(
                    $d['name']
                    ?? ''
                )
            );


        $email =
            strtolower(
                trim(
                    (string)(
                        $d['email']
                        ?? ''
                    )
                )
            );


        $password =
            (string)(
                $d['password']
                ?? ''
            );


        if (
            $name === ''
        ) {

            response(
                [
                    'message' =>
                        'El nombre es obligatorio'
                ],
                422
            );

        }


        if (
            mb_strlen($name) < 2
        ) {

            response(
                [
                    'message' =>
                        'El nombre debe tener al menos 2 caracteres'
                ],
                422
            );

        }


        if (
            !filter_var(
                $email,
                FILTER_VALIDATE_EMAIL
            )
        ) {

            response(
                [
                    'message' =>
                        'Introduce un email válido'
                ],
                422
            );

        }


        if (
            strlen($password) < 8
        ) {

            response(
                [
                    'message' =>
                        'La contraseña debe tener al menos 8 caracteres'
                ],
                422
            );

        }


        $pdo =
            db();


        $check =
            $pdo->prepare("
                SELECT id
                FROM users
                WHERE email = ?
                LIMIT 1
            ");


        $check->execute([
            $email
        ]);


        if (
            $check->fetch()
        ) {

            response(
                [
                    'message' =>
                        'Ya existe una cuenta con ese email'
                ],
                409
            );

        }


        $passwordHash =
            password_hash(
                $password,
                PASSWORD_DEFAULT
            );


        $insert =
            $pdo->prepare("
                INSERT INTO users (
                    name,
                    email,
                    password_hash
                )
                VALUES (?,?,?)
            ");


        $insert->execute([
            $name,
            $email,
            $passwordHash
        ]);


        $userId =
            (int)$pdo->lastInsertId();


        session_regenerate_id(
            true
        );


        $_SESSION['user_id'] =
            $userId;


        response(
            [
                'user' => [

                    'id' =>
                        $userId,

                    'name' =>
                        $name,

                    'email' =>
                        $email

                ]
            ],
            201
        );

    }


    /*
    |--------------------------------------------------------------------------
    | EXERCISES
    |--------------------------------------------------------------------------
    */

    if (
        $path === '/exercises'
        &&
        $method === 'GET'
    ) {

        requireAuth();


        $rows =
            db()->query("
                SELECT
                    id,
                    muscle_group,
                    name,
                    description

                FROM exercises

                ORDER BY
                    FIELD(
                        muscle_group,
                        'pecho',
                        'hombro',
                        'espalda',
                        'pierna',
                        'biceps',
                        'triceps'
                    ),
                    name
            ")->fetchAll();


        response([
            'exercises' =>
                $rows
        ]);

    }


    /*
    |--------------------------------------------------------------------------
    | PLANS - LIST
    |--------------------------------------------------------------------------
    */

    if (
        $path === '/plans'
        &&
        $method === 'GET'
    ) {

        $uid =
            requireAuth();


        $q =
            db()->prepare("
                SELECT id
                FROM workout_plans

                WHERE user_id = ?

                ORDER BY
                    created_at ASC,
                    id ASC
            ");


        $q->execute([
            $uid
        ]);


        $plans = [];


        foreach (
            $q->fetchAll(
                PDO::FETCH_COLUMN
            )
            as $id
        ) {

            $plan =
                planById(
                    (int)$id,
                    $uid
                );


            if ($plan) {

                $plans[] =
                    $plan;

            }

        }


        response([
            'plans' =>
                $plans
        ]);

    }


    /*
    |--------------------------------------------------------------------------
    | PLANS - CREATE
    |--------------------------------------------------------------------------
    */

    if (
        $path === '/plans'
        &&
        $method === 'POST'
    ) {

        $uid =
            requireAuth();


        [
            $name,
            $exerciseIds
        ] =
            validatePlanPayload(
                jsonInput()
            );


        $pdo =
            db();


        $pdo->beginTransaction();


        try {

            $q =
                $pdo->prepare("
                    INSERT INTO workout_plans(
                        user_id,
                        name
                    )
                    VALUES(?,?)
                ");


            $q->execute([
                $uid,
                $name
            ]);


            $planId =
                (int)$pdo->lastInsertId();


            $q =
                $pdo->prepare("
                    INSERT INTO workout_plan_exercises(
                        plan_id,
                        exercise_id,
                        exercise_order
                    )
                    VALUES(?,?,?)
                ");


            $order = 1;


            foreach (
                $exerciseIds
                as $exerciseId
            ) {

                $q->execute([
                    $planId,
                    $exerciseId,
                    $order++
                ]);

            }


            $pdo->commit();


            response(
                [
                    'id' =>
                        $planId
                ],
                201
            );

        } catch (Throwable $e) {

            $pdo->rollBack();


            response(
                [
                    'message' =>
                        'No se pudo crear el plan'
                ],
                422
            );

        }

    }


    /*
    |--------------------------------------------------------------------------
    | PLAN BY ID - GET
    |--------------------------------------------------------------------------
    */

    if (
        preg_match(
            '#^/plans/(\d+)$#',
            $path,
            $matches
        )
        &&
        $method === 'GET'
    ) {

        $uid =
            requireAuth();


        $plan =
            planById(
                (int)$matches[1],
                $uid
            );


        if (!$plan) {

            response(
                [
                    'plan' =>
                        null
                ],
                404
            );

        }


        response([
            'plan' =>
                $plan
        ]);

    }


    /*
    |--------------------------------------------------------------------------
    | PLAN BY ID - UPDATE
    |--------------------------------------------------------------------------
    */

    if (
        preg_match(
            '#^/plans/(\d+)$#',
            $path,
            $matches
        )
        &&
        $method === 'PUT'
    ) {

        $uid =
            requireAuth();


        $planId =
            (int)$matches[1];


        if (
            !planById(
                $planId,
                $uid
            )
        ) {

            response(
                [
                    'message' =>
                        'Plan no encontrado'
                ],
                404
            );

        }


        [
            $name,
            $exerciseIds
        ] =
            validatePlanPayload(
                jsonInput()
            );


        $pdo =
            db();


        $pdo->beginTransaction();


        try {

            $q =
                $pdo->prepare("
                    UPDATE workout_plans

                    SET name = ?

                    WHERE
                        id = ?
                        AND user_id = ?
                ");


            $q->execute([
                $name,
                $planId,
                $uid
            ]);


            $pdo
                ->prepare("
                    DELETE FROM workout_plan_exercises
                    WHERE plan_id = ?
                ")
                ->execute([
                    $planId
                ]);


            $q =
                $pdo->prepare("
                    INSERT INTO workout_plan_exercises(
                        plan_id,
                        exercise_id,
                        exercise_order
                    )
                    VALUES(?,?,?)
                ");


            $order = 1;


            foreach (
                $exerciseIds
                as $exerciseId
            ) {

                $q->execute([
                    $planId,
                    $exerciseId,
                    $order++
                ]);

            }


            $pdo->commit();


            response([
                'message' =>
                    'Plan actualizado'
            ]);

        } catch (Throwable $e) {

            $pdo->rollBack();


            response(
                [
                    'message' =>
                        'No se pudo actualizar el plan'
                ],
                422
            );

        }

    }


    /*
    |--------------------------------------------------------------------------
    | PLAN BY ID - DELETE
    |--------------------------------------------------------------------------
    */

    if (
        preg_match(
            '#^/plans/(\d+)$#',
            $path,
            $matches
        )
        &&
        $method === 'DELETE'
    ) {

        $uid =
            requireAuth();


        $planId =
            (int)$matches[1];


        $q =
            db()->prepare("
                DELETE FROM workout_plans

                WHERE
                    id = ?
                    AND user_id = ?
            ");


        $q->execute([
            $planId,
            $uid
        ]);


        if (
            $q->rowCount() === 0
        ) {

            response(
                [
                    'message' =>
                        'Plan no encontrado'
                ],
                404
            );

        }


        response([
            'message' =>
                'Plan eliminado'
        ]);

    }


    /*
    |--------------------------------------------------------------------------
    | CREATE WORKOUT
    |--------------------------------------------------------------------------
    */

    if (
        $path === '/workouts'
        &&
        $method === 'POST'
    ) {

        $uid =
            requireAuth();


        $d =
            jsonInput();


        $started =
            (string)(
                $d['started_at']
                ?? ''
            );


        $duration =
            (int)(
                $d['duration_seconds']
                ?? 0
            );


        $groups =
            $d['exercises']
            ?? [];


        if (
            !$started
            ||
            !is_array($groups)
            ||
            count($groups) < 1
        ) {

            response(
                [
                    'message' =>
                        'El entrenamiento debe tener al menos un ejercicio'
                ],
                422
            );

        }


        $dt =
            DateTime::createFromFormat(
                DateTime::ATOM,
                $started
            );


        if (!$dt) {

            $dt =
                new DateTime(
                    $started
                );

        }


        $dt->setTimezone(
            new DateTimeZone(
                'Europe/Madrid'
            )
        );


        $mysql =
            $dt->format(
                'Y-m-d H:i:s'
            );


        if (
            $duration < 0
            ||
            $duration > 86400
        ) {

            response(
                [
                    'message' =>
                        'Duración no válida'
                ],
                422
            );

        }


        $pdo =
            db();


        $pdo->beginTransaction();


        try {

            $s =
                $pdo->prepare("
                    INSERT INTO workouts(
                        user_id,
                        started_at,
                        duration_seconds
                    )
                    VALUES(?,?,?)
                ");


            $s->execute([
                $uid,
                $mysql,
                $duration
            ]);


            $wid =
                (int)$pdo->lastInsertId();


            $order = 1;


            foreach (
                $groups
                as $ex
            ) {

                $eid =
                    (int)(
                        $ex['exercise_id']
                        ?? 0
                    );


                $sets =
                    $ex['sets']
                    ?? [];


                if (
                    $eid <= 0
                    ||
                    !is_array($sets)
                    ||
                    count($sets) < 1
                ) {

                    throw new InvalidArgumentException(
                        'Ejercicio o series inválidas'
                    );

                }


                $s =
                    $pdo->prepare("
                        SELECT id
                        FROM exercises
                        WHERE id = ?
                    ");


                $s->execute([
                    $eid
                ]);


                if (
                    !$s->fetchColumn()
                ) {

                    throw new InvalidArgumentException(
                        'Ejercicio no válido'
                    );

                }


                $setNo = 1;


                foreach (
                    $sets
                    as $set
                ) {

                    $weight =
                        (float)(
                            $set['weight_kg']
                            ?? -1
                        );


                    $reps =
                        (int)(
                            $set['repetitions']
                            ?? 0
                        );


                    if (
                        $weight < 0
                        ||
                        $weight > 1000
                        ||
                        $reps < 1
                        ||
                        $reps > 1000
                    ) {

                        throw new InvalidArgumentException(
                            'Peso o repeticiones no válidos'
                        );

                    }


                    $s =
                        $pdo->prepare("
                            INSERT INTO workout_sets(
                                workout_id,
                                exercise_id,
                                exercise_order,
                                set_number,
                                weight_kg,
                                repetitions
                            )
                            VALUES(?,?,?,?,?,?)
                        ");


                    $s->execute([
                        $wid,
                        $eid,
                        $order,
                        $setNo++,
                        $weight,
                        $reps
                    ]);

                }


                $order++;

            }


            $pdo->commit();


            response(
                [
                    'id' =>
                        $wid
                ],
                201
            );

        } catch (Throwable $e) {

            $pdo->rollBack();


            response(
                [
                    'message' =>
                        $e instanceof InvalidArgumentException
                            ? $e->getMessage()
                            : 'No se pudo guardar el entrenamiento'
                ],
                422
            );

        }

    }


    /*
    |--------------------------------------------------------------------------
    | PREVIOUS WORKOUT
    |--------------------------------------------------------------------------
    */

    if (
        $path === '/workouts/previous'
        &&
        $method === 'GET'
    ) {

        $uid =
            requireAuth();


        $date =
            trim(
                (string)(
                    $_GET['date']
                    ?? ''
                )
            );


        if ($date === '') {

            $s =
                db()->prepare("
                    SELECT
                        DATE(started_at)

                    FROM workouts

                    WHERE
                        user_id = ?
                        AND DATE(started_at) = CURDATE()

                    ORDER BY
                        started_at DESC

                    LIMIT 1
                ");


            $s->execute([
                $uid
            ]);


            $date =
                $s->fetchColumn()
                ?:
                date(
                    'Y-m-d',
                    strtotime('-1 day')
                );

        }


        if (
            !validateDate(
                $date
            )
        ) {

            response(
                [
                    'message' =>
                        'Fecha no válida'
                ],
                422
            );

        }


        $s =
            db()->prepare("
                SELECT id

                FROM workouts

                WHERE
                    user_id = ?
                    AND DATE(started_at) = ?

                ORDER BY
                    started_at DESC

                LIMIT 1
            ");


        $s->execute([
            $uid,
            $date
        ]);


        $id =
            $s->fetchColumn();


        response([
            'workout' =>
                $id
                    ? workoutById(
                        (int)$id
                    )
                    : null
        ]);

    }


    /*
    |--------------------------------------------------------------------------
    | NUEVO:
    | PREVIOUS EXERCISE
    |--------------------------------------------------------------------------
    |
    | Devuelve el último entrenamiento del usuario
    | que contenga un ejercicio concreto.
    |
    */

    if (
        preg_match(
            '#^/workouts/previous-exercise/(\d+)$#',
            $path,
            $matches
        )
        &&
        $method === 'GET'
    ) {

        $uid =
            requireAuth();


        $exerciseId =
            (int)$matches[1];


        if (
            $exerciseId <= 0
        ) {

            response(
                [
                    'message' =>
                        'Ejercicio no válido'
                ],
                422
            );

        }


        $previous =
            previousExercise(
                $uid,
                $exerciseId
            );


        response([
            'workout' =>
                $previous
        ]);

    }


    /*
    |--------------------------------------------------------------------------
    | WORKOUT BY ID
    |--------------------------------------------------------------------------
    */

    if (
        preg_match(
            '#^/workouts/(\d+)$#',
            $path,
            $matches
        )
        &&
        $method === 'GET'
    ) {

        $uid =
            requireAuth();


        $workoutId =
            (int)$matches[1];


        $s =
            db()->prepare("
                SELECT id

                FROM workouts

                WHERE
                    id = ?
                    AND user_id = ?

                LIMIT 1
            ");


        $s->execute([
            $workoutId,
            $uid
        ]);


        if (
            !$s->fetchColumn()
        ) {

            response(
                [
                    'workout' =>
                        null
                ],
                404
            );

        }


        response([
            'workout' =>
                workoutById(
                    $workoutId
                )
        ]);

    }


    /*
    |--------------------------------------------------------------------------
    | DASHBOARD
    |--------------------------------------------------------------------------
    */

    if (
        $path === '/dashboard'
        &&
        $method === 'GET'
    ) {

        $uid =
            requireAuth();


        $requestedDays =
            (int)(
                $_GET['volume_days']
                ?? 30
            );


        $volumeDays =
            in_array(
                $requestedDays,
                [
                    0,
                    30,
                    180,
                    365
                ],
                true
            )
                ? $requestedDays
                : 30;


        $today =
            date(
                'Y-m-d'
            );


        $yesterday =
            date(
                'Y-m-d',
                strtotime('-1 day')
            );


        /*
        |--------------------------------------------------------------------------
        | VOLUME
        |--------------------------------------------------------------------------
        */

        if (
            $volumeDays === 0
        ) {

            $s =
                db()->prepare("
                    SELECT
                        DATE(w.started_at) AS day,
                        ROUND(
                            SUM(
                                ws.weight_kg *
                                ws.repetitions
                            ),
                            2
                        ) AS volume

                    FROM workouts w

                    JOIN workout_sets ws
                        ON ws.workout_id = w.id

                    WHERE w.user_id = ?

                    GROUP BY
                        DATE(w.started_at)

                    ORDER BY
                        day
                ");


            $s->execute([
                $uid
            ]);

        } else {

            $since =
                date(
                    'Y-m-d',
                    strtotime(
                        "-{$volumeDays} days"
                    )
                );


            $s =
                db()->prepare("
                    SELECT
                        DATE(w.started_at) AS day,
                        ROUND(
                            SUM(
                                ws.weight_kg *
                                ws.repetitions
                            ),
                            2
                        ) AS volume

                    FROM workouts w

                    JOIN workout_sets ws
                        ON ws.workout_id = w.id

                    WHERE
                        w.user_id = ?
                        AND DATE(w.started_at) >= ?

                    GROUP BY
                        DATE(w.started_at)

                    ORDER BY
                        day
                ");


            $s->execute([
                $uid,
                $since
            ]);

        }


        $volume =
            $s->fetchAll();


        /*
        |--------------------------------------------------------------------------
        | REPETITIONS
        |--------------------------------------------------------------------------
        */

        $repsSince =
            date(
                'Y-m-d',
                strtotime('-30 days')
            );


        $s =
            db()->prepare("
                SELECT
                    DATE(w.started_at) AS day,
                    e.name AS exercise,
                    SUM(ws.repetitions) AS repetitions

                FROM workouts w

                JOIN workout_sets ws
                    ON ws.workout_id = w.id

                JOIN exercises e
                    ON e.id = ws.exercise_id

                WHERE
                    w.user_id = ?
                    AND DATE(w.started_at) >= ?

                GROUP BY
                    DATE(w.started_at),
                    e.id,
                    e.name

                ORDER BY
                    day,
                    e.name
            ");


        $s->execute([
            $uid,
            $repsSince
        ]);


        $reps =
            $s->fetchAll();


        /*
        |--------------------------------------------------------------------------
        | TODAY'S WORKOUTS
        |--------------------------------------------------------------------------
        */

        $s =
            db()->prepare("
                SELECT id

                FROM workouts

                WHERE
                    user_id = ?
                    AND DATE(started_at) = ?

                ORDER BY
                    started_at ASC,
                    id ASC
            ");


        $s->execute([
            $uid,
            $today
        ]);


        $todayIds =
            $s->fetchAll(
                PDO::FETCH_COLUMN
            );


        $todayWorkouts = [];

        $todayDuration = 0;

        $todayVolume = 0;


        foreach (
            $todayIds
            as $id
        ) {

            $workout =
                workoutById(
                    (int)$id
                );


            if (!$workout) {
                continue;
            }


            $todayWorkouts[] =
                $workout;


            $todayDuration +=
                (int)$workout[
                    'duration_seconds'
                ];


            $todayVolume +=
                (float)$workout[
                    'volume'
                ];

        }


        /*
        |--------------------------------------------------------------------------
        | PREVIOUS VOLUME
        |--------------------------------------------------------------------------
        */

        $s =
            db()->prepare("
                SELECT
                    ROUND(
                        SUM(
                            ws.weight_kg *
                            ws.repetitions
                        ),
                        2
                    ) AS volume

                FROM workouts w

                JOIN workout_sets ws
                    ON ws.workout_id = w.id

                WHERE
                    w.user_id = ?
                    AND DATE(w.started_at) = ?
            ");


        $s->execute([
            $uid,
            $yesterday
        ]);


        $yesterdayVolume =
            $s->fetchColumn();


        $previousVolume = null;


        if (
            $yesterdayVolume !== false
            &&
            $yesterdayVolume !== null
        ) {

            $previousVolume =
                (float)$yesterdayVolume;

        } else {

            $s =
                db()->prepare("
                    SELECT
                        ROUND(
                            SUM(
                                ws.weight_kg *
                                ws.repetitions
                            ),
                            2
                        ) AS volume

                    FROM workouts w

                    JOIN workout_sets ws
                        ON ws.workout_id = w.id

                    WHERE
                        w.user_id = ?
                        AND w.started_at < ?

                    GROUP BY
                        w.id

                    ORDER BY
                        w.started_at DESC

                    LIMIT 1
                ");


            $s->execute([
                $uid,
                $today . ' 00:00:00'
            ]);


            $previousVolume =
                $s->fetchColumn();


            $previousVolume =
                $previousVolume !== false
                &&
                $previousVolume !== null

                    ? (float)$previousVolume
                    : null;

        }


        /*
        |--------------------------------------------------------------------------
        | DASHBOARD MESSAGE
        |--------------------------------------------------------------------------
        */

        $message = null;

        $messageSecondary = null;


        if (
            count($todayWorkouts) > 0
            &&
            $previousVolume !== null
        ) {

            if (
                $todayVolume >
                $previousVolume
            ) {

                $message =
                    'Muy bien, en el último entrenamiento has levantado más peso que en el del día anterior.';

            } elseif (
                $todayVolume <
                $previousVolume
            ) {

                $message =
                    '¡Sigue así, el secreto es no estar parado!';


                $messageSecondary =
                    'Mantente activo para superar el peso del día anterior.';

            } else {

                $message =
                    'Muy bien, has alcanzado la meta ahora toca superarse';


                $messageSecondary =
                    'Continua entrenando para superarte';

            }

        }


        /*
        |--------------------------------------------------------------------------
        | HISTORY
        |--------------------------------------------------------------------------
        */

        $s =
            db()->prepare("
                SELECT id

                FROM workouts

                WHERE user_id = ?

                ORDER BY
                    started_at DESC,
                    id DESC
            ");


        $s->execute([
            $uid
        ]);


        $historyIds =
            $s->fetchAll(
                PDO::FETCH_COLUMN
            );


        $history = [];


        foreach (
            $historyIds
            as $id
        ) {

            $workout =
                workoutById(
                    (int)$id
                );


            if ($workout) {

                $history[] =
                    workoutSummary(
                        $workout
                    );

            }

        }


        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        response([

            'volume_by_day' =>
                $volume,

            'repetitions_by_exercise_day' =>
                $reps,

            'message' =>
                $message,

            'message_secondary' =>
                $messageSecondary,

            'today_workouts' =>
                $todayWorkouts,

            'today_total_duration_seconds' =>
                $todayDuration,

            'history' =>
                $history

        ]);

    }


    /*
    |--------------------------------------------------------------------------
    | 404
    |--------------------------------------------------------------------------
    */

    response(
        [
            'message' =>
                'Ruta no encontrada'
        ],
        404
    );


} catch (Throwable $e) {

    error_log(
        (string)$e
    );


    response(
        [
            'message' =>
                'Error interno del servidor'
        ],
        500
    );

}
