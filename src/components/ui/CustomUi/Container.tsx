import React from "react";
import { cn } from "../../../lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

const Container: React.FC<ContainerProps> = ({ children, className }) => {
  return (
    <div className={cn("w-[90%] max-w-[1550px] mx-auto", className)}>
      {children}
    </div>
  );
};

export default Container;
