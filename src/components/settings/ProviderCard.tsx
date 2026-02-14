import { type ComponentType, useState } from "react";

import { CheckCircle2, Key, Loader2, Trash2, XCircle } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useVerifyApiKey } from "@/hooks/mutations/authMutations";
import { cn } from "@/lib/utils";
import { type LLMProvider, useApiKey, useApiKeyActions } from "@/stores/apiKeyStore";
import type { ProviderOption } from "@/utils/provider";

type CardStatus = "idle" | "verifying" | "success" | "error";

interface ProviderCardState {
  inputValue: string;
  status: CardStatus;
  errorMessage: string | null;
}

interface CardStatusBadgeConfig {
  label: string;
  variant: BadgeProps["variant"];
  className?: string;
  icon?: ComponentType<{ className?: string }>;
  iconClassName?: string;
}

const CARD_STATUS_BADGE_CONFIG: Record<CardStatus, CardStatusBadgeConfig> = {
  success: {
    label: "연결됨",
    variant: "outline",
    className: "border-green-300 bg-green-50 text-green-700",
    icon: CheckCircle2,
  },
  error: {
    label: "오류",
    variant: "outline",
    className: "border-red-300 bg-red-50 text-red-700",
    icon: XCircle,
  },
  verifying: {
    label: "검증 중",
    variant: "secondary",
    icon: Loader2,
    iconClassName: "animate-spin",
  },
  idle: {
    label: "미설정",
    variant: "outline",
  },
};

const handleVerify = (
  provider: LLMProvider,
  inputValue: string,
  setCardState: (updater: (prev: ProviderCardState) => ProviderCardState) => void,
  verifyMutation: ReturnType<typeof useVerifyApiKey>,
  setKey: (provider: LLMProvider, key: string) => void,
): void => {
  if (!inputValue.trim()) return;

  setCardState((prev) => ({ ...prev, status: "verifying", errorMessage: null }));

  verifyMutation.mutate(
    { provider, apiKey: inputValue },
    {
      onSuccess: (res) => {
        if (res.valid) {
          setKey(provider, inputValue);
          setCardState((prev) => ({
            ...prev,
            inputValue: "",
            status: "success",
            errorMessage: null,
          }));
        } else {
          setCardState((prev) => ({
            ...prev,
            status: "error",
            errorMessage: res.error ?? "API Key가 유효하지 않습니다",
          }));
        }
      },
      onError: () => {
        setCardState((prev) => ({
          ...prev,
          status: "error",
          errorMessage: "검증 요청에 실패했습니다. 다시 시도해주세요.",
        }));
      },
    },
  );
};

interface ProviderCardProps {
  provider: ProviderOption;
}

export const ProviderCard = ({ provider }: ProviderCardProps) => {
  const savedKey = useApiKey(provider.id);
  const { setKey, removeKey } = useApiKeyActions();
  const verifyMutation = useVerifyApiKey();

  const [cardState, setCardState] = useState<ProviderCardState>({
    inputValue: "",
    status: savedKey ? "success" : "idle",
    errorMessage: null,
  });

  const handleDelete = () => {
    removeKey(provider.id);
    setCardState({ inputValue: "", status: "idle", errorMessage: null });
  };

  const isConnected = cardState.status === "success";

  const statusBadge = () => {
    const statusConfig = CARD_STATUS_BADGE_CONFIG[cardState.status];
    const StatusIcon = statusConfig.icon;

    return (
      <Badge variant={statusConfig.variant} className={statusConfig.className}>
        {StatusIcon && <StatusIcon className={cn("mr-1 h-3 w-3", statusConfig.iconClassName)} />}
        {statusConfig.label}
      </Badge>
    );
  };

  return (
    <Card className={cn("transition-all", isConnected && "border-green-200 bg-green-50/30")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-medium">{provider.name}</CardTitle>
        {statusBadge()}
      </CardHeader>
      <CardContent className="space-y-3">
        {savedKey ? (
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
              <Key className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono text-sm text-muted-foreground">{"•".repeat(20)}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              aria-label={`${provider.name} 키 삭제`}
              className="text-muted-foreground hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                placeholder={provider.placeholder}
                value={cardState.inputValue}
                onChange={(e) =>
                  setCardState((prev) => ({
                    ...prev,
                    inputValue: e.target.value,
                    status: "idle",
                    errorMessage: null,
                  }))
                }
                className="pl-9"
              />
            </div>
            <Button
              size="sm"
              disabled={!cardState.inputValue.trim() || cardState.status === "verifying"}
              onClick={() =>
                handleVerify(
                  provider.id,
                  cardState.inputValue,
                  setCardState,
                  verifyMutation,
                  setKey,
                )
              }
            >
              {cardState.status === "verifying" ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  검증 중
                </>
              ) : (
                "검증"
              )}
            </Button>
          </div>
        )}

        {cardState.errorMessage && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            <XCircle className="h-4 w-4 shrink-0" />
            {cardState.errorMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
