import { PageHeader } from "@/components/layout/PageHeader";

export const PromptsPage = () => {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Prompts" />
      <div className="flex-1 p-6">
        <p className="text-muted-foreground">Prompts management</p>
      </div>
    </div>
  );
};
