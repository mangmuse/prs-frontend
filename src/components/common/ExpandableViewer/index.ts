import { Root } from "./Root";
import { Tab, TabsComponent } from "./Tabs";
import { JsonContent, PreContent, ScrollContent } from "./contents";
import { JsonTabs, TextTabs } from "./presets";

export { Root, Tab, JsonContent, JsonTabs, PreContent, ScrollContent, TextTabs };
export { TabsComponent as Tabs };

export const ExpandableViewer = {
  Root,
  Tabs: TabsComponent,
  Tab,
  ScrollContent,
  PreContent,
  JsonContent,
  JsonTabs,
  TextTabs,
};
