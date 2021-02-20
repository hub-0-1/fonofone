import Utils from "./_utils.js";

const hauteur_controlleur = 0.1;

// TODO Refact des x, y, debut, longueur
export default {
  mixins: [Utils],
  data: function () {
    return { 
      x: 0,
      y: 0,
      debut: this.valeur.debut,
      longueur: this.valeur.longueur
    }
  },
  methods: {
    update: function () {
      this.$emit('update:valeur', { debut: this.debut, longueur: this.longueur }); // TODO Ca fait rien
    },
    drag: function (e) {
      let coords = this.get_mouse_position(e);

      this.y = this.borner_0_1(coords.y) - (hauteur_controlleur / 2);
      let x = this.borner_0_1(coords.x) - (this.width / 2)
      this.x = Math.min(Math.max(x, 0), 1 - this.width);

      this.debut = this.x;
      this.longueur = this.y;

      this.update();
    },
  },
  computed: {
    width: function () { return Math.max(this.y, 0.05); }
  },
  mounted: function () {
    this.y = this.longueur;
    this.x = this.debut - (this.width / 2);
  },
  template: `
    <generique :module="$t('modules.filtre')" :disposition="disposition" :modifiable="modifiable && !is_dragging" @redispose="this.update_disposition">
      <svg viewBox="0 0 1 1" preserveAspectRatio="none" ref="canvas">
        <rect class="bg" x="0" width="1" y="0" height="1"/>
        <rect class="centre" x="0.49" width="0.02" y="0.95" height="0.1"/>
        <rect class="controlleur" :x="x" :y="y" :width="width" height="${hauteur_controlleur}" ref="controlleur"/>
      </svg>
    </generique>
  `
};
