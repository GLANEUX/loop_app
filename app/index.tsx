import { Redirect } from "expo-router";

export default function Index() {
  // plus tard: si user connecté -> '/(tabs)', sinon landing/auth
  return <Redirect href="/(landing)/welcomePage" />;
}
