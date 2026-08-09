"use client"

import {Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton} from "@/components/ui/sidebar";
import * as React from "react"
import {ComponentProps} from "react";
import Link from "next/link";
import {Wrench} from "lucide-react";


export function AppSidebar({ ...props}: ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible={"offcanvas"} {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="data-[slot=sidebar-menu-button]:p-1.5!">
                            <Link href="/">
                                <Wrench className="size-5!" />
                                <span className="text-base font-semibold">
                                    Tools Management
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <div>Sidebar</div>
            </SidebarContent>
        </Sidebar>
    )
}