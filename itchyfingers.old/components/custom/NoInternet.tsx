import { AlertTriangle, CrossIcon } from "lucide-react";

type NoInterNetProps = {
  onClose: () => void;
};

const NoInterNet = ({ onClose }: NoInterNetProps) => {
  return (
    <div className="w-full h-full flex items-center justify-between">
      <AlertTriangle className="size-8" />
      <span className="text-2xl font-bold h-full items-center">
        No Internet Connection
      </span>
      <CrossIcon className="size-8" onClick={onClose} />
    </div>
  );
};

export default NoInterNet;
