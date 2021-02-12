import Utils from "./_utils.js";

const hauteur_controlleur = 0.1;

export default {
  mixins: [Utils],
  data: function () {
    return { volume: this.valeur }
  },
  methods: {
    drag: function (e) {
      this.volume = 1 - this.get_mouse_position(e).y;
      this.update();
    },
    update: function () {
      this.$emit('update:valeur', this.volume);
    }
  },
  computed: {
    y: function () {
      return 1 - this.volume - (hauteur_controlleur / 2);
      //return Math.min(Math.max(1 - this.volume, 0.05), 0.85)
    }
  },
  template: `
    <generique :module="$t('modules.volume')" :disposition="disposition" :modifiable="modifiable && !is_dragging" @redispose="this.update_disposition">
      <svg viewBox="0 0 1 1" preserveAspectRatio="none" ref="canvas">
        <rect class="bg" x="0" width="1" y="0" height="1"/>
        <rect class="centre" x="0.49" width="0.02" y="0" height="1"/>
        <rect class="controlleur" x="0.4" width="0.2" :y="y" height="${hauteur_controlleur}" rx="0.02" ref="controlleur"/>
      </svg>
    </generique>
  `
};
