import {PropsWithChildren} from "react";
import AdminDashboard from "@/components/dashboard/admin-dashboard";

export default function DashboardLayout({ children} : PropsWithChildren) {
    return (<AdminDashboard>{children}</AdminDashboard>)
}