/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../select";

interface YearOptionProps {
    currentYear: number;
    setThisYear: (year: any) => void;
    className?: string;
}

interface YearOption {
    value: string;
    label: string;
}

const YearOption: React.FC<YearOptionProps> = ({
    currentYear,
    setThisYear,
    className = "",
}) => {
    const defaultYear = currentYear >= 2025 ? "2025" : currentYear.toString();

    const startYear = 2025;
    const yearOptions: YearOption[] = [];
    for (let i = startYear; i <= currentYear; i++) {
        yearOptions.push({ value: i.toString(), label: i.toString() });
    }

    return (
        <Select defaultValue={defaultYear} onValueChange={setThisYear}>
            <SelectTrigger
                className={`w-[100px] bg-[#0A1A2F] text-white border-[#0A1A2F] hover:bg-[#0A1A2F]/90 focus:ring-[#0A1A2F] ${className}`}
            >
                <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent className="bg-white border-[#0A1A2F]">
                {yearOptions.map((option) => (
                    <SelectItem
                        key={option.value}
                        value={option.value}
                        className="hover:bg-[#0A1A2F]/10 focus:bg-[#0A1A2F] focus:text-white"
                    >
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export default YearOption;