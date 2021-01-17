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
            <selecteur v-if="modules.selecteur.actif" @update="modules.selecteur.valeur = $event" @moved="modules.selecteur.position = $event" :mode-edition="mode_edition" class="fnfn-selecteur" ref="selecteur"></selecteur>
          </div>
        </div>
        <div v-show="panneaux.valeurs_modules" class="valeurs-modules">
          <h3>Selecteur</h3>
          <p>{{ modules.selecteur.valeur.debut }} - {{ modules.selecteur.valeur.fin }}</p>
        </div>
      </div>
      <div v-show="panneaux.importation" ref="filepond"></div>
    </main>
    <footer>
      <img class="logo" src="${Logo}">
      <div class="menu">
        <div v-show="panneaux.menu" class="container-menu">
          <button v-on:click="exporter()">Exporter</button>
          <button v-on:click="panneaux.importation = !panneaux.importation">Importer</button>
          <toggle-button v-model="mode_edition" :labels="{checked: $t('menu.modes.edition'), unchecked: $t('menu.modes.mixage')}" :width="100" :color="{checked: '#00FF00', unchecked: '#FF0000'}"/>
          <toggle-button v-model="panneaux.valeurs_modules" :width="100" @input="repaint()"/>
        </div>
        <img v-on:click="panneaux.menu = !panneaux.menu" class="hamburger" src="${Hamburger}">
      </div>
    </footer>
  </div>
`;

export default template_fnfn;
