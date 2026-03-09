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
  const data = await apiRequest<any[]>("/discovery/queue", {
    method: "GET",
    authToken: token,
  });

  // Map backend profile to MatchingProfile
  return data.map((p) => ({
    ...p,
    userId: p.id, // In discovery queue, id is the user/profile id
  }));
}

/**
 * Swipe un utilisateur
 */
export async function swipeUser(
  token: string,
  targetProfileId: string,
  isLike: boolean,
): Promise<LikeResponse> {
  const response = await apiRequest<{
    swipeId: string;
    isLike: boolean;
    createdAt: string;
    matchCreated: boolean;
    matchId?: string;
  }>("/swipes", {
    method: "POST",
    authToken: token,
    body: JSON.stringify({
      targetProfileId,
      isLike,
    }),
  });

  return {
    matched: response.matchCreated,
    matchId: response.matchId,
  };
}

/**
 * Like un utilisateur
 */
export async function likeUser(token: string, targetUserId: string): Promise<LikeResponse> {
  return swipeUser(token, targetUserId, true);
}

/**
 * Dislike un utilisateur
 */
export async function dislikeUser(token: string, targetUserId: string): Promise<{ success: boolean }> {
  await swipeUser(token, targetUserId, false);
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

/**
 * Liste les personnes qui ont liké l'utilisateur (nouveaux matchs potentiels)
 */
export async function listLikes(token: string): Promise<Array<{
  id: string;
  createdAt: string;
  profile: MatchingProfile;
}>> {
  return apiRequest<Array<{
    id: string;
    createdAt: string;
    profile: MatchingProfile;
  }>>("/discovery/swipes/likes", {
    method: "GET",
    authToken: token,
  });
}
