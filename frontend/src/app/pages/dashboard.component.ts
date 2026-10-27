import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { ApiService } from '../core/api.service';
import { DashboardData, MuscleGroup, TodayWorkout, Workout, WorkoutSummary } from '../models/models';

Chart.register(...registerables);

interface HistoryDateGroup {
  date: string;
  day: string;
  dayNumber: string;
  label: string;
  workouts: WorkoutSummary[];
  expanded: boolean;
  totalDurationSeconds: number;
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="mb-2 text-sm font-medium text-black/45">Resumen principal</p>
        <h1 class="text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Tu progreso.</h1>
        <p class="mt-3 max-w-xl text-black/50">Una vista limpia de la carga que has movido y de la evolución de tus entrenamientos.</p>
      </div>
      <a routerLink="/registrar" class="btn-primary inline-flex items-center justify-center gap-2">
        <span class="text-base leading-none">+</span> Registrar entrenamiento
      </a>
    </div>

    @if (data?.message; as message) {
      <div class="mb-6 rounded-[24px] border border-black/10 bg-[#1d1d1f] px-6 py-5 text-white shadow-[0_14px_35px_rgba(0,0,0,.12)]">
        <div class="flex items-start gap-3">
          <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10">✓</div>
          <div>
            <div class="text-sm font-semibold">Buen trabajo</div>
            <div class="mt-1 text-sm text-white/65">{{ message }}</div>
            @if (data?.message_secondary; as secondary) {
              <div class="mt-1 text-sm text-white/65">{{ secondary }}</div>
            }
          </div>
        </div>
      </div>
    }

    <!-- Entrenamiento de hoy -->
    <section class="card mb-6 overflow-hidden border-black/10">
      <div class="border-b border-black/[0.06] px-6 py-6 sm:px-7">
        <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div class="mb-2 flex items-center gap-2">
              <span class="status-dot"></span>
              <span class="text-xs font-semibold uppercase tracking-[0.12em] text-black/45">Entrenamiento de hoy</span>
            </div>
            <h2 class="text-2xl font-semibold tracking-[-0.035em]">{{ todayWorkouts.length ? 'Tus sesiones de hoy.' : 'Sin entrenamiento todavía.' }}</h2>
            @if (todayWorkouts.length) {
              <p class="mt-1 text-sm text-black/45">{{ todayWorkouts.length }} {{ todayWorkouts.length === 1 ? 'sesión realizada' : 'sesiones realizadas' }} hoy</p>
            } @else {
              <p class="mt-1 text-sm text-black/45">Cuando guardes una sesión aparecerá aquí automáticamente.</p>
            }
          </div>

          @if (todayWorkouts.length) {
            <div class="today-summary">
              <div>
                <span>Sesiones</span>
                <strong>{{ todayWorkouts.length }}</strong>
              </div>
              <div>
                <span>Tiempo total</span>
                <strong>{{ duration(data?.today_total_duration_seconds ?? 0) }}</strong>
              </div>
            </div>
          }
        </div>
      </div>

      @if (todayWorkouts.length) {
        <div class="divide-y divide-black/[0.06]">
          @for (workout of todayWorkouts; track workout.id; let i = $index) {
            <button type="button" class="group flex w-full items-center gap-5 px-6 py-5 text-left transition duration-200 hover:bg-black/[0.025] sm:px-7" (click)="openWorkout(workout)">
              <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-black/[0.09] bg-black/[0.025] text-sm font-semibold text-black/55">{{ i + 1 }}</div>

              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span class="text-[15px] font-semibold">Entrenamiento {{ i + 1 }}</span>
                  <span class="text-black/20">·</span>
                  <span class="text-[13px] text-black/50">{{ workout.started_at | date:'HH:mm' }}</span>
                </div>

                <div class="mt-2 flex flex-wrap gap-1.5">
                  @for (group of muscleGroups(workout.exercises); track group) {
                    <span class="exercise-chip">{{ muscleGroupLabel(group) }}</span>
                  }
                </div>
              </div>

              <div class="hidden shrink-0 items-center gap-8 sm:flex">
                <div class="text-right">
                  <strong class="block text-sm font-semibold">{{ duration(workout.duration_seconds) }}</strong>
                  <span class="mt-1 block text-[10px] font-semibold uppercase tracking-[0.08em] text-black/35">Duración</span>
                </div>
                <div class="min-w-[92px] text-right">
                  <strong class="block text-sm font-semibold">{{ workout.volume | number:'1.0-1' }} kg</strong>
                  <span class="mt-1 block text-[10px] font-semibold uppercase tracking-[0.08em] text-black/35">Volumen</span>
                </div>
              </div>

              <div class="shrink-0 text-right sm:hidden">
                <strong class="block text-sm font-semibold">{{ duration(workout.duration_seconds) }}</strong>
                <span class="mt-1 block text-[10px] text-black/35">{{ workout.volume | number:'1.0-1' }} kg</span>
              </div>

              <span class="shrink-0 text-2xl leading-none text-black/25 transition-transform duration-200 group-hover:translate-x-1">›</span>
            </button>
          }
        </div>
      } @else {
        <div class="px-6 py-7 sm:px-7">
          <a routerLink="/registrar" class="btn-secondary">Empezar sesión <span class="ml-2">→</span></a>
        </div>
      }
    </section>

