import { Navbar } from "./_components/navbar";
import { Sidebar } from "./_components/sidebar";
import { MobileSidebar } from "./_components/mobile-sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="md:hidden fixed inset-0 z-50">
        <MobileSidebar />
      </div>

      <div className="h-[70px] md:pl-64 fixed inset-y-0 w-full z-40">
        <Navbar />
      </div>

      <div className="hidden md:flex h-full w-64 flex-col fixed inset-y-0 z-40">
        <Sidebar />
      </div>

      <main className="md:pl-64 pt-[70px] h-full">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
