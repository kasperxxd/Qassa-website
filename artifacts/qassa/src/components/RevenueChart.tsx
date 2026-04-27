import { useGetAdminRevenue } from "@workspace/api-client-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, Wallet } from "lucide-react";
import { formatIQD } from "@/lib/services";

export function RevenueChart() {
  const { data, isLoading } = useGetAdminRevenue();

  const dailyData = (data?.daily ?? []).map((d) => ({
    ...d,
    label: format(new Date(`${d.date}T00:00:00`), "EEE d", { locale: arSA }),
  }));

  return (
    <div className="space-y-4" data-testid="card-revenue">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" /> إيرادات اليوم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-3xl font-bold text-primary"
              data-testid="text-revenue-today"
            >
              {isLoading ? "—" : formatIQD(data?.todayTotal ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> آخر 7 أيام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-3xl font-bold"
              data-testid="text-revenue-week"
            >
              {isLoading ? "—" : formatIQD(data?.weekTotal ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> الإجمالي الكلي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className="text-3xl font-bold"
              data-testid="text-revenue-total"
            >
              {isLoading ? "—" : formatIQD(data?.allTimeTotal ?? 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">الإيرادات اليومية - آخر 7 أيام</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyData}
                margin={{ top: 12, right: 8, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  reversed
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  orientation="right"
                  width={70}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`
                  }
                />
                <Tooltip
                  cursor={{ fill: "rgba(34, 100, 60, 0.05)" }}
                  contentStyle={{
                    direction: "rtl",
                    textAlign: "right",
                    fontSize: 13,
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                  }}
                  formatter={(value: number) => [formatIQD(value), "الإيراد"]}
                  labelFormatter={(label) => label}
                />
                <Bar
                  dataKey="total"
                  fill="hsl(var(--primary))"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
