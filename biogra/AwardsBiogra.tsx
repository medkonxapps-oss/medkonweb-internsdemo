import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const awards = [
  {
    year: "2023",
    title: "Framer Award",
    role: "Lead Designer",
    image: "/assets/img/images/award-img-1.png",
  },
  {
    year: "2022",
    title: "Behance Prize",
    role: "Senior Visual",
    image: "/assets/img/images/award-img-1.png",
  },
  {
    year: "2021",
    title: "Design Honor",
    role: "Head of UI/UX",
    image: "/assets/img/images/award-img-1.png",
  },
  {
    year: "2020",
    title: "Figma Trophy",
    role: "Brand Creator",
    image: "/assets/img/images/award-img-1.png",
  },
  {
    year: "2019",
    title: "Sketch Glory",
    role: "Lead Designer",
    image: "/assets/img/images/award-img-1.png",
  },
  {
    year: "2018",
    title: "Creative Win",
    role: "Lead Designer",
    image: "/assets/img/images/award-img-1.png",
  },
  {
    year: "2017",
    title: "Framer Award",
    role: "Lead Designer",
    image: "/assets/img/images/award-img-1.png",
  },
];

export function AwardsBiogra() {
  return (
    <section className="award-section py-32">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="award-content relative"
            >
              <div className="section-heading mb-16 relative">
                <h2 className="section-title text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-8">
                  Let's Explore <br />
                  My Awards & <br />
                  Achievements
                </h2>
                <img
                  className="award-shape absolute top-0 right-0 w-32 h-32 opacity-20"
                  src="/assets/img/shapes/h1-awards-shape.png"
                  alt="shape"
                />
              </div>
              <div className="trophy-img">
                <img
                  src="/assets/img/images/trophy.png"
                  alt="trophy"
                  className="w-full h-auto max-w-md"
                />
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="award-accordion"
            >
              <Accordion type="single" collapsible className="space-y-4">
                {awards.map((award, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border border-border/50 rounded-2xl px-6 bg-card/30 backdrop-blur-sm"
                  >
                    <AccordionTrigger className="hover:no-underline py-6">
                      <div className="award-item-top flex items-center justify-between w-full text-left">
                        <span className="text-sm text-muted-foreground">{award.year}</span>
                        <span className="title text-xl font-serif font-bold">{award.title}</span>
                        <span className="text-sm text-muted-foreground">{award.role}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                      <div className="award-img">
                        <img
                          src={award.image}
                          alt={award.title}
                          className="w-full h-auto rounded-xl"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

