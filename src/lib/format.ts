import type { PricingModel } from "@/types/game";

export function pricingModelLabel(model: PricingModel): string {
  switch (model) {
    case "free":
      return "Gratis";
    case "free-to-play":
      return "Free to play";
    case "demo":
      return "Demo";
    case "paid":
      return "De pago";
    default:
      return model;
  }
}

export function formatDate(date: string, style: "long" | "short" = "short"): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: style === "long" ? "long" : "short",
    year: "numeric",
  }).format(parsed);
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("es-ES", { notation: "compact", maximumFractionDigits: 1 }).format(
    value,
  );
}
