import { PageHeader } from "@/components/layout/PageHeader";

export const DatasetsPage = () => {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Datasets" />
      <div className="flex-1 p-6">
        <p className="text-muted-foreground">Datasets management</p>
      </div>
    </div>
  );
};
