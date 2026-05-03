import type { ComponentProps, ElementType, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/shadcn/utils";

type CareerTone = "cyan" | "emerald" | "amber" | "purple" | "red" | "slate";

const toneStyles = {
  cyan: {
    gradient: "from-cyan-500 to-blue-600",
    soft: "from-cyan-500/10 to-blue-500/10",
    border: "border-cyan-500/20",
    hoverBorder: "hover:border-cyan-500/50",
    shadow: "shadow-cyan-500/30",
    text: "text-cyan-400",
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
    text: "text-emerald-400",
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
    text: "text-amber-400",
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
    text: "text-purple-400",
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
    text: "text-red-400",
    icon: "text-red-500",
    bg: "bg-red-500",
    wash: "bg-red-500/10",
  },
  slate: {
    gradient: "from-slate-700 to-slate-800",
    soft: "from-slate-800/70 to-slate-900/70",
    border: "border-slate-700",
    hoverBorder: "hover:border-slate-600",
    shadow: "shadow-slate-950/20",
    text: "text-slate-300",
    icon: "text-slate-400",
    bg: "bg-slate-700",
    wash: "bg-slate-800/50",
  },
} satisfies Record<CareerTone, Record<string, string>>;

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
      className={cn("min-h-screen bg-slate-950 text-slate-100", className)}
      {...props}
    />
  );
}

export function AppHeader({ className, ...props }: ComponentProps<"header">) {
  return (
    <header
      className={cn(
        "border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl",
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
  interactive?: boolean;
};

export function CareerPanel({
  tone = "slate",
  interactive,
  className,
  ...props
}: CareerPanelProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-700 bg-slate-900/50",
        "transition-all hover:bg-slate-800 hover:shadow-lg",
        toneStyles[tone].hoverBorder,
        className,
      )}
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
        "overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl",
        toneStyles[tone].border,
        tone === "slate" ? "shadow-slate-950/20" : toneStyles[tone].shadow,
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
      className={cn("border-b border-slate-700 bg-slate-900/50 p-6", className)}
      {...props}
    >
      <div className="flex flex-col items-start justify-between gap-2 pb-2 sm:flex-row sm:gap-4">
        <h3 className="text-xl font-bold text-slate-100">{title}</h3>
        {action}
      </div>
      {description && <p className="text-sm text-slate-400">{description}</p>}
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
};

export function StatusPill({
  tone = "cyan",
  className,
  children,
  ...props
}: StatusPillProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs",
        toneStyles[tone].wash,
        className,
      )}
      {...props}
    >
      <span className={cn("h-2 w-2 rounded-full", toneStyles[tone].bg)} />
      <span className={toneStyles[tone].text}>{children}</span>
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
      <span className="text-slate-400">{label}</span>
    </div>
  );
}

type InfoBlockProps = ComponentProps<"div"> & {
  label?: string;
  labelTone?: CareerTone;
};

export function InfoBlock({
  label,
  labelTone = "slate",
  className,
  children,
  ...props
}: InfoBlockProps) {
  return (
    <div className={cn("rounded-lg bg-slate-950/50 p-3", className)} {...props}>
      {label && (
        <p
          className={cn(
            "mb-1 text-xs font-medium uppercase tracking-wider",
            labelTone === "slate"
              ? "text-slate-500"
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
      className={cn("h-2 overflow-hidden rounded-full bg-slate-700", className)}
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
        <div className="mb-1 text-3xl font-bold text-slate-100">{value}</div>
        <div className="mb-0.5 text-xs font-medium text-slate-300">{label}</div>
        <div className="text-xs text-slate-500">{comparison}</div>
      </div>
    </CareerPanel>
  );
}

type EmptyHeroProps = ComponentProps<"div"> & {
  icon: LucideIcon;
  title: string;
  description: string;
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
      <h1 className="mb-3 text-3xl font-bold text-slate-100">{title}</h1>
      <p className="mb-12 max-w-md text-center text-slate-400">{description}</p>
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
