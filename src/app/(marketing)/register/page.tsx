import { RegisterForm } from "@/components/auth/register-form";
import { getPlatformSettings } from "@/actions/settings-actions";

export default async function RegisterPage() {
  const settings = await getPlatformSettings();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <RegisterForm allowRegistrations={settings.allowNewRegistrations} />
    </div>
  );
}
