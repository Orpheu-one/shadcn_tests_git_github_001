import Image from "next/image"
import {d2d_Data} from "@/lib/data"

const {email} = d2d_Data[3];
const {photo} = d2d_Data[4];
const {d2dId} = d2d_Data[2];
const {phone} = d2d_Data[5]

const d2dSinglePage = () => {
  return (
    <div className='flex-1 p-4 flex flex-col gap-4 xl:flex-row' >

    {/* LEFT */}
    <div className="w-full xl:w-2/3">

        {/*TOP */}
        <div className="flex flex-col lg:flex-row gap-4">

            {/* USER INFO CARD */ }
            <div className="bg-purple-400 py-6 px-4 rounded-lg flex-1 flex gap-4">
                <div className="w-1/3">
                    <Image src={photo} alt="" width={80} height={80} className ="w-36 h-36 rounded-full object-cover" />
                </div>
                
                <div className="w-2/3 flex-coljustify-between gap-4">
                <h1 className="text-xl font-semibold">John Doe</h1>
                <p className="text-sm text-gray-600">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.
                </p>

                <div className="flex mt-2 items-center justify-between gap-2">
                    <h2 className="text-md font-semibold text-gray-800">{d2dId}</h2>
                    <h2 className="text-lg font-bold text-gray-800">TEAM</h2>
                    
                </div>


                    <div className="mt-1">

                <div className="flex items-center justify-between gap-2 flex-wrap text-sm font-medium">
                    <Image src="/mail.png" alt="email" width={18} height={18} />
                    <span className="text-black font-xs">{email}</span>
                </div>
                <div className="flex items-center justify-between gap-2 flex-wrap text-sm font-medium">
                    <Image src="/phone.png" alt="email" width={16} height={16} />
                    <span className="text-black font-xs">{phone}</span>
                </div>

                    </div>
                
                </div>



            </div>

            {/* USER SMALL CARD */ }
            <div className="flex-1 flex gap-4 justify-between flex-wrap bg-white py-6 px-4 rounded-lg">

                

            </div>
    
        </div>
        {/* BOTTOM */}
        <div className="">graphs</div>

    </div>

     {/* RIGHT */}
    <div className="w-full xl:w-1/3">r</div>
    
    </div>
  )
}

export default d2dSinglePage