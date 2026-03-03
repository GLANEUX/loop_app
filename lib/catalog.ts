import { apiRequest } from "@/lib/api";

export type Instrument = {
  id: string;
  name: string;
  slug: string;
};

export type Genre = {
  id: string;
  name: string;
  slug: string;
};

export function getInstruments() {
  return apiRequest<Instrument[]>("/instruments");
}

export function getGenres() {
  return apiRequest<Genre[]>("/genres");
}
