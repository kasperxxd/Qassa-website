import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { CalendarIcon, Check } from "lucide-react";

import { useCreateBooking } from "@workspace/api-client-react";
import type { ServiceId } from "@workspace/api-client-react/src/generated/api.schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { SERVICE_CATALOG, calculateTotal, formatIQD } from "@/lib/services";

const SERVICE_IDS = SERVICE_CATALOG.map((s) => s.id) as [ServiceId, ...ServiceId[]];

const bookingSchema = z.object({
  fullName: z.string().min(2, "الاسم الكامل مطلوب"),
  phone: z.string().min(4, "رقم الهاتف غير صالح"),
  blockNumber: z.string().min(1, "رقم البلوك مطلوب"),
  buildingNumber: z.string().min(1, "رقم البناية مطلوب"),
  apartmentNumber: z.string().min(1, "رقم الشقة مطلوب"),
  scheduledAt: z.date({
    required_error: "يرجى تحديد الموعد",
  }),
  services: z
    .array(z.enum(SERVICE_IDS))
    .min(1, "يرجى اختيار خدمة واحدة على الأقل"),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function Book() {
  const [, setLocation] = useLocation();
  const createBooking = useCreateBooking();
  
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      blockNumber: "",
      buildingNumber: "",
      apartmentNumber: "",
      services: [],
      notes: "",
    },
  });

  const selectedServices = form.watch("services") ?? [];
  const total = calculateTotal(selectedServices);

  const onSubmit = (data: BookingFormValues) => {
    createBooking.mutate(
      {
        data: {
          fullName: data.fullName,
          phone: data.phone,
          blockNumber: data.blockNumber,
          buildingNumber: data.buildingNumber,
          apartmentNumber: data.apartmentNumber,
          scheduledAt: data.scheduledAt.toISOString(),
          services: data.services,
          notes: data.notes || undefined,
        },
      },
      {
        onSuccess: (booking) => {
          toast.success("تم تأكيد الحجز بنجاح!");
          setLocation(`/queue/${booking.id}`);
        },
        onError: () => {
          toast.error("حدث خطأ أثناء تأكيد الحجز. يرجى المحاولة مرة أخرى.");
        },
      }
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto w-full"
    >
      <Card className="border-0 shadow-xl shadow-primary/5 rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardHeader className="bg-primary/5 border-b pb-6">
          <CardTitle className="text-2xl font-bold text-primary">حجز موعد جديد</CardTitle>
          <CardDescription className="text-base">
            الرجاء إدخال تفاصيل العنوان والوقت المناسب لحضور الحلاق.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">الاسم الكامل</FormLabel>
                      <FormControl>
                        <Input placeholder="أحمد محمد" className="h-12 bg-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">رقم الهاتف</FormLabel>
                      <FormControl>
                        <Input placeholder="0500000000" type="tel" dir="ltr" className="h-12 text-right bg-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="blockNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">قطعة / بلوك</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: 4" className="h-12 bg-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="buildingNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">مبنى / منزل</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: 12" className="h-12 bg-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="apartmentNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">شقة / دور</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: 2" className="h-12 bg-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="scheduledAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-base font-semibold">تاريخ الموعد</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full h-12 justify-start text-right font-normal bg-white border-input",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                            {field.value ? (
                              format(field.value, "PPP", { locale: arSA })
                            ) : (
                              <span>اختر تاريخاً</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className="rtl:dir-rtl pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="services"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      اختر الخدمات
                    </FormLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {SERVICE_CATALOG.map((svc) => {
                        const checked = (field.value ?? []).includes(svc.id);
                        return (
                          <button
                            type="button"
                            key={svc.id}
                            onClick={() => {
                              const current = field.value ?? [];
                              field.onChange(
                                checked
                                  ? current.filter((id) => id !== svc.id)
                                  : [...current, svc.id],
                              );
                            }}
                            data-testid={`service-${svc.id}`}
                            className={cn(
                              "group text-right p-4 rounded-xl border-2 bg-white transition-all",
                              "hover:border-primary/60 hover:shadow-md",
                              checked
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-input",
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm leading-tight">
                                  {svc.label}
                                </p>
                                {svc.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {svc.description}
                                  </p>
                                )}
                                <p className="text-primary font-bold mt-2">
                                  {formatIQD(svc.price)}
                                </p>
                              </div>
                              <div
                                className={cn(
                                  "shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                  checked
                                    ? "bg-primary border-primary text-primary-foreground"
                                    : "border-input bg-white",
                                )}
                              >
                                {checked && <Check className="w-4 h-4" />}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <FormMessage />
                    <div className="mt-3 flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
                      <span className="text-sm font-semibold">
                        المجموع
                      </span>
                      <span
                        className="text-xl font-bold text-primary"
                        data-testid="text-total-price"
                      >
                        {formatIQD(total)}
                      </span>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">ملاحظات إضافية (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="أي تعليمات خاصة للوصول للمنزل..." 
                        className="resize-none min-h-[100px] bg-white" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg rounded-xl hover:scale-[1.02] transition-transform" 
                  disabled={createBooking.isPending}
                >
                  {createBooking.isPending ? "جاري التأكيد..." : "تأكيد الحجز"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}