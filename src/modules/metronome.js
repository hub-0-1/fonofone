import Utils from "./_utils.js";

export default {
  mixins: [Utils],
  data: function () {
    return { metronome: this.valeur } // TODO ajouter le 2e parametre ici
  },
  methods: {
    drag: function (e) {
      this.metronome = this.get_mouse_position(e).x;
      this.update();
    },
    update: function () {
      this.$emit('update:valeur', this.metronome);
    }
  },
  computed: {
    // TODO utiliser getPointAtLength pour cercle sur arc
    x: function () {
      return Math.min(Math.max(this.metronome, 0.05), 0.85)
    }
  },
  mounted: function () {
    this.$refs.arc.setAttribute("d", describeArc(0.5, 0.4, 0.3, -135, 135));
    console.log(this.$refs.arc.getPointAtLength(this.$refs.arc.getTotalLength() / 2)); 
  },
  // Deplacement du point : https://bl.ocks.org/mbostock/1705868
  template: `
    <generique :module="$t('modules.metronome')" :disposition="disposition" :modifiable="modifiable && !is_dragging" @redispose="this.update_disposition">
      <svg viewBox="0 0 1 1" preserveAspectRatio="none" ref="canvas">
        <circle class="concentrique" cx="0.5" cy="0.4" r="0.2"/>
        <circle class="concentrique" cx="0.5" cy="0.4" r="0.15/>
        <circle class="concentrique "cx="0.5" cy="0.4" r="0.1"/>
        <path class="arc" ref="arc"/>
        <circle cx="0.5" cy="0.1" r="0.01" style="fill:white;"/>
        <rect x="0.2" width="0.6" y="0.8" height="0.01" rx="0.02" style="fill: orange;" />
        <rect class="controlleur" :x="x" width="0.05" y="0.7" height="0.2" rx="0.02" style="fill: white" ref="controlleur"/>
      </svg>
    </generique>
  `
};

// https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle#18473154
function describeArc(x, y, radius, startAngle, endAngle){
  var start = polarToCartesian(x, y, radius, endAngle);
  var end = polarToCartesian(x, y, radius, startAngle);

  var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  var d = [
    "M", start.x, start.y, 
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
  return d;       
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}


