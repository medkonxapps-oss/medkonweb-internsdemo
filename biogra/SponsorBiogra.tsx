import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const sponsors = [
  { logo: "/assets/img/sponsor/sponsor-1.png", name: "Sponsor 1" },
  { logo: "/assets/img/sponsor/sponsor-2.png", name: "Sponsor 2" },
  { logo: "/assets/img/sponsor/sponsor-3.png", name: "Sponsor 3" },
  { logo: "/assets/img/sponsor/sponsor-4.png", name: "Sponsor 4" },
  { logo: "/assets/img/sponsor/sponsor-5.png", name: "Sponsor 5" },
  { logo: "/assets/img/sponsor/sponsor-6.png", name: "Sponsor 6" },
  { logo: "/assets/img/sponsor/sponsor-7.png", name: "Sponsor 7" },
  { logo: "/assets/img/sponsor/sponsor-8.png", name: "Sponsor 8" },
];

export function SponsorBiogra() {
  return (
    <section className="sponsor-section py-16 border-y border-border/30">
      <div className="container mx-auto px-4">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={40}
          slidesPerView={2}
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 3,
            },
            768: {
              slidesPerView: 4,
            },
            1024: {
              slidesPerView: 5,
            },
            1280: {
              slidesPerView: 6,
            },
          }}
          loop={true}
          className="sponsor-carousel"
        >
          {sponsors.map((sponsor, index) => (
            <SwiperSlide key={index}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="sponsor-item text-center"
              >
                <a href="#" className="block transition-transform hover:scale-105">
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="w-full h-auto max-h-16 object-contain mx-auto transition-transform"
                  />
                </a>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

