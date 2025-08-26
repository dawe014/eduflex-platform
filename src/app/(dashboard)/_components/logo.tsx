// File: src/app/(dashboard)/_components/logo.tsx
import Link from "next/link";
import Image from "next/image";

export const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="relative w-8 h-8">
        <Image
          height={32}
          width={32}
          alt="EduFlex Logo"
          src="/logo.svg"
          className="object-contain"
        />
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        EduFlex
      </span>
    </Link>
  );
};
