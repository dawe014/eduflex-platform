// File: src/app/(dashboard)/_components/sidebar.tsx
import { Logo } from "./logo";
import { SidebarRoutes } from "./sidebar-routes";

export const Sidebar = () => {
  return (
    <div className="h-full border-r flex flex-col overflow-y-auto bg-white shadow-sm">
      <div className="p-6 border-b">
        <Logo />
      </div>
      {/* SidebarRoutes now controls the rest of the vertical space */}
      <SidebarRoutes />
    </div>
  );
};
