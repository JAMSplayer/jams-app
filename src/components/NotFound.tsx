import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <>
            <p className="text-base font-semibold leading-8 ">404</p>
            <h1 className="mt-4 text-pretty text-5xl font-semibold tracking-tight  sm:text-6xl">
                Page not found
            </h1>
            <p className="mt-6 text-pretty text-lg font-medium sm:text-xl/8">
                Sorry, we couldn’t find the page you’re looking for.
            </p>
            <div className="mt-10">
                <Link to="/" className="text-sm font-semibold leading-7">
                    <span aria-hidden="true">&larr;</span> Go back
                </Link>
            </div>
        </>
    );
}
