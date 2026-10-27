import {
  Component,
  OnInit,
  OnDestroy,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { ApiService } from '../core/api.service';

import {
  Exercise,
  MuscleGroup,
  PreviousExercise,
  WorkoutPlan
} from '../models/models';


interface SetRow {
  weight_kg: number | null;
  repetitions: number | null;
}


interface ExerciseCard {
  exercise_id: number | null;

  sets: SetRow[];

  previous: PreviousExercise | null;

  previousLoading: boolean;
}


@Component({
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  template: `

    <!-- CABECERA -->

    <div class="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

      <div>

        <p class="mb-2 text-sm font-medium text-black/45">
          Nueva sesión
        </p>

        <h1 class="text-4xl font-semibold tracking-[-0.055em]">
          Registrar entrenamiento.
        </h1>

        <p class="mt-3 text-black/50">
          Elige ejercicios individualmente o carga uno de tus planes.
        </p>

      </div>


      <div class="card px-5 py-3 text-center">

        <div
          class="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35"
        >
          Tiempo
        </div>

        <div class="mt-1 font-mono text-xl font-semibold">
          {{ timer }}
        </div>

      </div>

    </div>


    <!-- TIPO DE SESIÓN -->

    <section class="card mb-5 p-5 sm:p-7">

      <div class="mb-4">

        <p
          class="text-xs font-semibold uppercase tracking-[0.12em] text-black/35"
        >
          Tipo de sesión
        </p>

        <h2 class="mt-1 text-lg font-semibold">
          ¿Cómo quieres empezar?
        </h2>

      </div>


      <div class="grid gap-3 sm:grid-cols-2">

        <!-- EJERCICIOS -->

        <button
          type="button"
          class="rounded-2xl border px-4 py-4 text-left transition"
          [class.mode-card-active]="mode === 'exercise'"
          (click)="selectExerciseMode()"
        >

          <span class="block text-sm font-semibold">
            Ejercicios
          </span>

          <span class="mt-1 block text-xs leading-5 text-black/45">
            Añade manualmente los ejercicios de esta sesión.
          </span>

        </button>


        <!-- PLAN -->

        <button
          type="button"
          class="rounded-2xl border px-4 py-4 text-left transition"
          [class.mode-card-active]="mode === 'plan'"
          (click)="selectPlanMode()"
        >

          <span class="block text-sm font-semibold">
            Plan personalizado
          </span>

          <span class="mt-1 block text-xs leading-5 text-black/45">
            Carga automáticamente los ejercicios de una rutina guardada.
          </span>

        </button>

      </div>


      <!-- SELECTOR DE PLAN -->

      @if (mode === 'plan') {

        <div class="mt-5 border-t border-black/[0.06] pt-5">

          <label class="mb-2 block text-sm font-medium">
            Selecciona un plan
          </label>

          <select
            class="input"
            [value]="selectedPlanId ?? ''"
            (change)="selectPlan($any($event.target).value)"
          >

            <option value="">
              Selecciona un plan…
            </option>

            @for (plan of plans; track plan.id) {

              <option [value]="plan.id">

                {{ plan.name }}
                ·
                {{ plan.exercises.length }}

                {{
                  plan.exercises.length === 1
                    ? 'ejercicio'
                    : 'ejercicios'
                }}

              </option>

            }

          </select>


          @if (!plans.length && !plansLoading) {

            <p class="mt-3 text-sm text-black/45">

              Todavía no tienes planes.

              Puedes crearlos desde

              <a
                routerLink="/planes"
                class="font-medium text-black underline underline-offset-4"
              >
                Planes Workouts
              </a>.

            </p>

          }

        </div>

      }

    </section>



    <!-- FORMULARIO -->

    <form
      (ngSubmit)="save()"
      class="space-y-5"
    >

      <!-- PLAN SIN SELECCIONAR -->

      @if (mode === 'plan' && !selectedPlanId) {

        <section class="card px-6 py-10 text-center sm:px-7">

          <div
            class="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-black/[0.025]"
          >
            ↗
          </div>

          <h2 class="mt-4 text-lg font-semibold">
            Selecciona un plan para empezar.
          </h2>

          <p class="mt-2 text-sm text-black/45">
            Los ejercicios de la rutina aparecerán aquí automáticamente.
          </p>

        </section>

      } @else {

        <!-- EJERCICIOS -->

        @for (card of cards; track $index; let i = $index) {

          <section class="card p-5 sm:p-7">

            <!-- CABECERA EJERCICIO -->

            <div class="mb-6 flex items-center justify-between">

              <div>

                <span
                  class="text-xs font-medium text-black/35"
                >
                  EJERCICIO {{ i + 1 }}
                </span>

                <h2 class="mt-1 text-lg font-semibold">
                  {{
                    exerciseName(card.exercise_id)
                    || 'Selecciona el ejercicio'
                  }}
                </h2>

              </div>


              @if (mode === 'exercise' && cards.length > 1) {

                <button
                  type="button"
                  class="rounded-full px-3 py-2 text-xs text-black/45 hover:bg-red-50 hover:text-red-600"
                  (click)="removeCard(i)"
                >
                  Eliminar
                </button>

              }

            </div>



            <!-- SELECCIÓN DE EJERCICIO -->

            @if (mode === 'exercise') {

              <select
                class="input mb-6"
                [value]="card.exercise_id ?? ''"
                (change)="setExercise(i, $any($event.target).value)"
              >

                <option value="">
                  Selecciona un ejercicio…
                </option>

                @for (group of groupOrder; track group) {

                  <optgroup [label]="groupLabels[group]">

                    @for (
                      exercise of grouped[group];
                      track exercise.id
                    ) {

                      <option [value]="exercise.id">
                        {{ exercise.name }}
                      </option>

                    }

                  </optgroup>

                }

              </select>

            } @else {

              <div class="mb-6 flex flex-wrap gap-2">

                <span
                  class="rounded-full border border-black/[0.08] bg-black/[0.025] px-3 py-1.5 text-xs text-black/50"
                >
                  {{ muscleGroupLabel(card.exercise_id) }}
                </span>

                <span
                  class="rounded-full border border-black/[0.08] bg-black/[0.025] px-3 py-1.5 text-xs text-black/50"
                >
                  Del plan
                </span>

              </div>

            }



            <!-- HISTORIAL + REGISTRO ACTUAL -->

            @if (card.exercise_id) {

              <div class="grid gap-5 lg:grid-cols-2">


                <!-- ====================================== -->
                <!-- ENTRENAMIENTO ANTERIOR -->
                <!-- ====================================== -->

                <div
                  class="rounded-[22px] border border-black/[0.07] bg-black/[0.018] p-5"
                >

                  <div class="mb-5">

                    <p
                      class="text-[10px] font-semibold uppercase tracking-[0.14em] text-black/35"
                    >
                      Entrenamiento anterior
                    </p>

                    <h3 class="mt-1 text-base font-semibold">
                      Último registro
                    </h3>

                  </div>


                  <!-- CARGANDO -->

                  @if (card.previousLoading) {

                    <div class="flex items-center gap-3 py-5">

                      <div
                        class="h-4 w-4 animate-spin rounded-full border-2 border-black/10 border-t-black/60"
                      ></div>

                      <span class="text-sm text-black/40">
                        Cargando historial…
                      </span>

                    </div>

                  }

                  <!-- SIN HISTORIAL -->

                  @else if (!card.previous) {

                    <div
                      class="rounded-2xl border border-black/[0.06] bg-white/60 px-4 py-5"
                    >

                      <p class="text-sm font-medium text-black/55">
                        Sin entrenamiento anterior
                      </p>

                      <p class="mt-1 text-xs leading-5 text-black/35">
                        Todavía no has registrado este ejercicio.
                      </p>

                    </div>

                  }

                  <!-- HISTORIAL EXISTENTE -->

                  @else {

                    <div>

                      <!-- FECHA -->

                      <div
                        class="mb-4 flex items-center justify-between gap-3"
                      >

                        <span
                          class="text-xs font-medium text-black/40"
                        >
                          Última vez
                        </span>

                        <span
                          class="rounded-full border border-black/[0.08] bg-white px-3 py-1 text-xs font-medium text-black/55"
                        >
                          {{ formatDate(card.previous.date) }}
                        </span>

                      </div>


                      <!-- TABLA -->

                      <div
                        class="overflow-hidden rounded-2xl border border-black/[0.07] bg-white"
                      >

                        <div
                          class="grid grid-cols-[52px_1fr_1fr] gap-3 border-b border-black/[0.06] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-black/30"
                        >

                          <span>
                            Serie
                          </span>

                          <span>
                            Peso
                          </span>

                          <span>
                            Reps
                          </span>

                        </div>


                        @for (
                          set of card.previous.sets;
                          track set.set_number
                        ) {

                          <div
                            class="grid grid-cols-[52px_1fr_1fr] gap-3 border-b border-black/[0.05] px-4 py-3 last:border-b-0"
                          >

                            <span
                              class="text-sm font-medium text-black/40"
                            >
                              {{ set.set_number }}
                            </span>

                            <span
                              class="text-sm font-semibold"
                            >
                              {{ set.weight_kg }} kg
                            </span>

                            <span
                              class="text-sm font-semibold"
                            >
                              {{ set.repetitions }}
                            </span>

                          </div>

                        }

                      </div>

                    </div>

                  }

                </div>



                <!-- ====================================== -->
                <!-- ENTRENAMIENTO ACTUAL -->
                <!-- ====================================== -->

                <div
                  class="rounded-[22px] border border-black/[0.07] bg-white p-5"
                >

                  <div class="mb-5">

                    <p
                      class="text-[10px] font-semibold uppercase tracking-[0.14em] text-black/35"
                    >
                      Entrenamiento actual
                    </p>

                    <h3 class="mt-1 text-base font-semibold">
                      Registra tus series
                    </h3>

                  </div>


                  <!-- CABECERA SERIES -->

                  <div class="space-y-2">

                    <div
                      class="grid grid-cols-[52px_1fr_1fr_40px] gap-3 px-1 text-[10px] font-semibold uppercase tracking-wider text-black/30"
                    >

                      <span>
                        Serie
                      </span>

                      <span>
                        Peso (kg)
                      </span>

                      <span>
                        Reps
                      </span>

                      <span></span>

                    </div>


                    <!-- SERIES -->

                    @for (
                      set of card.sets;
                      track $index;
                      let s = $index
                    ) {

                      <div
                        class="grid grid-cols-[52px_1fr_1fr_40px] items-center gap-3"
                      >

                        <div
                          class="text-sm font-medium text-black/45"
                        >
                          {{ s + 1 }}
                        </div>


                        <input
                          class="input"
                          type="number"
                          min="0"
                          step="0.5"
                          placeholder="60"
                          [value]="set.weight_kg ?? ''"
                          (input)="setWeight(
                            i,
                            s,
                            $any($event.target).value
                          )"
                        />


                        <input
                          class="input"
                          type="number"
                          min="1"
                          step="1"
                          placeholder="10"
                          [value]="set.repetitions ?? ''"
                          (input)="setReps(
                            i,
                            s,
                            $any($event.target).value
                          )"
                        />


                        <button
                          type="button"
                          class="text-black/30 hover:text-red-600"
                          (click)="removeSet(i, s)"
                          [disabled]="card.sets.length === 1"
                        >
                          ×
                        </button>

                      </div>

                    }

                  </div>


                  <!-- AÑADIR SERIE -->

                  <button
                    type="button"
                    class="btn-secondary mt-5 !px-4 !py-2 text-xs"
                    (click)="addSet(i)"
                  >
                    + Añadir serie
                  </button>

                </div>

              </div>

            }

          </section>

        }



        <!-- BOTONES -->

        <div
          class="flex flex-col gap-3 sm:flex-row sm:justify-between"
        >

          @if (mode === 'exercise') {

            <button
              type="button"
              class="btn-secondary"
              (click)="addCard()"
            >
              + Añadir ejercicio
            </button>

          } @else {

            <a
              routerLink="/planes"
              class="btn-secondary text-center"
            >
              Gestionar planes
            </a>

          }


          <button
            type="submit"
            class="btn-primary"
            [disabled]="saving"
          >

            {{
              saving
                ? 'Guardando…'
                : 'Guardar entrenamiento'
            }}

          </button>

        </div>

      }


      <!-- ERROR -->

      @if (error) {

        <div
          class="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700"
        >
          {{ error }}
        </div>

      }


      <!-- SUCCESS -->

      @if (success) {

        <div
          class="rounded-2xl bg-green-50 px-5 py-4 text-sm text-green-700"
        >
          {{ success }}
        </div>

      }

    </form>
  `,

  styles: [`

    .mode-card-active {
      border-color: rgba(0,0,0,.95);
      background: rgba(0,0,0,.035);
    }

  `]
})


export class WorkoutRegisterComponent
  implements OnInit, OnDestroy {

  private readonly api = inject(ApiService);

  private readonly router = inject(Router);


  exercises: Exercise[] = [];

  plans: WorkoutPlan[] = [];


  grouped: Record<MuscleGroup, Exercise[]> = {

    pecho: [],
    hombro: [],
    espalda: [],
    pierna: [],
    biceps: [],
    triceps: []

  };


  groupOrder: MuscleGroup[] = [
    'pecho',
    'hombro',
    'espalda',
    'pierna',
    'biceps',
    'triceps'
  ];


  groupLabels: Record<MuscleGroup, string> = {

    pecho: 'Pecho',
    hombro: 'Hombro',
    espalda: 'Espalda',
    pierna: 'Pierna',
    biceps: 'Bíceps',
    triceps: 'Tríceps'

  };


  mode: 'exercise' | 'plan' = 'exercise';

  selectedPlanId: number | null = null;

  plansLoading = false;


  cards: ExerciseCard[] = [
    this.newCard()
  ];


  startedAt = new Date();

  elapsed = 0;

  timerHandle?: ReturnType<typeof setInterval>;


  saving = false;

  error = '';

  success = '';



  // ==========================================
  // INIT
  // ==========================================

  ngOnInit(): void {

    this.api.exercises().subscribe({

      next: r => {

        this.exercises = r.exercises;

        this.groupOrder.forEach(
          group => {

            this.grouped[group] =
              this.exercises.filter(
                e => e.muscle_group === group
              );

          }
        );

      },

      error: () => {

        this.error =
          'No se pudieron cargar los ejercicios.';

      }

    });


    this.loadPlans();


    this.timerHandle = setInterval(() => {

      this.elapsed =
        Math.floor(
          (
            Date.now()
            -
            this.startedAt.getTime()
          ) / 1000
        );

    }, 1000);

  }



  ngOnDestroy(): void {

    if (this.timerHandle) {

      clearInterval(this.timerHandle);

    }

  }



  // ==========================================
  // PLANES
  // ==========================================

  loadPlans(): void {

    this.plansLoading = true;

    this.api.plans().subscribe({

      next: r => {

        this.plans = r.plans;

        this.plansLoading = false;

      },

      error: () => {

        this.plansLoading = false;

      }

    });

  }



  // ==========================================
  // TARJETAS
  // ==========================================

  newCard(
    exerciseId: number | null = null
  ): ExerciseCard {

    return {

      exercise_id: exerciseId,

      sets: [
        {
          weight_kg: null,
          repetitions: null
        }
      ],

      previous: null,

      previousLoading: !!exerciseId

    };

  }



  selectExerciseMode(): void {

    this.mode = 'exercise';

    this.selectedPlanId = null;

    this.cards = [
      this.newCard()
    ];

    this.error = '';

    this.success = '';

  }



  selectPlanMode(): void {

    this.mode = 'plan';

    this.selectedPlanId = null;

    this.cards = [];

    this.error = '';

    this.success = '';

  }



  selectPlan(value: string): void {

    this.selectedPlanId =
      value
        ? Number(value)
        : null;


    const plan =
      this.plans.find(
        p => p.id === this.selectedPlanId
      );


    this.cards =
      plan
        ? plan.exercises.map(
            exercise =>
              this.newCard(exercise.id)
          )
        : [];


    this.error = '';

    this.success = '';


    // Cargamos el último entrenamiento
    // de cada ejercicio del plan.

    this.cards.forEach(
      (_, index) => {

        this.loadPreviousForCard(index);

      }
    );

  }



  addCard(): void {

    this.cards.push(
      this.newCard()
    );

  }



  removeCard(index: number): void {

    this.cards.splice(index, 1);

  }



  addSet(index: number): void {

    this.cards[index].sets.push({

      weight_kg: null,

      repetitions: null

    });

  }



  removeSet(
    i: number,
    s: number
  ): void {

    if (
      this.cards[i].sets.length > 1
    ) {

      this.cards[i].sets.splice(
        s,
        1
      );

    }

  }



  // ==========================================
  // EJERCICIO
  // ==========================================

  setExercise(
    i: number,
    value: string
  ): void {

    this.cards[i].exercise_id =
      value
        ? Number(value)
        : null;


    this.cards[i].previous = null;


    this.cards[i].previousLoading =
      !!this.cards[i].exercise_id;


    if (this.cards[i].exercise_id) {

      this.loadPreviousForCard(i);

    }

  }



  // ==========================================
  // HISTORIAL ANTERIOR
  // ==========================================

  loadPreviousForCard(
    index: number
  ): void {

    const card =
      this.cards[index];


    if (!card.exercise_id) {

      card.previous = null;

      card.previousLoading = false;

      return;

    }


    card.previousLoading = true;


    this.api
      .previousExercise(card.exercise_id)
      .subscribe({

        next: response => {

          card.previous =
            response.workout;

          card.previousLoading =
            false;

        },

        error: () => {

          card.previous = null;

          card.previousLoading =
            false;

        }

      });

  }



  // ==========================================
  // INPUTS
  // ==========================================

  setWeight(
    i: number,
    s: number,
    value: string
  ): void {

    this.cards[i].sets[s].weight_kg =
      value === ''
        ? null
        : Number(value);

  }



  setReps(
    i: number,
    s: number,
    value: string
  ): void {

    this.cards[i].sets[s].repetitions =
      value === ''
        ? null
        : Number(value);

  }



  // ==========================================
  // HELPERS
  // ==========================================

  exerciseName(
    id: number | null
  ): string {

    return (
      this.exercises.find(
        e => e.id === id
      )?.name
      ?? ''
    );

  }



  muscleGroupLabel(
    id: number | null
  ): string {

    const group =
      this.exercises.find(
        e => e.id === id
      )?.muscle_group;


    return group
      ? this.groupLabels[group]
      : '';

  }



  formatDate(
    date: string
  ): string {

    const parsed =
      new Date(
        `${date}T00:00:00`
      );


    return parsed.toLocaleDateString(
      'es-ES',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    );

  }



  get timer(): string {

    const h =
      Math.floor(
        this.elapsed / 3600
      );


    const m =
      Math.floor(
        (this.elapsed % 3600) / 60
      );


    const s =
      this.elapsed % 60;


    return (

      `${
        h
          ? h
              .toString()
              .padStart(2, '0')
            + ':'
          : ''
      }${
        m
          .toString()
          .padStart(2, '0')
      }:${
        s
          .toString()
          .padStart(2, '0')
      }`

    );

  }



  // ==========================================
  // GUARDAR
  // ==========================================

  save(): void {

    this.error = '';

    this.success = '';


    if (!this.cards.length) {

      this.error =
        'Selecciona un plan con al menos un ejercicio.';

      return;

    }


    for (const card of this.cards) {

      if (!card.exercise_id) {

        this.error =
          'Selecciona un ejercicio en cada tarjeta.';

        return;

      }


      if (
        card.sets.some(
          set =>
            set.weight_kg === null
            ||
            set.repetitions === null
            ||
            set.weight_kg < 0
            ||
            set.repetitions < 1
        )
      ) {

        this.error =
          'Completa correctamente el peso y las repeticiones de todas las series.';

        return;

      }

    }


    this.saving = true;


    const payload = {

      started_at:
        this.startedAt.toISOString(),

      duration_seconds:
        this.elapsed,

      exercises:
        this.cards.map(
          card => ({

            exercise_id:
              card.exercise_id,

            sets:
              card.sets.map(
                set => ({

                  weight_kg:
                    set.weight_kg,

                  repetitions:
                    set.repetitions

                })
              )

          })
        )

    };


    this.api
      .saveWorkout(payload)
      .subscribe({

        next: () => {

          this.saving = false;

          this.success =
            'Entrenamiento guardado correctamente.';


          setTimeout(
            () =>
              this.router.navigateByUrl(
                '/anterior'
              ),
            700
          );

        },

        error: err => {

          this.saving = false;

          this.error =
            err?.error?.message
            ??
            'No se pudo guardar el entrenamiento.';

        }

      });

  }

}