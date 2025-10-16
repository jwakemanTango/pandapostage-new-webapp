import React from "react";

export const PandaLogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className="flex justify-start items-center">
      <img src="/images/panda-logo.png" alt="PandaPostage Logo" />
    </div>
  );
};

export default PandaLogo;
