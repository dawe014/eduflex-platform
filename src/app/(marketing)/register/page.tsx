// File: src/app/(marketing)/register/page.tsx

import { RegisterForm } from "@/components/auth/register-form";

const RegisterPage = () => {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center">
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;
