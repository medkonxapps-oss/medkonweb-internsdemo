import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useRef } from "react";

type Testimonial = Tables<"testimonials">;

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .limit(6);
    
    if (data) setTestimonials(data);
    setLoading(false);
  };

  return (
    <section 
      ref={containerRef}
      className="py-32 relative overflow-hidden"
    >
      {/* Parallax background */}
      <motion.div 
        style={{ y, opacity }}
        className="absolute inset-0 bg-gradient-subtle"
      />
      <div className="absolute top-1/2 left-0 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[140px] -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-[700px] h-[700px] bg-accent/5 rounded-full blur-[140px] -translate-y-1/2" />
      <div className="absolute inset-0 bg-grid opacity-15" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-6 py-3 rounded-full bg-success/10 border border-success/20 text-success text-sm font-medium mb-8 uppercase tracking-wider"
          >
            Testimonials
          </motion.span>
          <h2 className="text-experimental-sans mb-8">
            What Clients{" "}
            <span className="text-gradient">Say</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Don't just take our word for it. Here's what our clients have to say 
            about working with us.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-80 rounded-3xl bg-card/50 animate-pulse" />
            ))}
          </div>
        ) : testimonials.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative"
              >
                <div className="h-full p-10 rounded-3xl bg-card/30 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 card-glow">
                  {/* Quote Icon */}
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    className="w-14 h-14 rounded-2xl bg-gradient-primary p-[2px] mb-8"
                  >
                    <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                      <Quote className="h-7 w-7 text-primary" />
                    </div>
                  </motion.div>

                  {/* Content */}
                  <p className="text-foreground/90 mb-8 leading-relaxed text-lg font-serif italic">
                    "{testimonial.content}"
                  </p>

                  {/* Rating */}
                  {testimonial.rating && (
                    <div className="flex gap-1 mb-8">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < testimonial.rating!
                              ? "text-warning fill-warning"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                    {testimonial.avatar_url ? (
                      <img
                        src={testimonial.avatar_url}
                        alt={testimonial.name}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-border"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-lg">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="font-semibold font-display text-lg">{testimonial.name}</div>
                      {(testimonial.role || testimonial.company) && (
                        <div className="text-sm text-muted-foreground">
                          {testimonial.role}
                          {testimonial.role && testimonial.company && " at "}
                          <span className="text-primary font-medium">{testimonial.company}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
              <Quote className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg">Testimonials coming soon!</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
