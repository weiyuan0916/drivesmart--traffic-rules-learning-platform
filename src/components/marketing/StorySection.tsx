import { motion } from 'motion/react';
import { stats } from './data/products';

export function StorySection() {
  return (
    <section className="bg-[#FAF8F3] py-20 md:py-32 overflow-hidden" aria-label="Our story">
      <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900&q=85"
                alt="Vietnamese farmers harvesting crops"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            {/* Floating accent card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="absolute -bottom-6 -right-4 md:-right-8 bg-white rounded-2xl shadow-xl p-5 md:p-6"
            >
              <p className="text-3xl md:text-4xl font-black text-[#1E1E1E]">100%</p>
              <p className="text-sm text-gray-500 font-medium mt-1">Natural & Organic</p>
            </motion.div>
          </motion.div>

          {/* Right: Story Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:pl-4"
          >
            <span className="text-sm font-semibold tracking-widest uppercase text-[#8B7355]">
              Our Story
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#1E1E1E] mt-4 mb-6 leading-tight">
              From Farm to Table,<br />
              <span className="text-[#6F4E37]">With Love & Care</span>
            </h2>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-6">
              For over 15 years, AgriVietnam has partnered with over 1,000 farming families across Vietnam's most fertile regions. From the misty highlands of Da Lat to the rich delta soils of the Mekong, we source only the finest agricultural products.
            </p>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-10">
              Every product tells a story of sustainable farming, traditional wisdom, and a deep respect for the land. We work directly with farmers, ensuring fair prices and environmentally responsible practices.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100"
                >
                  <p className="text-2xl md:text-3xl font-black text-[#3D2B1F]">{stat.value}</p>
                  <p className="text-sm text-gray-500 font-medium mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
