import { HomeIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface Page {
    name: string;
    current: boolean;
}

interface TopLevelBreadcrumbsProps {
    pages: Page[];
}

const TopLevelBreadcrumbs: React.FC<TopLevelBreadcrumbsProps> = ({ pages }) => {
    return (
        <nav aria-label="Breadcrumb" className="relative border-b">
            <ol
                role="list"
                className="mx-auto flex w-full max-w-screen-xl space-x-4 px-4 sm:px-6 lg:px-8"
            >
                <li className="flex">
                    <div className="flex items-center">
                        <Link
                            to="/"
                            className="text-muted-foreground hover:text-accent-foreground"
                        >
                            <HomeIcon
                                aria-hidden="true"
                                className="h-5 w-5 flex-shrink-0"
                            />
                        </Link>
                    </div>
                </li>
                {pages.map((page) => (
                    <li key={page.name} className="flex cursor-default">
                        <div className="flex items-center">
                            <svg
                                fill="currentColor"
                                viewBox="0 0 24 44"
                                preserveAspectRatio="none"
                                aria-hidden="true"
                                className="h-full w-6 flex-shrink-0 text-sidebar-border"
                            >
                                <path
                                    d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z"
                                    strokeWidth="0.1"
                                    stroke="#6B7280"
                                    style={{ opacity: 0.4 }}
                                />
                            </svg>
                            <div
                                aria-current={page.current ? "page" : undefined}
                                className="ml-4 text-sm font-medium text-muted-foreground"
                            >
                                {page.name}
                            </div>
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default TopLevelBreadcrumbs;
