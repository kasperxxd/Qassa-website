import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { useCreateBooking } from "@workspace/api-client-react";
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

const bookingSchema = z.object({
  fullName: z.string().min(2, "الاسم الكامل مطلوب"),
  phone: z.string().min(4, "رقم الهاتف غير صالح"),
  blockNumber: z.string().min(1, "رقم البلوك مطلوب"),
  buildingNumber: z.string().min(1, "رقم البناية مطلوب"),
  apartmentNumber: z.string().min(1, "رقم الشقة مطلوب"),
  scheduledAt: z.date({
    required_error: "يرجى تحديد الموعد",
  }),
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
      notes: "",
    },
  });

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