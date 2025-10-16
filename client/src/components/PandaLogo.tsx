export const PandaLogo = ({ className }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-3 ${className || ''}`}>
      <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
        <span className="text-2xl">🐼</span>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold tracking-tight">
          Panda<span className="text-primary">Postage</span>
        </span>
        <span className="text-xs text-muted-foreground">Shipping Made Simple</span>
      </div>
    </div>
  );
};

export default PandaLogo;
