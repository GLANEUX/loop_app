import UserProfileContent from "@/components/layout/profile/UserProfileContent";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function UserProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const profileId = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!profileId) return null;

  return (
    <UserProfileContent
      profileId={profileId}
      onBack={() => router.back()}
    />
  );
}
