export default {
  configuration_primitive: "https://hub-0-1.github.io/fonofone/src/configurations/dauphin.fnfn",
  min_width_grille: 600,
  mimetype_export: "audio/wav",
  modules: {
    volume: {
      hauteur_controlleur: 0.1,
      largeur_controlleur: 0.1,
      nb_division: 8,
      width_division: 0.005,
      cote_image: 0.1
    },
    metronome: {
      taille_arc: 270,
      centre_cercle: { x: 0.5, y: 0.4 },
      largeur_controlleur_aleatoire: 0.1,
      largeur_controlleur_syncope: 0.1,
      min_bpm: 5,
      max_bpm: 1000
    },
    reverberation: {
      largeur_controlleur: 0.1,
      hauteur_controlleur: 0.075,
      dimension_img: 0.15,
      sons: [
        { image: "https://mdn.mozillademos.org/files/6457/mdn_logo_only_color.png", son: "https://hub-0-1.github.io/fonofone/src/donnees/impulse.wav" },
        { image: "https://mdn.mozillademos.org/files/6457/mdn_logo_only_color.png", son: "https://hub-0-1.github.io/fonofone/src/donnees/impulse.wav2" },
        { image: "https://mdn.mozillademos.org/files/6457/mdn_logo_only_color.png", son: "https://hub-0-1.github.io/fonofone/src/donnees/impulse.wav3" },
        { image: "https://mdn.mozillademos.org/files/6457/mdn_logo_only_color.png", son: "https://hub-0-1.github.io/fonofone/src/donnees/impulse.wav4" }
      ]
    },
    vitesse: {
      nb_divisions: 7,
      largeur_controlleur: 0.1,
      largeur_module: 1,
      hauteur_module: 0.5,
      width_demie: 0.02,
      border_width: 0.02
    },
    filtre: {
      largeur_module: 1,
      hauteur_module: 1,
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
