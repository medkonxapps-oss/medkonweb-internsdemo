import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Project = Tables<"projects">;

interface CaseStudyModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

function CaseStudyModal({ project, isOpen, onClose }: CaseStudyModalProps) {
  if (!project) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-[101] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-full bg-background/95 backdrop-blur-xl rounded-3xl border border-border/50 overflow-hidden">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-card transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Hero Image */}
              {project.featured_image && (
                <div className="relative h-[40vh] min-h-[300px] overflow-hidden">
                  <motion.img
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    src={project.featured_image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                </div>
              )}

              {/* Content */}
              <div className="px-8 md:px-16 py-12">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {project.category && (
                    <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                      {project.category}
                    </span>
                  )}

                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-6 leading-tight">
                    {project.title}
                  </h1>

                  <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl leading-relaxed">
                    {project.description}
                  </p>
                </motion.div>

                {/* Tech Stack */}
                {project.tech_stack && project.tech_stack.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-12"
                  >
                    <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
                      Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {project.tech_stack.map((tech) => (
                        <span
                          key={tech}
                          className="px-4 py-2 rounded-full bg-card border border-border/50 text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-4"
                >
                  <Link
                    to={`/project/${project.slug}`}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                  >
                    View Full Case Study
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  {project.project_url && (
                    <a
                      href={project.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-border bg-card/50 hover:bg-card transition-colors"
                    >
                      Visit Live Site
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function CaseStudies() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("status", "completed")
      .order("is_featured", { ascending: false })
      .limit(8);

    if (data) setProjects(data);
    setLoading(false);
  };

  const openCaseStudy = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeCaseStudy = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "auto";
  };

  if (loading) {
    return (
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="flex gap-8 overflow-x-auto pb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[400px] h-[600px] bg-card/50 rounded-3xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-experimental-sans text-center mb-6">
              Case Studies
            </h2>
            <p className="text-xl text-muted-foreground text-center max-w-2xl mx-auto">
              Immersive experiences that push boundaries
            </p>
          </motion.div>

          <div className="flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-[400px] md:w-[500px] snap-center"
              >
                <div
                  onClick={() => openCaseStudy(project)}
                  className="group relative h-[600px] rounded-3xl overflow-hidden bg-card/30 border border-border/50 cursor-pointer"
                >
                  {/* Image */}
                  {project.featured_image ? (
                    <div className="absolute inset-0">
                      <img
                        src={project.featured_image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
                  )}

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    {project.category && (
                      <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium mb-4">
                        {project.category}
                      </span>
                    )}
                    <h3 className="text-3xl md:text-4xl font-serif font-bold mb-3 group-hover:text-gradient transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2 mb-6">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      View Case Study
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CaseStudyModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={closeCaseStudy}
      />
    </>
  );
}

