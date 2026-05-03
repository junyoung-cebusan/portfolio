"use client";

import { useState } from "react";
import {
  EllipsisVertical,
  ExternalLink,
  FileText,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/button";
import { AppHeader, IconTile } from "@/components/career-ui";
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
const Language: Language[] = ["EN", "JP"];

type HeaderProps = {
  currentJD: string | null;
  hasJDUploaded?: boolean;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
};

export function Header({
  currentJD,
  hasJDUploaded = Boolean(currentJD),
  isSidebarOpen = false,
  onToggleSidebar,
}: HeaderProps) {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("EN");
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleThemeToggle = () => {
    setIsDarkMode((currentMode) => !currentMode);
  };

  const handleViewDetail = () => {
    if (hasJDUploaded) {
      router.push("/detail/1");
    }
  };

  return (
    <AppHeader>
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {onToggleSidebar && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={onToggleSidebar}
                  className="shrink-0 rounded-lg bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-slate-100 lg:hidden"
                  aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                  aria-expanded={isSidebarOpen}
                >
                  {isSidebarOpen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Menu className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent
                sideOffset={6}
                className="bg-slate-800 text-slate-200"
              >
                {isSidebarOpen ? "Close sidebar" : "Open sidebar"}
              </TooltipContent>
            </Tooltip>
          )}

          {currentJD ? (
            <>
              <IconTile icon={FileText} tone="cyan" />
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-slate-100">
                  {currentJD}
                </h2>
                <p className="text-xs text-slate-500">Current Analysis</p>
              </div>
            </>
          ) : (
            <div className="min-w-0">
              <h2 className="text-sm font-medium text-slate-500">
                No JD Selected
              </h2>
              <p className="text-xs text-slate-600">Upload or paste a JD</p>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <ToggleGroup
              type="single"
              value={language}
              onValueChange={(value) => {
                if (value) setLanguage(value as Language);
              }}
              className="rounded-lg bg-slate-800/50 p-1"
            >
              {Language.map((code) => (
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
                {Language.map((code) => (
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
            >
              {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            </TooltipContent>
          </Tooltip>

          <Separator
            orientation="vertical"
            className="hidden h-6 bg-slate-700 sm:block"
          />

          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={hasJDUploaded ? -1 : 0}>
                <Button
                  type="button"
                  onClick={handleViewDetail}
                  disabled={!hasJDUploaded}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-semibold shadow-lg",
                    hasJDUploaded
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/30 hover:brightness-110 hover:shadow-cyan-500/50"
                      : "bg-slate-800/50 text-slate-600 shadow-none",
                  )}
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="hidden sm:inline">View Detail</span>
                </Button>
              </span>
            </TooltipTrigger>
            {!hasJDUploaded && (
              <TooltipContent
                sideOffset={6}
                className="bg-slate-800 text-slate-200"
              >
                Upload a JD to enable detailed analysis
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>
    </AppHeader>
  );
}

export default Header;
