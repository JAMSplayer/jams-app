import { Ellipsis } from "lucide-react";

import { cn } from "@/lib/utils";
import { getMenuList } from "@/lib/utils/menu-list";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CollapseMenuButton } from "@/components/admin-panel/collapse-menu-button";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
} from "@/components/ui/tooltip";
import { Link, useLocation } from "react-router-dom";
import { useConnection } from "@/providers/connection-provider";

interface MenuProps {
    isOpen: boolean | undefined;
}

export function Menu({ isOpen }: MenuProps) {
    const { account } = useConnection();
    const location = useLocation(); // Get the current location (pathname) from react-router
    const menuList = getMenuList(location.pathname); // Use location.pathname instead of manually tracking pathname
    const pathname = location.pathname;

    return (
        <ScrollArea className="[&>div>div[style]]:!block">
            <nav className="mt-8 h-full w-full">
                <ul className="flex flex-col min-h-[calc(100vh-48px-36px-16px-32px)] lg:min-h-[calc(100vh-32px-40px-32px)] items-start space-y-1 px-2">
                    {menuList.map(({ groupLabel, menus }, groupIndex) => {
                        // Filter out top-level menus based on requiresAuth
                        const filteredMenus = menus.filter(
                            (menu) => !menu.requiresAuth || account
                        );

                        if (filteredMenus.length === 0) return null; // Skip group if no menus are visible

                        return (
                            <li
                                className={cn(
                                    "w-full",
                                    groupLabel ? "pt-5" : ""
                                )}
                                key={groupIndex}
                            >
                                {(isOpen && groupLabel) ||
                                isOpen === undefined ? (
                                    <p className="text-sm font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate">
                                        {groupLabel}
                                    </p>
                                ) : !isOpen &&
                                  isOpen !== undefined &&
                                  groupLabel ? (
                                    <TooltipProvider>
                                        <Tooltip delayDuration={100}>
                                            <TooltipTrigger className="w-full">
                                                <div className="w-full flex justify-center items-center">
                                                    <Ellipsis className="h-5 w-5" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                <p>{groupLabel}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ) : (
                                    <p className="pb-2"></p>
                                )}
                                {filteredMenus.map(
                                    (
                                        {
                                            href,
                                            label,
                                            icon: Icon,
                                            submenus,
                                            requiresAuth, // Check this property
                                        },
                                        index
                                    ) =>
                                        !submenus || submenus.length === 0 ? (
                                            <div className="w-full" key={index}>
                                                <TooltipProvider
                                                    disableHoverableContent
                                                >
                                                    <Tooltip
                                                        delayDuration={100}
                                                    >
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant={
                                                                    pathname ===
                                                                    href
                                                                        ? "secondary"
                                                                        : "ghost"
                                                                }
                                                                className="w-full justify-start h-10 mb-1"
                                                                asChild
                                                            >
                                                                <Link
                                                                    to={href}
                                                                    className="w-full flex items-center"
                                                                >
                                                                    <span
                                                                        className={cn(
                                                                            isOpen ===
                                                                                false
                                                                                ? ""
                                                                                : "mr-4"
                                                                        )}
                                                                    >
                                                                        <Icon
                                                                            size={
                                                                                18
                                                                            }
                                                                        />
                                                                    </span>
                                                                    <p
                                                                        className={cn(
                                                                            "max-w-[200px] truncate",
                                                                            isOpen ===
                                                                                false
                                                                                ? "-translate-x-96 opacity-0"
                                                                                : "translate-x-0 opacity-100"
                                                                        )}
                                                                    >
                                                                        {label}
                                                                    </p>
                                                                </Link>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        {isOpen === false && (
                                                            <TooltipContent side="right">
                                                                {label}
                                                            </TooltipContent>
                                                        )}
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        ) : (
                                            <div className="w-full" key={index}>
                                                <CollapseMenuButton
                                                    icon={Icon}
                                                    label={label}
                                                    active={
                                                        pathname === href // Exact match for active
                                                    }
                                                    submenus={submenus.filter(
                                                        (submenu) =>
                                                            !submenu.requiresAuth ||
                                                            account
                                                    )} // Filter submenus
                                                    isOpen={isOpen}
                                                />
                                            </div>
                                        )
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </ScrollArea>
    );
}
