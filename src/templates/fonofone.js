let template_fnfn = `
  <div :id="id" class="fonofone">
    <header>
      <div class="nom-archive">Archive</div>
      <div :id="waveform_id"></div>
      <div class="menu">
        <div class="menu-gauche">
          <button @click="mixer.jouer()">jouer</button>
          <button @click="exporter()">Exporter</button>
          <button @click="mode_importation = !mode_importation">Importer</button>
          <toggle-button v-model="mode_edition" :labels="{checked: $t('menu.modes.edition'), unchecked: $t('menu.modes.mixage')}" :width="100" :color="{checked: '#00FF00', unchecked: '#FF0000'}"/>
          <toggle-button v-model="loop" :width="25"/>
          <toggle-button v-model="mode_colonne" :labels="{checked: 'colonne', unchecked: 'grille'}" :width="100" :color="{checked: '#00FF00', unchecked: '#FF0000'}"/>
        </div>
        <div class="menu-droit">
        </div>
      </div>
    </header>
    <main>
      <div class="mixer" :class="{colonne: mode_colonne}">
        <component v-for="(module, key) in archive.config" :is="key" :key="key" v-bind.sync="module" :modifiable="mode_edition && !mode_colonne" :class="key" :ref="key"></component>
      </div>
      <div v-show="mode_importation" ref="filepond"></div>
    </main>
    <footer></footer>
  </div>
`;

export default template_fnfn;
