import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Mail, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { MedkonLogo } from "./MedkonLogo";

const navItems = [
  { label: "Home", href: "/", submenu: [] },
  {
    label: "About",
    href: "/about",
    submenu: [
      { label: "About", href: "/about" },
      { label: "About 2", href: "/about-2" },
    ],
  },
  {
    label: "Work",
    href: "/portfolio",
    submenu: [
      { label: "Portfolio", href: "/portfolio" },
    ],
  },
  {
    label: "Services",
    href: "/service-details",
    submenu: [
      { label: "Services", href: "/service-details" },
    ],
  },
  {
    label: "Pages",
    href: "#",
    submenu: [
      { label: "FAQ", href: "/faq" },
      { label: "Pricing", href: "/pricing" },
      { label: "Testimonial", href: "#testimonials" },
      { label: "Blog", href: "/blog" },
    ],
  },
  { label: "Contact", href: "#contact" },
];

export function HeaderBiogra() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setSidebarOpen(false);
      }
    } else {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      <header
        data-gsap-header
        className={`header sticky-active fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-background/95 backdrop-blur-md border-b border-border/30" : "bg-transparent"
        }`}
      >
        <div className="primary-header">
          <div className="container mx-auto px-4">
            <div className="primary-header-inner flex items-center justify-between py-4">
              <div className="header-left flex items-center gap-8">
                <div className="header-logo">
                  <Link to="/" className="text-foreground hover:text-foreground" aria-label="Medkon home">
                    <MedkonLogo className="h-9" showWordmark />
                  </Link>
                </div>
                <div className="mail-box hidden lg:block">
                  <a
                    href="mailto:hello@medkon.dev"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    hello@medkon.dev
                  </a>
                </div>
              </div>

              <div className="header-right-wrap flex items-center gap-6">
                <nav className="hidden lg:block">
                  <ul className="flex items-center gap-1">
                    {navItems.map((item) => (
                      <li key={item.label} className="relative group">
                        {item.href.startsWith("#") ? (
                          <button
                            onClick={() => scrollToSection(item.href)}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {item.label}
                          </button>
                        ) : (
                          <Link
                            to={item.href}
                            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors block"
                          >
                            {item.label}
                          </Link>
                        )}
                        {item.submenu && item.submenu.length > 0 && (
                          <ul className="absolute top-full left-0 mt-2 w-48 bg-card/95 backdrop-blur-md border border-border/50 rounded-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                            {item.submenu.map((sub) => (
                              <li key={sub.label}>
                                {sub.href.startsWith("#") ? (
                                  <button
                                    onClick={() => scrollToSection(sub.href)}
                                    className="w-full text-left block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                                  >
                                    {sub.label}
                                  </button>
                                ) : (
                                  <Link
                                    to={sub.href}
                                    className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                                  >
                                    {sub.label}
                                  </Link>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="header-right flex items-center gap-2">
                  <button
                    className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    aria-label="Toggle theme"
                  >
                    {mounted && theme === "dark" ? (
                      <Sun className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    className="sidebar-icon p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full md:w-96 h-full bg-background border-l border-border z-[70] overflow-y-auto"
            >
              <div className="p-8">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="absolute top-6 right-6 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="side-menu-logo mb-12">
                  <Link to="/" onClick={() => setSidebarOpen(false)}>
                    <MedkonLogo className="h-9" showWordmark />
                  </Link>
                </div>

                <nav className="side-menu-wrap mb-12">
                  <ul className="space-y-2">
                    {navItems.map((item) => (
                      <li key={item.label}>
                        {item.href.startsWith("#") ? (
                          <button
                            onClick={() => scrollToSection(item.href)}
                            className="w-full text-left block px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                          >
                            {item.label}
                          </button>
                        ) : (
                          <Link
                            to={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className="block px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                          >
                            {item.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 pt-6 border-t border-border/30">
                    <button
                      onClick={() => {
                        setTheme(theme === "dark" ? "light" : "dark");
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                    >
                      <span>Theme</span>
                      {mounted && theme === "dark" ? (
                        <Sun className="w-5 h-5" />
                      ) : (
                        <Moon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </nav>

                <div className="side-menu-about mb-12">
                  <h3 className="text-xl font-serif font-bold mb-4">About Us</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Building digital experiences that drive results. From custom web applications
                    to powerful plugins, we help businesses grow.
                  </p>
                  <Link
                    to="#contact"
                    onClick={() => scrollToSection("#contact")}
                    className="inline-block px-6 py-3 rounded-full bg-gradient-primary text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all"
                  >
                    Contact Us
                  </Link>
                </div>

                <div className="side-menu-contact">
                  <h3 className="text-xl font-serif font-bold mb-4">Contact Us</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-4">
                      <Mail className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <a
                          href="mailto:hello@medkon.dev"
                          className="text-foreground hover:text-primary"
                        >
                          hello@medkon.dev
                        </a>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <Mail className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <a href="tel:+12345678899" className="text-foreground hover:text-primary">
                          +1 (234) 567 8899
                        </a>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

