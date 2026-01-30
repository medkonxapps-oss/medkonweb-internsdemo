import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

type Testimonial = Tables<"testimonials">;

export function TestimonialsBiogra() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .limit(6);
      
      if (data) {
        setTestimonials(data);
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="testimonial-section py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="h-96 bg-card/50 rounded-2xl animate-pulse" />
        </div>
      </section>
    );
  }

  return (
    <section
      className="testimonial-section py-32 overflow-hidden relative"
      data-gsap-section
    >
      <div className="testimonial-shape absolute top-0 right-0 w-64 h-64 opacity-10 hidden md:block">
        <img src="/assets/img/shapes/testimonials-shape.png" alt="shape" className="w-full h-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-heading mb-16"
          data-gsap-section-heading
        >
          <h4 className="sub-heading text-sm uppercase tracking-wider text-primary mb-4">
            Testimonials
          </h4>
          <h2 className="section-title text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight">
            What Clients Say About <br />
            My Services
          </h2>
        </motion.div>

        <Swiper
          modules={[Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          pagination={{ clickable: true }}
          breakpoints={{
            768: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          className="testi-carousel"
        >
          {testimonials.length === 0 ? (
            <SwiperSlide>
              <div className="testi-item p-8 rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm h-full text-center">
                <p className="text-muted-foreground">No testimonials available</p>
              </div>
            </SwiperSlide>
          ) : (
            testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="testi-item p-8 rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm h-full"
              >
                <span className="category inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
                  Quality Designer
                </span>
                <p className="text-foreground/90 text-lg leading-relaxed mb-8">
                  "{testimonial.content}"
                </p>
                <div className="testi-author flex items-center gap-4">
                  <div className="author-img">
                    {testimonial.avatar_url ? (
                      <img
                        src={testimonial.avatar_url}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-xl">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="content">
                    <h4 className="name text-xl font-serif font-bold">{testimonial.name}</h4>
                    <span className="text-muted-foreground text-sm">
                      {testimonial.role}
                      {testimonial.role && testimonial.company && " at "}
                      <span className="text-primary">{testimonial.company}</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
            ))
          )}
        </Swiper>
      </div>
    </section>
  );
}

