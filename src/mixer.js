import WaveSurfer from 'wavesurfer.js';
import Regions from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';
//import Cursor from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.min.js';

class Mixer {
  constructor (waveform_element_id) {
    this.blob = null;
    this.nodes = {};
    this.selection = { debut: 0, duree: 10, attack: 0.1, release: 0.1 };

    // Representation graphique du son
    this.wavesurfer = WaveSurfer.create({
      container: `#${waveform_element_id}`,
      waveColor: 'violet',
      progressColor: 'purple',
      height: 100, // TODO determiner par CSS si possible
      plugins: [
        Regions.create(),
//        Cursor.create()
      ]
    });

    // Initialisation
    this.contexte = this.wavesurfer.backend.getAudioContext(); // TODO Creer un contexte detache
    this.source = this.contexte.createBufferSource();
    this.source.connect(this.contexte.destination);
    this.nodes.gainNode = this.contexte.createGain(); // TODO Changer le nom pour master
    //this.nodes.convolver = this.contexte.createConvolver(); // TODO Reverb

    // Appliquer les filtres
    this.wavesurfer.backend.setFilters(_.map(this.nodes, (val) => { return val })); // TODO connecter les nodes manuellement
  }

  charger (blob_audio) {
    this.blob = blob_audio;
    this.wavesurfer.load(URL.createObjectURL(this.blob));
    this.set_selecteur({x: 0, y: 300});

    // OU this.source.buffer = this.wavesurfer.backend.buffer;
    new Response(this.blob).arrayBuffer()
      .then((buffer) => {
        this.contexte.decodeAudioData(buffer)
      .then((audio_buffer) => {
        this.source.buffer = audio_buffer;
      })
    });
  }

  jouer () {
    this.source.start();

    /*
     * Le metronome spawn des tracks selon son timing
     *
     * Considerant qu'une source ne peut jouer pas jouer de facon concurrente
     * Chaque source doit avoir une enveloppe et ensuite on l'envoie dans le master voir main.js:146
     *
     * class Track {
     * constructor (context, audio_buffer, start, duration, attack, release, playbackRate)
     *  this.source = context.createBufferSource();
     *  this.source.buffer = audio_buffer;
     *  this.source.playbackRate = playbackRate;
     *  this.source.start(content.currentTime, start, attack + duration + release)
     * }
     */

    //this.source.start(this.contexte.currentTime, this.selection.debut, this.selection.attack + this.selection.duree + this.selection.release); 
    

    //this.wavesurfer.regions.list.selected.play();
  }

  set_selecteur (valeur) {

    this.selection.debut = valeur.x;
    this.selection.duree = valeur.y;

    // TODO Valeurs a utiliser : milieu, longueur en pct
    this.wavesurfer.clearRegions();
    this.wavesurfer.addRegion({id: "selected", start: valeur.x, end: valeur.y, color: 'rgba(200,0,0,0.2)'});
    console.log(this.wavesurfer.backend);
  }

  set_volume (valeur) {
    this.nodes.gainNode.gain.setValueAtTime(valeur, this.contexte.currentTime);
  }

  set_reverb (valeur) {
    //https://blog.gskinner.com/archives/2019/02/reverb-web-audio-api.html
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
