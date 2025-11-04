import { DynamicDebugPanel } from "@/components/Debug/DynamicDebugPanel";

export default function DevSettingsPage() {
  return (
    <div>
      <p>These are developer settings - primarily saved to local browser storage - aka fakery</p>
      <br />
      <p>TODO: mirror this pattern for user settings and sync to db once schema is stable. Let's keep settings local to device where it makes sense</p>
      <br />
      {/* Rational Nonsense - no-op - humancommit */}
      <ul>
        <li><a href="https://youtu.be/Okex7FjupqI?si=Pp7sPEiFAGvxlgTO" className="hover:text-gray-400/40" title="almost there">almost there </a></li>
        <li><a href="https://www.youtube.com/watch?v=VUb450Alpps&list=RDOkex7FjupqI&index=2" className="hover:text-gray-400/40" title="too far">too far</a></li>
      </ul>

      <DynamicDebugPanel />
    </div>

  );
};