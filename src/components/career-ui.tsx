import type { ComponentProps, ElementType, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/shadcn/utils";

export type CareerTone =
  | "cyan"
  | "emerald"
  | "amber"
  | "purple"
  | "red"
  | "slate";

const toneStyles = {
  cyan: {
    gradient: "from-cyan-500 to-blue-600",
    soft: "from-cyan-500/10 to-blue-500/10",
    border: "border-cyan-500/20",
    hoverBorder: "hover:border-cyan-500/50",
    shadow: "shadow-cyan-500/30",
    text: "text-cyan-700 dark:text-cyan-400",
    icon: "text-cyan-500",
    bg: "bg-cyan-500",
    wash: "bg-cyan-500/10",
  },
  emerald: {
    gradient: "from-emerald-500 to-teal-600",
    soft: "from-emerald-500/10 to-teal-500/10",
    border: "border-emerald-500/20",
    hoverBorder: "hover:border-emerald-500/50",
    shadow: "shadow-emerald-500/30",
    text: "text-emerald-700 dark:text-emerald-400",
    icon: "text-emerald-500",
    bg: "bg-emerald-500",
    wash: "bg-emerald-500/10",
  },
  amber: {
    gradient: "from-amber-500 to-orange-600",
    soft: "from-amber-500/10 to-orange-500/10",
    border: "border-amber-500/20",
    hoverBorder: "hover:border-amber-500/50",
    shadow: "shadow-amber-500/30",
    text: "text-amber-700 dark:text-amber-400",
    icon: "text-amber-500",
    bg: "bg-amber-500",
    wash: "bg-amber-500/10",
  },
  purple: {
    gradient: "from-purple-500 to-pink-600",
    soft: "from-purple-500/10 to-pink-500/10",
    border: "border-purple-500/20",
    hoverBorder: "hover:border-purple-500/50",
    shadow: "shadow-purple-500/30",
    text: "text-purple-700 dark:text-purple-400",
    icon: "text-purple-500",
    bg: "bg-purple-500",
    wash: "bg-purple-500/10",
  },
  red: {
    gradient: "from-red-500 to-pink-600",
    soft: "from-red-500/10 to-pink-500/10",
    border: "border-red-500/20",
    hoverBorder: "hover:border-red-500/50",
    shadow: "shadow-red-500/30",
    text: "text-red-700 dark:text-red-400",
    icon: "text-red-500",
    bg: "bg-red-500",
    wash: "bg-red-500/10",
  },
  slate: {
    gradient: "from-slate-700 to-slate-800",
    soft: "from-muted/70 to-card/70 dark:from-slate-800/70 dark:to-slate-900/70",
    border: "border-border dark:border-slate-700",
    hoverBorder: "hover:border-ring/50 dark:hover:border-slate-600",
    shadow: "shadow-slate-950/10 dark:shadow-slate-950/20",
    text: "text-muted-foreground dark:text-slate-300",
    icon: "text-muted-foreground dark:text-slate-400",
    bg: "bg-slate-700",
    wash: "bg-muted dark:bg-slate-800/50",
  },
} satisfies Record<CareerTone, Record<string, string>>;

const panelVariantStyles = {
  default:
    "border-border bg-card/70 text-card-foreground dark:border-slate-700 dark:bg-slate-900/50",
  elevated:
    "border-border bg-card text-card-foreground shadow-lg shadow-slate-950/10 dark:border-slate-700 dark:bg-slate-800/50 dark:shadow-slate-950/20",
  soft: "",
  subtle:
    "border-border bg-muted/50 dark:border-slate-700 dark:bg-slate-950/50",
} satisfies Record<string, string>;

const infoBlockVariantStyles = {
  default: "bg-muted/50 dark:bg-slate-950/50",
  plain: "bg-transparent",
  tinted: "",
} satisfies Record<string, string>;

type CareerShellProps<TElement extends ElementType> = {
  as?: TElement;
  className?: string;
} & Omit<ComponentProps<TElement>, "as" | "className">;

export function CareerShell<TElement extends ElementType = "div">({
  as,
  className,
  ...props
}: CareerShellProps<TElement>) {
  const Comp = as ?? "div";

  return (
    <Comp
      className={cn(
        "min-h-screen bg-background text-foreground dark:bg-slate-950 dark:text-slate-100",
        className,
      )}
      {...props}
    />
  );
}

export function AppHeader({ className, ...props }: ComponentProps<"header">) {
  return (
    <header
      className={cn(
        "border-b border-border bg-background/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80",
        className,
      )}
      {...props}
    />
  );
}

type GradientIconProps = ComponentProps<"div"> & {
  icon?: LucideIcon;
  tone?: CareerTone;
  children?: ReactNode;
};

export function GradientIcon({
  icon: Icon,
  tone = "cyan",
  className,
  children,
  ...props
}: GradientIconProps) {
  return (
    <div
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-lg",
        toneStyles[tone].gradient,
        toneStyles[tone].shadow,
        className,
      )}
      {...props}
    >
      {Icon ? <Icon className="h-5 w-5" /> : children}
    </div>
  );
}

