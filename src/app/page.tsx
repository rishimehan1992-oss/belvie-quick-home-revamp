import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { PromiseSection } from "@/components/PromiseSection";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StartCta } from "@/components/StartCta";
import { UspSection } from "@/components/UspSection";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <UspSection />
        <HowItWorks />
        <PromiseSection />
        <StartCta />
      </main>
      <SiteFooter />
    </>
  );
}
