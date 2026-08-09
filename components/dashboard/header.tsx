import {PropsWithChildren} from "react";
import {DashboardProps} from "@/components/dashboard/wrapper";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function DashboardHeader({ leftSection, rightSection }: DashboardProps) {
    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2  border-b transition-[width,height] ease-linear">
            <div>
                <SidebarTrigger className={"-ml-1"} />
                <Separator orientation="vertical" className={"mx-2 data-[orientation=vertical]:h-4"}/>
                {leftSection}

                <div className={"ml-auto flex items-center gap-2"}>
                    {rightSection}
                </div>

            </div>
        </header>
    )
}