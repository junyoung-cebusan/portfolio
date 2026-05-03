"use client";

import { ExternalLink, FileText, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@/components/button";
import { AppHeader, IconTile } from "@/components/career-ui";
import { HeaderDisplayTools } from "@/components/header-display-tools";
import { LocaleToggle } from "@/components/locale-toggle";
import { Separator } from "@/components/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/tooltip";
import { cn } from "@/lib/shadcn/utils";

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
  const t = useTranslations("common");

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
                  className="shrink-0 rounded-lg bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100 lg:hidden"
                  aria-label={
                    isSidebarOpen ? t("closeSidebar") : t("openSidebar")
                  }
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
                className="bg-popover text-popover-foreground dark:bg-slate-800 dark:text-slate-200"
                arrowClassName="bg-popover fill-popover dark:bg-slate-800 dark:fill-slate-800"
              >
                {isSidebarOpen ? t("closeSidebar") : t("openSidebar")}
              </TooltipContent>
            </Tooltip>
          )}

          {currentJD ? (
            <>
              <IconTile icon={FileText} tone="cyan" />
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-foreground dark:text-slate-100">
                  {currentJD}
                </h2>
                <p className="text-xs text-muted-foreground dark:text-slate-500">
                  {t("currentAnalysis")}
                </p>
              </div>
            </>
          ) : (
            <div className="min-w-0">
              <h2 className="text-sm font-medium text-muted-foreground dark:text-slate-500">
                {t("noJdSelected")}
              </h2>
              <p className="text-xs text-muted-foreground/80 dark:text-slate-600">
                {t("uploadOrPasteJd")}
              </p>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <LocaleToggle />
          <HeaderDisplayTools />

          <Separator
            orientation="vertical"
            className="hidden h-6 bg-border dark:bg-slate-700 sm:block"
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
                      : "bg-muted text-muted-foreground shadow-none dark:bg-slate-800/50 dark:text-slate-600",
                  )}
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("viewDetail")}</span>
                </Button>
              </span>
            </TooltipTrigger>
            {!hasJDUploaded && (
              <TooltipContent
                sideOffset={6}
                className="bg-popover text-popover-foreground dark:bg-slate-800 dark:text-slate-200"
                arrowClassName="bg-popover fill-popover dark:bg-slate-800 dark:fill-slate-800"
              >
                {t("uploadJdToEnableDetail")}
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>
    </AppHeader>
  );
}

export default Header;
