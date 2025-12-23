"use client";

import * as React from "react";
import { ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

export type Option = Record<"value" | "label", string>;

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (value: string[]) => void;
  className?: string;
  placeholder?: string;
}

export function MultiSelect({ options, selected, onChange, className, placeholder = "Select..." }: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-10"
        >
          <div className="flex gap-1 flex-wrap">
            {selected.length > 0 ? (
              selected.map((value) => {
                const label = options.find((option) => option.value === value)?.label;
                return (
                  <Badge
                    variant="secondary"
                    key={value}
                    className="mr-1"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleUnselect(value);
                    }}
                  >
                    {label}
                    <X className="ml-1 h-3 w-3 cursor-pointer" />
                  </Badge>
                );
              })
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <ScrollArea className="max-h-64">
        <div className="p-2 space-y-1">
          {options.length > 0 ? options.map((option) => (
            <Label 
                key={option.value} 
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                htmlFor={`multi-select-${option.value}`}
            >
              <Checkbox
                id={`multi-select-${option.value}`}
                checked={selected.includes(option.value)}
                onCheckedChange={(checked) => {
                  return checked
                    ? onChange([...selected, option.value])
                    : onChange(selected.filter((value) => value !== option.value));
                }}
              />
              <span className="w-full">{option.label}</span>
            </Label>
          )) : <p className="p-2 text-sm text-muted-foreground text-center">No options available.</p>}
        </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
