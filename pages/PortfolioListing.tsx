import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { LayoutBiogra } from '@/components/biogra/LayoutBiogra';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ExternalLink, Calendar, ArrowRight, Grid, List } from 'lucide-react';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type Project = Tables<'projects'>;

export default function PortfolioListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, [selectedCategory]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('projects')
        .select('*')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,client.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('category')
        .eq('status', 'completed')
        .not('category', 'is', null);

      if (error) throw error;
      const uniqueCategories = [...new Set(data?.map(p => p.category).filter(Boolean))] as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchQuery) {
      newParams.set('search', searchQuery);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
    fetchProjects();
  };

  const handleCategoryChange = (category: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (category) {
      newParams.set('category', category);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
    setSelectedCategory(category);
  };

  return (
    <LayoutBiogra>
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Portfolio</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Explore our completed projects and see how we've helped businesses succeed
              </p>

              {/* Search */}
              <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search projects..."
                    className="pl-9"
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>
            </motion.div>
          </div>
        </section>

        {/* Filters & View Toggle */}
        <section className="py-6 border-b border-border">
          <div className="container">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Categories */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant={selectedCategory === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryChange('')}
                >
                  All Projects
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCategoryChange(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Projects */}
        <section className="py-12">
          <div className="container">
            {loading ? (
              <div className={viewMode === 'grid' ? 'grid gap-8 md:grid-cols-2 lg:grid-cols-3' : 'space-y-6'}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">No projects found</p>
                {(searchQuery || selectedCategory) && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('');
                      setSearchParams(new URLSearchParams());
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project, index) => (
                  <motion.article
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <Link to={`/project/${project.slug}`} className="block">
                      <div className="overflow-hidden rounded-xl border border-border bg-card mb-4">
                        {project.featured_image ? (
                          <img
                            src={project.featured_image}
                            alt={project.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <span className="text-4xl opacity-50">🚀</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {project.category && (
                            <Badge variant="secondary" className="font-normal">
                              {project.category}
                            </Badge>
                          )}
                          {project.completed_at && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(project.completed_at), 'MMM yyyy')}
                            </div>
                          )}
                        </div>

                        <h2 className="text-xl font-semibold group-hover:text-primary transition-colors line-clamp-2">
                          {project.title}
                        </h2>

                        {project.client && (
                          <p className="text-sm text-muted-foreground">
                            Client: {project.client}
                          </p>
                        )}

                        {project.description && (
                          <p className="text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>
                        )}

                        <div className="flex items-center gap-1 text-sm font-medium text-primary pt-2">
                          View Project
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {projects.map((project, index) => (
                  <motion.article
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={`/project/${project.slug}`}
                      className="flex flex-col md:flex-row gap-6 p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors group"
                    >
                      <div className="md:w-64 flex-shrink-0">
                        {project.featured_image ? (
                          <img
                            src={project.featured_image}
                            alt={project.title}
                            className="w-full h-40 md:h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-40 md:h-full bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                            <span className="text-4xl opacity-50">🚀</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {project.category && (
                            <Badge variant="secondary" className="font-normal">
                              {project.category}
                            </Badge>
                          )}
                          {project.completed_at && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(project.completed_at), 'MMM yyyy')}
                            </div>
                          )}
                        </div>

                        <h2 className="text-2xl font-semibold group-hover:text-primary transition-colors">
                          {project.title}
                        </h2>

                        {project.client && (
                          <p className="text-sm text-muted-foreground">
                            Client: {project.client}
                          </p>
                        )}

                        {project.description && (
                          <p className="text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>
                        )}

                        {project.tech_stack && project.tech_stack.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {project.tech_stack.slice(0, 5).map((tech) => (
                              <Badge key={tech} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                            {project.tech_stack.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{project.tech_stack.length - 5}
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-4 pt-2">
                          <span className="text-sm font-medium text-primary flex items-center gap-1">
                            View Details
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </span>
                          {project.website_url && (
                            <span
                              onClick={(e) => {
                                e.preventDefault();
                                window.open(project.website_url!, '_blank');
                              }}
                              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Live Site
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </LayoutBiogra>
  );
}
