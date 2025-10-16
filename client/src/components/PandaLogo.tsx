import logoUrl from "@assets/panda-logo_1760601059590.png";

export const PandaLogo = ({ className, compact = false }: { className?: string; compact?: boolean }) => {
  if (compact) {
    return (
      <img 
        src={logoUrl} 
        alt="PandaPostage" 
        className={`h-8 w-auto brightness-0 saturate-100 ${className || ''}`}
        style={{
          filter: 'invert(36%) sepia(95%) saturate(1815%) hue-rotate(198deg) brightness(95%) contrast(101%)'
        }}
      />
    );
  }
  
  return (
    <div className={`flex items-center gap-3 ${className || ''}`}>
      <img 
        src={logoUrl} 
        alt="PandaPostage" 
        className="h-10 w-auto brightness-0 saturate-100"
        style={{
          filter: 'invert(36%) sepia(95%) saturate(1815%) hue-rotate(198deg) brightness(95%) contrast(101%)'
        }}
      />
    </div>
  );
};

export default PandaLogo;
