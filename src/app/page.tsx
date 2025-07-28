import Appointment from "./_components/Appointment";
import Hero from "./_components/Hero";
import OurSevrices from "./_components/OurSevrices";
import ProductSection from "./_components/ProductSection";
import Separator from "./_components/Sparator";


export default function Home() {
  return (
   <div>
    
      <Hero/>
    <Separator value="About Us"></Separator>
    <OurSevrices/>
    <Separator value="Appointment"></Separator>
    <Appointment/>
    <Separator value="Our Products"></Separator>
    <ProductSection/>
    
    
   </div>
  );
}
