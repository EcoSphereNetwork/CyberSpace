import { EventEmitter } from '@/utils/EventEmitter';

export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  metadata?: Record<string, any>;
}

export interface AuthConfig {
  apiUrl: string;
  tokenKey?: string;
  refreshTokenKey?: string;
}

export class SecurityManager extends EventEmitter {
  private currentUser: User | null = null;
  private config: AuthConfig;
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor(config: AuthConfig) {
    super();
    this.config = {
      tokenKey: 'auth_token',
      refreshTokenKey: 'refresh_token',
      ...config,
    };

    this.loadTokens();
  }

  private loadTokens(): void {
    if (typeof window === 'undefined') return;

    this.token = localStorage.getItem(this.config.tokenKey!);
    this.refreshToken = localStorage.getItem(this.config.refreshTokenKey!);

    if (this.token) {
      this.validateToken();
    }
  }

  private saveTokens(token: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;

    this.token = token;
    this.refreshToken = refreshToken;

    localStorage.setItem(this.config.tokenKey!, token);
    localStorage.setItem(this.config.refreshTokenKey!, refreshToken);
  }

  private clearTokens(): void {
    if (typeof window === 'undefined') return;

    this.token = null;
    this.refreshToken = null;

    localStorage.removeItem(this.config.tokenKey!);
    localStorage.removeItem(this.config.refreshTokenKey!);
  }

  async login(username: string, password: string): Promise<User> {
    try {
      const response = await fetch(`${this.config.apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      this.saveTokens(data.token, data.refreshToken);
      this.currentUser = data.user;
      this.emit('login', this.currentUser);
      return this.currentUser;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    if (!this.token) return;

    try {
      await fetch(`${this.config.apiUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
    } catch (error) {
      this.emit('error', error);
    } finally {
      this.clearTokens();
      this.currentUser = null;
      this.emit('logout');
    }
  }

  async validateToken(): Promise<boolean> {
    if (!this.token) return false;

    try {
      const response = await fetch(`${this.config.apiUrl}/auth/validate`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 && this.refreshToken) {
          return this.refreshSession();
        }
        throw new Error('Token validation failed');
      }

      const data = await response.json();
      this.currentUser = data.user;
      return true;
    } catch (error) {
      this.emit('error', error);
      this.clearTokens();
      return false;
    }
  }

  private async refreshSession(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${this.config.apiUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Session refresh failed');
      }

      const data = await response.json();
      this.saveTokens(data.token, data.refreshToken);
      this.currentUser = data.user;
      return true;
    } catch (error) {
      this.emit('error', error);
      this.clearTokens();
      return false;
    }
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.currentUser;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  hasRole(role: string): boolean {
    return this.currentUser?.roles.includes(role) ?? false;
  }

  hasPermission(permission: string): boolean {
    return this.currentUser?.permissions.includes(permission) ?? false;
  }

  getToken(): string | null {
    return this.token;
  }
}