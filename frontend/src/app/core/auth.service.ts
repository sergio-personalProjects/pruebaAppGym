import { Injectable, inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly userSubject = new BehaviorSubject<User | null>(null);

  readonly user$ = this.userSubject.asObservable();

  login(email: string, password: string): Observable<User> {
    return this.api.login(email, password).pipe(
      map(response => response.user),
      tap(user => this.userSubject.next(user))
    );
  }

  register(
    name: string,
    email: string,
    password: string
  ): Observable<User> {
    return this.api.register(name, email, password).pipe(
      map(response => response.user),
      tap(user => this.userSubject.next(user))
    );
  }

  restoreSession(): Observable<User | null> {
    return this.api.me().pipe(
      map(response => response.user),
      tap(user => this.userSubject.next(user)),
      catchError(() => {
        this.userSubject.next(null);
        return of(null);
      })
    );
  }

  logout(): void {
    this.api.logout().subscribe({
      next: () => this.finishLogout(),
      error: () => this.finishLogout()
    });
  }

  finishLogout(): void {
    this.userSubject.next(null);
    this.router.navigateByUrl('/login');
  }

  get user(): User | null {
    return this.userSubject.value;
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
