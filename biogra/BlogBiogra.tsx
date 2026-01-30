import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";

type BlogPost = Tables<"blog_posts">;

export function BlogBiogra() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(3);
      
      if (data) {
        setPosts(data);
      }
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="blog-section py-32">
        <div className="container mx-auto px-4">
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-card/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="blog-section py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-heading-1 mb-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
        >
          <div>
            <h4 className="sub-heading text-sm uppercase tracking-wider text-primary mb-4">
              News & Blog
            </h4>
            <h2 className="section-title text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight">
              Discover Every Single Updates <br />
              for UI/UX Articles & Tips
            </h2>
          </div>
          <Link
            to="/blog"
            className="new-btn inline-block px-8 py-4 rounded-full bg-gradient-primary text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all"
          >
            View All Blogs
          </Link>
        </motion.div>

        <div className="post-card-wrap space-y-8">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="post-card flex flex-col md:flex-row gap-8 p-8 rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all group"
            >
              <div className="post-thumb-wrap flex-shrink-0">
                <div className="post-thumb w-full md:w-80 h-64 rounded-xl overflow-hidden">
                  {post.featured_image ? (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                  )}
                </div>
              </div>
              <div className="post-content-wrap flex-1 flex flex-col justify-center">
                <div className="post-content">
                  <ul className="post-meta flex gap-6 text-sm text-muted-foreground mb-4">
                    <li>
                      Post by <span className="text-foreground font-semibold">Admin</span>
                    </li>
                    <li>
                      Date{" "}
                      <span className="text-foreground font-semibold">
                        {post.published_at
                          ? format(new Date(post.published_at), "dd MMM yyyy")
                          : "N/A"}
                      </span>
                    </li>
                  </ul>
                  <h3 className="title text-2xl md:text-3xl font-serif font-bold mb-6 group-hover:text-primary transition-colors line-clamp-2">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-block px-6 py-3 rounded-full bg-gradient-primary text-primary-foreground font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

