import { LayoutBiogra } from "@/components/biogra/LayoutBiogra";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "$2,999",
      period: "per project",
      description: "Perfect for small businesses and startups",
      features: [
        "Logo Design",
        "Brand Guidelines (Basic)",
        "5 Page Website Design",
        "1 Round of Revisions",
        "Source Files",
        "2 Weeks Delivery",
      ],
      popular: false,
    },
    {
      name: "Professional",
      price: "$7,999",
      period: "per project",
      description: "Ideal for growing businesses",
      features: [
        "Complete Brand Identity",
        "Comprehensive Brand Guidelines",
        "10 Page Website Design",
        "3 Rounds of Revisions",
        "Responsive Design",
        "UI/UX Consultation",
        "Source Files & Documentation",
        "4-6 Weeks Delivery",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "quote",
      description: "For large organizations with complex needs",
      features: [
        "Full Brand Strategy & Identity",
        "Complete Design System",
        "Unlimited Pages",
        "Unlimited Revisions",
        "Custom Development",
        "Ongoing Support",
        "Dedicated Project Manager",
        "Priority Support",
        "Flexible Timeline",
      ],
      popular: false,
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
              Pricing
            </h4>
            <h1 className="section-title text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight mb-6">
              Choose Your Plan
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transparent pricing for design services tailored to your needs
            </p>
          </div>
        </div>
      </motion.section>

      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-8 rounded-2xl border-2 ${
                  plan.popular
                    ? "border-primary bg-card/50 backdrop-blur-sm"
                    : "border-border/50 bg-card/30 backdrop-blur-sm"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-serif font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    {plan.period !== "quote" && (
                      <span className="text-muted-foreground ml-2">/ {plan.period}</span>
                    )}
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/90">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/contact" className="block">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    Get Started
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </LayoutBiogra>
  );
};

export default Pricing;

