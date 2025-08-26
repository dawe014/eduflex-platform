// File: src/app/(dashboard)/_components/sidebar.tsx
import { Logo } from "./logo";
import { SidebarRoutes } from "./sidebar-routes";
import { UserInfo } from "./user-info";

export const Sidebar = () => {
  return (
    <div className="h-full flex flex-col bg-white/95 backdrop-blur-sm border-r border-gray-200 shadow-lg">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Logo />
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <UserInfo />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarRoutes />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          EduFlex © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};
