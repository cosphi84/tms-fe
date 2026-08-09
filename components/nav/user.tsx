"use client"

import React, {Fragment} from "react";
import {useRouter} from "next/navigation";
import {useGetAuth, useLogout} from "@/queries/auth";
import {useSidebar, SidebarMenuItem, SidebarMenuButton, SidebarMenu} from "@/components/ui/sidebar";
import {DropdownMenuTrigger, DropdownMenuContent, DropdownMenu, DropdownMenuItem} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {LogOut} from "lucide-react";
import ConfirmationModal from "@/components/modals/confirmation";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";

export default function NavUser(){
    const [openLogout, setOpenLogout] = React.useState<boolean>(false);
    const router = useRouter();
    const {data, isError, error} = useGetAuth({
        redirectToLogin: true
    });
    const logout = useLogout();
    const { isMobile } = useSidebar();

    return (
        <Fragment>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            {data?.email}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                            side={"bottom"}
                            align="end"
                            sideOffset={4}
                        >
                            <DropdownMenuItem>
                                Profile
                            </DropdownMenuItem>
                            <Separator orientation={"horizontal"} />
                            <AlertDialog open={openLogout} onOpenChange={setOpenLogout} >
                                <AlertDialogTrigger render={
                                    <DropdownMenuItem>
                                        {"Logout"}
                                    </DropdownMenuItem>
                                }>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Logout</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {"Are you sure you want to logout?"}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{ "Cancel"}</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => {
                                            logout();
                                            setOpenLogout(false);
                                        }}>{ "OK"}</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>


        </Fragment>
    );
}