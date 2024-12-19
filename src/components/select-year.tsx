import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

function SelectYear({
    setValue,
    height = "auto",
}: {
    register: any;
    setValue: any;
    height?: string;
}) {
    const [years, setYears] = useState<number[]>([]);

    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const yearList = [];
        for (let year = currentYear; year >= 1800; year--) {
            yearList.push(year);
        }
        setYears(yearList);
    }, []);

    return (
        <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <Select
                onValueChange={(value) =>
                    setValue("year", value ? parseInt(value, 10) : undefined)
                }
            >
                <SelectTrigger className="w-full border px-2 py-1 rounded">
                    <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent style={{ maxHeight: height, overflowY: "auto" }}>
                    {years.map((year) => (
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
