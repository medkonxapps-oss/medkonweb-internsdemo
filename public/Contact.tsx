import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Send, Mail, MapPin, Phone, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRef } from "react";

export function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error: dbError } = await supabase.from("leads").insert({
        name: form.name,
        email: form.email,
        company: form.company || null,
        phone: form.phone || null,
        message: form.message,
        source: "website",
      });

      if (dbError) throw dbError;

      try {
        await supabase.functions.invoke("send-notification", {
          body: {
            type: "lead",
            data: { name: form.name, email: form.email, company: form.company, phone: form.phone, message: form.message },
          },
        });
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
      }

      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", company: "", phone: "", message: "" });
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section 
      ref={containerRef}
      id="contact" 
      className="py-32 relative overflow-hidden"
    >
      {/* Parallax background */}
      <motion.div 
        style={{ y, opacity }}
        className="absolute inset-0 bg-gradient-subtle"
      />
      <div className="absolute inset-0 bg-grid opacity-15" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[140px]" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />
      
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
            className="inline-block px-6 py-3 rounded-full bg-info/10 border border-info/20 text-info text-sm font-medium mb-8 uppercase tracking-wider"
          >
            Contact Us
          </motion.span>
          <h2 className="text-experimental-sans mb-8">
            Get in <span className="text-gradient">Touch</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Ready to start your project? Let's build something amazing together.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div>
              <h3 className="text-4xl font-serif font-bold mb-6">Let's Talk</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                We'd love to hear about your project. Send us a message and we'll respond within 24 hours.
              </p>
            </div>

            <div className="space-y-6">
              {[
                { icon: Mail, label: "Email", value: "hello@medkon.dev", href: "mailto:hello@medkon.dev" },
                { icon: Phone, label: "Phone", value: "+1 (234) 567-890", href: "tel:+1234567890" },
                { icon: MapPin, label: "Location", value: "Remote • Worldwide" },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-5 group"
                >
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    className="w-14 h-14 rounded-2xl bg-gradient-primary p-[2px] flex-shrink-0"
                  >
                    <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                  </motion.div>
                  <div>
                    <div className="font-semibold font-display text-lg mb-1">{item.label}</div>
                    {item.href ? (
                      <a href={item.href} className="text-muted-foreground hover:text-primary transition-colors text-base">
                        {item.value}
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-base">{item.value}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-5 p-6 rounded-3xl bg-card/30 border border-border/50 backdrop-blur-sm"
            >
              <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-7 w-7 text-success" />
              </div>
              <div>
                <div className="font-semibold font-display text-lg">Quick Response</div>
                <div className="text-sm text-muted-foreground">Average response time: 2-4 hours</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <form onSubmit={handleSubmit} className="p-10 rounded-3xl bg-card/30 border border-border/50 backdrop-blur-sm space-y-6">
              <div className="grid sm:grid-cols-2 gap-5">
                <Input 
                  placeholder="Your name *" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  required 
                  className="bg-secondary/50 border-border/50 h-14 rounded-xl" 
                />
                <Input 
                  type="email" 
                  placeholder="Your email *" 
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })} 
                  required 
                  className="bg-secondary/50 border-border/50 h-14 rounded-xl" 
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <Input 
                  placeholder="Company" 
                  value={form.company} 
                  onChange={(e) => setForm({ ...form, company: e.target.value })} 
                  className="bg-secondary/50 border-border/50 h-14 rounded-xl" 
                />
                <Input 
                  type="tel" 
                  placeholder="Phone" 
                  value={form.phone} 
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                  className="bg-secondary/50 border-border/50 h-14 rounded-xl" 
                />
              </div>
              <Textarea 
                placeholder="Tell us about your project *" 
                value={form.message} 
                onChange={(e) => setForm({ ...form, message: e.target.value })} 
                required 
                rows={6} 
                className="bg-secondary/50 border-border/50 resize-none rounded-xl" 
              />
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-gradient-primary text-primary-foreground font-semibold h-16 rounded-full glow text-lg" 
                  disabled={submitting}
                >
                  {submitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Send Message
                      <Send className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </motion.div>
              <p className="text-xs text-muted-foreground text-center">By submitting, you agree to our privacy policy.</p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
