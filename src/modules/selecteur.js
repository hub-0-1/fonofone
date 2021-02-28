import Utils from "./_utils.js";

const coordonnees_triangle = { hauteur: 1, largeur: 1 };
const ratio_controlleur = 10;

export default {
  mixins: [Utils],
  data: function () {
    return { 
      x: 0,
      y: 0,
      cote_gauche: {
        pente: (0 - coordonnees_triangle.hauteur) / ((coordonnees_triangle.largeur / 2) - 0),
        y0: null 
      },
      cote_droit: {
        pente: (coordonnees_triangle.hauteur - 0) / (coordonnees_triangle.largeur - (coordonnees_triangle.largeur / 2)),
        y0: null
      },
      debut: this.valeur.debut,
      longueur: this.valeur.longueur
    }
  },
  methods: {
    update: function () {
      this.$emit('update:valeur', { debut: this.debut, longueur: this.longueur });
    },
    drag: function (e) {
      let coords = this.get_mouse_position(e);

      this.y = this.borner_0_1(coords.y);
      this.x = this.borner_0_1(coords.x);
      if(coords.x < 0.5) {
        this.x = Math.max(this.x, this.x_cote_gauche(this.y));
      }
      else if(coords.x > 0.5) {
        this.x = Math.min(this.x, this.x_cote_droit(this.y));
      }

      this.update_position_controlleur();
      this.svg_a_mixer();
      this.update();
    },
    x_cote_gauche: function (y) {
      return (y - this.cote_gauche.y0) / this.cote_gauche.pente;
    },
    x_cote_droit: function (y) {
      return (y - this.cote_droit.y0) / this.cote_droit.pente;
    },
    update_position_controlleur: function () {
      this.$refs.controlleur.style.transform = `translate(${(this.x - coordonnees_triangle.largeur / 2 / ratio_controlleur) * 100}%, ${(Math.min(this.y, 1 - (coordonnees_triangle.hauteur / ratio_controlleur))) * 100}%)`;
    },
    svg_a_mixer: function () {
      let x_gauche = this.x_cote_gauche(this.y);
      let x_droit  = this.x_cote_droit(this.y);

      this.longueur = 1 - this.y;
      this.debut = ((1 - this.longueur) * ((this.x - x_gauche) / (x_droit - x_gauche)) || 0);
    },
    mixer_a_svg: function () {
      this.y = 1 - this.longueur;

      let x_gauche = this.x_cote_gauche(this.y);
      let x_droit  = this.x_cote_droit(this.y);
      this.x = ((this.debut / (1 - this.longueur)) * (x_droit - x_gauche)) + x_gauche;
    }
  },
  mounted: function () {
    this.cote_gauche.y0 = 0 - (this.cote_gauche.pente * (coordonnees_triangle.largeur / 2)); // Pointe en haut
    this.cote_droit.y0 = 0 - (this.cote_droit.pente * (coordonnees_triangle.largeur / 2)); // Pointe en haut
    this.mixer_a_svg();
    this.update_position_controlleur();
  },
  template: `
    <generique :module="$t('modules.selecteur')" :disposition="disposition" :modifiable="modifiable && !is_dragging" @redispose="this.update_disposition">
      <svg viewBox="0 0 1 1" preserveAspectRatio="none" ref="canvas">
        <polygon class="triangle" points="0,${coordonnees_triangle.hauteur} ${coordonnees_triangle.largeur / 2},0 ${coordonnees_triangle.largeur},${coordonnees_triangle.hauteur}"/>
        <polygon class="controlleur" points="0,${coordonnees_triangle.hauteur / ratio_controlleur} ${coordonnees_triangle.largeur / ratio_controlleur / 2},0 ${coordonnees_triangle.largeur / ratio_controlleur},${coordonnees_triangle.hauteur / ratio_controlleur}" ref="controlleur"/>
      </svg>
    </generique>
  `
};
