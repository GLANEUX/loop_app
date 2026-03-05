// app/landing-2.tsx

import { LandingSlide } from "@/components/layout/Landing/LandingSlide";

export default function Landing2() {
  return (
    <LandingSlide
      image={require("@/assets/images/landing/landing-2.jpg")}
      title={"Organise tes sessions\nen un clic."}
      description={
        "Planifie rapidement tes répètes, échange des samples et coordonne tes projets sans prise de tête."
      }
      nextRoute="/play-together"
    />
  );
}
