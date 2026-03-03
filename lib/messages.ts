import { apiRequest } from "./api";
import { UserProfile } from "./user";

export type MessageType = "text" | "system" | "image" | "voice";
export type MessageStatus = "sent" | "delivered" | "read";

export type Message = {
  id: string;
  matchId: string;
  authorProfileId: string | null;
  type: MessageType;
  body: string;
  createdAt: string;
  editedAt?: string | null;
  status?: MessageStatus | null;
};

export type Thread = {
  matchId: string;
  createdAt: string;
  profile: UserProfile;
  lastMessage: {
    id: string;
    body: string;
    type: MessageType;
    createdAt: string;
    authorProfileId: string | null;
  } | null;
  unreadCount: number;
};

export type ListMessagesResponse = {
  messages: Message[];
  nextCursor?: {
    before: string;
    beforeId: string;
  };
};

/**
 * Liste les conversations (threads)
 */
export async function getThreads(token: string): Promise<Thread[]> {
  return apiRequest<Thread[]>("/messages/threads", {
    method: "GET",
    authToken: token,
  });
}

/**
 * Liste les messages d'un match
 */
export async function getMessages(
  token: string,
  matchId: string,
  params: { limit?: number; before?: string; beforeId?: string } = {},
): Promise<ListMessagesResponse> {
  const query = new URLSearchParams();
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.before) query.append("before", params.before);
  if (params.beforeId) query.append("beforeId", params.beforeId);

  const queryString = query.toString();
  const path = `/matches/${matchId}/messages${queryString ? `?${queryString}` : ""}`;

  return apiRequest<ListMessagesResponse>(path, {
    method: "GET",
    authToken: token,
  });
}

/**
 * Envoie un message
 */
export async function sendMessage(
  token: string,
  matchId: string,
  body: string,
): Promise<Message> {
  return apiRequest<Message>(`/matches/${matchId}/messages`, {
    method: "POST",
    authToken: token,
    body: JSON.stringify({ body }),
  });
}

/**
 * Marque un message comme lu
 */
export async function markAsRead(
  token: string,
  matchId: string,
  messageId: string,
): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/matches/${matchId}/read`, {
    method: "POST",
    authToken: token,
    body: JSON.stringify({ messageId }),
  });
}
