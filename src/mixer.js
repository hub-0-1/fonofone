import WaveSurfer from 'wavesurfer.js';
import Regions from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js'; // Note : S'ajoute automatiquement a wavesurfer.regions
import Cursor from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.min.js'; // TODO Marche pas

class Mixer {
  constructor (waveform_element_id) {
    this.blob = null;
    this.source = null;
    this.nodes = {};

    this.contexte = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext);
    this.nodes.gainNode = this.contexte.createGain();
    this.nodes.stereoPannerNode = this.contexte.createStereoPanner();

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
  }

  charger (blob_audio) {

    this.blob = blob_audio;
    let url_source_audio = URL.createObjectURL(this.blob);

    // Charger
    this.source = new Audio(url_source_audio);
    this.media_source = this.contexte.createMediaElementSource(this.source);

    // Mixer
    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API
    this.media_source // Envoyer la source
      .connect(this.nodes.gainNode) // Dans le modificateur de gain (volume) 
      .connect(this.nodes.stereoPannerNode) // Dans le modificateur de pan (gauche / droite) 
      .connect(this.contexte.destination); // Envoyer vers la sortie standard

    // Affichage
    this.wavesurfer.on('ready', () => {
      //this.wavesurfer.addRegion({start: 0, end: 1, color: 'black'});
    });
    this.wavesurfer.load(url_source_audio);
  }

  jouer () {
    this.source.play();
  }

  set_selecteur (valeur) {
    this.wavesurfer.clearRegions();
    this.wavesurfer.addRegion({start: valeur.x, end: valeur.y, color: 'black'});
  }

  set_volume (valeur) {
    this.nodes.gainNode.gain.setValueAtTime(valeur, this.contexte.currentTime);
  }

  set_pan (valeur) {
    this.nodes.stereoPannerNode.pan.setValueAtTime(valeur, this.contexte.currentTime);
  }

  set_loop (valeur) {
    this.source.loop = valeur;
  }

  static async handle_to_blob (fichier) {
    return await (await fetch(fichier)).blob();
  }
}

export default Mixer;
