import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, ArrowRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { HorizontalScroll } from "@/components/modern/HorizontalScroll";

type Project = Tables<"projects">;

export function Portfolio() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("status", "completed")
      .order("is_featured", { ascending: false })
      .limit(12);
    
    if (data) setProjects(data);
    setLoading(false);
  };

  const categories = ["All", ...new Set(projects.map((p) => p.category).filter(Boolean))];
  
  const filteredProjects = activeCategory === "All" 
    ? projects 
    : projects.filter((p) => p.category === activeCategory);

  return (
    <section id="portfolio" className="py-32 relative overflow-hidden">
      {/* Background with parallax */}
      <div className="absolute inset-0 bg-dots opacity-20" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-accent/5 rounded-full blur-[150px]" />
      
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
            className="inline-block px-6 py-3 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-8 uppercase tracking-wider"
          >
            Our Work
          </motion.span>
          <h2 className="text-experimental-sans mb-8">
            Featured{" "}
            <span className="text-gradient">Projects</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore our latest work and see how we've helped businesses 
            transform their digital presence with cutting-edge design.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-20"
        >
          {categories.map((category) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(category as string)}
              className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 uppercase tracking-wider ${
                activeCategory === category 
                  ? "bg-gradient-primary text-primary-foreground border-0 glow shadow-lg shadow-primary/20" 
                  : "border-2 border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 hover:border-primary/30"
              }`}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 rounded-3xl bg-card/50 animate-pulse" />
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <>
            {/* Horizontal Scroll Section for Featured Projects */}
            <HorizontalScroll className="mb-20">
              {filteredProjects.slice(0, 6).map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-shrink-0 w-[500px] h-[700px]"
                >
                  <Link
                    to={`/project/${project.slug}`}
                    className="group block relative h-full rounded-3xl overflow-hidden bg-card/30 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 card-glow"
                  >
                    {/* Project Image */}
                    <div className="h-[60%] bg-secondary relative overflow-hidden">
                      {project.featured_image ? (
                        <motion.img
                          src={project.featured_image}
                          alt={project.title}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.7 }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                      )}
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* View button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="w-16 h-16 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center"
                        >
                          <Eye className="w-7 h-7 text-primary-foreground" />
                        </motion.div>
                      </div>
                    </div>

                    {/* Project Info */}
                    <div className="p-8 h-[40%] flex flex-col justify-between">
                      <div>
                        {project.category && (
                          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                            {project.category}
                          </Badge>
                        )}
                        
                        <h3 className="text-3xl font-serif font-bold mb-4 group-hover:text-gradient transition-all duration-300">
                          {project.title}
                        </h3>
                        
                        <p className="text-muted-foreground text-base mb-6 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        {project.tech_stack && project.tech_stack.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.tech_stack.slice(0, 2).map((tech) => (
                              <span
                                key={tech}
                                className="text-xs px-3 py-1 rounded-full bg-secondary/50 text-muted-foreground"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                          View Project
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </HorizontalScroll>

            {/* Grid Layout for remaining projects */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredProjects.slice(6).map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={`/project/${project.slug}`}
                      className="group block relative rounded-3xl overflow-hidden bg-card/30 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 card-glow"
                    >
                      {/* Project Image */}
                      <div className="aspect-[4/3] bg-secondary relative overflow-hidden">
                        {project.featured_image ? (
                          <img
                            src={project.featured_image}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                        )}
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        {/* View button */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                            <Eye className="w-6 h-6 text-primary-foreground" />
                          </div>
                        </div>
                      </div>

                      {/* Project Info */}
                      <div className="p-6">
                        {project.category && (
                          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                            {project.category}
                          </Badge>
                        )}
                        
                        <h3 className="text-2xl font-serif font-bold mb-3 group-hover:text-gradient transition-all duration-300">
                          {project.title}
                        </h3>
                        
                        <p className="text-muted-foreground text-sm mb-5 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>

                        <div className="flex items-center gap-2 text-sm font-medium text-primary">
                          View Project
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
              <Eye className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg">No projects to show yet.</p>
          </motion.div>
        )}

        {projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-20"
          >
            <Link to="/portfolio">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full px-10 py-7 border-2 border-border/50 bg-card/30 backdrop-blur-sm hover:bg-card/50 hover:border-primary/30 group text-lg"
                >
                  View All Projects
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
