import Image from "next/image"

const UserCard = ({type}: {type:string}) => {
  return (
    <div className='rounded-xl odd:dark:bg-purple-500 even:dark:bg-yellow-600 p-4 flex-1'>
        <div className="flex justify-between items-center">
            <span className="text-[14px] text-gray-600 bg-white rounded-full p-1">10/2025</span>
            <Image src="/more.png" alt="more" width={20} height={20} className=""/>
        </div>
            <h1 className="text-2xl font-semibold mt-2">1234</h1>
            <h2 className="capitalize text-sm font-medium">{type}</h2>
        
    </div>
  )
}

export default UserCard