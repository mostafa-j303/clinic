import Hero from "./_components/Hero";
import ProductSection from "./_components/ProductSection";
import Separator from "./_components/Sparator";

export default function Home() {
  return (
   <div>
    <Hero/>
    <Separator value="About Maysa"></Separator>
    <ProductSection/>
   </div>
  );
}
