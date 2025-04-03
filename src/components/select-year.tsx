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
    onChange: (year: number) => void;
    height?: string;
}) {
    return (
        <div>
            <label className="block text-sm font-medium mb-3">Year</label>
            <Select
                value={currentYear ? currentYear.toString() : ""}
                onValueChange={(selectedYear) => {
                    const year = selectedYear
                        ? parseInt(selectedYear, 10)
                        : NaN;
                    if (!isNaN(year)) {
                        onChange(year); // Pass the new year up to parent
                    }
                }}
            >
                <SelectTrigger className="w-full border px-2 py-1 rounded">
                    <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent style={{ maxHeight: height, overflowY: "auto" }}>
                    {Array.from(
                        { length: 2023 - 1800 + 1 },
                        (_, i) => 2023 - i
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
