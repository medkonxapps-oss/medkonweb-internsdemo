import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutBiogra } from '@/components/biogra/LayoutBiogra';
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";
import { SocialShare } from "@/components/public/SocialShare";

type Project = Tables<"projects">;

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (slug) fetchProject();
  }, [slug]);

  const fetchProject = async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .eq("status", "completed")
      .single();
    
    if (data) setProject(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <LayoutBiogra>
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="h-8 w-48 bg-card animate-pulse rounded mb-6" />
            <div className="h-12 w-full bg-card animate-pulse rounded mb-4" />
            <div className="h-96 w-full bg-card animate-pulse rounded" />
          </div>
        </main>
      </LayoutBiogra>
    );
  }

  if (!project) {
    return (
      <LayoutBiogra>
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The project you're looking for doesn't exist or is not yet completed.
            </p>
            <Link to="/#portfolio">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Portfolio
              </Button>
            </Link>
          </div>
        </main>
      </LayoutBiogra>
    );
  }

  const allImages = [project.featured_image, ...(project.images || [])].filter(Boolean) as string[];

  return (
    <LayoutBiogra>
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link
              to="/#portfolio"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Portfolio
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Images */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {allImages.length > 0 ? (
                <div className="space-y-4">
                  <div className="aspect-video rounded-xl overflow-hidden bg-card">
                    <img
                      src={allImages[activeImage]}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {allImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {allImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImage(i)}
                          className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                            activeImage === i ? "border-primary" : "border-transparent"
                          }`}
                        >
                          <img
                            src={img}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video rounded-xl bg-gradient-primary opacity-20" />
              )}
            </motion.div>

            {/* Right: Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {project.category && (
                  <Badge variant="secondary">{project.category}</Badge>
                )}
                {project.completed_at && (
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    {format(new Date(project.completed_at), "MMMM yyyy")}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold mb-4">
                {project.title}
              </h1>

              {project.client && (
                <p className="text-muted-foreground mb-6">
                  Client: <span className="text-foreground">{project.client}</span>
                </p>
              )}

              {project.description && (
                <p className="text-lg text-muted-foreground mb-8">
                  {project.description}
                </p>
              )}

              {/* Tech Stack */}
              {project.tech_stack && project.tech_stack.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-semibold mb-3">Technologies Used</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tech_stack.map((tech) => (
                      <Badge key={tech} variant="outline">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA & Share */}
              <div className="flex flex-wrap items-center gap-4">
                {project.website_url && (
                  <a
                    href={project.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="bg-gradient-primary hover:opacity-90">
                      Visit Website
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                )}
                <SocialShare 
                  title={project.title} 
                  description={project.description || ''} 
                />
              </div>
            </motion.div>
          </div>

          {/* Challenge, Solution, Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-3 gap-8 mt-16"
          >
            {project.challenge && (
              <div className="p-6 rounded-xl bg-card border border-border">
                <h3 className="text-lg font-semibold mb-3 text-destructive">
                  The Challenge
                </h3>
                <p className="text-muted-foreground">{project.challenge}</p>
              </div>
            )}
            {project.solution && (
              <div className="p-6 rounded-xl bg-card border border-border">
                <h3 className="text-lg font-semibold mb-3 text-primary">
                  Our Solution
                </h3>
                <p className="text-muted-foreground">{project.solution}</p>
              </div>
            )}
            {project.results && (
              <div className="p-6 rounded-xl bg-card border border-border">
                <h3 className="text-lg font-semibold mb-3 text-success">
                  The Results
                </h3>
                <p className="text-muted-foreground">{project.results}</p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </LayoutBiogra>
  );
}
