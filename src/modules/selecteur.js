import Utils from "./_utils.js";

const coordonnees_triangle = { hauteur: 100, largeur: 100 };
const ratio_controlleur = 10;

export default {
  mixins: [Utils],
  data: function () {
    return { x: 0, y: 0 }
  },
  methods: {
    update: function () {
      this.$emit('update:valeur', { x: this.x, y: this.y });
    },
    drag: function (e) {
      let coords = this.get_mouse_position(e);
      this.$refs.controlleur.style.transform = `translate(${coords.x - 5}%, ${coords.y - 5}%)`; // TODO enlever les magic numbers
    }
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
