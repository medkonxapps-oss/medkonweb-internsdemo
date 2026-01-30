import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Download, Chrome, Figma, Globe, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { useRef } from "react";

type Plugin = Tables<"plugins">;

const pluginIcons = {
  wordpress: Globe,
  chrome: Chrome,
  figma: Figma,
};

export function Plugins() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [downloadForm, setDownloadForm] = useState({ name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  useEffect(() => {
    fetchPlugins();
  }, []);

  const fetchPlugins = async () => {
    const { data } = await supabase
      .from("plugins")
      .select("*")
      .eq("is_active", true)
      .order("download_count", { ascending: false });
    
    if (data) setPlugins(data);
    setLoading(false);
  };

  const handleDownloadRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlugin) return;

    setSubmitting(true);

    try {
      const { error: dbError } = await supabase.from("plugin_downloads").insert({
        plugin_id: selectedPlugin.id,
        name: downloadForm.name,
        email: downloadForm.email,
      });

      if (dbError) throw dbError;

      try {
        await supabase.functions.invoke("send-notification", {
          body: {
            type: "plugin_download",
            data: {
              name: downloadForm.name,
              email: downloadForm.email,
              plugin_name: selectedPlugin.name,
            },
          },
        });
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
      }

      toast.success("Download request submitted! Check your email soon.");
      setSelectedPlugin(null);
      setDownloadForm({ name: "", email: "" });
    } catch (error: any) {
      console.error("Error submitting request:", error);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section 
      ref={containerRef}
      id="plugins" 
      className="py-32 relative overflow-hidden"
    >
      {/* Parallax background */}
      <motion.div 
        style={{ y, opacity }}
        className="absolute inset-0 bg-gradient-subtle"
      />
      <div className="absolute inset-0 bg-grid opacity-15" />
      <div className="absolute top-0 right-0 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
      
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
            className="inline-block px-6 py-3 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 uppercase tracking-wider"
          >
            Free Resources
          </motion.span>
          <h2 className="text-experimental-sans mb-8">
            Premium <span className="text-gradient">Plugins</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Download our premium plugins for WordPress, Chrome, and Figma. 
            Boost your productivity with tools built by experts.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-80 rounded-3xl bg-card/50 animate-pulse" />
            ))}
          </div>
        ) : plugins.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {plugins.map((plugin, index) => {
              const IconComponent = pluginIcons[plugin.type] || Globe;
              
              return (
                <motion.div
                  key={plugin.id}
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
                  <div className="relative h-full p-10 rounded-3xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 overflow-hidden card-glow">
                    {/* Gradient background on hover */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    />
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <motion.div
                          whileHover={{ rotate: 5, scale: 1.1 }}
                          className="w-16 h-16 rounded-2xl bg-gradient-primary p-[2px]"
                        >
                          <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                            <IconComponent className="h-8 w-8 text-primary" />
                          </div>
                        </motion.div>
                        <Badge 
                          variant="secondary" 
                          className="capitalize px-4 py-2 rounded-full border border-border/50"
                        >
                          {plugin.type}
                        </Badge>
                      </div>

                      <h3 className="text-2xl font-serif font-bold mb-4 group-hover:text-gradient transition-all duration-300">
                        {plugin.name}
                      </h3>
                      <p className="text-muted-foreground text-base mb-6 leading-relaxed line-clamp-3">
                        {plugin.description}
                      </p>

                      {plugin.features && plugin.features.length > 0 && (
                        <ul className="text-sm text-muted-foreground mb-8 space-y-2">
                          {plugin.features.slice(0, 3).map((feature, i) => (
                            <li key={i} className="flex items-center gap-3">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="flex items-center justify-between pt-6 border-t border-border/50">
                        <span className="text-sm text-muted-foreground font-medium">
                          {plugin.download_count.toLocaleString()} downloads
                        </span>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            className="bg-gradient-primary text-primary-foreground font-semibold px-6 py-6 rounded-full hover:shadow-lg hover:shadow-primary/20 transition-all"
                            onClick={() => setSelectedPlugin(plugin)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Get Plugin
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
              <Download className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg">No plugins available yet. Check back soon!</p>
          </motion.div>
        )}
      </div>

      {/* Download Dialog */}
      <Dialog open={!!selectedPlugin} onOpenChange={() => setSelectedPlugin(null)}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-border/50 rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif font-bold">Get {selectedPlugin?.name}</DialogTitle>
            <DialogDescription className="text-base">
              Enter your details below and we'll send you the download link.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleDownloadRequest} className="space-y-5">
            <div>
              <Input
                placeholder="Your name"
                value={downloadForm.name}
                onChange={(e) => setDownloadForm({ ...downloadForm, name: e.target.value })}
                required
                className="bg-secondary/50 border-border/50 h-12 rounded-xl"
              />
            </div>
            <div>
              <Input
                type="email"
                placeholder="Your email"
                value={downloadForm.email}
                onChange={(e) => setDownloadForm({ ...downloadForm, email: e.target.value })}
                required
                className="bg-secondary/50 border-border/50 h-12 rounded-xl"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-primary text-primary-foreground font-semibold h-12 rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Request Download"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
