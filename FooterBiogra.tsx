import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Instagram,
} from "lucide-react";

export function FooterBiogra() {
  const scrollToSection = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  // Shared gradient definition
  const gradientStops = [
    { offset: "0%", color: "hsl(190 95% 55%)" },
    { offset: "50%", color: "hsl(280 85% 65%)" },
    { offset: "100%", color: "hsl(340 80% 60%)" }
  ];

  const GradientIcon = ({ Icon, id, size = 24 }: { Icon: any; id: string; size?: number }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${id}Gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
          {gradientStops.map((stop, index) => (
            <stop key={index} offset={stop.offset} stopColor={stop.color} />
          ))}
        </linearGradient>
      </defs>
      <Icon stroke={`url(#${id}Gradient)`} />
    </svg>
  );

  const GradientText = ({ children, id }: { children: string; id: string }) => (
    <h2 
      className="text-2xl font-semibold mb-4 gradient-text"
      style={{
        background: 'linear-gradient(135deg, #1FD5F9 0%, #A855F7 50%, #EC4899 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
        display: 'inline-block'
      }}
    >
      {children}
    </h2>
  );

  const SocialIcon = ({ Icon, href, id }: { Icon: any; href: string; id: string }) => (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-lg bg-card/50 border border-border/50 flex items-center justify-center hover:border-primary/30 transition-all group"
      >
        <Icon className="w-5 h-5 text-foreground/70 group-hover:hidden" />
        <div className="hidden group-hover:block">
          <GradientIcon Icon={Icon} id={id} size={20} />
        </div>
      </a>
    </li>
  );

  return (
    <footer className="footer-section bg-background overflow-hidden relative">
      <div className="shape-1 absolute bottom-0 left-0 w-64 h-64 opacity-10">
        <img
          src="/assets/img/shapes/footer-shape-1.png"
          alt="shape"
          className="w-full h-full"
        />
      </div>

      {/* Footer Top */}
      <div className="footer-top-wrap border-b border-border/30">
        <div className="container mx-auto px-4 py-12">
          <div className="footer-top flex flex-col lg:flex-row items-center justify-between gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-heading"
            >
              <h2 className="section-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold leading-tight text-white text-center lg:text-left">
                Reach out to get started about <br className="hidden sm:block" /> your design needs?
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="footer-btn"
            >
              <Link
                to="#contact"
                onClick={() => scrollToSection("#contact")}
                className="inline-block px-8 py-4 rounded-full bg-gradient-primary text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all"
              >
                Connect with us
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container mx-auto px-4 py-12">
          <div className="footer-contact grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Let's Connect Section */}
            <div className="footer-contact-item">
              <GradientText id="connect">Let's Connect</GradientText>
              
              <div className="space-y-3">
                {/* Email */}
                <div className="group flex items-center gap-3 transition-transform duration-300 hover:translate-x-1">
                  <GradientIcon Icon={Mail} id="mail" />
                  <a
                    href="mailto:hello@medkon.dev"
                    className="text-base font-medium text-foreground/70"
                  >
                    hello@medkon.dev
                  </a>
                </div>

                {/* Address */}
                <div className="group flex items-start gap-3 transition-transform duration-300 hover:translate-x-1">
                  <div className="mt-1">
                    <GradientIcon Icon={MapPin} id="mapPin" />
                  </div>
                  <p className="text-base font-medium text-foreground/70 leading-snug">
                    20 Cooper Square, New York, NY 10003, USA
                  </p>
                </div>

                {/* Contact Number */}
                <div className="group flex items-center gap-3 transition-transform duration-300 hover:translate-x-1">
                  <GradientIcon Icon={Phone} id="phone" />
                  <a
                    href="tel:+1234567890"
                    className="text-base font-medium text-foreground/70"
                  >
                    +1 (234) 567-890
                  </a>
                </div>

                {/* Social Media Icons */}
                <div className="pt-1">
                  <ul className="flex flex-wrap gap-3 sm:gap-4">
                    <SocialIcon Icon={Linkedin} href="https://www.linkedin.com/" id="linkedin" />
                    <SocialIcon Icon={Twitter} href="https://www.twitter.com/" id="twitter" />
                    <SocialIcon Icon={Instagram} href="https://www.instagram.com/" id="instagram" />
                  </ul>
                </div>
              </div>
            </div>

            {/* Services Section */}
            <div className="footer-contact-item">
              <GradientText id="services">Services</GradientText>

              <ul className="space-y-3">
                {["Web Development", "SEO Optimization", "App Development"].map(
                  (service, index) => (
                    <li key={index} className="text-foreground/60">
                      <div className="group flex items-center gap-2 transition-all duration-300 hover:translate-x-2 hover:text-foreground w-fit">
                        <span 
                          className="font-bold"
                          style={{
                            background: 'linear-gradient(135deg, #1FD5F9 0%, #A855F7 50%, #EC4899 100%)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            color: 'transparent',
                            display: 'inline-block'
                          }}
                        >
                          {">"}
                        </span>
                        <span>{service}</span>
                      </div>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Resources Section */}
            <div className="footer-contact-item">
              <GradientText id="resources">Resources</GradientText>

              <ul className="space-y-3">
                {[
                  { label: "Blog", href: "/blog" },
                  { label: "Terms and Conditions", href: "/terms" },
                  { label: "Privacy Policy", href: "/privacy" },
                ].map((item, index) => (
                  <li key={index} className="text-foreground/60">
                    <div className="group flex items-center gap-2 transition-all duration-300 hover:translate-x-2 w-fit">
                      <span 
                        className="font-bold"
                        style={{
                          background: 'linear-gradient(135deg, #1FD5F9 0%, #A855F7 50%, #EC4899 100%)',
                          WebkitBackgroundClip: 'text',
                          backgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          color: 'transparent',
                          display: 'inline-block'
                        }}
                      >
                        {">"}
                      </span>
                      <a
                        href={item.href}
                        className="group-hover:text-foreground transition-colors text-base font-medium"
                      >
                        {item.label}
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Section */}
            <div className="footer-contact-item">
              <GradientText id="company">Company</GradientText>

              <ul className="space-y-3">
                {[
                  { label: "About Us", href: "/about" },
                  { label: "Careers", href: "/careers" },
                  { label: "Contact", href: "/contact" },
                ].map((item, index) => (
                  <li key={index} className="text-foreground/60">
                    <div className="group flex items-center gap-2 transition-all duration-300 hover:translate-x-2 w-fit">
                      <span 
                        className="font-bold"
                        style={{
                          background: 'linear-gradient(135deg, #1FD5F9 0%, #A855F7 50%, #EC4899 100%)',
                          WebkitBackgroundClip: 'text',
                          backgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          color: 'transparent',
                          display: 'inline-block'
                        }}
                      >
                        {">"}
                      </span>
                      <a
                        href={item.href}
                        className="group-hover:text-foreground transition-colors text-base font-medium"
                      >
                        {item.label}
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="copyright-content text-center pt-8 border-t border-border/30">
            <h2 className="footer-text text-4xl font-serif font-bold mb-4">
              MEDKON
            </h2>
            <p className="text-muted-foreground">
              © {new Date().getFullYear()} MEDKON. <br />
              All Rights Reserved. <br />
              Design by Medkon Team
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}