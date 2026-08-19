"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon, GlobeIcon, LogOutIcon, PackageIcon } from "lucide-react";
import { logoutAction } from "@/lib/auth";
import type { CmsSite } from "@/lib/backend";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function AppSidebar({ username, sites }: { username: string; sites: CmsSite[] }) {
  const pathname = usePathname();
  const inSitios = pathname.startsWith("/sitios");
  const [sitiosManualOpen, setSitiosManualOpen] = useState(false);
  const sitiosOpen = inSitios || sitiosManualOpen;
  const [manualOpenBySlug, setManualOpenBySlug] = useState<Record<string, boolean>>({});

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/images/logo.svg"
            alt="Solgas"
            width={185}
            height={34}
            className="h-7 w-auto brightness-0 invert"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible open={sitiosOpen} onOpenChange={setSitiosManualOpen} className="group/sitios">
                <SidebarMenuItem>
                  <CollapsibleTrigger render={<SidebarMenuButton isActive={inSitios} />}>
                    <GlobeIcon />
                    <span>Sitios</span>
                    <ChevronRightIcon className="ml-auto transition-transform group-data-open/sitios:rotate-90" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {sites.map((site) => {
                        const productsHref = `/sitios/${site.slug}/productos`;
                        const siteActive = pathname.startsWith(`/sitios/${site.slug}`);

                        const siteOpen =
                          pathname.startsWith(`/sitios/${site.slug}`) ||
                          (manualOpenBySlug[site.slug] ?? false);

                        return (
                          <Collapsible
                            key={site.slug}
                            open={siteOpen}
                            onOpenChange={(open) =>
                              setManualOpenBySlug((current) => ({ ...current, [site.slug]: open }))
                            }
                            className="group/site"
                          >
                            <SidebarMenuSubItem>
                              <CollapsibleTrigger
                                render={
                                  <SidebarMenuSubButton
                                    isActive={siteActive}
                                    render={<button type="button" />}
                                  />
                                }
                              >
                                <span>{site.name}</span>
                                <ChevronRightIcon className="ml-auto size-3.5 transition-transform group-data-open/site:rotate-90" />
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <SidebarMenuSub>
                                  <SidebarMenuSubItem>
                                    <SidebarMenuSubButton
                                      isActive={pathname === productsHref}
                                      render={<Link href={productsHref} />}
                                    >
                                      <PackageIcon />
                                      <span>Productos</span>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                </SidebarMenuSub>
                              </CollapsibleContent>
                            </SidebarMenuSubItem>
                          </Collapsible>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-3 py-2">
          <p className="text-[11px] tracking-wide text-sidebar-foreground/45 uppercase">
            Sesión
          </p>
          <p className="mt-0.5 truncate text-sm text-sidebar-foreground/80">{username}</p>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <form action={logoutAction} className="w-full">
              <SidebarMenuButton type="submit" tooltip="Salir" className="w-full">
                <LogOutIcon />
                <span>Salir</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
