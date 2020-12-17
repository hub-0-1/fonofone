import Logo from '../images/logo_fonofone.svg'
import Hamburger from '../images/icons/square.svg'

let template_fnfn = `
  <div class="fonofone">
    <header>{{ $t("titre") }}</header>
    <main>
      <div id="waveform"></div>
      <div ref="filepond"></div>
    </main>
    <footer>
      <img class="logo" src="${Logo}">
      <div class="menu">
        <button v-on:click="exporter()">Exporter</button>
        <img class="hamburger" src="${Hamburger}">
      </div>
    </footer>
  </div>
`;

export default template_fnfn;
