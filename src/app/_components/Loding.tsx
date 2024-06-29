import { LoaderPinwheel } from "lucide-react";
import React from "react";

function Loding() {
  return (
    <div className="flex flex-col gap-5 transition ease-out duration-200 hover:scale-110 hover:z-40 p-4 mb-6 w-full bg-white rounded-lg shadow-hovprimary shadow-sm hover:shadow-2xl"
    >
      <div className="flex justify-center items-center h-[200px] w-auto bg-hovsecondary animate-pulse rounded-2xl" >
      <svg className="rounded-full w-32 animate-spin h-32 bg-primary mr-3 " viewBox="0 0 24 24">
        <LoaderPinwheel />
        </svg>
      </div>
      <div className="h-[20px] w-1/3 bg-hovprimary animate-pulse" />
      <div className="h-[20px] w-auto bg-hovprimary animate-pulse" />
      <div className="h-[20px] w-2/3 bg-hovprimary animate-pulse" />
      <div className="h-[20px] w-auto animate-bounce bg-secondary" />
    </div>
  );
}

export default Loding;
