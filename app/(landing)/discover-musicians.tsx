// app/landing-1.tsx

import { LandingSlide } from "@/components/layout/Landing/LandingSlide";

export default function Landing1() {
  return (
    <LandingSlide
      image={require("@/assets/images/landing/landing-1.jpg")}
      title={"Rejoins la scène\nmusicale de demain."}
      description={
        "Notre algorithme intelligent te connecte aux artistes compatibles avec ton style et tes envies."
      }
      nextRoute="/match-and-chat"
    />
  );
}
