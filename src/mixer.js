import WaveSurfer from 'wavesurfer';
import * as Regions from '../node_modules/wavesurfer/dist/plugin/wavesurfer.regions.min.js';

class Mixer {
  constructor (waveform_element_id) {
    this.blob = null;
    this.source = null;
    this.nodes = {};

    this.contexte = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext);
    this.nodes.gainNode = this.contexte.createGain();
    this.nodes.stereoPannerNode = this.contexte.createStereoPanner();

    // Representation graphique du son
    //console.log(Regions);
    this.wavesurfer = WaveSurfer.create({
      container: `#${waveform_element_id}`,
      waveColor: 'violet',
      progressColor: 'purple',
      height: 100,
      plugins: [/*
          Regions.create()
          */]
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
    this.wavesurfer.load(url_source_audio);
  }

  jouer () {
    this.source.play();
  }

  setGain (valeur) {
    this.nodes.gainNode.gain.setValueAtTime(valeur, this.contexte.currentTime);
  }

  setPan (valeur) {
    this.nodes.stereoPannerNode.pan.setValueAtTime(valeur, this.contexte.currentTime);
  }

  setLoop (valeur) {
    this.source.loop = valeur;
  }

  static async handle_to_blob (fichier) {
    //return URL.createObjectURL(await (await fetch(fichier)).blob());
    return await (await fetch(fichier)).blob();
  }
}

export default Mixer;
