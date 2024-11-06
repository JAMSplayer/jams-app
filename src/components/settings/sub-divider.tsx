import SubDividerLayout from "@/enums/sub-divider-layout";

interface SubDividerProps {
    title: string;
    layout: SubDividerLayout;
}

const SubDivider = ({ title, layout }: SubDividerProps) => {
    return (
        <>
            {(layout === SubDividerLayout.DEFAULT ||
                layout === SubDividerLayout.BOTTOM) && (
                <hr className="w-full" />
            )}
            <div className="text-md font-bold p-4 bg-secondary">{title}</div>
            {(layout === SubDividerLayout.DEFAULT ||
                layout === SubDividerLayout.TOP) && <hr className="w-full" />}
        </>
    );
};

export default SubDivider;
