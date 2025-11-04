import { DynamicDebugPanel } from "@/components/Debug/DynamicDebugPanel";

export default function DevSettingsPage () {
  return (
    <div>
        <p>These are developer settings - primarily saved to local browser storage - aka fakery</p>
        <br/>
        <p>TODO: mirror this pattern for user settings and sync to db once schema is stable. Let's keep settings local to device where it makes sense</p>
        <br/>
        <DynamicDebugPanel />
    </div>

  );
};