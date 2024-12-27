import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import arcjet, { createMiddleware, detectBot, shield } from "@arcjet/next";

const isPublicRoute = createRouteMatcher(['/dashboard(.*)', '/account(.*)', '/transaction(.*)']);

const aj = arcjet({
    key: process.env.ARCJET_KEY,
    rules: [
        shield({
            mode: "LIVE",
        }),
        detectBot({
            mode: "LIVE",
            allow: ["CATEGORY:SEARCH_ENGINE", "GO_HTTP"],
        }),
    ],
});

const clerk = clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();
    if (!userId && isPublicRoute(req)) {
        const { redirectToSignIn } = await auth();
        return redirectToSignIn();
    }
});

export default createMiddleware(aj, clerk);

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};