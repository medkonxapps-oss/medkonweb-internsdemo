import { motion } from "framer-motion";

const skills = [
  { number: "01", icon: "/assets/img/icon/skill-1.png", title: "Figma", category: "Design", level: "Advance" },
  { number: "02", icon: "/assets/img/icon/skill-2.png", title: "Framer", category: "Development", level: "Advance" },
  { number: "03", icon: "/assets/img/icon/skill-3.png", title: "Photoshop", category: "Design", level: "Advance" },
  { number: "04", icon: "/assets/img/icon/skill-4.png", title: "Illustrator", category: "Design", level: "Advance" },
  { number: "05", icon: "/assets/img/icon/skill-5.png", title: "After-effects", category: "Video FX", level: "Advance" },
  { number: "06", icon: "/assets/img/icon/skill-6.png", title: "Sketch", category: "Design", level: "Advance" },
];

export function SkillsBiogra() {
  return (
    <section className="skill-section py-32 relative">
      <div className="mid-border absolute top-1/2 left-0 right-0 h-px bg-border/30" />
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="skill-img"
          >
            <img
              src="/assets/img/images/skill-img.png"
              alt="skills"
              className="w-full h-auto rounded-2xl"
            />
          </motion.div>

          {/* Content */}
          <div className="skill-content">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="section-heading mb-16"
            >
              <h4 className="sub-heading text-sm uppercase tracking-wider text-primary mb-4">
                Best skills
              </h4>
              <h2 className="section-title text-4xl md:text-5xl font-serif font-bold leading-tight">
                Mastering the Web, One <br />
                Line of Code at a Time
              </h2>
            </motion.div>

            <div className="skill-items grid grid-cols-2 gap-6">
              {skills.map((skill, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="skill-item p-6 rounded-2xl bg-card/30 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all group"
                >
                  <div className="skill-item-top flex items-center justify-between mb-4">
                    <span className="number text-2xl font-serif font-bold text-primary/50">
                      {skill.number}
                    </span>
                    <div className="icon">
                      <img src={skill.icon} alt={skill.title} className="w-12 h-12" />
                    </div>
                  </div>
                  <h3 className="title text-xl font-serif font-bold mb-2">{skill.title}</h3>
                  <span className="category text-sm text-muted-foreground block mb-3">
                    {skill.category}
                  </span>
                  <span className="skill-btn inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                    {skill.level}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

