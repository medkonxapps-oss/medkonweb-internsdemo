import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Linkedin, Twitter, Instagram } from "lucide-react";

export function FooterBiogra() {
  const scrollToSection = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="footer-section bg-background overflow-hidden relative">
      <div className="shape-1 absolute bottom-0 left-0 w-64 h-64 opacity-10">
        <img src="/assets/img/shapes/footer-shape-1.png" alt="shape" className="w-full h-full" />
      </div>

      {/* Footer Top */}
      <div className="footer-top-wrap border-b border-border/30">
        <div className="container mx-auto px-4 py-20">
          <div className="footer-top flex flex-col md:flex-row items-center justify-between gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-heading"
            >
              <h2 className="section-title text-3xl md:text-4xl lg:text-5xl font-serif font-bold leading-tight text-white">
                Reach out to get started about <br /> your design needs?
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
                Hire Me Now
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container mx-auto px-4 py-16">
          <div className="footer-contact grid md:grid-cols-4 gap-8 mb-12">
            <div className="footer-contact-item">
              <span className="text-muted-foreground text-sm block mb-2">Email Address</span>
              <h4 className="item-title text-lg font-semibold">
                <a
                  href="mailto:hello@medkon.dev"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  hello@medkon.dev
                </a>
              </h4>
            </div>
            <div className="footer-contact-item">
              <span className="text-muted-foreground text-sm block mb-2">Current Address</span>
              <h4 className="item-title text-lg font-semibold">
                20 Cooper Square, New York, NY <br />
                10003, USA
              </h4>
            </div>
            <div className="footer-contact-item">
              <span className="text-muted-foreground text-sm block mb-2">Need Projects?</span>
              <h4 className="item-title text-lg font-semibold">
                <a
                  href="tel:+12345678899"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Call : +1 (234) 567 8899
                </a>
              </h4>
            </div>
            <div className="footer-contact-item">
              <ul className="flex gap-4">
                <li>
                  <a
                    href="https://www.linkedin.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-card/50 border border-border/50 flex items-center justify-center hover:border-primary/30 hover:text-primary transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.twitter.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-card/50 border border-border/50 flex items-center justify-center hover:border-primary/30 hover:text-primary transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-card/50 border border-border/50 flex items-center justify-center hover:border-primary/30 hover:text-primary transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="copyright-content text-center pt-8 border-t border-border/30">
            <h2 className="footer-text text-4xl font-serif font-bold mb-4">MEDKON</h2>
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

