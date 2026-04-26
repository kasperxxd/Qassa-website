export type ServiceId =
  | "hair"
  | "beard"
  | "skincare"
  | "package_hair_beard"
  | "package_full";

export const SERVICE_PRICES: Record<ServiceId, number> = {
  hair: 5000,
  beard: 5000,
  skincare: 5000,
  package_hair_beard: 10000,
  package_full: 13000,
};

export function calculateTotalPrice(ids: ServiceId[]): number {
  return ids.reduce((sum, id) => sum + (SERVICE_PRICES[id] ?? 0), 0);
}
