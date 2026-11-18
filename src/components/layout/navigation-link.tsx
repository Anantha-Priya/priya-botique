"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type MouseEventHandler } from "react";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/types/store";

interface NavigationLinkProps extends NavigationItem {
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

interface NavigationAnchorProps extends NavigationLinkProps {
  isActive?: boolean;
}

function NavigationAnchor({
  label,
  href,
  className,
  onClick,
  isActive = false,
}: NavigationAnchorProps) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "rounded-sm transition-colors hover:text-primary aria-[current=page]:text-primary",
        className,
      )}
      onClick={onClick}
    >
      {label}
    </Link>
  );
}

function PathAwareNavigationLink(props: NavigationLinkProps) {
  const pathname = usePathname();
  const isActive =
    pathname === props.href ||
    (props.href !== "/" && pathname?.startsWith(`${props.href}/`));

  return <NavigationAnchor {...props} isActive={isActive} />;
}

export function NavigationLink(props: NavigationLinkProps) {
  return (
    <Suspense fallback={<NavigationAnchor {...props} />}>
      <PathAwareNavigationLink {...props} />
    </Suspense>
  );
}
