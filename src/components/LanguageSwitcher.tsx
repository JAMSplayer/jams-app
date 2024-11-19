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
import { useEffect, useState } from "react";
import { load, Store } from "@tauri-apps/plugin-store";
import i18next from "i18next";
import { useLanguage } from "@/providers/language-provider";
import { languageOptions } from "@/enums/languages";

const FormSchema = z.object({
    language: z.string({
        required_error: "Please select a language.",
    }),
});

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: { language },
    });

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        const selectedLanguage = data.language;
        if (selectedLanguage) {
            setLanguage(selectedLanguage); // Update the language using the context provider's function
            toast("Language Updated", {
                description: "Your selected language has been updated.",
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-end space-x-4">
                    <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Language</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                    "w-[200px] justify-between",
                                                    !field.value &&
                                                        "text-muted-foreground"
                                                )}
                                            >
                                                {field.value
                                                    ? languageOptions.find(
                                                          (language) =>
                                                              language.value ===
                                                              field.value
                                                      )?.label
                                                    : "Select language"}
                                                <ChevronsUpDown className="opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[200px] p-0">
                                        <Command>
                                            <CommandInput
                                                placeholder="Search language..."
                                                className="h-9"
                                            />
                                            <CommandList>
                                                <CommandEmpty>
                                                    No language found.
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {languageOptions.map(
                                                        (lang) => (
                                                            <CommandItem
                                                                value={
                                                                    lang.label
                                                                }
                                                                key={lang.value}
                                                                onSelect={() => {
                                                                    form.setValue(
                                                                        "language",
                                                                        lang.value
                                                                    );
                                                                }}
                                                            >
                                                                {lang.label}
                                                                <Check
                                                                    className={cn(
                                                                        "ml-auto",
                                                                        lang.value ===
                                                                            field.value
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                            </CommandItem>
                                                        )
                                                    )}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>

                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="self-end">
                        Submit
                    </Button>
                </div>
            </form>
        </Form>
    );
}
