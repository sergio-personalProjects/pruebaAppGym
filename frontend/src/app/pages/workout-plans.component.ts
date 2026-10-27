import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { Observable } from 'rxjs';
import { Exercise, MuscleGroup, WorkoutPlan } from '../models/models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="mb-2 text-sm font-medium text-black/45">Tu biblioteca</p>
        <h1 class="text-4xl font-semibold tracking-[-0.055em]">Planes Workouts.</h1>
        <p class="mt-3 max-w-2xl text-black/50">Crea tus propias rutinas y reutilízalas cuando registres un entrenamiento.</p>
      </div>
      @if (!editing) {
        <button type="button" class="btn-primary" (click)="startNewPlan()">+ Nuevo plan</button>
      }
    </div>

    @if (editing) {
      <section class="card mb-6 p-5 sm:p-7">
        <div class="mb-7 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.12em] text-black/35">{{ editingId ? 'Editar plan' : 'Nuevo plan' }}</p>
            <h2 class="mt-1 text-2xl font-semibold tracking-[-0.035em]">Configura tu rutina.</h2>
            <p class="mt-2 text-sm text-black/45">El plan guarda los ejercicios. Las series, el peso y las repeticiones se registran después.</p>
          </div>
          <button type="button" class="btn-secondary" (click)="cancelEdit()">Cancelar</button>
        </div>

        <div class="mb-7">
          <label class="mb-2 block text-sm font-medium">Nombre del plan</label>
          <input class="input" type="text" maxlength="100" [(ngModel)]="planName" placeholder="Ej. Push, Pull, Pierna…">
        </div>

        <div class="space-y-4">
          @for (exerciseId of selectedExerciseIds; track $index; let i = $index) {
            <div class="flex items-end gap-3">
              <div class="min-w-0 flex-1">
                <label class="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-black/35">Ejercicio {{ i + 1 }}</label>
                <select class="input" [value]="exerciseId" (change)="setPlanExercise(i, $any($event.target).value)">
                  <option value="">Selecciona un ejercicio…</option>
                  @for (group of groupOrder; track group) {
                    <optgroup [label]="groupLabels[group]">
                      @for (exercise of grouped[group]; track exercise.id) {
                        <option [value]="exercise.id" [disabled]="isExerciseAlreadySelected(exercise.id, i)">{{ exercise.name }}</option>
                      }
                    </optgroup>
                  }
                </select>
              </div>
              <button type="button" class="mb-1 h-10 w-10 shrink-0 rounded-full text-xl text-black/30 transition hover:bg-red-50 hover:text-red-600" (click)="removePlanExercise(i)" aria-label="Eliminar ejercicio">×</button>
            </div>
          }
        </div>

        <button type="button" class="btn-secondary mt-5 !px-4 !py-2 text-xs" (click)="addPlanExercise()">+ Añadir ejercicio</button>

        @if (error) {
          <div class="mt-5 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700">{{ error }}</div>
        }

        <div class="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" class="btn-secondary" (click)="cancelEdit()">Cancelar</button>
          <button type="button" class="btn-primary" [disabled]="saving" (click)="savePlan()">{{ saving ? 'Guardando…' : (editingId ? 'Guardar cambios' : 'Crear plan') }}</button>
        </div>
      </section>
    }

    @if (!editing && error) {
      <div class="mb-6 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700">{{ error }}</div>
    }

    <section class="card overflow-hidden border-black/10">
      <div class="border-b border-black/[0.06] px-6 py-6 sm:px-7">
        <p class="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-black/35">Mis planes</p>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 class="text-2xl font-semibold tracking-[-0.035em]">Tus rutinas guardadas.</h2>
            <p class="mt-1 text-sm text-black/45">{{ plans.length }} {{ plans.length === 1 ? 'plan disponible' : 'planes disponibles' }}.</p>
          </div>
        </div>
      </div>

      @if (loading) {
        <div class="px-6 py-10 text-center text-sm text-black/45">Cargando planes…</div>
      } @else if (!plans.length) {
        <div class="px-6 py-12 text-center sm:px-7">
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-black/[0.025] text-lg">＋</div>
          <div class="mt-4 text-lg font-semibold">Todavía no tienes planes.</div>
          <p class="mx-auto mt-2 max-w-md text-sm leading-6 text-black/45">Crea tu primera rutina y podrás cargar todos sus ejercicios directamente desde Registrar entrenamiento.</p>
          <button type="button" class="btn-primary mt-5" (click)="startNewPlan()">Crear mi primer plan</button>
        </div>
      } @else {
        <div class="divide-y divide-black/[0.06]">
          @for (plan of plans; track plan.id) {
            <article class="px-6 py-6 sm:px-7">
              <div class="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div class="min-w-0">
                  <h3 class="text-xl font-semibold tracking-[-0.025em]">{{ plan.name }}</h3>
                  <p class="mt-1 text-sm text-black/45">{{ plan.exercises.length }} {{ plan.exercises.length === 1 ? 'ejercicio' : 'ejercicios' }}</p>
                </div>
                <div class="flex shrink-0 gap-2">
                  <button type="button" class="btn-secondary !px-4 !py-2 text-xs" (click)="editPlan(plan)">Editar</button>
                  <button type="button" class="rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50" (click)="deletePlan(plan)">Eliminar</button>
                </div>
              </div>

              <div class="mt-5 flex flex-wrap gap-2">
                @for (exercise of plan.exercises; track exercise.id; let i = $index) {
                  <span class="rounded-full border border-black/[0.08] bg-black/[0.025] px-3 py-1.5 text-xs text-black/60">{{ i + 1 }}. {{ exercise.name }}</span>
                }
              </div>
            </article>
          }
        </div>
      }
    </section>
  `
})
export class WorkoutPlansComponent implements OnInit {
  private readonly api = inject(ApiService);

  exercises: Exercise[] = [];
  plans: WorkoutPlan[] = [];
  grouped: Record<MuscleGroup, Exercise[]> = {
    pecho: [], hombro: [], espalda: [], pierna: [], biceps: [], triceps: []
  };
  groupOrder: MuscleGroup[] = ['pecho', 'hombro', 'espalda', 'pierna', 'biceps', 'triceps'];
  groupLabels: Record<MuscleGroup, string> = {
    pecho: 'Pecho', hombro: 'Hombro', espalda: 'Espalda',
    pierna: 'Pierna', biceps: 'Bíceps', triceps: 'Tríceps'
  };

  loading = true;
  saving = false;
  editing = false;
  editingId: number | null = null;
  planName = '';
  selectedExerciseIds: Array<number | ''> = [ '' ];
  error = '';

  ngOnInit(): void {
    this.api.exercises().subscribe({
      next: r => {
        this.exercises = r.exercises;
        this.groupOrder.forEach(group => this.grouped[group] = this.exercises.filter(e => e.muscle_group === group));
        this.loadPlans();
      },
      error: () => {
        this.loading = false;
        this.error = 'No se pudieron cargar los ejercicios.';
      }
    });
  }

  loadPlans(): void {
    this.loading = true;
    this.api.plans().subscribe({
      next: r => { this.plans = r.plans; this.loading = false; },
      error: err => { this.loading = false; this.error = err?.error?.message ?? 'No se pudieron cargar los planes.'; }
    });
  }

  startNewPlan(): void {
    this.editing = true;
    this.editingId = null;
    this.planName = '';
    this.selectedExerciseIds = [ '' ];
    this.error = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  editPlan(plan: WorkoutPlan): void {
    this.editing = true;
    this.editingId = plan.id;
    this.planName = plan.name;
    this.selectedExerciseIds = plan.exercises.map(e => e.id);
    if (!this.selectedExerciseIds.length) this.selectedExerciseIds = [ '' ];
    this.error = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.editing = false;
    this.editingId = null;
    this.error = '';
  }

  addPlanExercise(): void {
    this.selectedExerciseIds.push('');
  }

  removePlanExercise(index: number): void {
    if (this.selectedExerciseIds.length === 1) {
      this.selectedExerciseIds[0] = '';
      return;
    }
    this.selectedExerciseIds.splice(index, 1);
  }

  setPlanExercise(index: number, value: string): void {
    this.selectedExerciseIds[index] = value ? Number(value) : '';
  }

  isExerciseAlreadySelected(id: number, currentIndex: number): boolean {
    return this.selectedExerciseIds.some((value, index) => index !== currentIndex && value === id);
  }

  savePlan(): void {
    this.error = '';
    const name = this.planName.trim();
    const ids = this.selectedExerciseIds.filter((id): id is number => typeof id === 'number' && id > 0);

    if (name.length < 2) {
      this.error = 'El nombre del plan debe tener al menos 2 caracteres.';
      return;
    }
    if (!ids.length) {
      this.error = 'Añade al menos un ejercicio al plan.';
      return;
    }
    if (new Set(ids).size !== ids.length) {
      this.error = 'No puedes añadir el mismo ejercicio dos veces al mismo plan.';
      return;
    }

    this.saving = true;
    const payload = { name, exercise_ids: ids };
    const request: Observable<unknown> = this.editingId
      ? this.api.updatePlan(this.editingId, payload)
      : this.api.savePlan(payload);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.editing = false;
        this.editingId = null;
        this.loadPlans();
      },
      error: err => {
        this.saving = false;
        this.error = err?.error?.message ?? 'No se pudo guardar el plan.';
      }
    });
  }

  deletePlan(plan: WorkoutPlan): void {
    if (!window.confirm(`¿Quieres eliminar el plan «${plan.name}»?`)) return;

    this.error = '';
    this.api.deletePlan(plan.id).subscribe({
      next: () => {
        if (this.editingId === plan.id) this.cancelEdit();
        this.loadPlans();
      },
      error: err => this.error = err?.error?.message ?? 'No se pudo eliminar el plan.'
    });
  }
}
