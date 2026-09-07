import awardImage from "@/assets/decorations/award.png";
import booksImage from "@/assets/decorations/books.png";
import catImage from "@/assets/decorations/cat.png";
import lampImage from "@/assets/decorations/lamp.png";
import lightsImage from "@/assets/decorations/lights.png";
import plantImage from "@/assets/decorations/plant.png";
import teaImage from "@/assets/decorations/tea.png";
import typewriterImage from "@/assets/decorations/typewriter.png";

export type DecorationKey = "lamp" | "books" | "tea" | "plant" | "typewriter" | "cat" | "award" | "lights";

export type Decoration = {
  key: DecorationKey;
  label: string;
  image: string;
  /** Where the object sits on the desk scene, in percentages of the scene box. */
  slot: { left: number; bottom: number; width: number };
};

export const DECORATIONS: Record<DecorationKey, Decoration> = {
  lamp: { key: "lamp", label: "Brass desk lamp", image: lampImage, slot: { left: 4, bottom: 6, width: 15 } },
  books: { key: "books", label: "Stack of read books", image: booksImage, slot: { left: 78, bottom: 4, width: 17 } },
  tea: { key: "tea", label: "Cup of tea", image: teaImage, slot: { left: 24, bottom: 3, width: 11 } },
  plant: { key: "plant", label: "Potted plant", image: plantImage, slot: { left: 64, bottom: 5, width: 13 } },
  typewriter: { key: "typewriter", label: "Typewriter", image: typewriterImage, slot: { left: 38, bottom: 2, width: 20 } },
  cat: { key: "cat", label: "Sleeping cat", image: catImage, slot: { left: 84, bottom: 30, width: 14 } },
  award: { key: "award", label: "Framed award", image: awardImage, slot: { left: 18, bottom: 34, width: 12 } },
  lights: { key: "lights", label: "Fairy lights", image: lightsImage, slot: { left: 8, bottom: 74, width: 84 } },
};

export const DECORATION_KEYS = Object.keys(DECORATIONS) as DecorationKey[];

export const isDecorationKey = (value: string): value is DecorationKey => value in DECORATIONS;

export const decorationLabel = (value: string) => (isDecorationKey(value) ? DECORATIONS[value].label : value);
