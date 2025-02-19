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
import { recoverAccountSchema } from "@/form-schemas/recover-account-schema";
import { Input } from "@/components/ui/input";
import { RecoverAccountUser } from "@/types/account-user";
import { registerUser } from "@/backend/logic";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { listAccounts } from "@/backend/autonomi";

interface RecoverAccountPanelProps {
    onReturnToSignInPanelClicked: () => void;
}

const RecoverAccountPanel: React.FC<RecoverAccountPanelProps> = ({
    onReturnToSignInPanelClicked,
}) => {
    // ====================================================================================
    // Recover Account Form Functionality
    // ====================================================================================

    const { t } = useTranslation();

    const recoverAccountForm = useForm<z.infer<typeof recoverAccountSchema>>({
        resolver: zodResolver(recoverAccountSchema),
        mode: "onChange",
        defaultValues: {
            privateKey: "",
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
    } = recoverAccountForm;

    type RecoverAccountFormData = z.infer<typeof recoverAccountSchema>;

    const [usernameAlreadyExistsError, setUsernameAlreadyExistsError] =
        useState<string | null>(null);

    const onSubmit = (data: RecoverAccountFormData) => {
        console.log(data);

        const newUser: RecoverAccountUser = {
            privateKey: data.privateKey,
            username: data.username,
            password: data.password,
            dateCreated: new Date(),
            dateUpdated: new Date(),
        };

        // Proceed with account creation
        registerUser(newUser);
    };

    const handleReturnToSignInPanelClicked = () => {
        onReturnToSignInPanelClicked();
    };

    const isUsernameValid = async (username: string) => {
        try {
            const accounts = await listAccounts();

            if (!accounts) {
                setUsernameAlreadyExistsError(null);
                return false;
            }

            const foundAccount = accounts.find(
                ([accountUsername]) => accountUsername === username
            );

            if (foundAccount) {
                setUsernameAlreadyExistsError(t("thisUsernameAlreadyExists"));
                return false;
            } else {
                setUsernameAlreadyExistsError(null);
                return true;
            }
        } catch (error) {
            console.error("Error checking username:", error);
            return false;
        }
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
                    <div className="text-md">{t("recoverAccount")}</div>
                </div>
                <Form {...recoverAccountForm}>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-2 pt-4"
                    >
                        <FormField
                            control={control}
                            name="privateKey"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t("privateKey")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={t(
                                                "enterYourPrivateKey"
                                            )}
                                            autoCapitalize="off"
                                            autoComplete="off"
                                            autoCorrect="off"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                            }}
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    isUsernameValid(
                                                        e.target.value
                                                    );
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
                            control={control}
                            name="password"
                            render={() => (
                                <FormItem>
                                    <FormLabel>{t("password")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your password"
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
                            control={control}
                            name="confirmPassword"
                            render={() => (
                                <FormItem>
                                    <FormLabel>
                                        {t("confirmPassword")}
                                    </FormLabel>
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

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                disabled={
                                    !isValid ||
                                    usernameAlreadyExistsError !== null
                                }
                            >
                                {t("recoverAccount")}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default RecoverAccountPanel;
