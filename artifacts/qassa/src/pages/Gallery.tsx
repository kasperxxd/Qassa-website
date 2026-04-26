import { useState, useEffect } from "react";
import { useListGalleryItems } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import customerImg from "@/assets/images/customer-1.png";

export default function Gallery() {
  const { data: styles, isLoading: isLoadingStyles } = useListGalleryItems({ section: "styles" });
  const { data: customers, isLoading: isLoadingCustomers } = useListGalleryItems({ section: "customers" });
  
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!styles || styles.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % styles.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [styles]);

  return (
    <div className="flex flex-col gap-16 pb-12">
      {/* Top Section: Styles Carousel */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-foreground">قصات مميزة</h2>
          <p className="text-muted-foreground">أحدث الصيحات والقصات الاحترافية</p>
        </div>

        {isLoadingStyles ? (
          <Skeleton className="w-full max-w-4xl mx-auto aspect-[16/7] rounded-3xl" />
        ) : styles && styles.length > 0 ? (
          <div className="relative w-full max-w-4xl mx-auto aspect-[16/7] rounded-3xl overflow-hidden shadow-2xl bg-card">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
              >
                <img 
                  src={styles[activeIndex].imageUrl} 
                  alt={styles[activeIndex].title || "Style"} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h3 className="text-2xl font-bold">{styles[activeIndex].title}</h3>
                  {styles[activeIndex].styleType && (
                    <p className="text-white/80 mt-1">{styles[activeIndex].styleType}</p>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
              {styles.map((_, i) => (
                <button
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === activeIndex ? "bg-white w-6" : "bg-white/50"
                  }`}
                  onClick={() => setActiveIndex(i)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl mx-auto aspect-[16/7] rounded-3xl bg-primary/5 flex items-center justify-center text-muted-foreground border border-dashed">
            لا توجد قصات مضافة بعد
          </div>
        )}
      </section>

      {/* Bottom Section: Customers Grid */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-foreground">آخر زبائننا</h2>
          <p className="text-muted-foreground">نتائج حقيقية من عملائنا الراضين</p>
        </div>

        {isLoadingCustomers ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)}
          </div>
        ) : customers && customers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {customers.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="overflow-hidden border-0 shadow-lg group">
                  <div className="aspect-[3/4] overflow-hidden relative">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title || "Customer"} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 text-white">
                      {item.title && <p className="font-bold">{item.title}</p>}
                      {item.styleType && <p className="text-sm text-white/80">{item.styleType}</p>}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {/* Fallback mock data if DB is empty */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="overflow-hidden border-0 shadow-lg group">
                <div className="aspect-[3/4] overflow-hidden relative">
                  <img 
                    src={customerImg} 
                    alt="Customer" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <p className="font-bold">أحمد</p>
                    <p className="text-sm text-white/80">قصة عصرية</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </section>
    </div>
  );
}