import { LayoutBiogra } from "@/components/biogra/LayoutBiogra";
import { AboutBiogra } from "@/components/biogra/AboutBiogra";
import { SkillsBiogra } from "@/components/biogra/SkillsBiogra";
import { CounterBiogra } from "@/components/biogra/CounterBiogra";
import { motion } from "framer-motion";

const About = () => {
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
              About Us
            </h4>
            <h1 className="section-title text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight mb-6">
              We Create Digital <br />
              Experiences That Matter
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Passionate about design and innovation, we help brands turn complex ideas into
              seamless, user-centered digital experiences.
            </p>
          </div>
        </div>
      </motion.section>
      <AboutBiogra />
      <SkillsBiogra />
      <CounterBiogra />
    </LayoutBiogra>
  );
};

export default About;

