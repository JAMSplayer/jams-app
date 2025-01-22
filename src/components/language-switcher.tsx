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
import { useLanguage } from "@/providers/language-provider";
import { languageOptions } from "@/enums/languages";
import { useTranslation } from "react-i18next";

const FormSchema = z.object({
    language: z.string({
        required_error: "Please select a language.",
    }),
});

export default function LanguageSwitcher() {
    const { t } = useTranslation();
    const { language, setLanguage } = useLanguage();

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: { language },
    });

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        const selectedLanguage = data.language;
        if (selectedLanguage) {
            setLanguage(selectedLanguage); // Update the language using the context provider's function
            toast(t("languageUpdated"), {
                description: t("yourSelectedLanguageHasBeenUpdated"),
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
                                <FormLabel>{t("language")}</FormLabel>
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
                                                placeholder={t(
                                                    "searchLanguage"
                                                )}
                                                className="h-9"
                                            />
                                            <CommandList>
                                                <CommandEmpty>
                                                    {t("noLanguageFound")}.
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
                        {t("submit")}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
