// File: src/app/(dashboard)/_components/navbar.tsx
import { UserButton } from "@/app/(marketing)/_components/user-button";

export const Navbar = () => {
  return (
    <div className="p-4 border-b h-full flex items-center bg-white shadow-sm">
      {/* We can add a mobile sidebar toggle here later */}
      <div className="ml-auto">
        <UserButton />
      </div>
    </div>
  );
};
