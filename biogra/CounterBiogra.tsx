import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface CounterItem {
  count: number;
  label: string;
  suffix: string;
}

const counters: CounterItem[] = [
  { count: 8, label: "Years of Experience", suffix: "+" },
  { count: 100, label: "Projects Completed", suffix: "+" },
  { count: 99, label: "Clients Satisfied", suffix: "%" },
  { count: 30, label: "Awards Won", suffix: "+" },
];

export function CounterBiogra() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [counts, setCounts] = useState([0, 0, 0, 0]);

  useEffect(() => {
    if (isInView) {
      counters.forEach((counter, index) => {
        const duration = 2000;
        const steps = 60;
        const increment = counter.count / steps;
        let current = 0;

        const timer = setInterval(() => {
          current += increment;
          if (current >= counter.count) {
            setCounts((prev) => {
              const newCounts = [...prev];
              newCounts[index] = counter.count;
              return newCounts;
            });
            clearInterval(timer);
          } else {
            setCounts((prev) => {
              const newCounts = [...prev];
              newCounts[index] = Math.floor(current);
              return newCounts;
            });
          }
        }, duration / steps);
      });
    }
  }, [isInView]);

  return (
    <section className="counter-section py-32">
      <div className="container mx-auto px-4">
        <div ref={ref} className="counter-item-wrap grid grid-cols-2 md:grid-cols-4 gap-8">
          {counters.map((counter, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="counter-item text-center"
            >
              <h3 className="title text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-gradient mb-4">
                {counts[index]}
                <span className="text-primary">{counter.suffix}</span>
              </h3>
              <p className="text-muted-foreground text-lg">{counter.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

