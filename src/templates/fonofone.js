import Logo from '../images/logo_fonofone.svg';

export default `
  <div :id="id" class="fonofone" ref="fonofone">
    <header>
      <div class="nom-archive">Archive</div>
      <div :id="waveform_id"></div>
      <div class="menu">
        <div class="menu-gauche">
          <bouton src="${Logo}" @click="mixer.jouer()"></bouton>
          <button @click="exporter()">Exporter</button>
          <button @click="mode_importation = !mode_importation">Importer</button>
          <toggle-button v-model="mode_edition" :labels="{checked: $t('menu.modes.edition'), unchecked: $t('menu.modes.mixage')}" :width="100" :color="{checked: '#00FF00', unchecked: '#FF0000'}"/>
          <toggle-button v-model="loop" :width="25"/>
        </div>
        <div class="menu-droit">
        </div>
      </div>
    </header>
    <main>
      <div class="mixer" :class="mode_affichage">
        <component v-for="(module, key) in archive.config" :is="key" :key="key" v-bind.sync="module" :modifiable="mode_edition && (mode_affichage == 'grille')" :class="key" :ref="key"></component>
      </div>
      <div v-show="mode_importation" ref="filepond"></div>
    </main>
    <footer></footer>
  </div>
`;
