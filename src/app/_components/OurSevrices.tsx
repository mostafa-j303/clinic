import React from "react";

function OurSevrices() {
  return (
    <div>
      <section className="bg-gradient-to-b from-hovprimary via-primary to-hovsecondary text-white">
        <div className="  px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          <div className="bg-white text-black p-5 border-hovprimary border-4 rounded-xl max-w-xl">
            <h2 id="aboutus" className="text-3xl font-bold sm:text-4xl">
              Professional Background
            </h2>

            <p className="mt-4 text-gray-600">
              &nbsp;&nbsp;&nbsp;&nbsp; I am a licensed dietitian with over nine years of dedicated
              experience in the field of nutritional therapy. My foundation was
              built through intensive clinical training at a hospital, where I
              completed a comprehensive 6-month internship that deepened my
              understanding of medical nutrition therapy and patient-centered
              care.
            </p>
          </div>

          <div className=" mt-8 grid grid-cols-1 gap-8 md:mt-16 md:grid-cols-2 md:gap-12 lg:grid-cols-3 justify-center items-center">
            <div className=" flex items-start gap-1">
              <span className="shrink-0 rounded-lg bg-secondary text-black p-4">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 14l9-5-9-5-9 5 9 5z"></path>
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                  ></path>
                </svg>
              </span>

              <div className="bg-white border-4 border-hovprimary  p-3 rounded-lg">
                <h2 className="text-lg text-black font-bold">
                  Education and Expertise
                </h2>

                <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                  &nbsp;&nbsp;&nbsp;&nbsp; Over the years, I have consistently earned colloquium credits,
                  staying current with evolving practices in dietetics. My
                  expertise spans a wide range of clinical and community
                  nutrition areas, including renal nutrition, diabetes
                  management, maternal nutrition (including pregnancy and
                  lactation), food safety, eating disorders, and
                  gastrointestinal tract diseases, among others.
                </p>
              </div>
            </div>

            <div className=" flex items-start gap-1">
              

              <div className="bg-white border-4 border-hovprimary  p-3 rounded-lg">
                <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                  &nbsp;&nbsp;&nbsp;&nbsp; Passionate about translating evidence-based nutrition into
                  practical strategies, I aim to empower individuals to improve
                  their health and quality of life through tailored dietary
                  interventions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default OurSevrices;
