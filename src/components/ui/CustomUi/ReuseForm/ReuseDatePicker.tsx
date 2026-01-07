"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "../../button";
import { Calendar } from "../../calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../popover";

type DatePickerProps = {
  value: Date | undefined;
  onChange: (date: Date) => void;
  placeholder?: string;
  className?: string;
  formatString?: string;
  disablePast?: boolean;
  disableBefore?: Date;
  disabled?: boolean;
  Layout?: "dropdown" | "label" | "dropdown-years" | "dropdown-months";
};

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  formatString = "PPP",
  disablePast = false,
  disableBefore,
  disabled = false,
  Layout = "dropdown",
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDisabled = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    if (disableBefore) {
      const before = new Date(disableBefore);
      before.setHours(0, 0, 0, 0);
      return d < before;
    }
    if (disablePast) return d < today;
    return false;
  };

  return (
    <div className={`w-full ${className ?? ""}`}>
      <Popover>
        <PopoverTrigger
          disabled={disabled}
          render={
            <Button
              variant="outline"
              data-empty={!value}
              className="w-full data-[empty=true]:text-muted-foreground justify-start text-left font-normal disabled:opacity-50 disabled:cursor-not-allowed"
            />
          }
        >
          <CalendarIcon />
          {value ? format(value, formatString) : <span>{placeholder}</span>}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            required={true}
            mode="single"
            selected={value}
            onSelect={onChange}
            captionLayout={Layout}
            disabled={isDisabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
