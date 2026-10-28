import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  DashboardData,
  Exercise,
  PreviousExercise,
  Workout,
  User,
  WorkoutPlan
} from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private readonly http = inject(HttpClient);

  private readonly base = '/api';

  login(
    email: string,
    password: string
  ): Observable<{ user: User }> {

    return this.http.post<{ user: User }>(
      `${this.base}/auth/login`,
      {
        email,
        password
      },
      {
        withCredentials: true
      }
    );
  }

  register(
    name: string,
    email: string,
    password: string
  ): Observable<{ user: User }> {

    return this.http.post<{ user: User }>(
      `${this.base}/auth/register`,
      {
        name,
        email,
        password
      },
      {
        withCredentials: true
      }
    );
  }

  me(): Observable<{ user: User }> {

    return this.http.get<{ user: User }>(
      `${this.base}/auth/me`,
      {
        withCredentials: true
      }
    );
  }

  logout(): Observable<{ message: string }> {

    return this.http.post<{ message: string }>(
      `${this.base}/auth/logout`,
      {},
      {
        withCredentials: true
      }
    );
  }

  exercises(): Observable<{ exercises: Exercise[] }> {

    return this.http.get<{ exercises: Exercise[] }>(
      `${this.base}/exercises`,
      {
        withCredentials: true
      }
    );
  }

  saveWorkout(
    payload: unknown
  ): Observable<{ id: number }> {

    return this.http.post<{ id: number }>(
      `${this.base}/workouts`,
      payload,
      {
        withCredentials: true
      }
    );
  }

  previousWorkout(): Observable<{ workout: Workout | null }> {

    return this.http.get<{ workout: Workout | null }>(
      `${this.base}/workouts/previous`,
      {
        withCredentials: true
      }
    );
  }

  previousExercise(
    exerciseId: number
  ): Observable<{ workout: PreviousExercise | null }> {

    return this.http.get<{ workout: PreviousExercise | null }>(
      `${this.base}/workouts/previous-exercise/${exerciseId}`,
      {
        withCredentials: true
      }
    );
  }

  workoutById(
    id: number
  ): Observable<{ workout: Workout | null }> {

    return this.http.get<{ workout: Workout | null }>(
      `${this.base}/workouts/${id}`,
      {
        withCredentials: true
      }
    );
  }

  dashboard(
    volumeDays: number = 30
  ): Observable<DashboardData> {

    return this.http.get<DashboardData>(
      `${this.base}/dashboard?volume_days=${volumeDays}`,
      {
        withCredentials: true
      }
    );
  }

  plans(): Observable<{ plans: WorkoutPlan[] }> {

    return this.http.get<{ plans: WorkoutPlan[] }>(
      `${this.base}/plans`,
      {
        withCredentials: true
      }
    );
  }

  planById(
    id: number
  ): Observable<{ plan: WorkoutPlan | null }> {

    return this.http.get<{ plan: WorkoutPlan | null }>(
      `${this.base}/plans/${id}`,
      {
        withCredentials: true
      }
    );
  }

  savePlan(
    payload: {
      name: string;
      exercise_ids: number[];
    }
  ): Observable<{ id: number }> {

    return this.http.post<{ id: number }>(
      `${this.base}/plans`,
      payload,
      {
        withCredentials: true
      }
    );
  }

  updatePlan(
    id: number,
    payload: {
      name: string;
      exercise_ids: number[];
    }
  ): Observable<{ message: string }> {

    return this.http.put<{ message: string }>(
      `${this.base}/plans/${id}`,
      payload,
      {
        withCredentials: true
      }
    );
  }

  deletePlan(
    id: number
  ): Observable<{ message: string }> {

    return this.http.delete<{ message: string }>(
      `${this.base}/plans/${id}`,
      {
        withCredentials: true
      }
    );
  }
}
