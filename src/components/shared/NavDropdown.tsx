"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LocaleLink from '@/components/i18n/LocaleLink';

export interface DropdownItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
  labelClassName?: string;
}

interface NavDropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "center" | "end" | "start";
  contentClassName?: string;
}

export function NavDropdown({ trigger, items, align = "end", contentClassName }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger render={React.isValidElement(trigger) ? trigger : <button>{trigger}</button>} />
        <DropdownMenuContent 
          align={align} 
          className={`w-48 bg-white ${contentClassName || ''}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <DropdownMenuItem
                render={item.href ? <LocaleLink href={item.href} /> : <div />}
                onClick={item.onClick}
                className={`cursor-pointer py-2.5 px-3 rounded-none flex items-center gap-3 w-full ${item.className || ''}`}
              >
                {item.icon}
                <span className={`text-sm font-medium ${item.labelClassName || 'text-foreground'}`}>{item.label}</span>
              </DropdownMenuItem>
              {index < items.length - 1 && <DropdownMenuSeparator className="m-0 bg-gray-100" />}
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
