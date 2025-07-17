
'use client';

export interface User {
    uid: string;
    email: string;
    displayName: string;
    password?: string; // Should be hashed in a real app
    photoURL?: string;
}

const AUTH_USER_KEY = 'savora-auth-user';

// In-memory user store for demonstration. In a real app, this would be a database.
const users: User[] = [
    {
        uid: '1',
        email: 'user@example.com',
        password: 'password123',
        displayName: 'Test User',
    },
    {
        uid: '2',
        email: 'admin@savora.com',
        password: 'password123',
        displayName: 'Admin User',
    }
];

export function findUserByEmail(email: string): User | undefined {
    return users.find(u => u.email === email);
}

export function addUser(user: User): void {
    if (!findUserByEmail(user.email)) {
        users.push(user);
    }
}

// --- LocalStorage helpers for session persistence ---

export function saveUser(user: User): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
}

export function getUser(): User | null {
    if (typeof window !== 'undefined') {
        const userJson = localStorage.getItem(AUTH_USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    }
    return null;
}

export function removeUser(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_USER_KEY);
    }
}
