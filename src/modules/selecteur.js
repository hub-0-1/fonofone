import Utils from "./_utils.js";

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
      this.$refs.controlleur.style.transform = `translate(${coords.x}%, ${coords.y}%)`;
    }
  },
  template: `
    <generique class="generique" :module="$t('modules.selecteur')" :disposition="disposition" :modifiable="modifiable" @redispose="this.update_disposition">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" ref="canvas">
        <polygon class="triangle" points="5,95 50,5 95,95"/>
        <polygon class="controlleur" points="0,10 5,0 10,10" ref="controlleur"/>
      </svg>
    </generique>
  `
};
