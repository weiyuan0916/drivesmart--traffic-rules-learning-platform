import { motion } from 'motion/react';
import { categories } from './data/products';

export function CategoryGrid() {
  return (
    <section className="bg-white py-20 md:py-32 overflow-hidden" aria-label="Product categories">
      <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold tracking-widest uppercase text-[#8B7355]">
            Browse By Category
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#1E1E1E] mt-4">
            Our Collections
          </h2>
        </motion.div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer"
            >
              {/* Image */}
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />

              {/* Dark overlay - lighter on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 group-hover:bg-black/60" />

              {/* Badge */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                  style={{ backgroundColor: cat.color + 'CC', color: cat.color === '#D8C3A5' ? '#2C2416' : 'white' }}>
                  {cat.name}
                </span>
              </div>

              {/* Bottom content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                <h3 className="text-white text-lg md:text-xl font-bold mb-1">{cat.name}</h3>
                <p className="text-white/70 text-sm hidden md:block mb-3">{cat.description}</p>

                {/* CTA - appears on hover */}
                <div className="overflow-hidden max-h-0 group-hover:max-h-12 transition-all duration-500">
                  <button className="w-full py-3 rounded-full bg-white text-[#1E1E1E] font-semibold text-sm hover:bg-gray-100 transition-colors min-h-[48px]">
                    Explore
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
