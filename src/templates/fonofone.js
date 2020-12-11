import Hamburger from '../images/icons/square.svg'

let template_fnfn = `
  <div :id="id" class="fonofone">
    <header>{{ $t("titre") }}</header>
    <main>
      <div class="interface-creation">
        <div class="mixer">
          <div v-show="panneaux.waveform" :id="waveform_id"></div>
          <div v-show="panneaux.grille" ref="grille_wrapper" class="grille-wrapper" :class="{colonne: mode_colonne}">
            <component v-for="(module, key) in archive.config" :is="key" :key="key" v-bind.sync="module" :modifiable="mode_edition && !mode_colonne" :class="key" :ref="key"></component>
          </div>
        </div>
      </div>
      <div v-show="panneaux.importation" ref="filepond"></div>
    </main>
    <footer>
      <div class="menu">
        <div v-show="panneaux.menu" class="container-menu">
          <button v-on:click="mixer.jouer()">jouer</button>
          <button v-on:click="exporter()">Exporter</button>
          <button v-on:click="panneaux.importation = !panneaux.importation">Importer</button>
          <toggle-button v-model="mode_edition" :labels="{checked: $t('menu.modes.edition'), unchecked: $t('menu.modes.mixage')}" :width="100" :color="{checked: '#00FF00', unchecked: '#FF0000'}"/>
          <toggle-button v-model="panneaux.valeurs_modules" :width="100" @input="repaint()"/>
          <toggle-button v-model="loop" :width="25"/>
          <toggle-button v-model="mode_colonne" :labels="{checked: 'colonne', unchecked: 'grille'}" :width="100" :color="{checked: '#00FF00', unchecked: '#FF0000'}"/>
        </div>
        <img v-on:click="panneaux.menu = !panneaux.menu" class="hamburger" src="${Hamburger}">
      </div>
    </footer>
  </div>
`;

export default template_fnfn;
