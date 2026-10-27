import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';

import { LoginComponent } from './pages/login.component';
import { RegisterComponent } from './pages/register.component';

import { ShellComponent } from './layout/shell.component';

import { DashboardComponent } from './pages/dashboard.component';

import { PreviousWorkoutComponent } from './pages/previous-workout.component';

import { WorkoutRegisterComponent } from './pages/workout-register.component';

import { ExercisesComponent } from './pages/exercises.component';

import { WorkoutPlansComponent } from './pages/workout-plans.component';


export const routes: Routes = [

  /*
   * RUTAS PÚBLICAS
   */

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'registro',
    component: RegisterComponent
  },


  /*
   * RUTAS PROTEGIDAS
   */

  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],

    children: [

      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'resumen'
      },

      {
        path: 'resumen',
        component: DashboardComponent
      },

      {
        path: 'anterior',
        component: PreviousWorkoutComponent
      },

      {
        path: 'registrar',
        component: WorkoutRegisterComponent
      },

      {
        path: 'planes',
        component: WorkoutPlansComponent
      },

      {
        path: 'ejercicios',
        component: ExercisesComponent
      }

    ]
  },


  /*
   * CUALQUIER RUTA DESCONOCIDA
   */

  {
    path: '**',
    redirectTo: ''
  }

];