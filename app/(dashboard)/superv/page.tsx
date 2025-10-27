const superPage = () => {
  return (
   <div className='w-full flex p-4 g-4 flex-col md:flex-row lg:flex-row'>
      {/*left side*/}
      <div className="w-full flex lg:w-2/3 dark:bg-gray-950 rounded-r-lg p-4">
super
      </div>

      {/*right side*/}
      <div className="w-full flex lg:w-1/3 dark:bg-gray-900 p-4 rounded-r-lg">
        <h2 className="text-lg font-semibold">Super Settings</h2>
      </div>
      
      </div>
  )
}

export default superPage