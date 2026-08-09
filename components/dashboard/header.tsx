import {PropsWithChildren} from "react";
import {DashboardProps} from "@/components/dashboard/wrapper";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import NavUser from "@/components/nav/user";
import Logout from "@/components/nav/logout";

export default function DashboardHeader({ leftSection }: DashboardProps) {
    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2  border-b transition-[width,height] ease-linear">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className={"-ml-1"} />
                <Separator orientation="vertical" className={"mx-2 data-[orientation=vertical]:h-4"}/>
                {leftSection}

                <div className={"ml-auto flex items-center gap-2"}>
                    {<Logout />}
                </div>

            </div>
        </header>
    )
}