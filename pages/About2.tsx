import { LayoutBiogra } from "@/components/biogra/LayoutBiogra";
import { AboutBiogra } from "@/components/biogra/AboutBiogra";
import { TestimonialsBiogra } from "@/components/biogra/TestimonialsBiogra";
import { AwardsBiogra } from "@/components/biogra/AwardsBiogra";
import { motion } from "framer-motion";

const About2 = () => {
  return (
    <LayoutBiogra>
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="hero-section py-32 relative"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h4 className="sub-heading text-sm uppercase tracking-wider text-primary mb-4">
              Our Story
            </h4>
            <h1 className="section-title text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight mb-8">
              Crafting Excellence <br />
              Through Design
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-12">
              With over 7 years of experience in product design, we've completed 100+ projects
              for clients worldwide. Our mission is to create digital experiences that not only
              look beautiful but also drive meaningful results.
            </p>
          </div>
        </div>
      </motion.section>
      <AboutBiogra />
      <AwardsBiogra />
      <TestimonialsBiogra />
    </LayoutBiogra>
  );
};

export default About2;

