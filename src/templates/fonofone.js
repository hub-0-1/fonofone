import Record from '../images/record.svg';

export default `
  <div :id="id" class="fonofone" ref="fonofone">
    <header>
      <div class="nom-archive">Archive</div>
      <div :id="waveform_id" class="wavesurfer"></div>
      <div class="menu">
        <div class="menu-gauche">
          <bouton src="${Record}" @click="enregistrer"></bouton>
          <button @click="exporter()">Exporter</button>
          <button @click="mode_importation = !mode_importation">Importer</button>
        </div>
        <div class="menu-droit">
        </div>
      </div>
    </header>
    <main>
      <div class="mixer" :class="mode_affichage">
        <component v-for="(module, key) in archive.config" :is="key" :key="key" v-bind.sync="module" :modifiable="mode_affichage == 'grille'" :class="key" :ref="key"></component>
      </div>
      <div v-show="mode_importation" ref="filepond"></div>
    </main>
    <footer></footer>
  </div>
`;
