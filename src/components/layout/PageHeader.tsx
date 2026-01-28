import { MobileSidebar } from "./MobileSidebar";

interface PageHeaderProps {
  title: string;
}

export const PageHeader = ({ title }: PageHeaderProps) => (
  <header className="flex h-16 items-center gap-4 border-b bg-white px-6">
    <MobileSidebar />
    <h1 className="text-xl font-semibold">{title}</h1>
  </header>
);
