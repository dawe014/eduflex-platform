// File: src/app/(dashboard)/instructor/layout.tsx
import React from "react";

const InstructorLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {/* We can add a shared sidebar or header for instructors here later */}
      {children}
    </div>
  );
};

export default InstructorLayout;
