-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "searchVector" tsvector;

-- CreateIndex
CREATE INDEX "Game_searchVector_idx" ON "Game" USING GIN ("searchVector");

-- Trigger: mantener searchVector al día en INSERT y UPDATE de Game
-- (PostgreSQL no permite DEFAULT con referencias de columna; el trigger lo resuelve).
CREATE OR REPLACE FUNCTION vortex_game_search_vector() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" := setweight(to_tsvector('spanish', coalesce(NEW."name", '')), 'A') || setweight(to_tsvector('spanish', coalesce(NEW."description", '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_game_search_vector ON "Game";
CREATE TRIGGER trg_game_search_vector BEFORE INSERT OR UPDATE ON "Game" FOR EACH ROW EXECUTE FUNCTION vortex_game_search_vector();
