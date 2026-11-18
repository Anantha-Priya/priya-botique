"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const heroSlides = [
  {
    src: "/images/south-indian-bridal-editorial.jpg",
    alt: "South Indian bride in a red saree and ornate gold jewellery, adjusting her earring.",
    objectPosition: "center 20%",
  },
  {
    src: "/images/south-indian-colourful-saree.jpg",
    alt: "Woman wearing a bright yellow and magenta saree in a garden.",
    objectPosition: "center 48%",
  },
  {
    src: "/images/south-indian-silk-editorial.jpg",
    alt: "Woman wearing a magenta and gold saree with traditional jewellery.",
    objectPosition: "center 5%",
  },
  {
    src: "/images/south-indian-temple-jewellery.jpg",
    alt: "Close-up of an ornate gold pendant worn with a gold-toned saree.",
    objectPosition: "center 52%",
  },
] as const;

const slideInterval = 6500;

export function HomeHero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (isPaused || prefersReducedMotion) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveSlide((currentSlide) => (currentSlide + 1) % heroSlides.length);
    }, slideInterval);

    return () => window.clearInterval(intervalId);
  }, [isPaused, prefersReducedMotion]);

  function showSlide(index: number) {
    setActiveSlide((index + heroSlides.length) % heroSlides.length);
  }

  return (
    <section
      aria-labelledby="home-hero-title"
      aria-roledescription="carousel"
      className="relative isolate min-h-[calc(100svh-8rem)] overflow-hidden bg-[#241915] text-white"
      role="region"
    >
      <div aria-live="off" className="absolute inset-0">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.src}
            aria-hidden={index !== activeSlide}
            aria-label={`${index + 1} of ${heroSlides.length}`}
            aria-roledescription="slide"
            className={`absolute inset-0 transition-opacity duration-1000 motion-reduce:transition-none ${
              index === activeSlide ? "opacity-100" : "opacity-0"
            }`}
            role="group"
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              preload={index === 0}
              loading={index === 0 ? undefined : "eager"}
              sizes="100vw"
              style={{ objectPosition: slide.objectPosition }}
              className="object-cover"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-[#241915]/85 via-[#241915]/55 to-[#241915]/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#241915]/65 via-transparent to-[#241915]/10" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-8rem)] max-w-7xl items-center px-5 pt-14 pb-24 sm:px-8 lg:px-14">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f4d8a4]">
            PRIYA · A SOUTH INDIAN BOUTIQUE PREVIEW
          </p>
          <h1
            id="home-hero-title"
            className="mt-6 max-w-xl text-5xl leading-[1.08] font-medium tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            Silk, colour, and a sense of home.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/85 sm:text-lg sm:leading-8">
            A first look at PRIYA’s South Indian-inspired edit of clothing,
            jewellery, and accessories.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              href="/shop"
              className={buttonVariants({
                size: "lg",
                className: "rounded-full px-6",
              })}
            >
              Explore the preview
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              href="#categories"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-white transition-colors hover:text-[#f4d8a4]"
            >
              Meet the categories
              <ArrowDown aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <p className="mt-8 text-xs text-white/75">
            Sample Pexels photography · visual direction only
          </p>
        </div>
      </div>

      <div className="absolute inset-x-4 bottom-5 z-20 mx-auto flex max-w-7xl items-center justify-between sm:inset-x-8 lg:inset-x-14">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Show previous slide"
            className="inline-flex size-10 items-center justify-center rounded-full border border-white/35 bg-black/20 text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={() => showSlide(activeSlide - 1)}
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Show next slide"
            className="inline-flex size-10 items-center justify-center rounded-full border border-white/35 bg-black/20 text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={() => showSlide(activeSlide + 1)}
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              aria-label={`Show slide ${index + 1}`}
              aria-pressed={index === activeSlide}
              className="inline-flex size-8 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              onClick={() => showSlide(index)}
            >
              <span
                aria-hidden="true"
                className={`size-2.5 rounded-full transition-colors ${
                  index === activeSlide ? "bg-white" : "bg-white/50"
                }`}
              />
            </button>
          ))}
          <button
            type="button"
            aria-label={
              prefersReducedMotion
                ? "Automatic slideshow disabled by reduced-motion preference"
                : isPaused
                  ? "Resume automatic slide changes"
                  : "Pause automatic slide changes"
            }
            aria-pressed={isPaused || prefersReducedMotion}
            className="inline-flex size-10 items-center justify-center rounded-full border border-white/35 bg-black/20 text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-70"
            disabled={prefersReducedMotion}
            onClick={() => setIsPaused((paused) => !paused)}
          >
            {isPaused || prefersReducedMotion ? (
              <Play aria-hidden="true" className="size-4" />
            ) : (
              <Pause aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
