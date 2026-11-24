import { Link } from "@tanstack/react-router";
import { CalendarDays, ClipboardList, Dumbbell, LayoutDashboard, LineChart, UserRound } from "lucide-react";

const NAV = [
  { to: "/", label: "Today", icon: LayoutDashboard },
  { to: "/training", label: "Mine", icon: ClipboardList },
  { to: "/plan", label: "Plan", icon: CalendarDays },
  { to: "/progress", label: "Progress", icon: LineChart },
  { to: "/equipment", label: "Kit", icon: Dumbbell },
  { to: "/profile", label: "You", icon: UserRound },
];

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] flex-col border-r border-border px-6 py-8 lg:flex">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
            B
          </span>
          <span className="font-display text-[15px] tracking-[-0.01em]">Back in Shape</span>
        </Link>

        <nav className="mt-10 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary font-medium text-foreground" }}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <p className="mt-auto text-[10.5px] leading-relaxed text-muted-foreground">
          Supports your doctor or physiotherapist. It doesn&rsquo;t replace them.
        </p>
      </aside>

      <div className="lg:pl-[232px]">
        <div className="mx-auto w-full max-w-[880px] px-5 pb-28 pt-0 sm:px-8 lg:pb-16 lg:pt-12">
          <div className="sticky top-0 z-20 -mx-5 mb-5 flex items-center justify-between border-b border-border bg-background/90 px-5 py-3.5 backdrop-blur sm:-mx-8 sm:px-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                B
              </span>
              <span className="font-display text-[14px]">Back in Shape</span>
            </Link>
            <span className="eyebrow">At home</span>
          </div>
          <div className="pt-2 lg:pt-0">{children}</div>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              className="flex flex-col items-center gap-1 py-2.5 text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground transition"
              activeProps={{ className: "text-primary" }}
            >
              <Icon className="h-[18px] w-[18px]" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}