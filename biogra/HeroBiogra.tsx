import { motion } from "framer-motion";
import { Play, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { smoothScrollToSelector } from "@/lib/smoothScroll";

export function HeroBiogra() {
  return (
    <section className="hero-section overflow-hidden relative" data-gsap-hero>
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <img 
          src="/assets/img/shapes/line-shape-2.png" 
          alt="shape" 
          className="absolute top-20 left-10 opacity-20"
        />
      </div>
      
      <div className="container mx-auto px-4">
        <div className="hero-wrap flex flex-col lg:flex-row items-center gap-12 lg:gap-20 py-32">
          {/* Left Content */}
          <div className="hero-content flex-1">
            {/* Hero List */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="hero-list-wrap mb-8"
            >
              <ul className="hero-list flex flex-wrap gap-4 text-sm text-muted-foreground uppercase tracking-wider">
                <li>Senior Product Designer</li>
                <li>Design Director & Visualizer</li>
              </ul>
            </motion.div>

            {/* Hero Title */}
            <div className="hero-title-wrap mb-8" data-gsap-hero-title>
              <h1 className="hero-title text-6xl md:text-7xl lg:text-8xl font-serif font-bold leading-tight mb-6">
                <span className="block">Design Director</span>
                <span className="block">& Visualizer</span>
              </h1>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="title-icon inline-block"
              >
                <img 
                  src="/assets/img/icon/hero-arrow.png" 
                  alt="icon" 
                  className="w-16 h-16"
                />
              </motion.div>
            </div>

            {/* Hero Bottom */}
            <div className="hero-bottom-wrap flex flex-col md:flex-row items-start md:items-center gap-8">
              <motion.p
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="hero-desc text-xl md:text-2xl text-muted-foreground leading-relaxed"
                data-gsap-hero-sub
              >
                Hey, I'm Medkon <br />
                <span className="text-primary font-semibold">7+ Years</span> of Experience <br />
                in product design
              </motion.p>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="hero-thumb relative group"
              >
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden">
                  <img
                    src="/assets/img/images/hero-thumb-1.png"
                    alt="hero"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                </div>
                <div className="play-btn absolute inset-0 flex items-center justify-center">
                  <motion.a
                    href="https://youtu.be/JwC-Qx1lJso"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-20 h-20 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center group/play hover:bg-primary transition-colors"
                  >
                    <Play className="w-8 h-8 text-primary-foreground ml-1 group-hover/play:scale-110 transition-transform" />
                  </motion.a>
                </div>
              </motion.div>
            </div>

            {/* Hero CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="flex flex-wrap gap-4 mt-10"
              data-gsap-hero-cta
            >
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all btn-cta"
              >
                View Case Studies
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                type="button"
                onClick={() => smoothScrollToSelector("#contact", { duration: 800 })}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-border/50 bg-card/30 backdrop-blur-sm font-semibold hover:bg-card/50 hover:border-primary/30 transition-all"
              >
                Hire Me
              </button>
            </motion.div>
          </div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="hero-img-wrap relative flex-shrink-0 hidden lg:block"
          >
            <div className="img-bg-shape absolute -z-10">
              <img 
                src="/assets/img/shapes/hero-shape-1.png" 
                alt="shape" 
                className="w-full h-full opacity-30"
              />
            </div>
            <div className="hero-men relative z-10">
              <img 
                src="/assets/img/images/hero-men-1.png" 
                alt="men" 
                className="w-full h-auto"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <button
          type="button"
          onClick={() => smoothScrollToSelector("#about", { duration: 800 })}
          className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-xs uppercase tracking-[0.2em]"
          aria-label="Scroll to explore"
        >
          <span>Scroll to explore</span>
          <span className="w-6 h-10 rounded-full border-2 border-current/40 flex items-start justify-center p-2">
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-1.5 h-2 rounded-full bg-current/80"
            />
          </span>
        </button>
      </motion.div>
    </section>
  );
}

