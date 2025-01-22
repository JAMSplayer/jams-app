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
            secretKey: "",
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
    const onSubmit = (data: RecoverAccountFormData) => {
        console.log(data);

        const newUser: RecoverAccountUser = {
            secretKey: data.secretKey,
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
                            name="secretKey"
                            render={() => (
                                <FormItem>
                                    <FormLabel>{t("secretKey")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={t(
                                                "enterYourSecretKey"
                                            )}
                                            autoCapitalize="off"
                                            autoComplete="off"
                                            autoCorrect="off"
                                            {...register("secretKey")}
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="username"
                            render={() => (
                                <FormItem>
                                    <FormLabel>{t("username")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={t("enterYourUsername")}
                                            autoCapitalize="off"
                                            autoComplete="off"
                                            autoCorrect="off"
                                            {...register("username")}
                                        />
                                    </FormControl>

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
                                disabled={!isValid}
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
