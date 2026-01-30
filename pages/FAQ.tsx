import { LayoutBiogra } from "@/components/biogra/LayoutBiogra";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "What services do you offer?",
      answer:
        "We offer a comprehensive range of design services including brand identity, UI/UX design, web development, motion graphics, and digital marketing. Our team specializes in creating cohesive visual systems and user-centered digital experiences.",
    },
    {
      question: "How long does a typical project take?",
      answer:
        "Project timelines vary depending on scope and complexity. A typical website project takes 4-8 weeks, while a complete brand identity can take 6-12 weeks. We'll provide a detailed timeline during our initial consultation.",
    },
    {
      question: "What is your design process?",
      answer:
        "Our process begins with discovery and research, followed by strategy and concept development. We then move into design iteration, refinement, and final delivery. Throughout the process, we maintain close communication with clients to ensure alignment.",
    },
    {
      question: "Do you work with international clients?",
      answer:
        "Yes, we work with clients worldwide. We're experienced in managing projects across different time zones and can accommodate various communication preferences and project requirements.",
    },
    {
      question: "What are your payment terms?",
      answer:
        "We typically work with a 50% deposit upfront and 50% upon project completion. For larger projects, we can arrange milestone-based payments. All terms are clearly outlined in our project proposals.",
    },
    {
      question: "Do you provide ongoing support after project completion?",
      answer:
        "Yes, we offer maintenance and support packages. This can include updates, bug fixes, content changes, and technical support. We'll discuss your ongoing needs during the project planning phase.",
    },
    {
      question: "Can you work with our existing design system?",
      answer:
        "Absolutely! We're experienced in working with existing brand guidelines and design systems. We can extend and enhance your current design language while maintaining consistency.",
    },
    {
      question: "What file formats do you deliver?",
      answer:
        "We deliver source files in various formats depending on the project type. For design work, we provide files in Figma, Adobe Creative Suite formats, and exported assets. We always include organized file structures and documentation.",
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
              FAQ
            </h4>
            <h1 className="section-title text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight mb-6">
              Frequently Asked <br />
              Questions
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Find answers to common questions about our services and process
            </p>
          </div>
        </div>
      </motion.section>

      <section className="py-32">
        <div className="container mx-auto px-4 max-w-4xl">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="border border-border/50 rounded-2xl px-6 bg-card/30 backdrop-blur-sm"
                >
                  <AccordionTrigger className="hover:no-underline py-6 text-left">
                    <span className="text-xl font-serif font-bold">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      {faq.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>
    </LayoutBiogra>
  );
};

export default FAQ;

