import { Loader } from "lucide-react";

export const ContentLoader = () => {
  return (
    <div className="w-full h-full min-h-96 flex items-center justify-center">
      <Loader className="animate-spin" />
    </div>
  );
};
