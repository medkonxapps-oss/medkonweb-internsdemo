import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function AboutBiogra() {
  const experiences = [
    { year: "2023 - Present", title: "Design Lead", company: "Microsoft" },
    { year: "2020 - 2022", title: "Senior Product Designer", company: "Google" },
    { year: "2017 - 2019", title: "Visualizer & Director", company: "Apple Software" },
    { year: "2013 - 2016", title: "Lead UX Designer", company: "Awwwards" },
  ];

  const education = [
    { category: "BSC in CSE", period: "London University (2006-2010)" },
    { category: "UX Design", period: "World University (2000-2002)" },
    { category: "UI Design", period: "USA University (1999-2000)" },
    { category: "Diploma in CSE", period: "Japan University (2006-2010)" },
  ];

  return (
    <section
      className="about-section py-32 relative overflow-hidden"
      data-gsap-section
    >
      <div className="section-divider my-0" aria-hidden />
      <div className="container mx-auto px-4">
        <div className="about-content-wrap grid lg:grid-cols-3 gap-12">
          {/* Left - Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="about-left-content"
          >
            <div className="about-author-img">
              <img
                src="/assets/img/images/about-img-2.png"
                alt="about"
                className="w-full h-auto rounded-2xl"
              />
            </div>
          </motion.div>

          {/* Middle - Content */}
          <div className="about-mid-content space-y-16">
            {/* About Me */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="about-mid-item"
              data-gsap-section-heading
            >
              <div className="section-heading mb-8">
                <h4 className="sub-heading text-sm uppercase tracking-wider text-primary mb-4">
                  About Me
                </h4>
                <h2 className="section-title text-4xl md:text-5xl font-serif font-bold leading-tight mb-6">
                  Passionate & Lead <br /> Product designer
                </h2>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                "I'm <span className="text-primary font-semibold">Medkon</span> a UI/UX designer passionate about
                creating intuitive, user-centered digital experiences. I help brands turn complex
                ideas into seamless interfaces. I have completed 100+ projects"
              </p>
              <Link to="/about">
                <Button className="bg-gradient-primary text-primary-foreground rounded-full px-8 py-6">
                  <Download className="mr-2 h-5 w-5" />
                  Download Resume
                </Button>
              </Link>
            </motion.div>

            {/* Experience */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="about-mid-item"
            >
              <div className="section-heading mb-10">
                <h4 className="sub-heading text-sm uppercase tracking-wider text-primary">
                  Experience
                </h4>
              </div>
              <div className="about-exp-items space-y-6">
                {experiences.map((exp, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="about-exp-item border-l-2 border-primary/30 pl-6 py-2"
                  >
                    <div className="mb-2">
                      <span className="year text-sm text-muted-foreground">{exp.year}</span>
                    </div>
                    <h4 className="item-title text-xl font-semibold">
                      {exp.title} <span className="text-primary">{exp.company}</span>
                    </h4>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Education */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="about-mid-item"
            >
              <div className="section-heading mb-8">
                <h4 className="sub-heading text-sm uppercase tracking-wider text-primary">
                  Education
                </h4>
              </div>
              <ul className="about-ed-list space-y-4">
                {education.map((edu, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-between items-center py-3 border-b border-border/30"
                  >
                    <span className="category font-semibold">{edu.category}</span>
                    <span className="text-muted-foreground text-sm">{edu.period}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Right - Author Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="about-right-content"
          >
            <div className="about-author-info relative p-8 rounded-3xl bg-card/30 border border-border/50 backdrop-blur-sm">
              <div className="border-label absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-primary rounded-tl-3xl" />
              <div className="author-img mb-6">
                <img
                  src="/assets/img/images/about-img-3.png"
                  alt="about"
                  className="w-32 h-32 rounded-full object-cover mx-auto"
                />
              </div>
              <h4 className="name text-2xl font-serif font-bold text-center mb-2">Medkon</h4>
              <span className="text-muted-foreground text-center block mb-6">
                Visualizer & Design Director
              </span>
              <img
                src="/assets/img/images/sign.png"
                alt="sign"
                className="w-24 h-auto mx-auto opacity-60"
              />
            </div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="about-right-item mt-16"
            >
              <div className="section-heading mb-8">
                <h4 className="sub-heading text-sm uppercase tracking-wider text-primary">
                  Contact
                </h4>
              </div>
              <ul className="about-ed-list space-y-4">
                <li className="flex justify-between items-center py-3 border-b border-border/30">
                  <span className="text-muted-foreground">Phone Number</span>
                  <a href="tel:+12345678899" className="category font-semibold hover:text-primary">
                    +1 (234) 567 8899
                  </a>
                </li>
                <li className="flex justify-between items-center py-3 border-b border-border/30">
                  <span className="text-muted-foreground">Email Address</span>
                  <a href="mailto:hello@medkon.dev" className="category font-semibold hover:text-primary">
                    hello@medkon.dev
                  </a>
                </li>
                <li className="flex justify-between items-center py-3 border-b border-border/30">
                  <span className="text-muted-foreground">Website</span>
                  <a href="#" className="category font-semibold hover:text-primary">
                    medkon.dev
                  </a>
                </li>
                <li className="flex justify-between items-center py-3">
                  <span className="text-muted-foreground">Current Address</span>
                  <span className="category font-semibold">New York</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

