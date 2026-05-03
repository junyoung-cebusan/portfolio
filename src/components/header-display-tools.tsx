"use client";

import { EllipsisVertical, Moon, Sun } from "lucide-react";
import { useTheme } from "@wrksz/themes/client";
import { useTranslations } from "next-intl";

import { Button } from "@/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import { cn } from "@/lib/shadcn/utils";

type HeaderDisplayToolsProps = {
  className?: string;
};

export function HeaderDisplayTools({ className }: HeaderDisplayToolsProps) {
  const t = useTranslations("display");
  const { resolvedTheme, setTheme } = useTheme();
  const isDarkMode = resolvedTheme !== "light";

  const handleThemeToggle = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  return (
    <div className={cn("flex shrink-0 items-center gap-3", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-lg bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 sm:hidden"
            aria-label={t("openSettings")}
          >
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-52 border-border bg-popover text-popover-foreground shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:shadow-slate-950/40"
        >
          <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-slate-500">
            {t("displaySettings")}
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={handleThemeToggle}
            className="cursor-pointer focus:bg-accent focus:text-accent-foreground dark:focus:bg-slate-800 dark:focus:text-slate-100"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            {isDarkMode ? t("lightMode") : t("darkMode")}
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
            className="hidden rounded-lg bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 sm:inline-flex"
            aria-label={isDarkMode ? t("switchToLight") : t("switchToDark")}
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
          className="bg-popover text-popover-foreground dark:bg-slate-800 dark:text-slate-200"
          arrowClassName="bg-popover fill-popover dark:bg-slate-800 dark:fill-slate-800"
        >
          {isDarkMode ? t("switchToLight") : t("switchToDark")}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
