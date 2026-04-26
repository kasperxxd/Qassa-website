import { useState } from "react";
import { 
  useGetAdminStats, 
  useListBookings, 
  useUpdateBookingStatus,
  useListGalleryItems,
  useCreateGalleryItem,
  useDeleteGalleryItem,
  getGetAdminStatsQueryKey,
  getListBookingsQueryKey,
  getListGalleryItemsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { Users, Clock, CheckCircle2, XCircle, Trash2, Plus, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { BookingStatus, GallerySection } from "@workspace/api-client-react/src/generated/api.schemas";
import { AdminAuth, AdminLogoutButton } from "@/components/AdminAuth";
import { openWhatsApp } from "@/lib/whatsapp";
import { getService, formatIQD } from "@/lib/services";

export default function Admin() {
  return (
    <AdminAuth>
      {(logout) => <AdminPanel onLogout={logout} />}
    </AdminAuth>
  );
}

function AdminPanel({ onLogout }: { onLogout: () => Promise<void> }) {
  const queryClient = useQueryClient();
  const { data: stats } = useGetAdminStats();
  const { data: bookings } = useListBookings();
  const { data: galleryItems } = useListGalleryItems();
  
  const updateStatus = useUpdateBookingStatus();
  const createGalleryItem = useCreateGalleryItem();
  const deleteGalleryItem = useDeleteGalleryItem();

  const handleStatusChange = (
    id: number,
    status: BookingStatus,
    customer?: { fullName: string; phone: string },
  ) => {
    updateStatus.mutate({ id, data: { status } }, {
      onSuccess: () => {
        toast.success("تم تحديث الحالة بنجاح");
        queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        if (status === "in_progress" && customer) {
          openWhatsApp(customer.phone, customer.fullName, "in_progress");
          toast.info("فُتحت محادثة واتساب لإبلاغ العميل بحلول دوره");
        }
      }
    });
  };

  const [newGallery, setNewGallery] = useState({
    section: "styles" as GallerySection,
    imageUrl: "",
    title: "",
    styleType: ""
  });

  const handleAddGallery = () => {
    if (!newGallery.imageUrl) {
      toast.error("رابط الصورة مطلوب");
      return;
    }
    createGalleryItem.mutate({ data: {
      ...newGallery,
      title: newGallery.title || undefined,
      styleType: newGallery.styleType || undefined
    }}, {
      onSuccess: () => {
        toast.success("تمت الإضافة بنجاح");
        setNewGallery({ section: "styles", imageUrl: "", title: "", styleType: "" });
        queryClient.invalidateQueries({ queryKey: getListGalleryItemsQueryKey() });
      }
    });
  };

  const handleDeleteGallery = (id: number) => {
    deleteGalleryItem.mutate({ id }, {
      onSuccess: () => {
        toast.success("تم الحذف بنجاح");
        queryClient.invalidateQueries({ queryKey: getListGalleryItemsQueryKey() });
      }
    });
  };

  const statusMap: Record<string, { label: string, color: string }> = {
    pending: { label: "قيد الانتظار", color: "bg-orange-100 text-orange-800" },
    in_progress: { label: "جاري التنفيذ", color: "bg-blue-100 text-blue-800" },
    completed: { label: "مكتمل", color: "bg-green-100 text-green-800" },
    cancelled: { label: "ملغى", color: "bg-red-100 text-red-800" },
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">لوحة الإدارة</h1>
        <AdminLogoutButton onLogout={onLogout} />
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" /> إجمالي الحجوزات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground mt-1">حجوزات اليوم: {stats.todayBookings}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" /> قيد الانتظار
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.pendingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> مكتملة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.completedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" /> ملغاة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.cancelledCount}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="bookings">الحجوزات</TabsTrigger>
          <TabsTrigger value="gallery">إدارة المعرض</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>سجل الحجوزات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الرقم</TableHead>
                      <TableHead className="text-right">العميل</TableHead>
                      <TableHead className="text-right">الهاتف</TableHead>
                      <TableHead className="text-right">الموعد</TableHead>
                      <TableHead className="text-right">الخدمات</TableHead>
                      <TableHead className="text-right">المجموع</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">إجراء</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings?.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">#{b.id}</TableCell>
                        <TableCell>{b.fullName}</TableCell>
                        <TableCell dir="ltr" className="text-right">{b.phone}</TableCell>
                        <TableCell>{format(new Date(b.scheduledAt), "PPP", { locale: arSA })}</TableCell>
                        <TableCell className="max-w-[220px]">
                          <div className="flex flex-wrap gap-1">
                            {b.services?.length ? (
                              b.services.map((sid) => {
                                const svc = getService(sid);
                                return (
                                  <Badge
                                    key={sid}
                                    variant="secondary"
                                    className="text-xs font-normal"
                                  >
                                    {svc?.label ?? sid}
                                  </Badge>
                                );
                              })
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-primary whitespace-nowrap">
                          {formatIQD(b.totalPrice ?? 0)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`border-0 ${statusMap[b.status].color}`}>
                            {statusMap[b.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select
                              value={b.status}
                              onValueChange={(val) =>
                                handleStatusChange(b.id, val as BookingStatus, {
                                  fullName: b.fullName,
                                  phone: b.phone,
                                })
                              }
                            >
                              <SelectTrigger className="w-[130px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">قيد الانتظار</SelectItem>
                                <SelectItem value="in_progress">جاري التنفيذ</SelectItem>
                                <SelectItem value="completed">مكتمل</SelectItem>
                                <SelectItem value="cancelled">ملغى</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2 text-green-700 hover:bg-green-50 hover:text-green-800"
                              onClick={() =>
                                openWhatsApp(b.phone, b.fullName, b.status)
                              }
                              title="إرسال رسالة واتساب للعميل"
                              data-testid={`button-whatsapp-${b.id}`}
                            >
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!bookings?.length && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                          لا توجد حجوزات
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إضافة عنصر جديد للمعرض</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium">القسم</label>
                  <Select value={newGallery.section} onValueChange={(v) => setNewGallery(s => ({...s, section: v as GallerySection}))}>
                    <SelectTrigger className="bg-white"><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="styles">قصات مميزة (Carousel)</SelectItem>
                      <SelectItem value="customers">زبائننا (Grid)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">رابط الصورة</label>
                  <Input 
                    placeholder="https://..." 
                    className="bg-white"
                    value={newGallery.imageUrl} 
                    onChange={e => setNewGallery(s => ({...s, imageUrl: e.target.value}))} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">العنوان (اختياري)</label>
                  <Input 
                    placeholder="عنوان القصة أو اسم العميل" 
                    className="bg-white"
                    value={newGallery.title} 
                    onChange={e => setNewGallery(s => ({...s, title: e.target.value}))} 
                  />
                </div>
                <Button onClick={handleAddGallery} className="w-full gap-2">
                  <Plus className="w-4 h-4"/> إضافة
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>العناصر الحالية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {galleryItems?.map(item => (
                  <div key={item.id} className="relative group rounded-lg overflow-hidden border">
                    <img src={item.imageUrl} alt="" className="w-full aspect-square object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteGallery(item.id)}>
                        <Trash2 className="w-4 h-4"/>
                      </Button>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-[10px]">{item.section === 'styles' ? 'قصات' : 'زبائن'}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}