import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { PageTitleProvider } from "@/components/page-title-provider"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <PageTitleProvider>
        <AppSidebar />
        <SidebarInset>
            <SiteHeader />
            <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
            </main>
        </SidebarInset>
      </PageTitleProvider>
    </SidebarProvider>
  )
}
