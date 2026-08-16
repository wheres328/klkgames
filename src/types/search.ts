export type SuggestionCategory = "juego" | "genero" | "plataforma" | "articulo";

export interface SearchSuggestion {
  id: string;
  label: string;
  description?: string;
  href: string;
  image?: string;
  category: SuggestionCategory;
}
