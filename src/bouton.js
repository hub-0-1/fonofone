export default {
  props: ['src', 'actif'],
  data: function () {
    return {
      est_actif: (this.actif || false),
    }
  },
  methods: {
    exporter: function () {
      console.log('ci');
    },
    update: function () {
      this.$emit("update:actif", est_actif);
    }
  },
  template: `
    <button class="bouton-controlleur" :class="{actif: est_actif}">
      <img :src="src" :alt="src" @click="est_actif = !est_actif"/>
    </button>
  `
}
