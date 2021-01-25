import WaveSurfer from 'wavesurfer.js';
import Regions from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js'; // Note : S'ajoute automatiquement a wavesurfer.regions
import Cursor from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.min.js'; // TODO Marche pas

class Mixer {
  constructor (waveform_element_id) {
    this.blob = null;
    this.nodes = {};

    // Representation graphique du son
    this.wavesurfer = WaveSurfer.create({
      container: `#${waveform_element_id}`,
      waveColor: 'violet',
      progressColor: 'purple',
      height: 100,
      plugins: [
        Regions.create(),
        Cursor.create()
      ]
    });

    // Initialisation
    this.contexte = this.wavesurfer.backend.getAudioContext();
    this.nodes.gainNode = this.contexte.createGain();
    this.nodes.convolver = this.contexte.createConvolver(); // TODO Reverb

    // Appliquer les filtres
    this.wavesurfer.backend.setFilters(_.map(this.nodes, (val) => { return val }));
  }

  charger (blob_audio) {
    this.blob = blob_audio;
    this.wavesurfer.load(URL.createObjectURL(this.blob));
    this.set_selecteur({x: 0, y: 300});
  }

  jouer () {
    this.wavesurfer.regions.list.selected.play();
  }

  set_selecteur (valeur) {

    // TODO Valeurs a utiliser : milieu, longueur en pct
    this.wavesurfer.clearRegions();
    this.wavesurfer.addRegion({id: "selected", start: valeur.x, end: valeur.y, color: 'rgba(200,0,0,0.2)'});
  }

  set_volume (valeur) {
    this.nodes.gainNode.gain.setValueAtTime(valeur.volume, this.contexte.currentTime);
  }

  set_reverb (valeur) {
    throw 'pas encore implemente';
  }

  /*set_pan (valeur) {
    this.nodes.stereoPannerNode.pan.setValueAtTime(valeur, this.contexte.currentTime);
  }*/

  set_loop (valeur) {
    this.wavesurfer.regions.list.selected.loop = valeur;
  }

  static async handle_to_blob (fichier) {
    return await (await fetch(fichier)).blob();
  }
}

export default Mixer;
