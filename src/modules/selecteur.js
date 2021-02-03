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
      }
    }
  },
  methods: {
    update: function () {
      this.$emit('update:valeur', { x: this.x, y: this.y });
    },
    drag: function (e) {
      let coords = this.get_mouse_position(e);
      if(coords.x < 50) {
        coords.x = Math.max(coords.x, this.x_cote_gauche(coords.y));
      }
      else if(coords.x > 50) {
        coords.x = Math.min(coords.x, this.x_cote_droit(coords.y));
      }
      this.$refs.controlleur.style.transform = `translate(${coords.x - coordonnees_triangle.largeur / 2 / ratio_controlleur}%, ${coords.y - coordonnees_triangle.hauteur / 2 / ratio_controlleur}%)`;
    },
    x_cote_gauche: function (y) {
      return (y - this.cote_gauche.y0) / this.cote_gauche.pente;
    },
    x_cote_droit: function (y) {
      return (y - this.cote_droit.y0) / this.cote_droit.pente;
    }
  },
  mounted: function () {
    this.cote_gauche.y0 = 0 - (this.cote_gauche.pente * (coordonnees_triangle.largeur / 2)); // Pointe en haut
    this.cote_droit.y0 = 0 - (this.cote_droit.pente * (coordonnees_triangle.largeur / 2)); // Pointe en haut
  },
  template: `
    <generique class="generique" :module="$t('modules.selecteur')" :disposition="disposition" :modifiable="modifiable" @redispose="this.update_disposition">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" ref="canvas">
        <polygon class="triangle" points="0,${coordonnees_triangle.hauteur} ${coordonnees_triangle.largeur / 2},0 ${coordonnees_triangle.largeur},${coordonnees_triangle.hauteur}"/>
        <polygon class="controlleur" points="0,${coordonnees_triangle.hauteur / ratio_controlleur} ${coordonnees_triangle.largeur / ratio_controlleur / 2},0 ${coordonnees_triangle.largeur / ratio_controlleur},${coordonnees_triangle.hauteur / ratio_controlleur}" ref="controlleur"/>
      </svg>
    </generique>
  `
};
