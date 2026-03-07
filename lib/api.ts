import { Env } from "@/constants/env";

export type ApiErrorPayload = {
  statusCode?: number;
  message?: unknown;
  error?: string;
};

export class ApiRequestError extends Error {
  status: number;
  details?: ApiErrorPayload;

  constructor(message: string, status: number, details?: ApiErrorPayload) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.details = details;
  }
}

const BASE_URL = Env.API_URL;

function buildUrl(path: string) {
  if (!path) return BASE_URL;
  return path.startsWith("/") ? `${BASE_URL}${path}` : `${BASE_URL}/${path}`;
}

async function parseJsonSafe(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function maskSensitive(value: unknown) {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(maskSensitive);
  const cloned: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (["password", "confirmPassword", "token", "accessToken"].includes(key)) {
      cloned[key] = "***";
    } else {
      cloned[key] = maskSensitive(val);
    }
  }
  return cloned;
}

function describeFormData(body: FormData) {
  const parts = (body as { _parts?: Array<[string, unknown]> })._parts;
  if (!Array.isArray(parts)) return "[FormData]";
  return parts.map(([key, value]) => {
    if (value && typeof value === "object" && "uri" in (value as object)) {
      const file = value as { uri?: string; name?: string; type?: string };
      return {
        key,
        file: {
          name: file.name,
          type: file.type,
          uri: file.uri,
        },
      };
    }
    return { key, value };
  });
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { authToken?: string } = {},
): Promise<T> {
  const { authToken, headers, ...rest } = options;
  const isFormData =
    typeof FormData !== "undefined" && rest.body instanceof FormData;
  const finalHeaders: Record<string, string> = {
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...(headers ? (headers as Record<string, string>) : {}),
  };
  if (isFormData) {
    delete finalHeaders["Content-Type"];
    delete finalHeaders["content-type"];
  }

  if (authToken) {
    finalHeaders.Authorization = `Bearer ${authToken}`;
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path), {
      ...rest,
      headers: finalHeaders,
    });
  } catch (err) {
    console.log("[api] network error", {
      method: rest.method || "GET",
      url: buildUrl(path),
      message: err instanceof Error ? err.message : String(err),
    });
    throw new ApiRequestError("Une erreur s'est produite.", 0);
  }

  const data = await parseJsonSafe(response);
  const safeBody =
    typeof rest.body === "string"
      ? maskSensitive(JSON.parse(rest.body))
      : isFormData && rest.body instanceof FormData
        ? describeFormData(rest.body)
        : rest.body;

  const requestLog = {
    method: rest.method || "GET",
    url: buildUrl(path),
    headers: finalHeaders,
    body: safeBody,
  };
  const responseLog = {
    status: response.status,
    ok: response.ok,
    data: maskSensitive(data),
  };
  console.log("[api] request", JSON.stringify(requestLog));
  console.log("[api] response", JSON.stringify(responseLog));

  if (!response.ok) {
    const details =
      typeof data === "object" && data ? (data as ApiErrorPayload) : undefined;
    if (details?.message && typeof details.message === "object") {
      console.log("[api] validation details", JSON.stringify(details.message));
    }
    const message =
      (details?.message as string) ||
      details?.error ||
      `Request failed (${response.status})`;
    throw new ApiRequestError(message, response.status, details);
  }

  return data as T;
}

export function formatApiError(error: unknown) {
  if (error instanceof ApiRequestError) {
    // Erreur réseau (status 0)
    if (error.status === 0) {
      return "Impossible de joindre le serveur. Vérifiez votre connexion.";
    }

    if (error.status === 401) {
      return "E-mail ou mot de passe incorrect.";
    }
    if (error.status === 403) {
      return "Action non autorisée.";
    }
    if (error.status === 429) {
      return "Trop de tentatives. Réessayez plus tard.";
    }
    if (error.status >= 500) {
      return "Erreur serveur. Nos musiciens s'en occupent !";
    }

    const details = error.details;
    const message = details?.message;

    // Si le message est une simple chaîne, on tente de le rendre plus humain
    if (typeof message === "string" && message.trim().length > 0) {
      const cleanMessage = message.trim();
      if (cleanMessage.toLowerCase().includes("already exists")) {
        return "Cette information est déjà utilisée.";
      }
      return cleanMessage;
    }

    // Si c'est un objet de validation complexe
    if (message && typeof message === "object") {
      const extracted = extractValidationMessages(message);
      if (extracted.length > 0) {
        // On retourne la première erreur pour ne pas surcharger l'affichage
        return extracted[0];
      }
      return "Certains champs sont invalides.";
    }
    
    return details?.error || "Une erreur inattendue est survenue.";
  }

  if (error instanceof Error && error.message) {
    if (error.message === "Network request failed") {
      return "Erreur réseau. Le serveur est peut-être éteint.";
    }
    return error.message;
  }

  return "Une erreur est survenue.";
}

function extractValidationMessages(payload: unknown): string[] {
  if (!payload || typeof payload !== "object") return [];
  const maybeMessage = payload as {
    errors?: string[];
    properties?: Record<string, { errors?: string[] }>;
  };

  const messages: string[] = [];

  // Cas où les erreurs sont directement dans un tableau 'errors'
  if (Array.isArray(maybeMessage.errors)) {
    for (const err of maybeMessage.errors) {
      if (typeof err === "string" && err.trim().length > 0) {
        messages.push(err.trim());
      }
    }
  }

  // Cas où les erreurs sont par propriété (mongoose/class-validator style)
  if (maybeMessage.properties && typeof maybeMessage.properties === "object") {
    for (const [, value] of Object.entries(maybeMessage.properties)) {
      if (value && Array.isArray(value.errors)) {
        for (const err of value.errors) {
          if (typeof err === "string" && err.trim().length > 0) {
            // On ne prend que le message, sans le nom du champ technique
            messages.push(err.trim());
          }
        }
      }
    }
  }

  // Support pour d'autres formats de validation (NestJS/Simple array of strings)
  if (Array.isArray(payload)) {
    for (const item of payload) {
      if (typeof item === "string") messages.push(item);
    }
  }

  return messages;
}
