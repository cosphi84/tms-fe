import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar";
import {CSSProperties, PropsWithChildren} from "react"
import {AppSidebar} from "@/components/dashboard/app-sidebar";

export default function AdminDashboard ( { children } : PropsWithChildren ) {
    return (
        <SidebarProvider style={{} as CSSProperties}>
            <AppSidebar variant={"inset"} />
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}