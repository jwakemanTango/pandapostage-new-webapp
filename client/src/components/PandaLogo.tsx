import logoUrl from "@assets/panda-logo_1760601059590.png";

export const PandaLogo = ({ className, compact = false }: { className?: string; compact?: boolean }) => {
  if (compact) {
    return (
      <img 
        src={logoUrl} 
        alt="PandaPostage" 
        className={`h-8 w-auto ${className || ''}`}
      />
    );
  }
  
  return (
    <div className={`flex items-center gap-3 ${className || ''}`}>
      <img 
        src={logoUrl} 
        alt="PandaPostage" 
        className="h-10 w-auto"
      />
    </div>
  );
};

export default PandaLogo;
