import { Component, inject } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-screen">

      <header
        class="sticky top-0 z-30 border-b border-black/[0.07] bg-[#f5f5f7]/90 backdrop-blur-2xl"
      >
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 lg:px-8">
          <a
  routerLink="/resumen"
  class="brand group flex shrink-0 select-none items-center"
  aria-label="GymGadget inicio"
  (click)="closeMenu()"
>
  <img
    src="assets/gymgadget-logo.png"
    alt="GymGadget"
    class="h-10 w-auto object-contain"
  />
</a>

          <div class="flex min-w-0 items-center gap-3">
            <span class="hidden truncate rounded-full border border-black/[0.08] bg-white/75 px-3 py-1.5 text-sm text-black/55 sm:inline-block">
              Hola, {{ auth.user?.name }}
            </span>

            <button class="btn-secondary shrink-0 !px-4 !py-2 text-xs" (click)="auth.logout()">
              Salir
            </button>

            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.08] bg-white/75 text-black/65 transition-all duration-200 hover:bg-white hover:text-black sm:hidden"
              (click)="toggleMenu()"
              [attr.aria-expanded]="menuOpen"
              aria-label="Abrir menú"
            >
              @if (!menuOpen) {
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="h-5 w-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
                </svg>
              }
              @if (menuOpen) {
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="h-5 w-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              }
            </button>
          </div>
        </div>

        <div class="mx-auto hidden max-w-7xl px-5 lg:px-8 sm:block">
          <nav class="main-nav flex items-center justify-center pb-4" aria-label="Navegación principal">
            <a routerLink="/resumen" routerLinkActive="nav-link-active" [routerLinkActiveOptions]="{ exact: true }" class="nav-link mr-4 text-black/55 hover:text-black">
              Resumen principal
            </a>
            <span class="mr-4">|</span>

            <a routerLink="/anterior" routerLinkActive="nav-link-active" class="nav-link mr-4 text-black/55 hover:text-black">
              Entrenamiento anterior
            </a>
            <span class="mr-4">|</span>

            <a routerLink="/registrar" routerLinkActive="nav-link-active" class="nav-link mr-4 text-black/55 hover:text-black">
              Registrar entrenamiento
            </a>
            <span class="mr-4">|</span>

            <a routerLink="/planes" routerLinkActive="nav-link-active" class="nav-link mr-4 text-black/55 hover:text-black">
              Planes Workouts
            </a>
            <span class="mr-4">|</span>

            <a routerLink="/ejercicios" routerLinkActive="nav-link-active" class="nav-link text-black/55 hover:text-black">
              Ejercicios
            </a>
          </nav>
        </div>

        @if (menuOpen) {
          <div class="border-t border-black/[0.06] bg-white/80 px-5 pb-4 pt-2 backdrop-blur-2xl sm:hidden">
            <nav class="mx-auto flex max-w-md flex-col" aria-label="Navegación móvil">
              <a routerLink="/resumen" routerLinkActive="mobile-nav-active" [routerLinkActiveOptions]="{ exact: true }" class="mobile-nav-link" (click)="closeMenu()">
                <span>Resumen principal</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
              </a>

              <a routerLink="/anterior" routerLinkActive="mobile-nav-active" class="mobile-nav-link" (click)="closeMenu()">
                <span>Entrenamiento anterior</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
              </a>

              <a routerLink="/registrar" routerLinkActive="mobile-nav-active" class="mobile-nav-link" (click)="closeMenu()">
                <span>Registrar entrenamiento</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
              </a>

              <a routerLink="/planes" routerLinkActive="mobile-nav-active" class="mobile-nav-link" (click)="closeMenu()">
                <span>Planes Workouts</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
              </a>

              <a routerLink="/ejercicios" routerLinkActive="mobile-nav-active" class="mobile-nav-link" (click)="closeMenu()">
                <span>Ejercicios</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
              </a>
            </nav>
          </div>
        }
      </header>

      <main class="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .mobile-nav-link {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 15px 4px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      color: rgba(0, 0, 0, 0.58);
      font-size: 0.95rem;
      font-weight: 500;
      transition: color 0.2s ease, padding-left 0.2s ease, background-color 0.2s ease;
    }
    .mobile-nav-link:last-child { border-bottom: none; }
    .mobile-nav-link:hover { color: rgba(0, 0, 0, 0.9); padding-left: 8px; }
    .mobile-nav-active { color: rgba(0, 0, 0, 0.95) !important; font-weight: 600; }
  `]
})
export class ShellComponent {
  readonly auth = inject(AuthService);
  menuOpen = false;

  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  closeMenu(): void { this.menuOpen = false; }
}
