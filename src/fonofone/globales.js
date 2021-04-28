/*
 * Attention
 * Les valeurs borde_width et hauteur_module
 * doivent aussi etre definies dans src/modules/styles.less
 */

import ImpulsePetit from "./donnees/impulse/masonic_lodge_1.wav";
import ImpulseGrand from "./donnees/impulse/parking_garage_2.wav";

export default {
  configuration_primitive: "https://hub-0-1.github.io/fonofone/src/fonofone/configurations/dauphin.fnfn",
  min_width_grille: 600,
  max_width_colonne: 300,
  mimetype_export: "audio/wav",
  modules: {
    selecteur: {
      largeur_module: 1,
      hauteur_module: 1,
      largeur_controlleur: 0.1,
      hauteur_controlleur: 0.1,
      ratio_controlleur: 0.1,
      border_width: 0.02,
      duration_min: 0.01
    },
    volume: {
      largeur_module: 1,
      hauteur_module: 0.6,
      hauteur_controlleur: 0.15,
      largeur_controlleur: 0.1,
      x_relatif_img_gauche: 0.1,
      x_relatif_img_droite: 0.9,
      border_width: 0.02,
      nb_divisions: 7,
      width_division: 0.001,
      cote_image: 0.1
    },
    metronome: {
      largeur_module: 1,
      hauteur_module: 1,
      taille_arc: 270,
      centre_cercle: { x: 0.5, y: 0.3 },
      largeur_controlleur: 0.05,
      hauteur_controlleur: 0.1,
      hauteur_syncope: 0.15,
      taille_centre_controlleur: 0.03,
      taille_cercle_controlleur: 0.03,
      y_relatif_centre_syncope: 0.625,
      y_relatif_centre_aleatoire: 0.94,
      y_relatif_image_aleatoire: 0.75,
      border_width: 0.01,
      nb_divisions: 1,
      min_bpm: 5,
      max_bpm: 1000
    },
    reverberation: {
      largeur_module: 1,
      hauteur_module: 0.55,
      largeur_controlleur: 0.05,
      hauteur_controlleur: 0.1,
      hauteur_centre_controlleur: 0.03,
      largeur_image: 0.4,
      hauteur_image: 0.2,
      y_relatif_centre_controlleur: 0.35,
      y_relatif_centre_images: 0.80,
      dimension_relative_img: 0.175,
      border_width: 0.02,
      sons: [ImpulsePetit, ImpulseGrand]
    },
    vitesse: {
      largeur_module: 1,
      hauteur_module: 0.25,
      largeur_controlleur: 0.05,
      hauteur_controlleur: 0.25,
      nb_divisions: 49,
      width_division: 0.005,
      border_width: 0.01,
      modes: [
        { nb_divisions: 13 },
        { nb_divisions: 25 },
        { nb_divisions: 49 }
      ]
    },
    filtre: {
      largeur_module: 1,
      hauteur_module: 0.6,
      hauteur_controlleur: 0.1,
      largeur_controlleur_minimale: 0.05,
      border_width: 0.02,
      hauteur_centre: 0.1
    }
  }
};
