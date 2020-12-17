import Logo from '../images/logo_fonofone.svg'
import Hamburger from '../images/icons/square.svg'

let template_fnfn = `
  <div class="fonofone">
    <header>{{ $t("titre") }}</header>
    <div id="waveform"></div>
    <button v-on:click="exporter()">Exporter</button>
    <div ref="filepond"></div>
    <footer>
      <img class="logo" src="${Logo}">
      <div class="menu">
        <img class="hamburger" src="${Hamburger}">
      </div>
    </footer>
  </div>
`;

export default template_fnfn;
