"use client"

import { useState } from "react";
import BigCalendar from "@/components/BigCalendar";
import ListaVendas from "@/components/ListaVendas";
import GoogleMaps from "@/components/GoogleMaps/GoogleMaps";

const D2dPage = () => {
  const [latitude, setLatitude] = useState(38.748103);
  const [longitude, setLongitude] = useState(-9.159047 );
  const [address, setAddress] = useState("");

  return (
    <div className="w-full flex gap-4 flex-col md:flex-row lg:flex-row">
      {/* LEFT side */}
      <div className="w-full lg:w-2/3 dark:bg-white rounded-lg p-4 text-black">
        <BigCalendar />
      </div>

      {/* RIGHT side – column layout */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
       
       

        {/* ListaVendas */}
        <div className="dark:bg-blak rounded-lg">
          <ListaVendas />
        </div>
         {/* GoogleMaps  */}
         <div className="dark:bg-gray-900 rounded-lg ">
          <GoogleMaps
            latitude={latitude}
            longitude={longitude}
            setLatitude={setLatitude}
            setLongitude={setLongitude}
            setAddress={setAddress}
            address={address}
            radius={1000}
          />
        </div>
      </div>
    </div>
  );
};

export default D2dPage;