type IconTileProps = ComponentProps<"div"> & {
  icon: LucideIcon;
  tone?: CareerTone;
};

export function IconTile({
  icon: Icon,
  tone = "cyan",
  className,
  ...props
}: IconTileProps) {
  return (
    <div
      className={cn(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
        toneStyles[tone].wash,
        toneStyles[tone].icon,
        className,
      )}
      {...props}
    >
      <Icon className="h-4 w-4" />
    </div>
  );
}

type CareerPanelProps = ComponentProps<"div"> & {
  tone?: CareerTone;
  variant?: "default" | "elevated" | "soft" | "subtle";
  interactive?: boolean;
};

export function CareerPanel({
  tone = "slate",
  variant = "default",
  interactive,
  className,
  ...props
}: CareerPanelProps) {
  return (
    <div
      className={cn(
        "rounded-xl border transition-all",
        variant === "soft"
          ? cn(
              "bg-gradient-to-br",
              toneStyles[tone].soft,
              toneStyles[tone].border,
            )
          : panelVariantStyles[variant],
        "transition-all",
        toneStyles[tone].hoverBorder,
        className,
      )}
      data-interactive={interactive ? "" : undefined}
      {...props}
    />
  );
}

type AnalysisCardProps = ComponentProps<"section"> & {
  tone?: CareerTone;
};

export function AnalysisCard({
  tone = "cyan",
  className,
  ...props
}: AnalysisCardProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-2xl dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800",
        toneStyles[tone].border,
        tone === "slate"
          ? "shadow-slate-950/10 dark:shadow-slate-950/20"
          : toneStyles[tone].shadow,
        className,
      )}
      {...props}
    />
  );
}

type AnalysisCardHeaderProps = ComponentProps<"div"> & {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function AnalysisCardHeader({
  title,
  description,
  action,
  className,
  ...props
}: AnalysisCardHeaderProps) {
  return (
    <div
      className={cn(
        "border-b border-border bg-muted/50 p-6 dark:border-slate-700 dark:bg-slate-900/50",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col items-start justify-between gap-2 pb-2 sm:flex-row sm:gap-4">
        <h3 className="text-xl font-bold text-foreground dark:text-slate-100">
          {title}
        </h3>
        {action}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}

type GradientBadgeProps = ComponentProps<"div"> & {
  tone?: CareerTone;
  icon?: LucideIcon;
};

export function GradientBadge({
  tone = "cyan",
  icon: Icon,
  className,
  children,
  ...props
}: GradientBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-4 py-1 text-sm font-bold text-white",
        toneStyles[tone].gradient,
        toneStyles[tone].shadow,
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </div>
  );
}

type StatusPillProps = ComponentProps<"div"> & {
  tone?: CareerTone;
  variant?: "default" | "solid";
};

export function StatusPill({
  tone = "cyan",
  variant = "default",
  className,
  children,
  ...props
}: StatusPillProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs",
        variant === "solid"
          ? cn("text-white", toneStyles[tone].bg)
          : toneStyles[tone].wash,
        className,
      )}
      {...props}
    >
      <span className={cn("h-2 w-2 rounded-full", toneStyles[tone].bg)} />
      <span
        className={variant === "solid" ? "text-white" : toneStyles[tone].text}
      >
        {children}
      </span>
    </div>
  );
}

type LegendItemProps = ComponentProps<"div"> & {
  tone?: CareerTone;
  label: string;
  shape?: "dot" | "square";
};

export function LegendItem({
  tone = "cyan",
  label,
  shape = "square",
  className,
  ...props
}: LegendItemProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)} {...props}>
      <span
        className={cn(
          shape === "dot" ? "h-2 w-2 rounded-full" : "h-3 w-3 rounded-sm",
          toneStyles[tone].bg,
        )}
      />
      <span className="text-muted-foreground dark:text-slate-400">{label}</span>
    </div>
  );
}

