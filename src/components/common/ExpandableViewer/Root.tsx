import type { ReactNode } from "react";

import { Expand } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RootProps {
  title: string;
  maxWidth?: string;
  trigger?: ReactNode;
  children: ReactNode;
}

export const Root = ({ title, maxWidth = "max-w-2xl", trigger, children }: RootProps) => {
  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="h-6 text-xs">
      <Expand className="mr-1 h-3 w-3" />
      전체 보기
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
      <DialogContent className={`max-h-[80vh] overflow-auto ${maxWidth}`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

Root.displayName = "ExpandableViewer.Root";
