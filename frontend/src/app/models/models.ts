export interface User {
  id: number;
  name: string;
  email: string;
}

export type MuscleGroup =
  | 'pecho'
  | 'hombro'
  | 'espalda'
  | 'pierna'
  | 'biceps'
  | 'triceps';

export interface Exercise {
  id: number;
  muscle_group: MuscleGroup;
  name: string;
  description?: string;
}

export interface WorkoutSet {
  set_number: number;
  weight_kg: number;
  repetitions: number;
}

export interface WorkoutExercise {
  exercise_id: number;
  name: string;
  muscle_group: MuscleGroup;
  sets: WorkoutSet[];
}

export interface Workout {
  id: number;
  date: string;
  started_at: string;
  duration_seconds: number;
  exercises: WorkoutExercise[];
  volume?: number;
  sets?: number;
}

export interface PreviousExercise {
  workout_id: number;
  date: string;
  started_at: string;
  exercise_id: number;
  name: string;
  muscle_group: MuscleGroup;
  sets: WorkoutSet[];
}

export interface TodayWorkout extends Workout {
  volume: number;
  sets: number;
}

export interface WorkoutSummary {
  id: number;
  date: string;
  started_at: string;
  duration_seconds: number;
  volume: number;
  sets: number;
  exercise_count: number;
  muscle_groups: MuscleGroup[];
}

export interface DashboardData {
  volume_by_day: {
    day: string;
    volume: number;
  }[];

  repetitions_by_exercise_day: {
    day: string;
    exercise: string;
    repetitions: number;
  }[];

  message: string | null;
  message_secondary: string | null;

  today_workouts: TodayWorkout[];

  today_total_duration_seconds: number;

  history: WorkoutSummary[];
}

export interface WorkoutPlan {
  id: number;
  name: string;
  created_at: string;
  exercises: Exercise[];
}