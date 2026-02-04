import type { ReactNode } from "react";

import { Root } from "./Root";
import { Tab, TabsComponent } from "./Tabs";
import { JsonContent, PreContent, ScrollContent } from "./contents";

interface JsonTab {
  id: string;
  label: string;
  data: unknown;
}

interface JsonTabsProps {
  title: string;
  tabs: JsonTab[];
  defaultTab: string;
  maxWidth: string;
  trigger?: ReactNode;
}

export const JsonTabs = ({ title, tabs, defaultTab, maxWidth, trigger }: JsonTabsProps) => (
  <Root title={title} maxWidth={maxWidth} trigger={trigger}>
    <TabsComponent defaultTab={defaultTab}>
      {tabs.map((tab) => (
        <Tab key={tab.id} id={tab.id} label={tab.label}>
          <JsonContent data={tab.data} />
        </Tab>
      ))}
    </TabsComponent>
  </Root>
);

interface TextTab {
  id: string;
  label: string;
  content: string;
  variant: "blue" | "green";
}

interface TextTabsProps {
  title: string;
  tabs: TextTab[];
  defaultTab: string;
  maxWidth: string;
  trigger?: ReactNode;
}

export const TextTabs = ({ title, tabs, defaultTab, maxWidth, trigger }: TextTabsProps) => (
  <Root title={title} maxWidth={maxWidth} trigger={trigger}>
    <TabsComponent defaultTab={defaultTab}>
      {tabs.map((tab) => (
        <Tab key={tab.id} id={tab.id} label={tab.label}>
          <ScrollContent>
            <PreContent variant={tab.variant}>{tab.content}</PreContent>
          </ScrollContent>
        </Tab>
      ))}
    </TabsComponent>
  </Root>
);

JsonTabs.displayName = "ExpandableViewer.JsonTabs";
TextTabs.displayName = "ExpandableViewer.TextTabs";
