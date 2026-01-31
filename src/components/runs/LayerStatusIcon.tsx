import { CheckCircle2, MinusCircle, XCircle } from "lucide-react";

import type { LayerStatus } from "@/utils/evaluation";

interface LayerStatusIconProps {
  status: LayerStatus;
}

export const LayerStatusIcon = ({ status }: LayerStatusIconProps) => {
  switch (status) {
    case "pass":
      return <CheckCircle2 className="mx-auto h-4 w-4 text-green-500" />;
    case "fail":
      return <XCircle className="mx-auto h-4 w-4 text-red-500" />;
    case "skipped":
      return <MinusCircle className="mx-auto h-4 w-4 text-gray-300" />;
  }
};
