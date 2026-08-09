"use client";
import { ReactNode } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
    , AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type Props = {
    open: boolean;
    openedAction: (value: boolean) => void;
    trigger: string | ReactNode;
    action: () => void;
    title: string;
    message: string | ReactNode;
    labels?: {
        close?: string;
        confirm?: string;
    };
};

export default function ConfirmationModal({ open, openedAction, trigger, action, labels, title, message}: Props) {
    return (
        <AlertDialog open={open} onOpenChange={openedAction}>
            <AlertDialogTrigger render={<Button variant="outline" />}>
                {trigger}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {message}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{labels?.close ?? "Cancel"}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => action()}>{labels?.confirm ?? "OK"}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
