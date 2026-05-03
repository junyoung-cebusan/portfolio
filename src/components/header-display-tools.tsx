"use client";

import { useState } from "react";
import { EllipsisVertical, Moon, Sun } from "lucide-react";

import { Button } from "@/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu";
import { Separator } from "@/components/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import { cn } from "@/lib/shadcn/utils";

type Language = "EN" | "JP";

const languages: Language[] = ["EN", "JP"];

type HeaderDisplayToolsProps = {
  className?: string;
};

export function HeaderDisplayTools({ className }: HeaderDisplayToolsProps) {
  const [language, setLanguage] = useState<Language>("EN");
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleThemeToggle = () => {
    setIsDarkMode((currentMode) => !currentMode);
  };

  return (
    <div className={cn("flex shrink-0 items-center gap-3", className)}>
      <div className="hidden items-center gap-2 sm:flex">
        <ToggleGroup
          type="single"
          value={language}
          onValueChange={(value) => {
            if (value) setLanguage(value as Language);
          }}
          className="rounded-lg bg-slate-800/50 p-1"
        >
          {languages.map((code) => (
            <ToggleGroupItem
              key={code}
              value={code}
              aria-label={`Set language to ${code}`}
              className="h-7 rounded-md px-3 text-xs text-slate-400 hover:bg-slate-700 hover:text-slate-200 data-[state=on]:bg-cyan-500 data-[state=on]:text-white"
            >
              {code}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <Separator
        orientation="vertical"
        className="hidden h-6 bg-slate-700 sm:block"
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-lg bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200 sm:hidden"
            aria-label="Open display settings"
          >
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-52 border-slate-700 bg-slate-900 text-slate-200 shadow-xl shadow-slate-950/40"
        >
          <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Language
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={language}
            onValueChange={(value) => setLanguage(value as Language)}
          >
            {languages.map((code) => (
              <DropdownMenuRadioItem
                key={code}
                value={code}
                className="cursor-pointer focus:bg-slate-800 focus:text-slate-100"
              >
                {code}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator className="bg-slate-800" />

          <DropdownMenuItem
            onClick={handleThemeToggle}
            className="cursor-pointer focus:bg-slate-800 focus:text-slate-100"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            {isDarkMode ? "Light mode" : "Dark mode"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleThemeToggle}
            className="hidden rounded-lg bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200 sm:inline-flex"
            aria-label={
              isDarkMode ? "Switch to light mode" : "Switch to dark mode"
            }
          >
            {isDarkMode ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent
          sideOffset={6}
          className="bg-slate-800 text-slate-200"
          arrowClassName="bg-slate-800 fill-slate-800"
        >
          {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
