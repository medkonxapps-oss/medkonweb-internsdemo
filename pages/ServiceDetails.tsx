import { LayoutBiogra } from "@/components/biogra/LayoutBiogra";
import { ServicesBiogra } from "@/components/biogra/ServicesBiogra";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const ServiceDetails = () => {
  const services = [
    {
      title: "Brand Identity & Art Direction",
      description:
        "Creating cohesive visual systems that define your brand's unique identity and personality.",
      features: [
        "Logo Design & Brand Guidelines",
        "Visual Identity Systems",
        "Art Direction & Creative Strategy",
        "Brand Storytelling",
      ],
      icon: "/assets/img/icon/service-icon-1.png",
    },
    {
      title: "Visual Concept Development",
      description:
        "Transforming ideas into compelling visual concepts that resonate with your audience.",
      features: [
        "Concept Ideation & Exploration",
        "Mood Board Creation",
        "Visual Prototyping",
        "Design System Development",
      ],
      icon: "/assets/img/icon/service-icon-2.png",
    },
    {
      title: "Motion & Visual Storytelling",
      description:
        "Bringing your brand to life through engaging animations and visual narratives.",
      features: [
        "2D & 3D Animation",
        "Video Production",
        "Interactive Experiences",
        "Motion Graphics",
      ],
      icon: "/assets/img/icon/service-icon-3.png",
    },
    {
      title: "Digital & Print Design",
      description:
        "Creating stunning designs for both digital platforms and traditional print media.",
      features: [
        "Web & Mobile UI/UX Design",
        "Print Design & Layout",
        "Packaging Design",
        "Editorial Design",
      ],
      icon: "/assets/img/icon/service-icon-4.png",
    },
  ];

  return (
    <LayoutBiogra>
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="hero-section py-32 relative"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h4 className="sub-heading text-sm uppercase tracking-wider text-primary mb-4">
              Services
            </h4>
            <h1 className="section-title text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight mb-6">
              Our Design Services
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Comprehensive design solutions tailored to your business needs
            </p>
          </div>
        </div>
      </motion.section>

      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all"
              >
                <div className="flex items-start gap-6 mb-6">
                  <img
                    src={service.icon}
                    alt={service.title}
                    className="w-16 h-16 flex-shrink-0"
                  />
                  <div>
                    <h3 className="text-2xl font-serif font-bold mb-2">{service.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground/90">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-4 transition-all"
                >
                  Get Started <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ServicesBiogra />
    </LayoutBiogra>
  );
};

export default ServiceDetails;

