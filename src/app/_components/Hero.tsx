import Image from "next/image";
import Link from "next/link";
import data from "../../../public/data.json"
function Hero() {
  return (
  
<section className="bg-gradient-to-br from-secondary via-hovsecondary to-white bg-hero-img pt-20  flex flex-wrap justify-self-center justify-center  justify-items-center content-center">
  <div className="mx-auto pt-10 max-w-screen-xl pb-10  px-4 py-32 lg:flex  lg:items-center">
    <div className=" p-10 mx-auto max-w-xl text-center">
      <h1 className="text-3xl text-black font-extrabold sm:text-5xl">
        Understand User Flow.
        <strong className="font-extrabold text-primary sm:block"> Increase Conversion. </strong>
      </h1>

      <p className="mt-4 sm:text-xl/relaxed text-black">
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nesciunt illo tenetur fuga ducimus
        numquam ea!
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          className="block w-full rounded bg-primary px-12 py-3 text-sm font-medium text-white shadow hover:bg-hovprimary focus:outline-none focus:ring active:bg-primary sm:w-auto"
          href="#"
        >
          Get Started
        </Link>

        <Link
          className="block w-full rounded bg-white px-12 py-3 text-sm font-medium text-primary shadow hover:text-hovprimary focus:outline-none focus:ring active:text-primary sm:w-auto"
          href="#Products"
        >
          See Our Products
        </Link>
      </div>
    </div>
  </div>
  <div className="flex mr-5 items-end justify-self-center justify-center  justify-items-center content-center">
    <Image className="bg-hovprimary pb-0  border-8 border-primary border-b-3 border-b-hovsecondary rounded-tr-[190px] rounded-tl-[700px] "  src={data.images.missoPic} alt="Maysa" width={400} height={573} ></Image>
  </div>
  
</section>
  );
}

export default Hero;