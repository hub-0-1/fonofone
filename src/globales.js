/*
 * Attention
 * Les valeurs borde_width et hauteur_module
 * doivent aussi etre definies dans src/modules/styles.less
 */

import Impulse1 from "./donnees/impulse/masonic_lodge_1.wav";
import Impulse2 from "./donnees/impulse/parking_garage_2.wav";
import Impulse3 from "./donnees/impulse/scala_milan_opera_hall_3.wav";
import Impulse4 from "./donnees/impulse/in_the_silo_revised_4.wav";

export default {
  configuration_primitive: "https://hub-0-1.github.io/fonofone/src/configurations/dauphin.fnfn",
  min_width_grille: 600,
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
      hauteur_controlleur: 0.1,
      largeur_controlleur: 0.1,
      x_relatif_img_gauche: 0.1,
      x_relatif_img_droite: 0.9,
      border_width: 0.02,
      nb_divisions: 7,
      width_division: 0.005,
      cote_image: 0.1
    },
    metronome: {
      largeur_module: 1,
      hauteur_module: 1,
      taille_arc: 270,
      centre_cercle: { x: 0.5, y: 0.4 },
      largeur_controlleur: 0.1,
      hauteur_controlleur: 0.1,
      taille_centre_controlleur: 0.01,
      taille_cercle_controlleur: 0.04,
      y_relatif_centre_syncope: 0.75,
      y_relatif_centre_aleatoire: 0.9,
      border_width: 0.02,
      nb_divisions: 1,
      min_bpm: 5,
      max_bpm: 1000
    },
    reverberation: {
      largeur_module: 1,
      hauteur_module: 0.55,
      largeur_controlleur: 0.1,
      hauteur_controlleur: 0.1,
      hauteur_centre_controlleur: 0.01,
      y_relatif_centre_controlleur: 0.35,
      y_relatif_centre_images: 0.80,
      dimension_relative_img: 0.175,
      border_width: 0.02,
      sons: [
        { image: "https://mdn.mozillademos.org/files/6457/mdn_logo_only_color.png", son: Impulse1 },
        { image: "https://mdn.mozillademos.org/files/6457/mdn_logo_only_color.png", son: Impulse2 },
        { image: "https://mdn.mozillademos.org/files/6457/mdn_logo_only_color.png", son: Impulse3 },
        { image: "https://mdn.mozillademos.org/files/6457/mdn_logo_only_color.png", son: Impulse4 }
      ]
    },
    vitesse: {
      largeur_module: 1,
      hauteur_module: 0.25,
      largeur_controlleur: 0.1,
      hauteur_controlleur: 0.25,
      nb_divisions: 7,
      width_division: 0.005,
      width_demie: 0.02,
      border_width: 0.02
    },
    filtre: {
      largeur_module: 1,
      hauteur_module: 0.6,
      hauteur_controlleur: 0.1,
      largeur_controlleur_minimale: 0.05,
      border_width: 0.02,
      hauteur_centre: 0.1
    }
  },
  sons: [{
    nom: "Impulse",
    url: "https://hub-0-1.github.io/fonofone/src/donnees/impulse.wav"
  }, {
    nom: "Son 2",
    url: "https://hub-0-1.github.io/fonofone/src/donnees/impulse.wav"
  }]
};
