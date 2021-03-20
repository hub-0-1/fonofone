export default {
  configuration_primitive: "https://hub-0-1.github.io/fonofone/src/configurations/dauphin.fnfn",
  min_width_grille: 600,
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
      min_bpm: 20,
      max_bpm: 220
    },
    reverberation: {
      largeur_reverberation: 0.1,
      dimension_img: 0.1,
      sons: [
        { image: "https://mdn.mozillademos.org/files/6457/mdn_logo_only_color.png", son: "https://hub-0-1.github.io/fonofone/src/donnees/impulse.wav" },
        { image: "https://mdn.mozillademos.org/files/6457/mdn_logo_only_color.png", son: "https://hub-0-1.github.io/fonofone/src/donnees/impulse.wav2" },
        { image: "https://mdn.mozillademos.org/files/6457/mdn_logo_only_color.png", son: "https://hub-0-1.github.io/fonofone/src/donnees/impulse.wav3" },
        { image: "https://mdn.mozillademos.org/files/6457/mdn_logo_only_color.png", son: "https://hub-0-1.github.io/fonofone/src/donnees/impulse.wav4" }
      ]
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
