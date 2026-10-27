  import { Component, inject } from '@angular/core';
  import {
    FormBuilder,
    ReactiveFormsModule,
    Validators
  } from '@angular/forms';
  import { Router, RouterLink } from '@angular/router';
  import { finalize } from 'rxjs';
  import { AuthService } from '../core/auth.service';

  @Component({
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink],
    template: `
      <main class="min-h-screen px-5 py-10">

        <div
          class="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center"
        >

          <section class="card w-full p-8 sm:p-10">

            <!-- CABECERA -->
            <div class="mb-10">

              <div
                class="mb-5 text-3xl font-semibold tracking-[-0.06em]"
              >
                TUAPP<span>+</span>
              </div>

              <h1
                class="text-3xl font-semibold tracking-[-0.04em]"
              >
                Crea tu cuenta.
              </h1>

              <p class="mt-3 text-sm leading-6 text-black/50">
                Regístrate para guardar tus entrenamientos y consultar
                tu progreso.
              </p>

            </div>


            <!-- FORMULARIO -->
            <form
              [formGroup]="form"
              (ngSubmit)="submit()"
              class="space-y-5"
            >

              <!-- NOMBRE -->
              <div>

                <label
                  class="mb-2 block text-sm font-medium"
                  for="name"
                >
                  Nombre
                </label>

                <input
                  id="name"
                  class="input"
                  type="text"
                  formControlName="name"
                  placeholder="Tu nombre"
                  autocomplete="name"
                />

                @if (
                  form.controls.name.touched &&
                  form.controls.name.invalid
                ) {
                  <p class="mt-2 text-xs text-red-600">
                    Introduce tu nombre.
                  </p>
                }

              </div>


              <!-- EMAIL -->
              <div>

                <label
                  class="mb-2 block text-sm font-medium"
                  for="email"
                >
                  Email
                </label>

                <input
                  id="email"
                  class="input"
                  type="email"
                  formControlName="email"
                  placeholder="tu@email.com"
                  autocomplete="email"
                />

                @if (
                  form.controls.email.touched &&
                  form.controls.email.invalid
                ) {
                  <p class="mt-2 text-xs text-red-600">
                    Introduce un email válido.
                  </p>
                }

              </div>


              <!-- CONTRASEÑA -->
              <div>

                <label
                  class="mb-2 block text-sm font-medium"
                  for="password"
                >
                  Contraseña
                </label>

                <input
                  id="password"
                  class="input"
                  type="password"
                  formControlName="password"
                  placeholder="••••••••"
                  autocomplete="new-password"
                />

                <p class="mt-2 text-xs text-black/40">
                  Mínimo 8 caracteres.
                </p>

              </div>


              <!-- REPETIR CONTRASEÑA -->
              <div>

                <label
                  class="mb-2 block text-sm font-medium"
                  for="confirmPassword"
                >
                  Repetir contraseña
                </label>

                <input
                  id="confirmPassword"
                  class="input"
                  type="password"
                  formControlName="confirmPassword"
                  placeholder="••••••••"
                  autocomplete="new-password"
                />

                @if (
                  form.controls.confirmPassword.touched &&
                  form.controls.confirmPassword.value !==
                  form.controls.password.value
                ) {
                  <p class="mt-2 text-xs text-red-600">
                    Las contraseñas no coinciden.
                  </p>
                }

              </div>


              <!-- ERROR -->
              @if (error) {

                <div
                  class="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {{ error }}
                </div>

              }


              <!-- CREAR CUENTA -->
              <button
                type="submit"
                class="btn-primary w-full py-3"
                [disabled]="loading || form.invalid"
              >
                {{ loading ? 'Creando cuenta…' : 'Crear cuenta' }}
              </button>

            </form>


            <!-- VOLVER -->
            <div class="mt-7 text-center">

              <a
                routerLink="/login"
                class="text-sm font-medium text-black/50 transition hover:text-black"
              >
                ← Volver a iniciar sesión
              </a>

            </div>

          </section>

        </div>

      </main>
    `
  })
  export class RegisterComponent {

    private readonly fb = inject(FormBuilder);
    private readonly auth = inject(AuthService);
    private readonly router = inject(Router);

    form = this.fb.nonNullable.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2)
        ]
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8)
        ]
      ],

      confirmPassword: [
        '',
        [
          Validators.required
        ]
      ]
    });

    loading = false;
    error = '';


    submit(): void {

      if (this.form.invalid) {
        this.form.markAllAsTouched();
        return;
      }

      const {
        name,
        email,
        password,
        confirmPassword
      } = this.form.getRawValue();


      if (password !== confirmPassword) {
        this.error = 'Las contraseñas no coinciden.';
        return;
      }


      this.loading = true;
      this.error = '';


      this.auth
        .register(name.trim(), email.trim(), password)
        .pipe(
          finalize(() => this.loading = false)
        )
        .subscribe({

          next: () => {
            this.router.navigateByUrl('/resumen');
          },

          error: err => {
            this.error =
              err?.error?.message ??
              'No se pudo crear la cuenta.';
          }

        });
    }
  }