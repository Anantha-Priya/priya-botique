"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import { NavigationLink } from "@/components/layout/navigation-link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { primaryNavigation, utilityNavigation } from "@/data/navigation";
import { brand } from "@/lib/brand";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  return (
    <div className="xl:hidden">
      <Sheet open={open} onOpenChange={(nextOpen) => setOpen(nextOpen)}>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open navigation menu"
            >
              <Menu aria-hidden="true" className="size-5" />
            </Button>
          }
        />
        <SheetContent
          side="left"
          className="max-w-[calc(100vw-2rem)] w-[min(85vw,24rem)] overflow-y-auto"
        >
          <SheetHeader className="border-b border-border p-6">
            <SheetTitle className="text-xl">{brand.name}</SheetTitle>
            <SheetDescription>Browse PRIYA Boutique</SheetDescription>
          </SheetHeader>
          <nav aria-label="Mobile primary navigation" className="px-4">
            <ul className="space-y-1">
              {primaryNavigation.map((item) => (
                <li key={item.href}>
                  <NavigationLink
                    {...item}
                    className="flex min-h-11 items-center rounded-md px-3 text-base font-medium hover:bg-secondary"
                    onClick={closeMenu}
                  />
                </li>
              ))}
            </ul>
          </nav>
          <div className="mx-4 border-t border-border pt-3">
            <nav aria-label="Account and shopping">
              <ul className="space-y-1">
                {utilityNavigation.map((item) => (
                  <li key={item.href}>
                    <NavigationLink
                      {...item}
                      className="flex min-h-11 items-center rounded-md px-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                      onClick={closeMenu}
                    />
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
