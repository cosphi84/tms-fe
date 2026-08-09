"use client"
import React, {Fragment} from "react";
import {usePathname} from "next/navigation";
import {useGetAuth, useLogout} from "@/queries/auth";
import {useSidebar, SidebarMenuItem, SidebarMenuButton, SidebarMenu} from "@/components/ui/sidebar";
import {DropdownMenuTrigger, DropdownMenuContent, DropdownMenu, DropdownMenuItem} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {LogOut} from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
 AlertDialogTrigger} from "@/components/ui/alert-dialog";

export default function NavUser(){
    const [openLogout, setOpenLogout] = React.useState<boolean>(false);
    const [loggingOut, setLoggingOut] = React.useState<boolean>(false);

    const pathname = usePathname();
    const {data, error} = useGetAuth({
        redirectToLogin: true
    });
    const logout = useLogout(pathname);
    const { isMobile } = useSidebar();

    const handleConfirmLogout = () => {
        setLoggingOut(true);
        // logout() sinkron: fire-and-forget POST /auth/logout, clear cookies,
        // lalu window.location.href redirect — tidak perlu await/setOpenLogout(false)
        // karena halaman akan langsung navigasi keluar.
        logout();
    };

    return (
        <Fragment>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <SidebarMenuButton>
                                {data?.username}
                            </SidebarMenuButton>
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
                            <DropdownMenuItem
                                onSelect={(e) => {
                                    e.preventDefault();
                                    setOpenLogout(true);
                                }}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>

            <AlertDialog open={openLogout} onOpenChange={setOpenLogout}>
                <AlertDialogTrigger>Logout</AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Logout from TMS</AlertDialogTitle>
                        <AlertDialogDescription>
                            {"Are you sure you want to logout? You'll need to sign in again to continue."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loggingOut}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmLogout}
                            disabled={loggingOut}
                        >
                            {loggingOut ? "Logging out..." : "Logout"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Fragment>
    );
}