import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Parallax effects with spring physics
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [0, 300]), {
    stiffness: 100,
    damping: 30,
  });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);
  
  // Deep parallax layers
  const layer1 = useSpring(useTransform(scrollYProgress, [0, 1], [0, 100]), {
    stiffness: 100,
    damping: 30,
  });
  const layer2 = useSpring(useTransform(scrollYProgress, [0, 1], [0, 200]), {
    stiffness: 100,
    damping: 30,
  });
  const layer3 = useSpring(useTransform(scrollYProgress, [0, 1], [0, 300]), {
    stiffness: 100,
    damping: 30,
  });

  const scrollToContact = () => {
    const element = document.querySelector("#contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToPortfolio = () => {
    const element = document.querySelector("#portfolio");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section ref={containerRef} className="relative min-h-[150vh] flex items-center justify-center overflow-hidden">
      {/* Deep parallax background layers */}
      <motion.div 
        style={{ y: layer1 }}
        className="absolute inset-0 bg-gradient-hero"
      />
      
      <motion.div 
        style={{ y: layer2 }}
        className="absolute inset-0 bg-mesh opacity-60"
      />
      
      {/* Animated blobs with parallax */}
      <motion.div 
        style={{ y: layer1 }}
        className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[120px] animate-blob" 
      />
      <motion.div 
        style={{ y: layer2 }}
        className="absolute bottom-1/4 -right-20 w-[700px] h-[700px] bg-accent/15 rounded-full blur-[140px] animate-blob animation-delay-2000" 
      />
      <motion.div 
        style={{ y: layer3 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[150px]" 
      />
      
      {/* Grid pattern with parallax */}
      <motion.div 
        style={{ y: layer2 }}
        className="absolute inset-0 bg-grid opacity-20"
      />

      {/* Main content with parallax */}
      <motion.div 
        style={{ y, opacity, scale }} 
        className="container mx-auto px-4 relative z-10 pt-32"
      >
        <div className="max-w-7xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm mb-12"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              Award-Winning Digital Studio
            </span>
          </motion.div>

          {/* Experimental Typography Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-experimental font-serif mb-8 leading-[0.9] tracking-tight"
          >
            <span className="block">We Craft</span>
            <span className="text-gradient block">Digital</span>
            <span className="block">Experiences</span>
          </motion.h1>

          {/* Subheadline with experimental sans */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-experimental-sans text-muted-foreground/80 mb-12 max-w-4xl leading-[0.95]"
          >
            That Convert & Inspire
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-16 leading-relaxed"
          >
            Award-winning design studio specializing in custom web applications, 
            powerful plugins, and digital solutions that help businesses scale 
            and stand out in the modern landscape.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-6 items-start"
          >
            <Button
              size="lg"
              className="relative bg-gradient-primary text-primary-foreground font-semibold px-10 py-7 text-lg rounded-full overflow-hidden group glow hover:scale-105 transition-transform"
              onClick={scrollToContact}
            >
              <span className="relative z-10 flex items-center gap-3">
                <Sparkles className="h-5 w-5" />
                Start Your Project
                <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
              </span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 font-semibold px-10 py-7 text-lg rounded-full group hover:scale-105 transition-transform"
              onClick={scrollToPortfolio}
            >
              <span className="flex items-center gap-3">
                View Our Work
                <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
              </span>
            </Button>
          </motion.div>

          {/* Stats with parallax */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            style={{ y: layer1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-32 pt-16 border-t border-border/30"
          >
            {[
              { value: "150+", label: "Projects", icon: "🚀" },
              { value: "50+", label: "Clients", icon: "💜" },
              { value: "10K+", label: "Downloads", icon: "⚡" },
              { value: "99%", label: "Satisfaction", icon: "⭐" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="text-center group"
              >
                <div className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-gradient mb-3">
                  {stat.value}
                </div>
                <div className="text-sm uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-2">
                  <span>{stat.icon}</span>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex flex-col items-center gap-3 text-muted-foreground"
        >
          <span className="text-xs uppercase tracking-[0.2em]">Scroll</span>
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-1.5 h-3 rounded-full bg-primary"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
