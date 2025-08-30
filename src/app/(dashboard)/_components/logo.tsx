// File: src/app/(dashboard)/_components/logo.tsx
import Link from "next/link";

export const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        EduFlex
      </span>
    </Link>
  );
};
