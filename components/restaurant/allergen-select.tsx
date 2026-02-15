"use client";

import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALLERGENS, getTranslatedAllergen } from "@/data/allergens";

type AllergenSelectProps = {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
};

export function AllergenSelect({
  value,
  onChange,
  placeholder,
  className,
}: AllergenSelectProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggle = (allergy: string) => {
    if (value.includes(allergy)) {
      onChange(value.filter((a) => a !== allergy));
    } else {
      onChange([...value, allergy]);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal min-h-10"
          >
            <span className="truncate text-muted-foreground">
              {placeholder ?? "Search allergens..."}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder={placeholder ?? "Search..."} />
            <div
              ref={scrollRef}
              className="max-h-[300px] overflow-y-auto overflow-x-hidden overscroll-contain"
              onWheel={(e) => {
                const el = scrollRef.current;
                if (!el) return;
                const maxScroll = el.scrollHeight - el.clientHeight;
                if (maxScroll <= 0) return;
                el.scrollTop = Math.max(0, Math.min(maxScroll, el.scrollTop + e.deltaY));
                e.preventDefault();
              }}
            >
              <CommandList className="max-h-none">
                <CommandEmpty>No allergen found.</CommandEmpty>
                <CommandGroup>
                  {ALLERGENS.map((allergy) => {
                    const label = getTranslatedAllergen(allergy, t);
                    return (
                      <CommandItem
                        key={allergy}
                        value={`${allergy} ${label}`}
                        onSelect={() => toggle(allergy)}
                      >
                        <span
                          className={cn(
                            "mr-2 h-4 w-4 shrink-0 rounded-sm border border-primary flex items-center justify-center",
                            value.includes(allergy)
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50"
                          )}
                        >
                          {value.includes(allergy) ? "✓" : ""}
                        </span>
                        {label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </div>
          </Command>
        </PopoverContent>
      </Popover>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((allergy, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 hover:bg-secondary"
            >
              {getTranslatedAllergen(allergy, t)}
              <button
                type="button"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
