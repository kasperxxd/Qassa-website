import { useParams } from "wouter";
import { useGetBooking, useGetQueuePosition, getGetQueuePositionQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { CheckCircle2, Clock, UserIcon, MapPin, Loader2, XCircle } from "lucide-react";

export default function Queue() {
  const params = useParams();
  const id = params.id ? parseInt(params.id, 10) : 0;

  const { data: booking, isLoading: isLoadingBooking } = useGetBooking(id, {
    query: { enabled: !!id }
  });

  const { data: queuePos } = useGetQueuePosition(id, {
    query: {
      enabled: !!id,
      refetchInterval: 5000,
      queryKey: getGetQueuePositionQueryKey(id)
    }
  });

  if (isLoadingBooking) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center text-muted-foreground py-12">
        الحجز غير موجود.
      </div>
    );
  }

  const isPending = booking.status === "pending";
  const isInProgress = booking.status === "in_progress";
  const isCompleted = booking.status === "completed";
  const isCancelled = booking.status === "cancelled";

  return (
    <div className="max-w-3xl mx-auto w-full space-y-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4 py-8"
      >
        <div className="inline-flex justify-center items-center w-20 h-20 rounded-full mb-4 bg-white shadow-lg">
          {isPending && <Clock className="w-10 h-10 text-orange-500" />}
          {isInProgress && <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />}
          {isCompleted && <CheckCircle2 className="w-10 h-10 text-green-500" />}
          {isCancelled && <XCircle className="w-10 h-10 text-red-500" />}
        </div>
        <h1 className="text-3xl font-bold">
          {isPending && "حجزك قيد الانتظار"}
          {isInProgress && "الحلاق في الطريق إليك"}
          {isCompleted && "تم الانتهاء بنجاح"}
          {isCancelled && "تم إلغاء الحجز"}
        </h1>
        {isPending && queuePos && (
          <p className="text-xl text-muted-foreground">
            أنت رقم <span className="font-bold text-primary text-2xl mx-1">{queuePos.position}</span> في الطابور
          </p>
        )}
      </motion.div>

      {/* Timeline Visualization */}
      <div className="relative pt-4 pb-12">
        <div className="absolute top-8 left-8 right-8 h-1 bg-muted rounded-full" />
        <div className="relative flex justify-between">
          {[
            { id: 'pending', label: 'قيد الانتظار', active: true },
            { id: 'in_progress', label: 'جاري التنفيذ', active: isInProgress || isCompleted },
            { id: 'completed', label: 'تم الانتهاء', active: isCompleted },
          ].map((step, i) => (
            <div key={step.id} className="flex flex-col items-center gap-3">
              <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center z-10 transition-colors duration-500 ${
                step.active ? 'bg-primary border-primary' : 'bg-card border-muted'
              }`}>
                {step.active && <CheckCircle2 className="w-4 h-4 text-white" />}
              </div>
              <span className={`text-sm font-semibold ${step.active ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>تفاصيل الحجز (رقم {booking.id})</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الاسم</p>
                <p className="font-semibold">{booking.fullName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تاريخ الموعد</p>
                <p className="font-semibold">{format(new Date(booking.scheduledAt), "PPP", { locale: arSA })}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 md:col-span-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">العنوان</p>
                <p className="font-semibold">
                  بلوك {booking.blockNumber} - مبنى {booking.buildingNumber} - شقة {booking.apartmentNumber}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}