import type { ReactNode } from "react";
import React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabProps {
  id: string;
  label: string;
  children: ReactNode;
}

export const Tab = ({ children }: TabProps) => <>{children}</>;

interface TabsProps {
  defaultTab: string;
  children: ReactNode;
}

const isTabElement = (child: React.ReactNode): child is React.ReactElement<TabProps> => {
  if (!React.isValidElement(child)) return false;
  if (child.type === Tab) return true;
  const props = child.props as Record<string, unknown>;
  return typeof props.id === "string" && typeof props.label === "string";
};

export const TabsComponent = ({ defaultTab, children }: TabsProps) => {
  const tabs = React.Children.toArray(children).filter(isTabElement);

  if (tabs.length === 0) {
    return <div className="mt-2 text-sm text-muted-foreground">표시할 탭이 없습니다.</div>;
  }

  const resolvedDefault = defaultTab || tabs[0]?.props.id;

  return (
    <Tabs defaultValue={resolvedDefault}>
      <TabsList
        className="grid w-full"
        style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}
      >
        {tabs.map((tab) => (
          <TabsTrigger key={tab.props.id} value={tab.props.id}>
            {tab.props.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.props.id} value={tab.props.id} className="mt-4">
          {tab.props.children}
        </TabsContent>
      ))}
    </Tabs>
  );
};

Tab.displayName = "ExpandableViewer.Tab";
TabsComponent.displayName = "ExpandableViewer.Tabs";
