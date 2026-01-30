import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRef } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from("newsletter_subscribers").insert({
      email,
      source: "website",
    });

    if (error) {
      if (error.code === "23505") {
        toast.info("You're already subscribed!");
      } else {
        toast.error("Failed to subscribe. Please try again.");
      }
    } else {
      toast.success("Thanks for subscribing!");
      setEmail("");
    }
    setSubmitting(false);
  };

  return (
    <section 
      ref={containerRef}
      className="py-32 relative overflow-hidden"
    >
      {/* Parallax background */}
      <motion.div 
        style={{ y, opacity }}
        className="absolute inset-0 bg-gradient-glow opacity-30"
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-grid opacity-10" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm mb-8"
          >
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground uppercase tracking-wider">Stay Updated</span>
          </motion.div>

          <h2 className="text-experimental-sans mb-8">
            Subscribe to Our <span className="text-gradient">Newsletter</span>
          </h2>
          
          <p className="text-muted-foreground text-xl mb-12 leading-relaxed">
            Get the latest updates on plugins, tutorials, and exclusive offers
            delivered straight to your inbox.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-12 bg-secondary/50 border-border/50 h-14 rounded-full text-base"
              />
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                size="lg"
                className="bg-gradient-primary text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all h-14 px-8 rounded-full"
                disabled={submitting}
              >
                {submitting ? "Subscribing..." : "Subscribe"}
              </Button>
            </motion.div>
          </form>

          <p className="text-sm text-muted-foreground mt-6">
            No spam, unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
