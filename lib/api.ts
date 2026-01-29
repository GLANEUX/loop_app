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
    if (error.status === 401) {
      return "E-mail ou mot de passe invalide.";
    }
    if (error.status === 429) {
      return "Trop de tentatives. Reessayez plus tard.";
    }
    const message = error.details?.message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
    if (message && typeof message === "object") {
      const extracted = extractValidationMessages(message);
      if (extracted.length > 0) {
        return extracted.join("\n");
      }
      return "Certains champs sont invalides.";
    }
    return "Une erreur s'est produite.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Une erreur s'est produite.";
}

function extractValidationMessages(payload: unknown): string[] {
  if (!payload || typeof payload !== "object") return [];
  const maybeMessage = payload as {
    errors?: string[];
    properties?: Record<string, { errors?: string[] }>;
  };

  const messages: string[] = [];

  if (Array.isArray(maybeMessage.errors)) {
    for (const err of maybeMessage.errors) {
      if (typeof err === "string" && err.trim().length > 0) {
        messages.push(err.trim());
      }
    }
  }

  if (maybeMessage.properties && typeof maybeMessage.properties === "object") {
    for (const [field, value] of Object.entries(maybeMessage.properties)) {
      if (value && Array.isArray(value.errors)) {
        for (const err of value.errors) {
          if (typeof err === "string" && err.trim().length > 0) {
            const trimmed = err.trim();
            messages.push(`${field}: ${trimmed}`);
          }
        }
      }
    }
  }

  return messages;
}
