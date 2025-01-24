import {
    Tag,
    Settings,
    Bookmark,
    LayoutGrid,
    LucideIcon,
    Music,
    List,
} from "lucide-react";
import { useTranslation } from "react-i18next";

type Submenu = {
    href: string;
    label: string;
    active?: boolean;
    requiresAuth?: boolean;
};

type Menu = {
    href: string;
    label: string;
    active?: boolean;
    icon: LucideIcon;
    submenus?: Submenu[];
    requiresAuth?: boolean;
};

type Group = {
    groupLabel: string;
    menus: Menu[];
};

export function getMenuList(_pathname: string): Group[] {
    const { t } = useTranslation();
    return [
        {
            groupLabel: "",
            menus: [
                {
                    href: "/",
                    label: t("dashboard"),
                    icon: LayoutGrid,
                    submenus: [],
                },
            ],
        },
        {
            groupLabel: t("music"),
            menus: [
                {
                    href: "",
                    label: t("songs"),
                    icon: Music,
                    submenus: [
                        {
                            href: "/songs",
                            label: t("allSongs"),
                        },
                        {
                            href: "/upload-songs",
                            label: t("uploadSongs"),
                            requiresAuth: true,
                        },
                        {
                            href: "/add-network-song",
                            label: "Add Network Song",
                        },
                    ],
                },
                {
                    href: "",
                    label: t("playlists"),
                    icon: List,
                    submenus: [
                        {
                            href: "/playlists",
                            label: t("allPlaylists"),
                        },
                        {
                            href: "/create-playlist",
                            label: t("createPlaylist"),
                        },
                    ],
                },
                {
                    href: "/favorites",
                    label: t("favorites"),
                    icon: Bookmark,
                },
                {
                    href: "/tags",
                    label: t("tags"),
                    icon: Tag,
                },
            ],
        },
        {
            groupLabel: t("other"),
            menus: [
                {
                    href: "/settings/status",
                    label: t("settings"),
                    icon: Settings,
                },
            ],
        },
    ];
}
