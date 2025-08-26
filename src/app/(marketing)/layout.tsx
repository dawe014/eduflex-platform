import type { Metadata } from "next";
import { Navbar } from "./_components/navbar";
import { Footer } from "./_components/footer";

export const metadata: Metadata = {
  title: "EduFlex - Online Learning Platform",
  description: "Learn anytime, anywhere.",
};

const MarketingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full bg-slate-100">
      <Navbar />
      <main className="pt-20 pb-20 bg-slate-100">{children}</main>
      <Footer />
    </div>
  );
};

export default MarketingLayout;
