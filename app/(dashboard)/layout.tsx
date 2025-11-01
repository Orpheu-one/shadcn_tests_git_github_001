import AppSideBar from "@/components/appSideBar";



export default function SecLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex">

      
    
      
     {/* SIDEMENU  */}
     
      <div className="w-[10%] md:w-[8%] lg:w-[10%] xl:w-[10%]">
        <AppSideBar />
     </div>
     
     <div className="w-[90%] md:w-[92%] lg:w-[90%] xl:w-[90%] flex">
       {children}
     </div>
     
    </div>
  );
}
