import { motion, useScroll, useTransform } from "framer-motion";
import { Code2, Palette, Puzzle, Zap, Globe, Shield, ArrowUpRight } from "lucide-react";
import { useRef } from "react";

const services = [
  {
    icon: Code2,
    title: "Custom Development",
    description:
      "Tailored web applications built with cutting-edge technologies to meet your unique business requirements.",
    color: "from-primary to-primary/50",
    features: ["React & Next.js", "TypeScript", "API Integration"]
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    description:
      "Beautiful, intuitive interfaces that captivate users and create memorable brand experiences.",
    color: "from-accent to-accent/50",
    features: ["User Research", "Prototyping", "Design Systems"]
  },
  {
    icon: Puzzle,
    title: "Plugin Development",
    description:
      "Powerful WordPress, Chrome, and Figma plugins that extend functionality and automate workflows.",
    color: "from-chart-3 to-chart-3/50",
    features: ["WordPress", "Chrome Extensions", "Figma Plugins"]
  },
  {
    icon: Zap,
    title: "Performance",
    description:
      "Supercharge your applications with expert optimization, achieving blazing-fast load times.",
    color: "from-warning to-warning/50",
    features: ["Core Web Vitals", "SEO", "Caching"]
  },
  {
    icon: Globe,
    title: "Web Applications",
    description:
      "Full-stack applications with robust backends, real-time features, and seamless user experience.",
    color: "from-info to-info/50",
    features: ["Full Stack", "Real-time", "Scalable"]
  },
  {
    icon: Shield,
    title: "Security & Support",
    description:
      "Keep your applications secure and running smoothly with our ongoing maintenance and support.",
    color: "from-chart-5 to-chart-5/50",
    features: ["24/7 Support", "Security Audits", "Updates"]
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export function Services() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section 
      ref={containerRef}
      id="services" 
      className="py-32 relative overflow-hidden"
    >
      {/* Parallax background */}
      <motion.div 
        style={{ y, opacity }}
        className="absolute inset-0 bg-gradient-subtle"
      />
      <div className="absolute inset-0 bg-grid opacity-15" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-24"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-6 py-3 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 uppercase tracking-wider"
          >
            What We Offer
          </motion.span>
          <h2 className="text-experimental-sans mb-8">
            Services We{" "}
            <span className="text-gradient">Provide</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Comprehensive digital solutions crafted with precision to help your 
            business thrive in the modern landscape.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative"
            >
              <div className="relative h-full p-10 rounded-3xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 overflow-hidden card-glow">
                {/* Gradient background on hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                />
                
                {/* Icon with animated gradient */}
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} p-[2px] mb-8`}
                >
                  <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                    <service.icon className="h-8 w-8 text-foreground" />
                  </div>
                </motion.div>
                
                {/* Content */}
                <h3 className="text-2xl font-serif font-bold mb-4 group-hover:text-gradient transition-all duration-300">
                  {service.title}
                </h3>
                
                <p className="text-muted-foreground text-base mb-8 leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {service.features.map((feature) => (
                    <span
                      key={feature}
                      className="text-xs px-4 py-2 rounded-full bg-secondary/50 text-muted-foreground border border-border/30"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Link */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-sm font-semibold text-primary"
                >
                  Learn More
                  <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
