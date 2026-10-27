import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Workout } from '../models/models';
import { getExerciseAsset, getExerciseImage } from '../core/exercise-assets';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="mb-2 text-sm font-medium text-black/45">Historial</p>
        <h1 class="text-4xl font-semibold tracking-[-0.055em]">Último entrenamiento.</h1>
        <p class="mt-3 text-black/50">
          Aquí se muestra automáticamente tu sesión más reciente, incluida la de hoy.
        </p>
      </div>

      <a
        routerLink="/registrar"
        class="btn-secondary inline-flex items-center justify-center gap-2"
      >
        + Nueva sesión
      </a>
    </div>

    @if (loading) {

      <div class="card p-8 text-sm text-black/50">
        Cargando entrenamiento…
      </div>

    } @else if (!workout) {

      <div class="card p-10 text-center">

        <div
          class="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-black/[0.025] text-lg"
        >
          ○
        </div>

        <div class="mt-4 text-lg font-semibold">
          Todavía no hay entrenamientos.
        </div>

        <p class="mt-2 text-sm text-black/45">
          Cuando completes una sesión aparecerá aquí.
        </p>

      </div>

    } @else {

      <section class="card mb-6 border-black/10 p-5 sm:p-8">

        <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

          <!-- INFORMACIÓN DE LA SESIÓN -->
          <div>
            <div class="mb-2 flex items-center gap-2">
              <span class="status-dot"></span>

              <span
                class="text-xs font-semibold uppercase tracking-[0.12em] text-black/45"
              >
                {{ isToday ? 'Hoy' : 'Última sesión' }}
              </span>
            </div>

            <p class="text-2xl font-semibold tracking-[-0.035em]">
              {{ workout.date | date:'EEEE, d MMMM' }}
            </p>
          </div>


          <!-- MÉTRICAS -->
          <div class="workout-metrics">

            <!-- INICIO -->
            <div class="metric-tile">

              <span class="metric-label">
                Inicio
              </span>

              <strong class="metric-value">
                {{ workout.started_at | date:'HH:mm' }}
              </strong>

              <small class="metric-description">
                hora
              </small>

            </div>


            <!-- DURACIÓN -->
            <div class="metric-tile">

              <span class="metric-label">
                Duración
              </span>

              <strong class="metric-value">
                {{ duration }}
              </strong>

              <small class="metric-description">
                sesión
              </small>

            </div>


            <!-- EJERCICIOS -->
            <div class="metric-tile">

              <span class="metric-label">
                Ejercicios
              </span>

              <strong class="metric-value">
                {{ workout.exercises.length }}
              </strong>

              <small class="metric-description">
                realizados
              </small>

            </div>

          </div>

        </div>

      </section>


      <!-- EJERCICIOS -->
      <div class="space-y-5">

        @for (exercise of workout.exercises; track exercise.exercise_id) {

          <section class="card overflow-hidden">

            <div class="border-b border-black/[0.06] bg-black/[0.01] px-6 py-5">

              <div class="flex items-center justify-between gap-4">

                <div>

                  <span
                    class="text-[10px] font-semibold uppercase tracking-[0.12em] text-black/35"
                  >
                    Ejercicio {{ $index + 1 }}
                  </span>

                  <h2 class="mt-1 font-semibold">
                    {{ exercise.name }}
                  </h2>

                </div>

                <span
                  class="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-black/50"
                >
                  {{ exercise.muscle_group }}
                </span>

              </div>

            </div>


            <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">

              <div>

                <div
                  class="grid grid-cols-3 gap-3 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-black/35"
                >
                  <span>Serie</span>
                  <span>Peso</span>
                  <span>Repeticiones</span>
                </div>

                @for (set of exercise.sets; track set.set_number) {

                  <div
                    class="grid grid-cols-3 gap-3 border-t border-black/[0.05] px-6 py-4 text-sm"
                  >
                    <span class="font-medium text-black/45">
                      {{ set.set_number }}
                    </span>

                    <span class="font-medium">
                      {{ set.weight_kg }} kg
                    </span>

                    <span class="font-medium">
                      {{ set.repetitions }}
                    </span>
                  </div>

                }

              </div>


              @if (exerciseImage(exercise.exercise_id)) {

                <div
                  class="mx-6 mb-6 overflow-hidden rounded-3xl border border-black/[0.06] bg-black/[0.02] lg:mx-0 lg:mr-6 lg:mt-5"
                >

                  <img
                    [src]="exerciseImage(exercise.exercise_id)"
                    [alt]="'Ilustración anatómica de ' + exercise.name"
                    class="block h-auto w-full"
                    loading="lazy"
                  />

                  @if (exerciseAsset(exercise.exercise_id); as asset) {

                    <div class="border-t border-black/[0.06] px-4 py-3">

                      <p
                        class="text-[10px] font-semibold uppercase tracking-[0.12em] text-black/35"
                      >
                        Músculo principal
                      </p>

                      <p class="mt-1 text-xs font-medium text-black/65">
                        {{ asset.primary }}
                      </p>

                      @if (asset.secondary.length) {

                        <p class="mt-2 text-[11px] leading-5 text-black/40">
                          También intervienen:
                          {{ asset.secondary.join(', ') }}
                        </p>

                      }

                    </div>

                  }

                </div>

              }

            </div>

          </section>

        }

      </div>

    }
  `,

  styles: [`

    /*
     * MÉTRICAS DEL ENTRENAMIENTO
     * --------------------------------
     * Desktop:
     * mantienen las tres métricas en una fila.
     *
     * Mobile:
     * cada métrica ocupa el mismo espacio,
     * evitando que los textos se superpongan.
     */

    .workout-metrics {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
      width: 100%;
    }


    .metric-tile {
      min-width: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      padding: 12px 6px;

      border: 1px solid rgba(0, 0, 0, 0.07);
      border-radius: 16px;

      background: rgba(0, 0, 0, 0.025);

      text-align: center;
    }


    .metric-label {
      display: block;

      width: 100%;

      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;

      color: rgba(0, 0, 0, 0.42);
    }


    .metric-value {
      display: block;

      margin-top: 4px;

      font-size: 18px;
      line-height: 1.2;
      font-weight: 600;

      white-space: nowrap;
    }


    .metric-description {
      display: block;

      margin-top: 3px;

      font-size: 10px;

      color: rgba(0, 0, 0, 0.38);
    }


    /*
     * DESKTOP
     */
    @media (min-width: 640px) {

      .workout-metrics {
        width: auto;
        min-width: 360px;
      }

      .metric-tile {
        padding: 12px 10px;
      }

    }


    /*
     * MÓVIL
     */
    @media (max-width: 639px) {

      .workout-metrics {
        gap: 7px;
      }

      .metric-tile {
        min-height: 82px;
      }

      .metric-value {
        font-size: 17px;
      }

    }

  `]
})
export class PreviousWorkoutComponent implements OnInit {

  private readonly api = inject(ApiService);

  workout: Workout | null = null;
  loading = true;


  exerciseImage(id: number): string {
    return getExerciseImage(id);
  }


  exerciseAsset(id: number) {
    return getExerciseAsset(id);
  }


  get isToday(): boolean {
    return !!this.workout && this.workout.date === this.localDate();
  }


  get duration(): string {

    if (!this.workout) return '—';

    const h = Math.floor(
      this.workout.duration_seconds / 3600
    );

    const m = Math.floor(
      (this.workout.duration_seconds % 3600) / 60
    );

    return h ? `${h}h ${m}m` : `${m}m`;
  }


  ngOnInit(): void {

    this.api.previousWorkout().subscribe({

      next: r => {
        this.workout = r.workout;
        this.loading = false;
      },

      error: () => {
        this.loading = false;
      }

    });

  }


  private localDate(): string {

    const d = new Date();

    const y = d.getFullYear();

    const m = String(
      d.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      d.getDate()
    ).padStart(2, '0');

    return `${y}-${m}-${day}`;
  }

}