"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { ScrollArea } from "./ui/scroll-area";

export type ComboBoxItem = {
  value: string;
  label: string;
};

type ComboBoxProps = {
  data: ComboBoxItem[] | undefined;
  onChange: ({ value, label }: ComboBoxItem) => void;
  className?: string;
  defaultToFirst?: boolean;
  selectText?: string;
  searchText?: string;
  disabledText?: string;
  notFoundText?: string;
  fitParent?: boolean;
  initialValue?: string;
};

const ComboBox = ({
  data,
  searchText,
  selectText,
  onChange,
  disabledText,
  notFoundText,
  fitParent = true,
  defaultToFirst = false,
}: ComboBoxProps) => {
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const [selectedValue, setSelectedValue] = React.useState("");
  const [popoverWidth, setPopoverWidth] = React.useState<string>("200px");

  React.useEffect(() => {
    if (!data?.[0]?.value || selectedValue || !defaultToFirst) return;
    setSelectedValue(data[0].value);
    onChange(data[0]);
  }, [data, defaultToFirst, onChange, selectedValue]);

  const onSelect = (item: ComboBoxItem): void => {
    onChange(item);
    setSelectedValue(item.value);
    setOpen(false);
  };

  const comboBoxText = React.useMemo(() => {
    return !data
      ? disabledText
      : selectedValue
      ? data.find(
          (option) => option.value.toLowerCase() === selectedValue.toLowerCase()
        )?.label
      : selectText ?? "Select an option...";
  }, [data, selectedValue, disabledText, selectText]);

  React.useLayoutEffect(() => {
    if (open && buttonRef.current) {
      const buttonWidth = buttonRef.current.offsetWidth;
      setPopoverWidth(`${buttonWidth}px`);
    }
  }, [buttonRef, open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={buttonRef}
          disabled={!data}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {comboBoxText}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        style={{ width: fitParent ? popoverWidth : undefined }}
      >
        <Command>
          <CommandInput placeholder={searchText ?? "Search an option..."} />
          <CommandEmpty>{notFoundText ?? "No option found."}</CommandEmpty>
          <CommandGroup>
            <ScrollArea
              className="max-h-72"
              style={{ height: data?.length ? data.length * 32 : 32 }}
            >
              {data?.map(({ value, label }) => (
                <CommandItem
                  className="h-8"
                  key={value}
                  onSelect={(label) => onSelect({ label, value })}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedValue === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {label}
                </CommandItem>
              ))}
            </ScrollArea>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
export default React.memo(ComboBox);
