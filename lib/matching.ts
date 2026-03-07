import { apiRequest } from "./api";
import { UserProfile } from "./user";

export type MatchingProfile = UserProfile & {
  distance?: number;
};

export type LikeResponse = {
  matched: boolean;
  matchId?: string;
  targetUser?: MatchingProfile;
};

/**
 * Récupère une liste de profils à découvrir
 */
export async function discoverProfiles(token: string): Promise<MatchingProfile[]> {
  const data = await apiRequest<any[]>("/matching/discover", {
    method: "GET",
    authToken: token,
  });

  // Map backend profile to MatchingProfile
  return data.map((p) => ({
    ...p,
    userId: p.id, // In discovery, id is the user/profile id
  }));
}

/**
 * Like un utilisateur
 */
export async function likeUser(token: string, targetUserId: string): Promise<LikeResponse> {
  const response = await apiRequest<{
    matched: boolean;
    matchId?: string;
  }>(`/matching/like/${targetUserId}`, {
    method: "POST",
    authToken: token,
  });

  return {
    matched: response.matched,
    matchId: response.matchId,
  };
}

/**
 * Dislike un utilisateur
 */
export async function dislikeUser(token: string, targetUserId: string): Promise<{ success: boolean }> {
  await apiRequest<{ success: boolean }>(`/matching/dislike/${targetUserId}`, {
    method: "POST",
    authToken: token,
  });
  return { success: true };
}

/**
 * Liste les matchs de l'utilisateur
 */
export async function listMatches(token: string): Promise<Array<{
  id: string;
  createdAt: string;
  profile: MatchingProfile;
}>> {
  return apiRequest<Array<{
    id: string;
    createdAt: string;
    profile: MatchingProfile;
  }>>("/matches", {
    method: "GET",
    authToken: token,
  });
}
