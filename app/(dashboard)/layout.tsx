import AppSideBar from "@/components/appSideBar";



export default function SecLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex">

      
    
      
     {/* SIDEMENU  */}
     
      <div className="w-[15%] md:w-[8%] lg:w-[15%] xl:w-[15%]">
        <AppSideBar />
     </div>
     
     <div className="w-[85%] md:w-[92%] lg:w-[85%] xl:w-[85%] flex">
       {children}
     </div>
     
    </div>
  );
}
