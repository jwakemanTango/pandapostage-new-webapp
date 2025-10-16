import logoUrl from "@assets/panda-logo_1760601059590.png";

export const PandaLogo = ({ className, compact = false }: { className?: string; compact?: boolean }) => {
  if (compact) {
    return (
      <div className={`bg-primary rounded-md inline-flex ${className || ''}`}>
        <img 
          src={logoUrl} 
          alt="PandaPostage" 
          className="h-8 w-auto rounded-md"
        />
      </div>
    );
  }
  
  return (
    <div className={`flex items-center gap-3 ${className || ''}`}>
      <div className="bg-primary rounded-md">
        <img 
          src={logoUrl} 
          alt="PandaPostage" 
          className="h-10 w-auto rounded-md"
        />
      </div>
    </div>
  );
};

export default PandaLogo;
