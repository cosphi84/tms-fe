"use client"
import {Fragment} from "react";
import {useGetAuth} from "@/queries/auth";
import {SidebarMenuItem, SidebarMenuButton, SidebarMenu} from "@/components/ui/sidebar";
import {DropdownMenuTrigger, DropdownMenuContent, DropdownMenu, DropdownMenuItem} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export default function NavUser(){
    const {data} = useGetAuth({
        redirectToLogin: true
    });

    return (
        <Fragment>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <SidebarMenuButton>
                                Welcome, {data?.username}
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                            side={"bottom"}
                            align="end"
                            sideOffset={4}
                        >
                            <DropdownMenuItem>
                                <Link href={"/user/edit"} className="w-full">Profile</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </Fragment>
    );
}