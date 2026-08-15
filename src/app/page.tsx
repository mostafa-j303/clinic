import Appointment from "./_components/Appointment";
import Hero from "./_components/Hero";
import OurSevrices from "./_components/OurSevrices";
import ProductSection from "./_components/ProductSection";

export default function Home() {
  return (
    <div>
      <Hero />
      <OurSevrices />
      <Appointment />
      <ProductSection />
    </div>
  );
}
