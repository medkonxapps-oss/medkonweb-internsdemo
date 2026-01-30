import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Project = Tables<"projects">;

export function ProjectsBiogra() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "completed")
        .order("is_featured", { ascending: false })
        .limit(5);
      
      if (data) {
        setProjects(data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="project-section py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-96 bg-card/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="project-section py-32 overflow-hidden"
      data-gsap-section
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-heading mb-16"
          data-gsap-section-heading
        >
          <h4 className="sub-heading text-sm uppercase tracking-wider text-primary mb-4">
            works
          </h4>
          <h2 className="section-title text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight">
            A Showcase of Digital Design <br />
            Excellence, My Work, Your <br />
            Next Inspiration
          </h2>
        </motion.div>

        {/* First Row - 2 Projects */}
        <div
          className="project-item-wrap grid md:grid-cols-2 gap-8 mb-8"
          data-gsap-section-content
        >
          {projects.slice(0, 2).map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="project-item group"
            >
              <Link to={`/project/${project.slug}`}>
                <div className="project-thumb relative overflow-hidden rounded-2xl mb-6">
                  {project.featured_image ? (
                    <img
                      src={project.featured_image}
                      alt={project.title}
                      className="w-full h-96 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-accent/20" />
                  )}
                </div>
                <div className="project-content">
                  <h3 className="title text-2xl font-serif font-bold mb-3 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <ul className="project-list flex gap-4 text-sm text-muted-foreground">
                    <li>{project.category || "Product Designer"}</li>
                    <li>UX/UI Design</li>
                  </ul>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Big Project */}
        {projects[2] && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="project-item big-item mb-8 group"
          >
            <Link to={`/project/${projects[2].slug}`}>
              <div className="project-thumb project-thumb-2 relative overflow-hidden rounded-2xl mb-6">
                {projects[2].featured_image ? (
                  <img
                    src={projects[2].featured_image}
                    alt={projects[2].title}
                    className="w-full h-[500px] object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-[500px] bg-gradient-to-br from-primary/20 to-accent/20" />
                )}
              </div>
              <div className="project-content">
                <h3 className="title text-2xl font-serif font-bold mb-3 group-hover:text-primary transition-colors">
                  {projects[2].title}
                </h3>
                <ul className="project-list flex gap-4 text-sm text-muted-foreground">
                  <li>{projects[2].category || "Product Designer"}</li>
                  <li>UX/UI Design</li>
                </ul>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Last Row - 2 Projects */}
        <div className="project-item-wrap grid md:grid-cols-2 gap-8">
          {projects.slice(3, 5).map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="project-item group"
            >
              <Link to={`/project/${project.slug}`}>
                <div className="project-thumb project-thumb-3 relative overflow-hidden rounded-2xl mb-6">
                  {project.featured_image ? (
                    <img
                      src={project.featured_image}
                      alt={project.title}
                      className="w-full h-96 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-accent/20" />
                  )}
                </div>
                <div className="project-content">
                  <h3 className="title text-2xl font-serif font-bold mb-3 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <ul className="project-list flex gap-4 text-sm text-muted-foreground">
                    <li>{project.category || "Product Designer"}</li>
                    <li>UX/UI Design</li>
                  </ul>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

