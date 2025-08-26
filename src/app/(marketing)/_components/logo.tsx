// File: src/app/(marketing)/_components/logo.tsx
import Link from "next/link";
import Image from "next/image";

export const Logo = () => {
  return (
    <Link href="/">
      <Image height={130} width={130} alt="logo" src="/logo.svg" />
    </Link>
  );
};
