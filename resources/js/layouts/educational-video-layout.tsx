import { Head, Link, usePage } from '@inertiajs/react';
import { Clapperboard } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { dashboard } from '@/routes';
import { index as videosIndex } from '@/routes/educational-videos';

/**
 * Standalone shell for the educational-video studio: its own colorful top bar and
 * background, no dashboard sidebar. Deliberately distinct from AppLayout — this is
 * meant to feel like a dedicated creation tool, not an admin-panel form.
 */
export default function EducationalVideoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&display=swap"
                    rel="stylesheet"
                />
                <style>{`.font-display { font-family: 'Baloo 2', 'Instrument Sans', ui-sans-serif, system-ui, sans-serif; }`}</style>
            </Head>

            <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-violet-50 via-white to-amber-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
                <div className="pointer-events-none fixed -top-32 -left-32 h-96 w-96 rounded-full bg-violet-300/30 blur-3xl dark:bg-violet-700/10" />
                <div className="pointer-events-none fixed top-1/3 -right-32 h-96 w-96 rounded-full bg-amber-300/30 blur-3xl dark:bg-amber-700/10" />

                <header className="sticky top-0 z-20 border-b border-violet-100 bg-white/70 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/70">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                        <Link
                            href={videosIndex()}
                            className="font-display flex items-center gap-2 text-lg font-bold text-violet-950 dark:text-white"
                        >
                            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-amber-500 text-white shadow-sm">
                                <Clapperboard className="size-5" />
                            </span>
                            Video Studio
                        </Link>

                        <div className="flex items-center gap-4">
                            <Link
                                href={dashboard()}
                                className="text-sm font-medium text-violet-700 hover:text-violet-900 dark:text-violet-300 dark:hover:text-white"
                            >
                                ← Dashboard
                            </Link>

                            {auth.user && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className="flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-2 py-1 dark:border-white/10 dark:bg-white/5"
                                        >
                                            <UserInfo user={auth.user} />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className="w-56 rounded-lg"
                                        align="end"
                                    >
                                        <UserMenuContent user={auth.user} />
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                </header>

                <main className="relative mx-auto max-w-6xl px-6 py-10">
                    {children}
                </main>
            </div>
        </>
    );
}
