import { Env } from "@/constants/env";
import { ApiErrorPayload, ApiRequestError, apiRequest } from "@/lib/api";
import * as FileSystem from "expo-file-system/legacy";
import { Media } from "./media";

export enum InstrumentLevel {
  Beginner = "Débutant",
  Intermediate = "Intermédiaire",
  Advanced = "Avancé",
  Professional = "Expert",
}

/**
 * Retourne le label d'un niveau d'instrument.
 * Gère les anciennes valeurs en anglais si nécessaire.
 */
export function getInstrumentLevelLabel(level: string): string {
  if (Object.values(InstrumentLevel).includes(level as InstrumentLevel)) {
    return level;
  }
  // Mapping pour les anciennes valeurs
  const mapping: Record<string, string> = {
    Beginner: InstrumentLevel.Beginner,
    Intermediate: InstrumentLevel.Intermediate,
    Advanced: InstrumentLevel.Advanced,
    Professional: InstrumentLevel.Professional,
  };
  return mapping[level] || level;
}

export type ProfileUpdateInput = {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  birthDate?: string;
  gender?: string;
  bio?: string;
  avatarUrl?: string;
  isPublic?: boolean;
  genres?: string[];
  instruments?: Array<{ instrument: string; level: string }>;
};

export type AudioMedia = {
  id: string;
  title?: string | null;
  mimeType: string;
  url: string;
};

export type UserProfile = {
  id: string;
  userId: string;
  pseudo?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  birthDate?: string | null;
  gender?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  hasAvatar?: boolean | null;
  isPublic?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
  genres?: string[] | null;
  instruments?: Array<{ instrument: string; level: string }> | null;
  media?: Media[] | null;
  audio?: AudioMedia[] | null;
};

export type UserMe = {
  id: string;
  email: string;
  role: string;
  pseudo?: string | null;
  profile?: UserProfile | null;
};

type ProfileCache = {
  data: UserMe;
  ts: number;
};

let profileCache: ProfileCache | null = null;
let profileInFlight: Promise<UserMe> | null = null;
const PROFILE_CACHE_TTL_MS = 30_000;

export type AvatarUploadInput = {
  uri: string;
  name: string;
  type?: string | null;
};

export function getMyProfile(token: string) {
  return apiRequest<UserMe>("/user/me", {
    method: "GET",
    authToken: token,
  });
}

/**
 * Récupère le profil complet et détaillé de l'utilisateur connecté
 * (inclut les médias, instruments, genres, etc.)
 */
export function getMyProfileDetails(token: string) {
  return apiRequest<UserProfile>("/user/me/profile", {
    method: "GET",
    authToken: token,
  });
}

/**
 * Récupère le profil public d'un autre utilisateur
 */
export function getUserProfile(profileId: string, token: string) {
  return apiRequest<UserProfile>(`/user/profiles/${profileId}`, {
    method: "GET",
    authToken: token,
  });
}

export function getMyProfileCached(token: string, force = false) {
  const now = Date.now();
  if (!force && profileCache && now - profileCache.ts < PROFILE_CACHE_TTL_MS) {
    return Promise.resolve(profileCache.data);
  }
  if (!force && profileInFlight) {
    return profileInFlight;
  }
  profileInFlight = getMyProfile(token)
    .then((data) => {
      profileCache = { data, ts: Date.now() };
      profileInFlight = null;
      return data;
    })
    .catch((err) => {
      profileInFlight = null;
      throw err;
    });
  return profileInFlight;
}

export function updateMyAvatar(file: AvatarUploadInput, token: string) {
  return FileSystem.uploadAsync(`${Env.API_URL}/user/me/avatar`, file.uri, {
    httpMethod: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName: "avatar",
    mimeType: file.type ?? "image/jpeg",
  }).then((result) => {
    const ok = result.status >= 200 && result.status < 300;
    let data: unknown = null;
    if (result.body) {
      try {
        data = JSON.parse(result.body);
      } catch {
        data = result.body;
      }
    }
    console.log(
      "[avatar] response",
      JSON.stringify({
        status: result.status,
        ok,
        data,
      }),
    );
    if (ok) return data;
    const message =
      typeof data === "object" && data && "message" in (data as object)
        ? String((data as { message?: unknown }).message)
        : `Request failed (${result.status})`;
    throw new ApiRequestError(message, result.status, data as ApiErrorPayload);
  }).catch((err: any) => {
    if (err?.name === "ApiRequestError") {
      throw err;
    }
    console.log("[avatar] error", JSON.stringify({ message: String(err) }));
    throw new ApiRequestError("Une erreur s'est produite.", 0);
  });
}

export async function updateMyProfile(payload: ProfileUpdateInput, token: string) {
  const result = await apiRequest<UserMe>("/user/me/profile", {
    method: "PATCH",
    authToken: token,
    body: JSON.stringify(payload),
  });
  // Force cache refresh after update
  await getMyProfileCached(token, true);
  return result;
}

export async function updateMyEmail(email: string, token: string) {
  const result = await apiRequest<UserMe>("/user/me", {
    method: "PATCH",
    authToken: token,
    body: JSON.stringify({ email }),
  });
  // Force cache refresh after update
  await getMyProfileCached(token, true);
  return result;
}

export async function updateMyPseudo(pseudo: string, token: string) {
  const result = await apiRequest<UserMe>("/user/me", {
    method: "PATCH",
    authToken: token,
    body: JSON.stringify({ pseudo }),
  });
  // Force cache refresh after update
  await getMyProfileCached(token, true);
  return result;
}

export async function updateMyPassword(
  currentPassword: string,
  newPassword: string,
  token: string,
) {
  try {
    return await apiRequest("/user/me/password", {
      method: "PATCH",
      authToken: token,
      body: JSON.stringify({ oldPassword: currentPassword, newPassword }),
    });
  } catch (err: any) {
    if (err?.name === "ApiRequestError" && [404, 405].includes(err.status)) {
      return apiRequest("/auth/change-password", {
        method: "POST",
        authToken: token,
        body: JSON.stringify({ oldPassword: currentPassword, newPassword }),
      });
    }
    throw err;
  }
}
