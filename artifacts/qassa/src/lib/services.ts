import type { ServiceId } from "@workspace/api-client-react/src/generated/api.schemas";

export interface ServiceItem {
  id: ServiceId;
  label: string;
  description?: string;
  price: number;
}

export const SERVICE_CATALOG: ServiceItem[] = [
  {
    id: "hair",
    label: "حلاقة شعر احترافية",
    price: 5000,
  },
  {
    id: "beard",
    label: "حلاقة اللحية والشارب",
    price: 5000,
  },
  {
    id: "skincare",
    label: "مساج وعناية بالبشرة",
    price: 5000,
  },
  {
    id: "package_hair_beard",
    label: "باقة (شعر + لحية)",
    description: "وفّر 0 د.ع مقابل خدمتين كاملتين",
    price: 10000,
  },
  {
    id: "package_full",
    label: "باقة (شعر + لحية + عناية بالبشرة)",
    description: "وفّر 2,000 د.ع مقابل ثلاث خدمات",
    price: 13000,
  },
];

export function getService(id: ServiceId): ServiceItem | undefined {
  return SERVICE_CATALOG.find((s) => s.id === id);
}

export function calculateTotal(ids: readonly ServiceId[]): number {
  return ids.reduce((sum, id) => sum + (getService(id)?.price ?? 0), 0);
}

export function formatIQD(amount: number): string {
  return `${amount.toLocaleString("en-US")} د.ع`;
}
