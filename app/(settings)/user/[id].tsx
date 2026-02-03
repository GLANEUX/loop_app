import ProfileScreenContent from "@/components/layout/profile/ProfileScreenContent";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function UserProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const profileId = Array.isArray(params.id) ? params.id[0] : params.id;

  return (
    <ProfileScreenContent
      profileId={profileId ?? null}
      onBack={() => router.back()}
    />
  );
}
