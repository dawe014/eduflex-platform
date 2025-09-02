import { Loader2 } from "lucide-react";

export const Spinner = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
};
