
'use client';

export type UserRole = 'user' | 'admin';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  password?: string; // Should not be stored in plain text in a real app
  role: UserRole;
}

const USERS_KEY = 'savora-users';

// Initialize with default users if not present in localStorage
export function initializeUsers() {
  if (typeof window !== 'undefined' && !localStorage.getItem(USERS_KEY)) {
    const initialUsers: User[] = [
      {
        uid: 'admin-savora',
        email: 'admin@savora.com',
        displayName: 'Admin User',
        password: 'admin123',
        role: 'admin',
      },
      {
        uid: 'user-savora',
        email: 'user@savora.com',
        displayName: 'Test User',
        password: 'user123',
        role: 'user',
      },
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
  }
}

function getUsers(): User[] {
    if (typeof window === 'undefined') return [];
    const usersJson = localStorage.getItem(USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
}

function saveUsers(users: User[]) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
}

export function getUserByEmail(email: string): User | undefined {
    const users = getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function registerUser(userData: Omit<User, 'uid'>): User | null {
    const users = getUsers();
    if (getUserByEmail(userData.email)) {
        return null; // User already exists
    }

    const newUser: User = {
        ...userData,
        uid: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    saveUsers([...users, newUser]);
    return newUser;
}

export function authenticateUser(email: string, password: string): User | null {
    const user = getUserByEmail(email);
    if (user && user.password === password) {
        // In a real app, never compare plain text passwords. This is for prototype purposes only.
        return user;
    }
    return null;
}
