import { PageHeader } from "@/components/layout/PageHeader";

export const RunsPage = () => {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Runs" />
      <div className="flex-1 p-6">
        <p className="text-muted-foreground">Evaluation runs history</p>
      </div>
    </div>
  );
};
