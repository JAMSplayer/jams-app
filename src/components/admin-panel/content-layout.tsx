import { Navbar } from "@/components/admin-panel/navbar";

interface ContentLayoutProps {
    children: React.ReactNode;
}

export function ContentLayout({ children }: ContentLayoutProps) {
    return (
        <div>
            <Navbar />
            <div>{children}</div>
        </div>
    );
}
