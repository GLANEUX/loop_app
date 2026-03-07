// app/landing-3.tsx

import { LandingSlide } from "@/components/layout/Landing/LandingSlide";

export default function Landing3() {
  return (
    <LandingSlide
      image={require("@/assets/images/landing/landing-3.jpg")}
      title={"Rejoins des musiciens\npassionnés."}
      description={
        "Connecte-toi avec une communauté de passionnés, sérieux et fiables."
      }
      nextRoute="/get-started"
      showBack={true}
    />
  );
}
