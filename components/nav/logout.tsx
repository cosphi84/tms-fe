"use client"
import {useGetAuth, useLogout} from "@/queries/auth";
import {usePathname} from "next/navigation";
import React, {Fragment} from "react";
import {AlertDialog, AlertDialogContent, AlertDialogTrigger, AlertDialogHeader, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function Logout() {
    const [open, setOpen] = React.useState(false);
    const {data} = useGetAuth({
        redirectToLogin: true
    });
    const pathname = usePathname();

    // ✅ hook dipanggil sekali, di render, di top-level komponen
    const logout = useLogout(pathname);

    const handleLogout = () => {
        logout();       // ✅ ini cuma manggil callback biasa, bukan hook lagi
        setOpen(false);
    }

    return (
        <Fragment>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogTrigger render={<Button variant="outline" />}>
                    Logout
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        {"TMS Logout"}
                    </AlertDialogHeader>
                    <AlertDialogDescription>
                        {"Are you sure you want to logout?"}
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{"Cancel"}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout}>{"OK"}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Fragment>
    );
}