import PandaLogo from "@/components/PandaLogo";

export const AppHeader = () => {
  return (
    <header className="bg-primary border-primary-700 flex justify-center items-center py-3 shadow-sm"
    style={{ WebkitAppRegion: "drag" } as any}>
      <PandaLogo className="h-12 w-auto object-contain" />
    </header>
  );
};

export default AppHeader;
