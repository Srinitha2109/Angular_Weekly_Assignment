import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'TRAINER' | 'CLIENT';
    companyId?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:5000/users';

    // Auth state using signals
    private currentUserSignal = signal<User | null>(this.getStoredUser());

    currentUser = this.currentUserSignal.asReadonly();
    isAuthenticated = computed(() => !!this.currentUserSignal());
    userRole = computed(() => this.currentUserSignal()?.role);

    constructor(private http: HttpClient, private router: Router) { }

    login(email: string, password: string): Observable<User[]> {
        return this.http.get<User[]>(`${this.apiUrl}?email=${email}&password=${password}`).pipe(
            tap(users => {
                if (users.length > 0) {
                    this.setCurrentUser(users[0]);
                }
            })
        );
    }

    logout() {
        localStorage.removeItem('user');
        this.currentUserSignal.set(null);
        this.router.navigate(['/login']);
    }

    private setCurrentUser(user: User) {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSignal.set(user);
    }

    private getStoredUser(): User | null {
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch {
            return null;
        }
    }
}
