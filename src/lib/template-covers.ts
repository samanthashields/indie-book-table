import foxCover from "@/assets/fox-lantern-cover.jpg";
import riverCover from "@/assets/river-map-cover.jpg";

export const templateCover = (illustrated?: boolean) => (illustrated ? foxCover : riverCover);
