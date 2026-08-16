-- Eliminar la columna "price": el modelo de negocio usa pricingModel + enlaces
-- de descarga externos; el precio concreto queda fuera de la plataforma.
ALTER TABLE "Game" DROP COLUMN "price";
