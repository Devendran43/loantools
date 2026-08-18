import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import AdSlot from "@/components/AdSlot";
import CalculatorApp from "@/components/CalculatorApp";
import SiteFooter from "@/components/SiteFooter";
import ErrorBoundary from "@/components/ErrorBoundary";

const AD_SLOT_TOP = process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP;

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <AdSlot variant="banner" slotId={AD_SLOT_TOP} />
        <ErrorBoundary>
          <CalculatorApp />
        </ErrorBoundary>
      </main>
      <SiteFooter />
    </>
  );
}
