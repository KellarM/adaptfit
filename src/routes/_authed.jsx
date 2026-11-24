import { createFileRoute, Outlet } from "@tanstack/react-router";
import AppShell from "@/components/AppShell";

export const Route = createFileRoute("/_authed")({
  ssr: false,
  component: AuthedLayout,
});

function AuthedLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}