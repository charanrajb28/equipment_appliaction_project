"use client";

import { FlaskConical } from "lucide-react";

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background">
            <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                    <div className="flex bg-foreground text-background h-7 w-7 items-center justify-center rounded-sm">
                        <FlaskConical className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold leading-tight tracking-tight">
                            BioTrack
                        </p>
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-medium text-muted-foreground mr-2">System Online</span>
                    </div>
                    <div className="h-4 w-px bg-border" />
                    <span className="text-xs font-medium text-foreground ml-2">v.1.0</span>
                </div>
            </div>
        </header>
    );
}
