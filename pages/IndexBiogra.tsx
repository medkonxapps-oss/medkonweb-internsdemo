import { HeroBiogra } from "@/components/biogra/HeroBiogra";
import { AboutBiogra } from "@/components/biogra/AboutBiogra";
import { SponsorBiogra } from "@/components/biogra/SponsorBiogra";
import { ProjectsBiogra } from "@/components/biogra/ProjectsBiogra";
import { ServicesBiogra } from "@/components/biogra/ServicesBiogra";
import { CounterBiogra } from "@/components/biogra/CounterBiogra";
import { SkillsBiogra } from "@/components/biogra/SkillsBiogra";
import { TestimonialsBiogra } from "@/components/biogra/TestimonialsBiogra";
import { AwardsBiogra } from "@/components/biogra/AwardsBiogra";
import { BlogBiogra } from "@/components/biogra/BlogBiogra";
import { Contact } from "@/components/public/Contact";
import { LayoutBiogra } from "@/components/biogra/LayoutBiogra";
import { useGsapHomeAnimations } from "@/hooks/useGsapHomeAnimations";

const IndexBiogra = () => {
  useGsapHomeAnimations();

  return (
    <LayoutBiogra>
      <HeroBiogra />
      <AboutBiogra />
      <SponsorBiogra />
      <ProjectsBiogra />
      <ServicesBiogra />
      <CounterBiogra />
      <SkillsBiogra />
      <TestimonialsBiogra />
      <AwardsBiogra />
      <BlogBiogra />
      <Contact />
    </LayoutBiogra>
  );
};

export default IndexBiogra;

