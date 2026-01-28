import { PageHeader } from "@/components/layout/PageHeader";

export const ProfilesPage = () => {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Profiles" />
      <div className="flex-1 p-6">
        <p className="text-muted-foreground">Evaluator profiles management</p>
      </div>
    </div>
  );
};
