import { UserProfile } from "@/lib/user";

export const OnboardingRoutes = {
  oops: "/(auth)/(onboarding)/oops",
  name: "/(auth)/(onboarding)/name",
  phone: "/(auth)/(onboarding)/phone",
  birthdate: "/(auth)/(onboarding)/birthdate",
  gender: "/(auth)/(onboarding)/gender",
  styles: "/(auth)/(onboarding)/styles",
  skills: "/(auth)/(onboarding)/skills",
  avatar: "/(auth)/(onboarding)/avatar",
  bio: "/(auth)/(onboarding)/bio",
  uploadTracks: "/(auth)/(onboarding)/upload-tracks",
  welcomeRules: "/(auth)/(onboarding)/welcome-rules",
} as const;

const OnboardingOrder = [
  OnboardingRoutes.oops,
  OnboardingRoutes.name,
  OnboardingRoutes.phone,
  OnboardingRoutes.birthdate,
  OnboardingRoutes.gender,
  OnboardingRoutes.styles,
  OnboardingRoutes.skills,
  OnboardingRoutes.avatar,
  OnboardingRoutes.bio,
  OnboardingRoutes.uploadTracks,
  OnboardingRoutes.welcomeRules,
] as const;

function isBlank(value?: string | null) {
  return !value || value.trim().length === 0;
}

function normalizeOnboardingPath(pathname: string) {
  if (!pathname) return "";
  const trimmed = pathname
    .replace(/^\/\(auth\)/, "")
    .replace(/^\/auth/, "")
    .replace(/^\/\(onboarding\)/, "")
    .replace(/^\/onboarding/, "");
  const parts = trimmed.split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  if (!last) return "";
  return `/(auth)/(onboarding)/${last}`;
}

export function getPreviousOnboardingRoute(pathname: string) {
  const normalized = normalizeOnboardingPath(pathname);
  const index = OnboardingOrder.findIndex((route) => route === normalized);
  if (index <= 0) return null;
  return OnboardingOrder[index - 1] ?? null;
}

export function getNextOnboardingRoute(profile?: UserProfile | null) {
  if (!profile) return OnboardingRoutes.name;
  if (isBlank(profile.firstName) || isBlank(profile.lastName)) {
    return OnboardingRoutes.name;
  }
  if (isBlank(profile.phoneNumber)) {
    return OnboardingRoutes.phone;
  }
  if (isBlank(profile.birthDate)) {
    return OnboardingRoutes.birthdate;
  }
  if (isBlank(profile.gender)) {
    return OnboardingRoutes.gender;
  }
  if (!profile.genres || profile.genres.length === 0) {
    return OnboardingRoutes.styles;
  }
  if (!profile.instruments || profile.instruments.length === 0) {
    return OnboardingRoutes.skills;
  }
  const hasAvatar =
    profile.hasAvatar === false
      ? false
      : profile.hasAvatar === true
        ? true
        : Boolean(profile.avatarUrl);
  if (!hasAvatar) {
    return OnboardingRoutes.avatar;
  }
  if (isBlank(profile.bio)) {
    return OnboardingRoutes.bio;
  }
  
  const hasAudio = (profile.audio && profile.audio.length > 0) || (profile.media && profile.media.some(m => m.type === "audio" || m.type === "video"));
  if (!hasAudio) {
    return OnboardingRoutes.uploadTracks;
  }

  return null;
}

export function getOnboardingEntry(profile?: UserProfile | null) {
  const next = getNextOnboardingRoute(profile);
  if (!next) return null;
  const step = next.split("/").filter(Boolean).pop() ?? "name";
  return {
    pathname: OnboardingRoutes.oops,
    params: { next: step },
  };
}
