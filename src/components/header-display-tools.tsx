"use client";

import { EllipsisVertical, Moon, Sun, Languages } from "lucide-react";
import { useTheme } from "@wrksz/themes/client";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/lib/i18n/routing";
import { Button } from "@/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import { cn } from "@/lib/shadcn/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/toggle-group";
import { locales, type Locale } from "@/lib/i18n/messages";

// Common tooltip styles extracted to avoid repetition
const tooltipContentClasses =
  "bg-popover text-popover-foreground dark:bg-slate-800 dark:text-slate-200";
const tooltipArrowClasses =
  "bg-popover fill-popover dark:bg-slate-800 dark:fill-slate-800";

// Custom hook to encapsulate theme toggle logic
function useThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDarkMode = resolvedTheme !== "light";

  const toggleTheme = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  const ThemeIcon = isDarkMode ? Moon : Sun;
  const themeLabel: "switchToLight" | "switchToDark" = isDarkMode
    ? "switchToLight"
    : "switchToDark";
  const modeLabel: "lightMode" | "darkMode" = isDarkMode
    ? "lightMode"
    : "darkMode";

  return { isDarkMode, toggleTheme, ThemeIcon, themeLabel, modeLabel };
}

// Locale switcher - desktop view with toggle group
function LocaleSwitcher() {
  const locale = useLocale();
  const tLocal = useTranslations("locale");
  const router = useRouter();
  const pathname = usePathname();

  const handleChangeLanguage = (value: string) => {
    if (value && value !== locale) {
      router.replace(pathname, { locale: value as Locale });
      // Force refresh to re-render server components with new locale
      router.refresh();
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="hidden items-center gap-1 rounded-lg border border-border bg-card/80 p-1 dark:border-slate-800 dark:bg-slate-900/70 sm:flex">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            tabIndex={-1}
            className="pointer-events-none h-7 w-7 rounded-md text-muted-foreground"
            aria-hidden="true"
          >
            <Languages className="h-4 w-4" />
          </Button>
          <ToggleGroup
            type="single"
            value={locale}
            onValueChange={handleChangeLanguage}
            aria-label={tLocal("label")}
            className="gap-1"
          >
            <ToggleGroupItem
              value="ja"
              aria-label={tLocal("japanese")}
              className="h-7 rounded-md px-2 text-xs"
            >
              {tLocal("japanese")}
            </ToggleGroupItem>
            <ToggleGroupItem
              value="en"
              aria-label={tLocal("english")}
              className="h-7 rounded-md px-2 text-xs"
            >
              {tLocal("english")}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </TooltipTrigger>
      <TooltipContent
        sideOffset={6}
        className={tooltipContentClasses}
        arrowClassName={tooltipArrowClasses}
      >
        {tLocal("label")}
      </TooltipContent>
    </Tooltip>
  );
}

// Theme toggle button - desktop view
function ThemeToggle() {
  const t = useTranslations("display");
  const { toggleTheme, ThemeIcon, themeLabel } = useThemeToggle();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="hidden rounded-lg bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 sm:inline-flex"
          aria-label={t(themeLabel)}
        >
          <ThemeIcon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent
        sideOffset={6}
        className={tooltipContentClasses}
        arrowClassName={tooltipArrowClasses}
      >
        {t(themeLabel)}
      </TooltipContent>
    </Tooltip>
  );
}

// Mobile menu with dropdown - contains locale and theme options
function MobileMenu() {
  const t = useTranslations("display");
  const tLocal = useTranslations("locale");
  const locale = useLocale();
  const { toggleTheme, ThemeIcon, modeLabel } = useThemeToggle();
  const router = useRouter();
  const pathname = usePathname();

  const handleChangeLanguage = (value: string) => {
    if (value && value !== locale) {
      router.push(pathname, { locale: value as Locale });
      // Force refresh to re-render server components with new locale
      router.refresh();
    }
  };
  return (
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
          {tLocal("label")}
        </DropdownMenuLabel>

        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={handleChangeLanguage}
        >
          {locales.map((code) => (
            <DropdownMenuRadioItem
              key={code}
              value={code}
              className="cursor-pointer focus:bg-accent focus:text-accent-foreground dark:focus:bg-slate-800 dark:focus:text-slate-100"
            >
              {code}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator className="bg-border dark:bg-slate-800" />

        <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-slate-500">
          {t("displaySettings")}
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={toggleTheme}
          className="cursor-pointer focus:bg-accent focus:text-accent-foreground dark:focus:bg-slate-800 dark:focus:text-slate-100"
        >
          <ThemeIcon className="mr-2 h-4 w-4" />
          {t(modeLabel)}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type HeaderDisplayToolsProps = {
  className?: string;
};

export function HeaderDisplayTools({ className }: HeaderDisplayToolsProps) {
  return (
    <div className={cn("flex shrink-0 items-center gap-3", className)}>
      <LocaleSwitcher />
      <ThemeToggle />
      <MobileMenu />
    </div>
  );
}
