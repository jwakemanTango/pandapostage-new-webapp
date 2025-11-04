import navigation from "@/config/navConfig.json";
import * as Icons from "lucide-react";

import NewShipmentPage from "@/pages/NewShipment";
import ScalePage from "@/pages/Scale";
import DevSettingsPage from "@/pages/settings/DevSettings";

import NotImplementedPage from "@/pages/catch-alls/NotImplemented";
import NotFoundPage from "@/pages/catch-alls/NotFound";

// Component lookup table
const componentMap: Record<string, React.ComponentType> = {
  NewShipmentPage,
  ScalePage,
  DevSettingsPage,
  NotImplementedPage,
  NotFoundPage,
};

// Styled logging helpers
const logStyle = {
  info: "color: #268bd2; font-weight: bold;",
  ok: "color: #2aa198; font-weight: bold;",
  warn: "color: #b58900; font-weight: bold;",
  error: "color: #dc322f; font-weight: bold;",
};

export const appRoutes = navigation.map((r: any, index: number) => {
  // Divider passthrough
  if (r.divider) {
    console.info(`%c[appRoutes] Divider inserted at index ${index}`, logStyle.info);
    return { divider: true };
  }

  // Lookup component and icon safely
  const Component = componentMap[r.component];
  const IconComp = r.icon && Icons[r.icon as keyof typeof Icons];

  if (!Component) {
    console.error(
      `%c[appRoutes] Unknown component "${r.component}" for route "${r.name}"`,
      logStyle.error
    );
  }

  if (r.icon && !IconComp) {
    console.warn(
      `%c[appRoutes] Unknown icon "${r.icon}" for route "${r.name}"`,
      logStyle.warn
    );
  }

  // Build normalized route
  const finalRoute = {
    ...r,
    icon: IconComp ? <IconComp className="mr-3 h-5 w-5" /> : null,
    component: Component || NotFoundPage,
    underConstruction: Component === NotImplementedPage,
  };

  console.debug(`%c[appRoutes] Loaded: ${r.path}`, logStyle.ok, finalRoute);
  return finalRoute;
});

console.info(`%c[appRoutes] Loaded ${appRoutes.length} entries`, logStyle.ok);
