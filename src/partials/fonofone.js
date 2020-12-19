import Logo from '../images/logo_fonofone.svg'
import Hamburger from '../images/icons/square.svg'

// TODO Enlever tous les ids, ou ajouter id fonofone (multi-fonofones)
let template_fnfn = `
  <div v-bind:id="id"class="fonofone">
    <header>{{ $t("titre") }}</header>
    <main>
      <div v-show="panneaux.waveform" v-bind:id="waveform_id"></div>
      <div v-show="panneaux.grille" ref="grille_wrapper" :id="grille_wrapper_id">
        <canvas :id="grille_id"></canvas>
      </div>
      <div v-show="panneaux.importation" ref="filepond"></div>
    </main>
    <footer>
      <img class="logo" src="${Logo}">
      <div class="menu">
        <div v-show="panneaux.menu" class="container-menu">
          <button v-on:click="exporter()">Exporter</button>
          <button v-on:click="toggle_importation()">Importer</button>
        </div>
        <img v-on:click="toggle_menu()" class="hamburger" src="${Hamburger}">
      </div>
    </footer>
  </div>
`;

export default template_fnfn;
