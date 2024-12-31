import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function NotFound() {
    const { t } = useTranslation();
    return (
        <>
            <p className="text-base font-semibold leading-8 ">404</p>
            <h1 className="mt-4 text-pretty text-5xl font-semibold tracking-tight  sm:text-6xl">
                {t("pageNotFound")}
            </h1>
            <p className="mt-6 text-pretty text-lg font-medium sm:text-xl/8">
                {t("sorryWeCouldNotFindThePageYouWereLookingFor")}.
            </p>
            <div className="mt-10">
                <Link to="/" className="text-sm font-semibold leading-7">
                    <span aria-hidden="true">&larr;</span> {t("goBack")}
                </Link>
            </div>
        </>
    );
}
