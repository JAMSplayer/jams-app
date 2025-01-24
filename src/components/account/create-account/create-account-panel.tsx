import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../../ui/form";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAccountSchema } from "@/form-schemas/create-account-schema";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { RegisterAccountUser, SimpleAccountUser } from "@/types/account-user";
import { registerUser } from "@/backend/logic";
import { useTranslation } from "react-i18next";

interface CreateAccountPanelProps {
    onReturnToSignInPanelClicked: () => void;
}

const CreateAccountPanel: React.FC<CreateAccountPanelProps> = ({
    onReturnToSignInPanelClicked,
}) => {
    // ====================================================================================
    // Create Account Form Functionality
    // ====================================================================================
    const { t } = useTranslation();

    const createAccountForm = useForm<z.infer<typeof createAccountSchema>>({
        resolver: zodResolver(createAccountSchema),
        mode: "onChange",
        defaultValues: {
            username: "",
            password: "",
            confirmPassword: "",
        },
    });

    const {
        handleSubmit,
        register,
        control,
        formState: { isValid },
    } = createAccountForm;

    const [usernameAlreadyExistsError, setUsernameAlreadyExistsError] =
        useState<string | null>(null);

    type CreateAccountFormData = z.infer<typeof createAccountSchema>;

    const onSubmit = (data: CreateAccountFormData) => {
        console.log(data);

        const newUser: RegisterAccountUser = {
            username: data.username,
            password: data.password,
            dateCreated: new Date(),
            dateUpdated: new Date(),
        };

        // Proceed with account creation
        registerUser(newUser);
    };

    // TODO currently we are using this as a way to store all existing accounts - get from the hook
    // recentAccountList, setRecentAccountList
    const [recentAccountList] = useState<SimpleAccountUser[]>([]);

    const validateUsername = (username: string) => {
        const foundAccount = recentAccountList.find(
            (account) => account.username === username
        );

        if (foundAccount) {
            setUsernameAlreadyExistsError(t("thisUsernameAlreadyExists"));
        } else {
            setUsernameAlreadyExistsError(null);
        }
    };

    const handleReturnToSignInPanelClicked = () => {
        onReturnToSignInPanelClicked();
    };

    return (
        <div className="flex flex-col w-full">
            <ArrowLeft
                size={16}
                className="cursor-pointer"
                onClick={handleReturnToSignInPanelClicked}
            />{" "}
            <div className="px-4">
                <div className="flex justify-center items-center">
                    <div className="text-md">{t("createAccount")}</div>
                </div>
                <Form {...createAccountForm}>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-2 pt-4"
                    >
                        <FormField
                            control={control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("username")}</FormLabel>
                                    <>
                                        <FormControl>
                                            <Input
                                                placeholder={t(
                                                    "enterYourUsername"
                                                )}
                                                autoCapitalize="off"
                                                autoComplete="off"
                                                autoCorrect="off"
                                                {...field} // Spread field instead of using register directly
                                                onChange={(e) => {
                                                    field.onChange(e); // Update field value
                                                    validateUsername(
                                                        e.target.value
                                                    ); // Validate on change
                                                }}
                                            />
                                        </FormControl>
                                        {usernameAlreadyExistsError && (
                                            <p className="text-destructive text-sm text-left">
                                                {usernameAlreadyExistsError}
                                            </p>
                                        )}
                                    </>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={createAccountForm.control}
                            name="password"
                            render={() => (
                                <FormItem>
                                    <FormLabel>{t("password")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={t("enterYourPassword")}
                                            type="password"
                                            autoCapitalize="off"
                                            autoComplete="off"
                                            autoCorrect="off"
                                            {...register("password")}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={createAccountForm.control}
                            name="confirmPassword"
                            render={() => (
                                <FormItem>
                                    <FormLabel>
                                        {t("confirmPassword")}
                                    </FormLabel>
                                    <>
                                        <FormControl>
                                            <Input
                                                placeholder={t(
                                                    "confirmYourPassword"
                                                )}
                                                type="password"
                                                autoCapitalize="off"
                                                autoComplete="off"
                                                autoCorrect="off"
                                                {...register("confirmPassword")}
                                            />
                                        </FormControl>
                                    </>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                disabled={!isValid}
                            >
                                {t("createAccount")}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default CreateAccountPanel;
