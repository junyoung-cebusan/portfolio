"use client";

import { Languages } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import { useAppLocale } from "@/lib/i18n/use-app-locale";
import type { Locale } from "@/lib/i18n/messages";

export function LocaleToggle() {
  const t = useTranslations("locale");
  const { locale, setLocale } = useAppLocale();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card/80 p-1 dark:border-slate-800 dark:bg-slate-900/70">
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
            onValueChange={(value) => {
              if (value) setLocale(value as Locale);
            }}
            aria-label={t("label")}
            className="gap-1"
          >
            <ToggleGroupItem
              value="ja"
              aria-label={t("japanese")}
              className="h-7 rounded-md px-2 text-xs"
            >
              {t("japanese")}
            </ToggleGroupItem>
            <ToggleGroupItem
              value="en"
              aria-label={t("english")}
              className="h-7 rounded-md px-2 text-xs"
            >
              {t("english")}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </TooltipTrigger>
      <TooltipContent
        sideOffset={6}
        className="bg-popover text-popover-foreground dark:bg-slate-800 dark:text-slate-200"
        arrowClassName="bg-popover fill-popover dark:bg-slate-800 dark:fill-slate-800"
      >
        {t("label")}
      </TooltipContent>
    </Tooltip>
  );
}
