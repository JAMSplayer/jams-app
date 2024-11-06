import { useNavigate } from "react-router-dom";

interface SecondaryPage {
    name: string;
    href: string;
    current: boolean;
}

interface TopLevelBreadcrumbsProps {
    pages: SecondaryPage[];
}

const SecondaryLevelBreadcrumbs: React.FC<TopLevelBreadcrumbsProps> = ({
    pages,
}) => {
    const navigate = useNavigate();

    return (
        <header className="border-b ">
            {/* Secondary navigation */}
            <nav className="flex overflow-x-auto py-4">
                <ul
                    role="list"
                    className="flex min-w-full flex-none gap-x-6 px-4 text-sm font-semibold leading-6 text-muted-foreground sm:px-6 lg:px-8"
                >
                    {pages.map((item) => (
                        <li key={item.name}>
                            <button
                                onClick={() => navigate(item.href)}
                                className={
                                    item.href === location.pathname
                                        ? "text-foreground"
                                        : ""
                                }
                            >
                                {item.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
};

export default SecondaryLevelBreadcrumbs;
