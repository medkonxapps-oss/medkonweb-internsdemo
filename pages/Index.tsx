import { Hero } from "@/components/public/Hero";
import { Services } from "@/components/public/Services";
import { Portfolio } from "@/components/public/Portfolio";
import { CaseStudies } from "@/components/modern/CaseStudies";
import { Plugins } from "@/components/public/Plugins";
import { BlogSection } from "@/components/public/BlogSection";
import { Testimonials } from "@/components/public/Testimonials";
import { Contact } from "@/components/public/Contact";
import { Newsletter } from "@/components/public/Newsletter";
import { Layout } from "@/components/public/Layout";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <Services />
      <CaseStudies />
      <Portfolio />
      <Plugins />
      <Testimonials />
      <BlogSection />
      <Newsletter />
      <Contact />
    </Layout>
  );
};

export default Index;
