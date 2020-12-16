let template_fnfn = `
  <div class="fonofone">
    <header>{{ $t("titre") }}</header>
    <div id="waveform"></div>
    <button v-on:click="exporter()">Exporter</button>
    <div ref="filepond"></div>
    <footer>Footer</footer>
  </div>
`;

export default template_fnfn;
