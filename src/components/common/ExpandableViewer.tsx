import { Expand } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ExpandableViewerProps {
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const ExpandableViewer = ({
  title,
  children,
  maxWidth = "max-w-2xl",
}: ExpandableViewerProps) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="ghost" size="sm" className="h-6 text-xs">
        <Expand className="mr-1 h-3 w-3" />
        전체 보기
      </Button>
    </DialogTrigger>
    <DialogContent className={`max-h-[80vh] overflow-auto ${maxWidth}`}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      {children}
    </DialogContent>
  </Dialog>
);
