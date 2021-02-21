import Record from '../images/record.svg';
import Folder from '../images/icon-folder.svg';

export default `
  <div :id="id" class="fonofone" ref="fonofone">
    <header>
      <div class="nom-archive">
        <bouton src="${Folder}" @click.native="mode_importation = !mode_importation"></bouton>
        Archive
      </div>
      <div :id="waveform_id" class="wavesurfer"></div>
      <div class="menu">
        <bouton src="${Record}" @click.native="enregistrer"></bouton>
      </div>
    </header>
    <main>
      <div v-show="!mode_importation" class="mixer" :class="mode_affichage" ref="mixer">
        <component v-for="(module, key) in archive.config" :is="key" :key="key" v-bind.sync="module" :modifiable="mode_affichage == 'grille'" :class="key" :ref="key"></component>
      </div>
      <div v-show="mode_importation" class="ecran-importation">
        <div class="background-importation">
          <div class="fenetre-importation">
            <header>Liste des sons</header>
            <main>
              <ul>
                <li v-for="item in configuration.sons">{{ item }}</li>
              </ul>
            </main>
            <footer>
              <div ref="filepond"></div>
              <div>Enregistrer un son</div>
              <button @click="exporter()">Exporter</button>
            </footer>
          </div>
        </div>
      </div>
    </main>
    <footer></footer>
  </div>
`;
