import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

export function NavMainWithSub({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const [openItems, setOpenItems] = useState<string[]>([]);

    const toggleItem = (title: string) => {
        setOpenItems(prev => 
            prev.includes(title) 
                ? prev.filter(item => item !== title)
                : [...prev, title]
        );
    };

    const isItemActive = (item: NavItem): boolean => {
        const itemUrl = resolveUrl(item.href);
        if (page.url.startsWith(itemUrl)) {
            return true;
        }
        
        // Check if any child is active
        if (item.children) {
            return item.children.some(child => page.url.startsWith(resolveUrl(child.href)));
        }
        
        return false;
    };

    // Separate File Management from other items
    const fileManagementItem = items.find(item => item.title === 'File Management');
    const otherItems = items.filter(item => item.title !== 'File Management');

    return (
        <>
            {/* Platform Section */}
            <SidebarGroup className="px-2 py-0">
                <SidebarGroupLabel>Platform</SidebarGroupLabel>
                <SidebarMenu>
                    {otherItems.map((item) => {
                        const hasChildren = item.children && item.children.length > 0;
                        const isOpen = openItems.includes(item.title);
                        const isActive = isItemActive(item);

                        return (
                            <SidebarMenuItem key={item.title}>
                                {hasChildren ? (
                                    <>
                                        <SidebarMenuButton
                                            onClick={() => toggleItem(item.title)}
                                            isActive={isActive}
                                            tooltip={{ children: item.title }}
                                            className="cursor-pointer"
                                        >
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                            <ChevronRight 
                                                className={`ml-auto h-4 w-4 transition-transform ${
                                                    isOpen ? 'rotate-90' : ''
                                                }`} 
                                            />
                                        </SidebarMenuButton>
                                        {isOpen && item.children && (
                                            <SidebarMenuSub>
                                                {item.children.map((child) => (
                                                    <SidebarMenuSubItem key={child.title}>
                                                        <SidebarMenuSubButton
                                                            asChild
                                                            isActive={page.url.startsWith(
                                                                resolveUrl(child.href),
                                                            )}
                                                        >
                                                            <Link href={child.href} prefetch>
                                                                {child.icon && <child.icon />}
                                                                <span>{child.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        )}
                                    </>
                                ) : (
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive}
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                )}
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroup>

            {/* File Management Section */}
            {fileManagementItem && (
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Manajemen File</SidebarGroupLabel>
                    <SidebarMenu>
                        {fileManagementItem.children?.map((child) => (
                            <SidebarMenuItem key={child.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={page.url.startsWith(resolveUrl(child.href))}
                                    tooltip={{ children: child.title }}
                                >
                                    <Link href={child.href} prefetch>
                                        {child.icon && <child.icon />}
                                        <span>{child.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            )}
        </>
    );
}