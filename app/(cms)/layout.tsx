import { redirect } from "next/navigation";
import { getAuthenticatedUser, listSites } from "@/lib/backend";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default async function CmsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  const sites = await listSites();

  return (
    <SidebarProvider>
      <AppSidebar username={user.username} sites={sites} />
      <SidebarInset>
        <header className="flex h-14 items-center gap-3 border-b border-border bg-card/70 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <p className="text-sm text-muted-foreground">Panel de administración</p>
        </header>
        <div className="flex-1 p-6 md:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
