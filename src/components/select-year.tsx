import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

function SelectYear({
    currentYear,
    onChange,
    height = "auto",
}: {
    currentYear?: number;
    onChange: (year: number | undefined) => void;
    height?: string;
}) {
    const currentYearValue = new Date().getFullYear();
    return (
        <div>
            <label className="block text-sm font-medium mb-3">Year</label>
            <Select
                value={currentYear ? currentYear.toString() : "no-year"}
                onValueChange={(selectedYear) => {
                    const year =
                        selectedYear === "no-year"
                            ? undefined
                            : parseInt(selectedYear, 10);
                    onChange(year); // pass the year or undefined up to parent
                }}
            >
                <SelectTrigger className="w-full border px-2 py-1 rounded">
                    <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent style={{ maxHeight: height, overflowY: "auto" }}>
                    <SelectItem value="no-year">No Year</SelectItem>
                    {Array.from(
                        { length: currentYearValue - 1800 + 1 },
                        (_, i) => currentYearValue - i
                    ).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                            {year}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

export default SelectYear;
