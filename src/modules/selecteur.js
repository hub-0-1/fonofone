import Utils from "./_utils.js";

const coordonnees_triangle = { hauteur: 100, largeur: 100 };
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
      this.x = coords.x;
      this.y = coords.y;

      if(coords.x < 50) {
        this.x = Math.max(coords.x, this.x_cote_gauche(coords.y));
      }
      else if(coords.x > 50) {
        this.x = Math.min(coords.x, this.x_cote_droit(coords.y));
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
      this.$refs.controlleur.style.transform = `translate(${this.x - coordonnees_triangle.largeur / 2 / ratio_controlleur}%, ${this.y - coordonnees_triangle.hauteur / 2 / ratio_controlleur}%)`;
    },
    svg_a_mixer: function () {
      this.longueur = 100 - this.y;
      this.debut = this.x - this.longueur / 2;
    },
    mixer_a_svg: function () {
      this.y = 100 - this.longueur;
      this.x = this.debut + this.longueur / 2;
    }
  },
  mounted: function () {
    this.cote_gauche.y0 = 0 - (this.cote_gauche.pente * (coordonnees_triangle.largeur / 2)); // Pointe en haut
    this.cote_droit.y0 = 0 - (this.cote_droit.pente * (coordonnees_triangle.largeur / 2)); // Pointe en haut
    this.mixer_a_svg();
    this.update_position_controlleur();
    this.update();
  },
  template: `
    <generique class="generique" :module="$t('modules.selecteur')" :disposition="disposition" :modifiable="modifiable && !is_dragging" @redispose="this.update_disposition">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" ref="canvas">
        <polygon class="triangle" points="0,${coordonnees_triangle.hauteur} ${coordonnees_triangle.largeur / 2},0 ${coordonnees_triangle.largeur},${coordonnees_triangle.hauteur}"/>
        <polygon class="controlleur" points="0,${coordonnees_triangle.hauteur / ratio_controlleur} ${coordonnees_triangle.largeur / ratio_controlleur / 2},0 ${coordonnees_triangle.largeur / ratio_controlleur},${coordonnees_triangle.hauteur / ratio_controlleur}" ref="controlleur"/>
      </svg>
    </generique>
  `
};