    <!-- Histórico -->
    <section class="card mb-6 overflow-hidden border-black/10">
      <div class="border-b border-black/[0.06] px-6 py-6 sm:px-7">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-black/35">Histórico</p>
            <h2 class="text-2xl font-semibold tracking-[-0.035em]">Todos tus entrenamientos.</h2>
            <p class="mt-1 text-sm text-black/45">Selecciona una fecha para consultar los entrenamientos realizados ese día.</p>
          </div>
          @if (history.length) {
            <span class="section-badge self-start sm:self-auto">{{ history.length }} {{ history.length === 1 ? 'entrenamiento' : 'entrenamientos' }}</span>
          }
        </div>
      </div>

      @if (historyGroups.length) {
        <div class="divide-y divide-black/[0.06]">
          @for (group of historyGroups; track group.date) {
            <div>
              <button
                type="button"
                class="history-day-row group"
                [attr.aria-expanded]="group.expanded"
                (click)="toggleHistoryDate(group)"
              >
                <div class="history-day-number">
                  <span>{{ group.day }}</span>
                  <strong>{{ group.dayNumber }}</strong>
                </div>

                <div class="min-w-0 flex-1 text-left">
                  <div class="text-[15px] font-semibold">{{ group.label }}</div>
                  <div class="mt-2 text-sm text-black/50">
                    Tiempo total de entrenamiento:
                    <span class="font-medium text-black/65">{{ duration(group.totalDurationSeconds) }}</span>
                  </div>
                </div>

                <div class="history-day-stat">
                  <strong>{{ group.workouts.length }}</strong>
                  <span>{{ group.workouts.length === 1 ? 'Entrenamiento' : 'Entrenamientos' }}</span>
                </div>

                <span class="history-day-chevron" [class.history-day-chevron-open]="group.expanded">›</span>
              </button>

              @if (group.expanded) {
                <div class="history-date-workouts">
                  @for (workout of group.workouts; track workout.id; let i = $index) {
                    <button
                      type="button"
                      class="dashboard-workout-row history-workout-row group"
                      (click)="openWorkoutById(workout.id)"
                    >
                      <div class="workout-list-index">{{ i + 1 }}</div>

                      <div class="min-w-0 flex-1">
                        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span class="text-[15px] font-semibold">Entrenamiento {{ i + 1 }}</span>
                          <span class="text-black/20">·</span>
                          <span class="text-[13px] text-black/50">{{ workout.started_at | date:'HH:mm' }}</span>
                        </div>

                        <div class="mt-2 flex flex-wrap gap-1.5">
                          @for (muscleGroup of workout.muscle_groups; track muscleGroup) {
                            <span class="exercise-chip">{{ muscleGroupLabel(muscleGroup) }}</span>
                          }
                        </div>
                      </div>

                      <div class="workout-list-stats">
                        <div>
                          <strong>{{ duration(workout.duration_seconds) }}</strong>
                          <span>Duración</span>
                        </div>
                        <div>
                          <strong>{{ workout.exercise_count }}</strong>
                          <span>{{ workout.exercise_count === 1 ? 'Ejercicio' : 'Ejercicios' }}</span>
                        </div>
                        <div class="min-w-[92px]">
                          <strong>{{ workout.volume | number:'1.0-1' }} kg</strong>
                          <span>Volumen</span>
                        </div>
                      </div>

                      <div class="shrink-0 text-right sm:hidden">
                        <strong class="block text-sm font-semibold">{{ duration(workout.duration_seconds) }}</strong>
                        <span class="mt-1 block text-[10px] text-black/35">{{ workout.volume | number:'1.0-1' }} kg</span>
                      </div>

                      <span class="workout-chevron group-hover:translate-x-1">›</span>
                    </button>
                  }
                </div>
              }
            </div>
          }
        </div>
      } @else {
        <div class="px-6 py-10 text-center sm:px-7">
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-black/[0.025] text-lg">○</div>
          <div class="mt-4 text-lg font-semibold">Todavía no hay entrenamientos.</div>
          <p class="mt-2 text-sm text-black/45">Cuando completes una sesión aparecerá aquí.</p>
        </div>
      }
    </section>

