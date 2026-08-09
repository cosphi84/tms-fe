import DashboardWrapper from "@/components/dashboard/wrapper";

const lft = () => {
    return(
        <h1>TMS Dashboard</h1>
    )
}

export default function DashboardPage()
{
    return (
        <DashboardWrapper
            leftSection={lft()} >
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            Toolssss Management
        </div>
        </DashboardWrapper>
    )
}
