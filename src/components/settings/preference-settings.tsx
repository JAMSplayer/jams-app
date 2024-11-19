import { ThemeToggler } from "../ThemeToggler";
import SubDividerLayout from "@/enums/sub-divider-layout";
import SubDivider from "./sub-divider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import LanguageSwitcher from "../LanguageSwitcher";

const languages = [
    { label: "English", value: "en" },
    { label: "German", value: "de" },
] as const;

const FormSchema = z.object({
    language: z.string({
        required_error: "Please select a language.",
    }),
});

function onSubmit(data: z.infer<typeof FormSchema>) {
    toast("You submitted the following values:");
}

export default function PreferenceSettings() {
    return (
        <div className="items-center">
            <SubDivider title="Theme" layout={SubDividerLayout.TOP} />
            <div className="p-4">
                <ThemeToggler />
            </div>
            <SubDivider title="Language" layout={SubDividerLayout.DEFAULT} />
            <div className="p-4">
                <LanguageSwitcher />
            </div>
        </div>
    );
}
