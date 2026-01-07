import Navbar from "@/components/Navbar";
import SideBar from "@/components/SideBar";

export default function SecLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex flex-col">
      {/* NAVBAR - Ocupa todo o topo */}
      <div className="w-full">
        <Navbar />
      </div>

      {/* CONTAINER PRINCIPAL - SideBar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR - Esquerda */}
        <div className="w-[10%] md:w-[8%] lg:w-[10%] xl:w-[10%]">
          <SideBar />
        </div>

        {/* CONTENT AREA - Direita */}
        <div className="w-[90%] md:w-[92%] lg:w-[90%] xl:w-[90%] overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}