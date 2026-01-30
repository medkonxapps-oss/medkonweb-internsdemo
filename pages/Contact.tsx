import { LayoutBiogra } from "@/components/biogra/LayoutBiogra";
import { Contact as ContactComponent } from "@/components/public/Contact";
import { motion } from "framer-motion";

const Contact = () => {
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
              Contact
            </h4>
            <h1 className="section-title text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight mb-6">
              Let's Start Your <br />
              Project Together
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Get in touch and let's discuss how we can bring your vision to life
            </p>
          </div>
        </div>
      </motion.section>
      <div id="contact">
        <ContactComponent />
      </div>
    </LayoutBiogra>
  );
};

export default Contact;
