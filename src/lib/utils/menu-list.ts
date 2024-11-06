import {
    Tag,
    Settings,
    Bookmark,
    SquarePen,
    LayoutGrid,
    LucideIcon,
    Music,
} from "lucide-react";

type Submenu = {
    href: string;
    label: string;
    active?: boolean;
};

type Menu = {
    href: string;
    label: string;
    active?: boolean;
    icon: LucideIcon;
    submenus?: Submenu[];
};

type Group = {
    groupLabel: string;
    menus: Menu[];
};

export function getMenuList(_pathname: string): Group[] {
    return [
        {
            groupLabel: "",
            menus: [
                {
                    href: "/",
                    label: "Dashboard",
                    icon: LayoutGrid,
                    submenus: [],
                },
            ],
        },
        {
            groupLabel: "Music",
            menus: [
                {
                    href: "",
                    label: "Songs",
                    icon: Music,
                    submenus: [
                        {
                            href: "/songs",
                            label: "All Songs",
                        },
                        {
                            href: "/songs/upload",
                            label: "Upload Song",
                        },
                    ],
                },
                {
                    href: "/favorites",
                    label: "Favorites",
                    icon: Bookmark,
                },
                {
                    href: "/tags",
                    label: "Tags",
                    icon: Tag,
                },
            ],
        },
        {
            groupLabel: "Other",
            menus: [
                {
                    href: "/settings/status",
                    label: "Settings",
                    icon: Settings,
                },
            ],
        },
    ];
}
