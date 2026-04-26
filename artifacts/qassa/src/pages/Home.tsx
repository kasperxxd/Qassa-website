import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import heroImg from "@/assets/images/hero.png";
import serviceImg from "@/assets/images/service-1.png";

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-12">
      {/* Hero Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center min-h-[60vh]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col gap-6"
        >
          <div className="inline-flex w-fit items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
            خدمة الحلاقة المنزلية الأولى
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-[1.2]">
            احصل على <span className="text-primary">قصة شعر احترافية</span> في راحة منزلك
          </h1>
          <p className="text-lg text-muted-foreground max-w-[90%] leading-relaxed">
            لا داعي للانتظار في الصالونات بعد اليوم. مع "قصة"، نوفر لك أمهر الحلاقين ليأتوا إلى منزلك في الوقت الذي يناسبك. تجربة مريحة، هادئة، وراقية.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <Link href="/book">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full hover:scale-105 transition-transform shadow-lg shadow-primary/20">
                احجز الآن
              </Button>
            </Link>
            <Link href="/gallery">
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full hover:bg-secondary">
                استعرض القصات
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-primary/10 mix-blend-multiply z-10" />
          <img 
            src={heroImg} 
            alt="أدوات حلاقة احترافية" 
            className="w-full h-full object-cover object-center"
          />
        </motion.div>
      </section>

      {/* Feature Section */}
      <section className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative aspect-square w-full max-w-md mx-auto rounded-full overflow-hidden shadow-xl"
          >
            <img 
              src={serviceImg} 
              alt="حلاق يقدم الخدمة في المنزل" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-6"
          >
            <h2 className="text-3xl font-bold text-foreground">كيف تعمل "قصة"؟</h2>
            <ul className="flex flex-col gap-4">
              {[
                { title: "احجز موعداً", desc: "اختر الوقت المناسب لك وأدخل تفاصيل عنوانك بخطوات بسيطة." },
                { title: "تتبع دورك", desc: "تعرف على موقعك في طابور الانتظار والوقت المتبقي بشفافية تامة." },
                { title: "استرخي واستمتع", desc: "سيصلك الحلاق إلى باب منزلك مجهزاً بكافة الأدوات المعقمة والاحترافية." }
              ].map((step, idx) => (
                <li key={idx} className="flex gap-4 p-4 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-border shadow-sm">
                  <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>
    </div>
  );
}