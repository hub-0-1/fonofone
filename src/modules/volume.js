import Utils from "./_utils.js";

export default {
  mixins: [Utils],
  data: function () {
    return { 
      collapsed: false,
      volume: 1
    }
  },
  methods: {
    update: function () {
      this.$emit('update:valeur', this.volume);
    }
  },
  template: `
    <generique class="generique" :module="$t('modules.volume')" :disposition="disposition" :modifiable="modifiable" @redispose="this.update_disposition">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width: 100%; height: 100%;">
        <rect x="5" width="90" y="5" height="90" rx="5" style="fill:green; fill-opacity:0.5;"/>
        <rect x="49" width="2" y="5" height="90" style="fill:green;"/>
        <rect x="40" width="20" y="45" height="10" rx="5" style="fill:green; stroke:white; stroke-width:5; fill-opacity:0.5;" ref="controlleur"/>
      </svg>
      <input v-model.number="volume" @input="this.update" type="hidden" step="0.1">
    </generique>
  `
};
