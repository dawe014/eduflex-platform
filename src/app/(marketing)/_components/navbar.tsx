// File: src/app/(marketing)/_components/navbar.tsx
import { Logo } from "./logo";
import { MainNav } from "./main-nav";
import { UserButton } from "./user-button";
import { MobileNav } from "./mobile-nav";

export const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm h-20 flex items-center">
      <div className="container mx-auto px-4 w-full flex items-center justify-between">
        <div className="hidden md:block">
          <Logo />
        </div>

        <div className="md:hidden">
          <MobileNav />
        </div>

        <div className="hidden md:block">
          <MainNav />
        </div>

        <div className="ml-auto">
          <UserButton />
        </div>
      </div>
    </header>
  );
};
