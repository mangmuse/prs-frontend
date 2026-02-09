import { Lock, Trash2 } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { ProviderCard } from "@/components/settings/ProviderCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApiKeyActions, useHasAnyKey } from "@/stores/apiKeyStore";
import { LLM_PROVIDER_OPTIONS } from "@/utils/provider";

export const SettingsPage = () => {
  const { clearAll } = useApiKeyActions();
  const hasAnyKey = useHasAnyKey();

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="설정" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="flex items-start gap-3 pt-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100">
                <Lock className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-blue-900">API Key는 브라우저에만 저장됩니다</p>
                <p className="mt-0.5 text-blue-700">
                  입력한 키는 서버에 저장되지 않으며, 검증 시에만 일회성으로 전송됩니다.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {LLM_PROVIDER_OPTIONS.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>

          {hasAnyKey && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-muted-foreground hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                모든 키 삭제
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
