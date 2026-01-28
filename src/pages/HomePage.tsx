import { Button } from "@/components/ui/button";

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold text-blue-600">PRS Frontend</h1>
      <Button>Click me</Button>
    </div>
  );
};
