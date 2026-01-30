import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let gsapRegistered = false;

export function useGsapHomeAnimations() {
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (!gsapRegistered) {
      gsap.registerPlugin(ScrollTrigger);
      gsapRegistered = true;
    }

    const ctx = gsap.context(() => {
      // Header slide-down on first load
      const header = document.querySelector<HTMLElement>("[data-gsap-header]");
      if (header) {
        gsap.from(header, {
          y: -40,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
        });
      }

      // Hero headline - bouncy, GenZ but clean
      const heroTitle = document.querySelectorAll<HTMLElement>(
        "[data-gsap-hero-title] span",
      );
      if (heroTitle.length) {
        gsap.from(heroTitle, {
          yPercent: 120,
          rotate: 2,
          opacity: 0,
          duration: 1,
          ease: "back.out(1.7)",
          stagger: 0.08,
        });
      }

      // Hero subline + description subtle slide
      const heroSub = document.querySelector<HTMLElement>(
        "[data-gsap-hero-sub]",
      );
      const heroDesc = document.querySelector<HTMLElement>(
        "[data-gsap-hero-desc]",
      );
      gsap.from([heroSub, heroDesc].filter(Boolean), {
        y: 30,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.1,
        delay: 0.15,
      });

      // CTA buttons pop
      const heroCtas = document.querySelectorAll<HTMLElement>(
        "[data-gsap-hero-cta]",
      );
      if (heroCtas.length) {
        gsap.from(heroCtas, {
          scale: 0.85,
          y: 20,
          opacity: 0,
          duration: 0.7,
          ease: "elastic.out(1, 0.7)",
          stagger: 0.1,
          delay: 0.25,
        });
      }

      // Sections scroll-in timeline
      const sections = gsap.utils.toArray<HTMLElement>(
        "[data-gsap-section]",
      );
      sections.forEach((section, index) => {
        const heading = section.querySelector<HTMLElement>(
          "[data-gsap-section-heading]",
        );
        const content = section.querySelectorAll<HTMLElement>(
          "[data-gsap-section-content]",
        );

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            end: "bottom 40%",
            toggleActions: "play none none reverse",
          },
        });

        if (heading) {
          tl.from(heading, {
            y: 40,
            opacity: 0,
            duration: 0.7,
            ease: "power3.out",
          });
        }

        if (content.length) {
          tl.from(
            content,
            {
              y: 40,
              opacity: 0,
              duration: 0.6,
              ease: "power3.out",
              stagger: 0.06,
            },
            "-=0.3",
          );
        }

        // Slight section card lift for depth
        tl.fromTo(
          section,
          { transformOrigin: "center center", scale: 0.98 },
          {
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
          },
          index === 0 ? 0 : "-=0.4",
        );
      });

      // Footer call-to-action
      const footerCta = document.querySelector<HTMLElement>(
        "[data-gsap-footer-cta]",
      );
      if (footerCta) {
        gsap.from(footerCta, {
          scrollTrigger: {
            trigger: footerCta,
            start: "top 80%",
          },
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
        });
      }
    });

    return () => {
      ctx.revert();
    };
  }, []);
}

