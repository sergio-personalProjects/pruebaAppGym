import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api.service';
import { Exercise, MuscleGroup } from '../models/models';
import { getExerciseAsset, getExerciseImage } from '../core/exercise-assets';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-8">
      <p class="mb-2 text-sm font-medium text-black/45">Biblioteca</p>
      <h1 class="text-4xl font-semibold tracking-[-0.055em]">Ejercicios.</h1>
      <p class="mt-3 max-w-2xl text-black/50">Ejercicios organizados por grupo muscular para que registrar una sesión sea rápido.</p>
    </div>

    <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      @for (group of groupOrder; track group) {
        <section class="card p-6">
          <div class="mb-5 flex items-center justify-between">
            <h2 class="text-lg font-semibold">{{ labels[group] }}</h2>
            <span class="rounded-full bg-black/[0.05] px-3 py-1 text-xs text-black/45">{{ grouped[group].length }}</span>
          </div>
          <div class="space-y-2">
            @for (exercise of grouped[group]; track exercise.id) {
              <div class="overflow-hidden rounded-2xl border border-black/[0.06] bg-black/[0.02]">
                <div class="flex items-center gap-4 p-3">
                  <div class="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
                    <img [src]="exerciseImage(exercise.id)" [alt]="'Ilustración anatómica de ' + exercise.name" class="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div class="min-w-0">
                    <div class="text-sm font-medium">{{ exercise.name }}</div>
                    <div class="mt-1 text-xs leading-5 text-black/40">{{ exercise.description }}</div>
                    @if (exerciseAsset(exercise.id); as asset) {
                      <div class="mt-2 text-[10px] font-medium uppercase tracking-[0.08em] text-black/35">Principal: {{ asset.primary }}</div>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </section>
      }
    </div>
  `
})
export class ExercisesComponent implements OnInit {
  private readonly api = inject(ApiService);
  groupOrder: MuscleGroup[] = ['pecho','hombro','espalda','pierna','biceps','triceps'];
  labels: Record<MuscleGroup,string> = {
    pecho:'Pecho', hombro:'Hombro', espalda:'Espalda',
    pierna:'Pierna', biceps:'Bíceps', triceps:'Tríceps'
  };
  grouped: Record<MuscleGroup, Exercise[]> = {
    pecho: [], hombro: [], espalda: [], pierna: [], biceps: [], triceps: []
  };

  exerciseImage(id: number): string { return getExerciseImage(id); }

  exerciseAsset(id: number) { return getExerciseAsset(id); }

  ngOnInit(): void {
    this.api.exercises().subscribe(r => {
      for (const group of this.groupOrder) {
        this.grouped[group] = r.exercises.filter(e => e.muscle_group === group);
      }
    });
  }
}
