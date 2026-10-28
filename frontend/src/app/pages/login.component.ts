import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="min-h-screen px-5 py-10">
      <div class="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <section class="card w-full p-8 sm:p-10">
          <div class="mb-10">
            <!--<img
  src="assets/gymgadget-logo.png"
  alt="GymGadget"
  class="mb-5 h-12 w-auto object-contain object-left"
/>-->
            <div class="mb-5 text-3xl font-semibold tracking-[-0.06em]">TUAPP<span>+</span></div>
            <h1 class="text-3xl font-semibold tracking-[-0.04em]">Tu entrenamiento, claro.</h1>
            <p class="mt-3 text-sm leading-6 text-black/50">Registra tus sesiones y descubre cómo evoluciona tu rendimiento.</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
            <div>
              <label class="mb-2 block text-sm font-medium">Email</label>
              <input class="input" type="email" formControlName="email" placeholder="tu@email.com">
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium">Contraseña</label>
              <input class="input" type="password" formControlName="password" placeholder="••••••••">
            </div>

            @if (error) {
              <div class="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{{ error }}</div>
            }

            <button class="btn-primary w-full py-3" [disabled]="loading || form.invalid">
              {{ loading ? 'Entrando…' : 'Iniciar sesión' }}
            </button>
            <a routerLink="/registro"  class="btn-secondary mt-3 w-full py-3 text-center">Registrarse</a>
          </form>

          <div class="mt-7 rounded-2xl bg-black/[0.035] p-4 text-xs leading-5 text-black/50">
            Demo local: <strong>demo&#64;tuapp.local</strong> · <strong>Demo1234!</strong>
          </div>
        </section>
      </div>
    </main>
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  form = this.fb.nonNullable.group({
    email: ['demo@tuapp.local', [Validators.required, Validators.email]],
    password: ['Demo1234!', Validators.required]
  });

  loading = false;
  error = '';

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => this.router.navigateByUrl('/resumen'),
        error: err => this.error = err?.error?.message ?? 'No se pudo iniciar sesión.'
      });
  }
}
