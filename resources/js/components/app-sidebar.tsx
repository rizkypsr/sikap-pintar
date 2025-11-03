import { NavMainWithSub } from '@/components/nav-main-with-sub';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import AppLogo from './app-logo';
import { BuildingOfficeIcon, FolderIcon, SquaresFourIcon } from '@phosphor-icons/react';

export function AppSidebar() {
    const { departments } = usePage<{ departments: SharedData['departments'] }>().props;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: SquaresFourIcon,
        },
        {
             title: 'File Management',
             href: '#',
             icon: FolderIcon,
             children: departments.map(department => ({
                 title: department.name,
                 href: `/file-management/departments/${department.id}/categories`,
                 icon: BuildingOfficeIcon,
             })),
         },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMainWithSub items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
