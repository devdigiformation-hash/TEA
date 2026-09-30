import { FilmDefinition } from "../../components/journey/types";
import { TEA_FILM } from "./tea";
import { CAMERA_FILM } from "./camera";
import { KATANA_FILM } from "./katana";

export const FILMS: Record<string, FilmDefinition> = {
  tea: TEA_FILM,
  camera: CAMERA_FILM,
  katana: KATANA_FILM,
};

export const FILM_LIST: FilmDefinition[] = [
  TEA_FILM,
  CAMERA_FILM,
  KATANA_FILM,
];

export { TEA_FILM, CAMERA_FILM, KATANA_FILM };
