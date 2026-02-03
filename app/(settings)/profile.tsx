import ProfileScreenContent from "@/components/layout/profile/ProfileScreenContent";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <ProfileScreenContent
      profileId="me"
      onBack={() => router.back()}
    />
  );
}