type InfoBlockProps = ComponentProps<"div"> & {
  label?: string;
  labelTone?: CareerTone;
  tone?: CareerTone;
  variant?: "default" | "plain" | "tinted";
};

export function InfoBlock({
  label,
  labelTone = "slate",
  tone = "slate",
  variant = "default",
  className,
  children,
  ...props
}: InfoBlockProps) {
  return (
    <div
      className={cn(
        "rounded-lg p-3",
        variant === "tinted"
          ? cn(toneStyles[tone].wash, toneStyles[tone].border, "border")
          : infoBlockVariantStyles[variant],
        className,
      )}
      {...props}
    >
      {label && (
        <p
          className={cn(
            "mb-1 text-xs font-medium uppercase tracking-wider",
            labelTone === "slate"
              ? "text-muted-foreground dark:text-slate-500"
              : toneStyles[labelTone].text,
          )}
        >
          {label}
        </p>
      )}
      {children}
    </div>
  );
}

export function CareerSkeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted dark:bg-slate-700/70",
        className,
      )}
      {...props}
    />
  );
}

type ProgressMeterProps = ComponentProps<"div"> & {
  value: number;
  tone?: CareerTone;
};

export function ProgressMeter({
  value,
  tone = "cyan",
  className,
  ...props
}: ProgressMeterProps) {
  return (
    <div
      className={cn(
        "h-2 overflow-hidden rounded-full bg-muted dark:bg-slate-700",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r shadow-lg transition-all duration-1000",
          toneStyles[tone].gradient,
          toneStyles[tone].shadow,
        )}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

type MetricTileProps = ComponentProps<"div"> & {
  icon: LucideIcon;
  tone?: CareerTone;
  value: string;
  label: string;
  comparison: string;
};

export function MetricTile({
  icon: Icon,
  tone = "cyan",
  value,
  label,
  comparison,
  className,
  ...props
}: MetricTileProps) {
  return (
    <CareerPanel
      tone={tone}
      interactive
      className={cn("group relative overflow-hidden p-5", className)}
      {...props}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-5",
          toneStyles[tone].gradient,
        )}
      />
      <div className="relative">
        <GradientIcon icon={Icon} tone={tone} className="mb-3" />
        <div className="mb-1 text-3xl font-bold text-foreground dark:text-slate-100">
          {value}
        </div>
        <div className="mb-0.5 text-xs font-medium text-foreground/80 dark:text-slate-300">
          {label}
        </div>
        <div className="text-xs text-muted-foreground dark:text-slate-500">
          {comparison}
        </div>
      </div>
    </CareerPanel>
  );
}

type EmptyHeroProps = ComponentProps<"div"> & {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
};

export function EmptyHero({
  icon,
  title,
  description,
  children,
  className,
  ...props
}: EmptyHeroProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col items-center justify-center px-4",
        className,
      )}
      {...props}
    >
      <GradientIcon icon={icon} className="mb-8 h-20 w-20 rounded-2xl" />
      <h1 className="mb-3 text-3xl font-bold text-foreground dark:text-slate-100">
        {title}
      </h1>
      <p className="mb-12 max-w-md text-center text-muted-foreground dark:text-slate-400">
        {description}
      </p>
      {children}
    </div>
  );
}

type HighlightMarkProps = ComponentProps<"span"> & {
  tone?: CareerTone;
  active?: boolean;
};

export function HighlightMark({
  tone = "cyan",
  active,
  className,
  ...props
}: HighlightMarkProps) {
  return (
    <span
      className={cn(
        "cursor-pointer rounded px-1 py-0.5 font-semibold transition-all hover:brightness-125",
        toneStyles[tone].wash,
        toneStyles[tone].text,
        active && "shadow-lg",
        active && toneStyles[tone].shadow,
        className,
      )}
      {...props}
    />
  );
}

type ToneTextProps<TElement extends ElementType> = {
  as?: TElement;
  tone?: CareerTone;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentProps<TElement>, "as" | "className" | "children">;

export function ToneText<TElement extends ElementType = "span">({
  as,
  tone = "cyan",
  className,
  ...props
}: ToneTextProps<TElement>) {
  const Comp = as ?? "span";

  return <Comp className={cn(toneStyles[tone].text, className)} {...props} />;
}
