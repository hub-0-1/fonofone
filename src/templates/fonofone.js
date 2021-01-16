import Logo from '../images/logo_fonofone.svg'
import Hamburger from '../images/icons/square.svg'

let template_fnfn = `
  <div :id="id" class="fonofone">
    <header>{{ $t("titre") }}</header>
    <main>
      <div class="interface-creation">
        <div class="mixer">
          <div v-show="panneaux.waveform" :id="waveform_id"></div>
          <div v-show="panneaux.grille" ref="grille_wrapper" :id="grille_wrapper_id" class="grille-wrapper">
            <fnfn-selecteur v-if="modules.selecteur.actif" v-on:update="modules.selecteur.valeur = $event" :mode-edition="mode_edition" class="fnfn-selecteur"></fnfn-selecteur>
          </div>
        </div>
        <div v-show="panneaux.valeurs_modules" class="valeurs-modules">
          <label for="selecteur">Sélecteur</label>
          <input :value="modules.selecteur.valeur.debut" type="number"> 
        </div>
      </div>
      <div v-show="panneaux.importation" ref="filepond"></div>
    </main>
    <footer>
      <img class="logo" src="${Logo}">
      <div class="menu">
        <div v-show="panneaux.menu" class="container-menu">
          <button v-on:click="exporter()">Exporter</button>
          <button v-on:click="toggle_importation()">Importer</button>
          <toggle-button v-model="mode_edition" :labels="{checked: $t('menu.modes.edition'), unchecked: $t('menu.modes.mixage')}" :width="100" :color="{checked: '#00FF00', unchecked: '#FF0000'}"/>
        </div>
        <img v-on:click="toggle_menu()" class="hamburger" src="${Hamburger}">
      </div>
    </footer>
  </div>
`;

export default template_fnfn;
