import {Fragment, PropsWithChildren, ReactNode} from "react";
import {SidebarInset} from "@/components/ui/sidebar";
import DashboardHeader from "@/components/dashboard/header";

export type DashboardProps = {
    leftSection?: ReactNode,
    rightSection?: ReactNode,
}

export default function DashboardWrapper({ children, leftSection, rightSection }: PropsWithChildren<DashboardProps>) {
    return (
        <Fragment>
            <SidebarInset className={"px-0"}>
                <DashboardHeader leftSection={leftSection} rightSection={rightSection} />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2 px-4 lg:px-6">
                        {children}
                    </div>
                </div>
            </SidebarInset>
        </Fragment>
    )
}