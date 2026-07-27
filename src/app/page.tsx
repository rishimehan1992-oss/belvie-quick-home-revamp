import { ConversionHero } from "@/components/ConversionHero";
import { DemoTransformations } from "@/components/DemoTransformations";
import { FaqSection } from "@/components/FaqSection";
import { HowItWorks } from "@/components/HowItWorks";
import { PricingSection } from "@/components/PricingSection";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StartCta } from "@/components/StartCta";
import { StickyCta } from "@/components/StickyCta";
import { TrustBar } from "@/components/TrustBar";
import { UspSection } from "@/components/UspSection";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="pb-20 md:pb-0">
        <ConversionHero />
        <TrustBar />
        <DemoTransformations />
        <UspSection />
        <HowItWorks />
        <PricingSection />
        <FaqSection />
        <StartCta />
      </main>
      <SiteFooter />
      <StickyCta />
    </>
  );
}
