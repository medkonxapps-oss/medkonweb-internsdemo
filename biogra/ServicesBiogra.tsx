import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Service = Tables<"services">;

export function ServicesBiogra() {
  const [services, setServices] = useState<Service[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true })
        .limit(4);
      
      if (data && data.length > 0) {
        setServices(data);
      } else {
        // Fallback to default services if none in DB
        setServices([
          {
            id: "1",
            name: "Brand Identity & Art Direction",
            description: "Creating cohesive visual systems that define a brand's personal identity and art direction.",
            icon: "/assets/img/icon/service-icon-1.png",
            is_active: true,
            order_index: 1,
          },
          {
            id: "2",
            name: "Visual Concept Development",
            description: "Developing compelling visual concepts that align with your brand's strategy and resonate with your target audience.",
            icon: "/assets/img/icon/service-icon-2.png",
            is_active: true,
            order_index: 2,
          },
          {
            id: "3",
            name: "Motion & Visual Storytelling",
            description: "Bringing your brand's narrative to life through engaging motion graphics and visual storytelling.",
            icon: "/assets/img/icon/service-icon-3.png",
            is_active: true,
            order_index: 3,
          },
          {
            id: "4",
            name: "Digital & Print Design",
            description: "Designing beautiful and effective marketing materials for both digital and print mediums.",
            icon: "/assets/img/icon/service-icon-4.png",
            is_active: true,
            order_index: 4,
          },
        ] as any);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      // Fallback to default services on error
      setServices([
        {
            id: "1",
            name: "Brand Identity & Art Direction",
            description: "Creating cohesive visual systems that define a brand's personal identity and art direction.",
            icon: "/assets/img/icon/service-icon-1.png",
            is_active: true,
            order_index: 1,
          },
          {
            id: "2",
            name: "Visual Concept Development",
            description: "Developing compelling visual concepts that align with your brand's strategy and resonate with your target audience.",
            icon: "/assets/img/icon/service-icon-2.png",
            is_active: true,
            order_index: 2,
          },
          {
            id: "3",
            name: "Motion & Visual Storytelling",
            description: "Bringing your brand's narrative to life through engaging motion graphics and visual storytelling.",
            icon: "/assets/img/icon/service-icon-3.png",
            is_active: true,
            order_index: 3,
          },
          {
            id: "4",
            name: "Digital & Print Design",
            description: "Designing beautiful and effective marketing materials for both digital and print mediums.",
            icon: "/assets/img/icon/service-icon-4.png",
            is_active: true,
            order_index: 4,
          },
      ] as any);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="service-section py-32 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="space-y-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-card/50 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="service-section py-32 relative overflow-hidden"
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
            Services
          </h4>
          <h2 className="section-title text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight">
            Human-Centered Design, <br />
            Delivered Solutions
          </h2>
        </motion.div>

        <div className="item-wrapper space-y-6" data-gsap-section-content>
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`item flex items-start gap-8 p-8 rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 cursor-pointer ${
                activeIndex === index ? "active border-primary/50" : ""
              }`}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <div className="icon flex-shrink-0">
                <img
                  src={service.icon || `/assets/img/icon/service-icon-${index + 1}.png`}
                  alt={service.name}
                  className="w-16 h-16"
                />
              </div>
              <div className="content flex-1">
                <Link to="/service-details" className="title block text-2xl font-serif font-bold mb-4 hover:text-primary transition-colors">
                  {service.name}
                </Link>
                <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                  {service.description || "Creating cohesive visual systems that define brand's personal identity"}
                </p>
                <Link
                  to="/service-details"
                  className="service-item-btn inline-flex items-center gap-2 text-primary font-semibold hover:gap-4 transition-all"
                >
                  View Details
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

