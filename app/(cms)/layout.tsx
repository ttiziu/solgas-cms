import { redirect } from "next/navigation";
import { getAuthenticatedUser, listSites } from "@/lib/backend";
import { AppSidebar } from "@/components/app-sidebar";
import { QueryProvider } from "@/components/query-provider";
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
    <QueryProvider>
      <SidebarProvider>
        <AppSidebar username={user.username} sites={sites} />
        <SidebarInset className="bg-background">
          <header className="flex h-14 items-center gap-2.5 border-b border-border bg-card/90 px-4 backdrop-blur-sm">
            <SidebarTrigger className="text-primary hover:bg-accent hover:text-accent-foreground" />
            <p className="text-sm font-medium text-foreground/80">Panel de administración</p>
          </header>
          <div className="flex-1 bg-background p-6 md:p-8">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </QueryProvider>
  );
}
