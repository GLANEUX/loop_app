import { apiRequest } from "@/lib/api";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  pseudo?: string;
  firstName?: string;
  lastName?: string;
};

export type AuthResponse = {
  accessToken: string;
  expiresAt: string;
  user: AuthUser;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  pseudo: string;
  email: string;
  password: string;
  role?: "user" | "admin";
};

export function login(payload: LoginInput) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function register(payload: RegisterInput) {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logout(token: string) {
  return apiRequest<{ ok: boolean }>("/auth/logout", {
    method: "POST",
    authToken: token,
  });
}
