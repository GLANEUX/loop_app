import { Env } from "@/constants/env";
import { ApiErrorPayload, ApiRequestError, apiRequest } from "@/lib/api";
import * as FileSystem from "expo-file-system/legacy";

export type MediaType = "image" | "audio" | "video";

export type Media = {
  id: string;
  type: MediaType;
  title: string;
  url: string;
  createdAt: string;
};

export type MediaUploadInput = {
  uri: string;
  name: string;
  type: MediaType;
  mimeType?: string;
};

/**
 * Upload un nouveau média (image, audio ou vidéo)
 */
export async function uploadMedia(file: MediaUploadInput, token: string): Promise<Media> {
  const uploadUrl = `${Env.API_URL}/user/me/media`;

  const result = await FileSystem.uploadAsync(uploadUrl, file.uri, {
    httpMethod: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName: "file",
    mimeType: file.mimeType || (file.type === "image" ? "image/jpeg" : "audio/mpeg"),
    parameters: {
      type: file.type,
      title: file.name,
    },
  });

  const ok = result.status >= 200 && result.status < 300;
  let data: any = null;
  
  try {
    data = JSON.parse(result.body);
  } catch {
    data = result.body;
  }

  if (!ok) {
    const message = data?.message || `Erreur d'upload (${result.status})`;
    throw new ApiRequestError(message, result.status, data as ApiErrorPayload);
  }

  return data as Media;
}

/**
 * Supprime un média par son ID
 */
export async function deleteMedia(mediaId: string, token: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(`/user/me/media/${mediaId}`, {
    method: "DELETE",
    authToken: token,
  });
}

/**
 * Récupère l'URL complète d'un média pour l'affichage/lecture
 */
export function getMediaUrl(mediaId: string): string {
  return `${Env.API_URL}/user/media/${mediaId}`;
}
