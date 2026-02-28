"use client";

import { Wrench } from "lucide-react";

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                        <Wrench className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                        <p className="text-sm font-bold leading-none tracking-tight">EquipTrack</p>
                        <p className="text-xs text-muted-foreground">Equipment Management</p>
                    </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs text-muted-foreground">System Online</span>
                </div>
            </div>
        </header>
    );
}