        <!-- Gráficas -->
    <div class="grid gap-6 xl:grid-cols-2">
      <section class="card p-5 sm:p-7">
        <div class="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 class="text-lg font-semibold">Volumen por día</h2>
            <p class="mt-1 text-sm text-black/45">Volumen = peso × repeticiones. La sesión de hoy se incluye automáticamente.</p>
          </div>
          <select class="section-filter" aria-label="Periodo del volumen" [value]="volumeDays" (change)="changeVolumeRange($any($event.target).value)">
            <option [value]="30">30 días</option>
            <option [value]="180">6 meses</option>
            <option [value]="365">1 año</option>
            <option [value]="0">Total</option>
          </select>
        </div>
        <div class="relative h-72"><canvas #volumeCanvas></canvas></div>
      </section>

      <section class="card p-5 sm:p-7">
        <div class="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold">Repeticiones por ejercicio</h2>
            <p class="mt-1 text-sm text-black/45">Repeticiones acumuladas por ejercicio y día, incluida la sesión de hoy.</p>
          </div>
          <span class="section-badge">Historial</span>
        </div>
        <div class="relative h-72"><canvas #repsCanvas></canvas></div>
      </section>
    </div>

    <!-- Detalle -->
    @if (selectedWorkout; as workout) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" (click)="closeWorkout()">
        <div class="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-black/10 bg-[#f5f5f7] shadow-[0_25px_80px_rgba(0,0,0,.22)]" (click)="$event.stopPropagation()">
          <div class="sticky top-0 z-10 border-b border-black/[0.07] bg-[#f5f5f7]/95 px-6 py-5 backdrop-blur-xl sm:px-7">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.12em] text-black/35">Detalle del entrenamiento</p>
                <h2 class="mt-1 text-2xl font-semibold tracking-[-0.035em]">Entrenamiento {{ workoutNumber(workout) }}</h2>
                <p class="mt-1 text-sm text-black/45">{{ workout.date | date:'EEEE, d MMMM yyyy' }} · {{ workout.started_at | date:'HH:mm' }}</p>
              </div>
              <button type="button" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-lg text-black/50 transition hover:text-black" (click)="closeWorkout()" aria-label="Cerrar">×</button>
            </div>

            <div class="mt-5 grid grid-cols-3 gap-2">
              <div class="metric-tile"><span>Duración</span><strong class="text-base sm:text-xl">{{ duration(workout.duration_seconds) }}</strong><small>sesión</small></div>
              <div class="metric-tile"><span>Volumen</span><strong class="text-base sm:text-xl">{{ workout.volume | number:'1.0-1' }}</strong><small>kg</small></div>
              <div class="metric-tile"><span>Series</span><strong class="text-base sm:text-xl">{{ workout.sets }}</strong><small>totales</small></div>
            </div>
          </div>

          <div class="space-y-4 p-4 sm:p-6">
            @for (exercise of workout.exercises; track exercise.exercise_id + '-' + $index) {
              <section class="card overflow-hidden">
                <div class="border-b border-black/[0.06] bg-black/[0.01] px-5 py-4">
                  <div class="flex items-center justify-between gap-4">
                    <div>
                      <span class="text-[10px] font-semibold uppercase tracking-[0.12em] text-black/35">Ejercicio {{ $index + 1 }}</span>
                      <h3 class="mt-1 font-semibold">{{ exercise.name }}</h3>
                    </div>
                    <span class="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-black/50">{{ muscleGroupLabel(exercise.muscle_group) }}</span>
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-3 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-black/30">
                  <span>Serie</span><span>Peso</span><span>Repeticiones</span>
                </div>

                @for (set of exercise.sets; track set.set_number) {
                  <div class="grid grid-cols-3 gap-3 border-t border-black/[0.05] px-5 py-3 text-sm">
                    <span class="font-medium text-black/45">{{ set.set_number }}</span>
                    <span class="font-medium">{{ set.weight_kg }} kg</span>
                    <span class="font-medium">{{ set.repetitions }}</span>
                  </div>
                }
              </section>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  private readonly api = inject(ApiService);

  @ViewChild('volumeCanvas') volumeCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('repsCanvas') repsCanvas!: ElementRef<HTMLCanvasElement>;

  data: DashboardData | null = null;
  selectedWorkout: Workout | null = null;
  volumeDays = 30;
  loading = false;
  historyGroups: HistoryDateGroup[] = [];

  private volumeChart?: Chart;
  private repsChart?: Chart;

  get todayWorkouts(): TodayWorkout[] {
    return this.data?.today_workouts ?? [];
  }

  get history(): WorkoutSummary[] {
    return this.data?.history ?? [];
  }

  ngAfterViewInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;

    this.api.dashboard(this.volumeDays).subscribe({
      next: data => {
        this.data = data;
        this.buildHistoryGroups();
        this.loading = false;
        queueMicrotask(() => this.renderCharts(data));
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  changeVolumeRange(value: string): void {
    const days = Number(value);
    if (![0, 30, 180, 365].includes(days) || days === this.volumeDays) return;
    this.volumeDays = days;
    this.loadDashboard();
  }

  private buildHistoryGroups(): void {
    const workouts = this.history;
    const groups = new Map<string, HistoryDateGroup>();

    for (const workout of workouts) {
      const date = workout.date;

      if (!groups.has(date)) {
        const [year, month, day] = date.split('-').map(Number);
        const dateValue = new Date(year, month - 1, day);
        const weekday = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(dateValue);
        const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(dateValue);

        groups.set(date, {
          date,
          day: weekday.charAt(0).toUpperCase() + weekday.slice(1),
          dayNumber: String(day).padStart(2, '0'),
          label: `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`,
          workouts: [],
          expanded: false,
          totalDurationSeconds: 0
        });
      }

      const group = groups.get(date)!;
      group.workouts.push(workout);
      group.totalDurationSeconds += Number(workout.duration_seconds) || 0;
    }

    this.historyGroups = Array.from(groups.values());
  }

  toggleHistoryDate(group: HistoryDateGroup): void {
    group.expanded = !group.expanded;
  }

  openWorkout(workout: TodayWorkout): void {
    this.selectedWorkout = workout;
  }

  openWorkoutById(id: number): void {
    this.api.workoutById(id).subscribe({
      next: response => {
        this.selectedWorkout = response.workout;
      }
    });
  }

  closeWorkout(): void {
    this.selectedWorkout = null;
  }

  workoutNumber(workout: Workout): number {
    const index = this.history.findIndex(item => item.id === workout.id);
    return index >= 0 ? index + 1 : 0;
  }

  duration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h) return `${h} h ${m} min`;
    if (m) return `${m} min`;
    return `${s} s`;
  }

  muscleGroups(exercises: { muscle_group: MuscleGroup }[]): MuscleGroup[] {
    return [...new Set(exercises.map(exercise => exercise.muscle_group))];
  }

  muscleGroupLabel(group: MuscleGroup): string {
    const labels: Record<MuscleGroup, string> = {
      pecho: 'Pecho',
      hombro: 'Hombro',
      espalda: 'Espalda',
      pierna: 'Pierna',
      biceps: 'Bíceps',
      triceps: 'Tríceps'
    };
    return labels[group];
  }

  private renderCharts(data: DashboardData): void {
    if (!this.volumeCanvas?.nativeElement || !this.repsCanvas?.nativeElement) return;

    this.volumeChart?.destroy();
    this.repsChart?.destroy();

    this.volumeChart = new Chart(this.volumeCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: data.volume_by_day.map(x => this.formatDay(x.day)),
        datasets: [{
          label: 'Volumen',
          data: data.volume_by_day.map(x => Number(x.volume)),
          tension: .35,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5
        }]
      },
      options: this.options()
    });

    this.repsChart = new Chart(this.repsCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: data.repetitions_by_exercise_day.map(x => `${this.formatDay(x.day)} · ${x.exercise}`),
        datasets: [{
          label: 'Repeticiones',
          data: data.repetitions_by_exercise_day.map(x => Number(x.repetitions)),
          borderRadius: 8
        }]
      },
      options: this.options()
    });
  }

  private options(): object {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: 'rgba(29,29,31,.45)' } },
        y: { grid: { display: false }, beginAtZero: true, ticks: { color: 'rgba(29,29,31,.45)' } }
      }
    };
  }

  private formatDay(value: string): string {
    const [_, m, d] = value.split('-');
    return `${d}/${m}`;
  }

  ngOnDestroy(): void {
    this.volumeChart?.destroy();
    this.repsChart?.destroy();
  }
}
