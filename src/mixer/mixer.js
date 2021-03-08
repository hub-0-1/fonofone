import WaveSurfer from 'wavesurfer.js';
import Regions from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';
import toWav from 'audiobuffer-to-wav';

import Track from "./track.js";
import Globales from "../globales.js";

const pct_bpm_aleatoire = 0.6;

// Hacks Safari : https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Migrating_from_webkitAudioContext

// TODO Refact constantes de tout le fonofone dans globales.js
class Mixer {
  constructor (waveform_element_id, fnfn_id, ctx_audio) {
    this.waveform_element_id = waveform_element_id;
    this.fnfn_id = fnfn_id;
    this.ctx_audio = ctx_audio;
    this.is_webkitAudioContext = (this.ctx_audio.constructor.name == "webkitAudioContext"); // Test safari
    this.chargement = true;
    this.audio_blob = null;
    this.audio_buffer = this.ctx_audio.createBufferSource();
    this.parametres = {};
    this.tracks = [];
    this.prochaines_tracks = [];
    this.nodes = {};

    // Enregistrement de session
    this.nodes.media_stream_destination = ctx_audio.createMediaStreamDestination();
    this.session = {
      blob: null,
      encours: false,
      chunks: [],
      recorder: new MediaRecorder(this.nodes.media_stream_destination.stream)
    };
    this.session.recorder.ondataavailable = (evt) => { this.session.chunks.push(evt.data); };

    // Visualisation
    this.paint();

    // Initialisation
    this.nodes.n0 = this.ctx_audio.createGain(); // Noeud initial qu'on passe a toutes les tracks pour qu'elles se connectent a la destination

    // Pan
    this.nodes.splitter = this.ctx_audio.createChannelSplitter(2);
    this.nodes.pan_gauche = this.ctx_audio.createGain();
    this.nodes.pan_droite = this.ctx_audio.createGain();
    this.nodes.merger = this.ctx_audio.createChannelMerger(2);

    // Reverb
    this.nodes.reverberation_dry = this.ctx_audio.createGain();
    this.nodes.reverberation_wet = this.ctx_audio.createGain();
    this.nodes.convolver = this.ctx_audio.createConvolver();

    // Filtre
    this.nodes.lowpass_filter = this.ctx_audio.createBiquadFilter();
    this.nodes.lowpass_filter.type='lowpass'
    this.nodes.lowpass_filter.frequency.value = 20000

    this.nodes.highpass_filter = this.ctx_audio.createBiquadFilter();
    this.nodes.highpass_filter.type='highpass'
    this.nodes.highpass_filter.frequency.value = 20

    this.nodes.bandpass_filter = this.ctx_audio.createBiquadFilter();
    this.nodes.bandpass_filter.type='peaking'
    this.nodes.bandpass_filter.frequency.value = 10000

    // Volume
    this.nodes.master = this.ctx_audio.createGain();

    // Appliquer les filtres //
    this.nodes.n0.connect(this.nodes.splitter);

    // Pan
    this.nodes.splitter.connect(this.nodes.pan_gauche, 0, 0);
    this.nodes.splitter.connect(this.nodes.pan_droite, 1, 0);
    this.nodes.pan_gauche.connect(this.nodes.merger, 0, 1);
    this.nodes.pan_droite.connect(this.nodes.merger, 0, 0);
    this.nodes.merger.connect(this.nodes.reverberation_dry);
    this.nodes.merger.connect(this.nodes.reverberation_wet);

    // Reverb
    this.nodes.reverberation_dry.connect(this.nodes.lowpass_filter);
    this.nodes.reverberation_wet.connect(this.nodes.convolver);
    this.nodes.convolver.connect(this.nodes.lowpass_filter);

    // Filtre
    this.nodes.lowpass_filter.connect(this.nodes.highpass_filter);
    this.nodes.highpass_filter.connect(this.nodes.bandpass_filter);
    this.nodes.bandpass_filter.connect(this.nodes.master);

    // Gain
    this.nodes.master.connect(this.ctx_audio.destination);
    this.nodes.master.connect(this.nodes.media_stream_destination);
  }

  paint () {

    if(this.wavesurfer) {
      this.wavesurfer.destroy();
    }
    
    // Afficher
    this.wavesurfer = WaveSurfer.create({
      container: `#${this.waveform_element_id}`,
      waveColor: '#418ACA',
      height: 100, // TODO determiner par CSS si possible
      plugins: [ Regions.create() ]
    });

    //this.wavesurfer.loadBlob(this.audio_blob);
  }

  charger_blob (blob) {

    // Affichage
    // TODO recursion infinie ...
    this.audio_blob = blob;
    //this.paint();

    return new Promise((resolve) => {
      new Response(blob).arrayBuffer().then((array_buffer) => {
        return this.buffer2audio_buffer(array_buffer);
      }).then((audio_buffer) => {
        this.audio_buffer = audio_buffer;
        // TODO tout enlever paint et mettre cette ligne si recursion infinie
        this.wavesurfer.loadBlob(this.audio_blob);
        resolve(true);
      });
    });
  }

  toggle_pause () {
    if(this.tracks.length > 0) {
      // Arreter les tracks qui jouent
      _.each(this.tracks, (track) => { 
        track.source.stop();
      });
    }
    else {
      if(this.ctx_audio.state == "running") {
        this.jouer();
      } else {
        // Politique autoplay
        this.ctx_audio.resume().then(() => { this.jouer(); });
      }
    }
  }

  jouer () {

    // Ne pas jouer au chargement
    if(this.chargement) return;

    // Creer et lancer la track
    let track = new Track(this.ctx_audio, this.audio_buffer, this.nodes.n0, this.parametres);
    this.tracks.push(track);

    // Lors de la fin
    track.source.onended = () => { 

      // Supprimer la track de la liste
      this.tracks.splice(this.tracks.indexOf(track), 1); 

      // Si loop mais pas metronome
      if(this.tracks.length == 0 && this.parametres.loop && !this.parametres.metronome_actif) {
        this.jouer();
      }
    }

    // Loop avec metronome
    if(this.parametres.metronome_actif && this.parametres.loop) { 
      let interval = (60 / this.parametres.bpm) * 1000;

      // Partie syncope
      if(this.parametres.syncope) {

        var coeff = 2 * (this.parametres.syncope / 2.0);

        if(this.parametres.prochaine_syncope_courte){
          interval = interval * (1 - coeff) +  interval * ((2/3) * coeff);
        } else {
          interval = interval * (1 - coeff) +  interval * ((4/3) * coeff);
        }
        this.parametres.prochaine_syncope_courte = !this.parametres.prochaine_syncope_courte;
      }

      // Partie aleatoire
      interval = interval * (1 - (this.parametres.aleatoire / 2)) + (Math.random() * interval * this.parametres.aleatoire);// + (60 / Globales.modules.metronome.min_bpm) * 1000;

      setTimeout(this.jouer.bind(this), interval);
    }
  }

  set_volume (valeur) {

    // Volume
    this.nodes.master.gain.setValueAtTime(valeur.volume, this.ctx_audio.currentTime);

    // Pan
    let pan = valeur.pan * (Math.PI/2);
    this.nodes.pan_gauche.gain.setValueAtTime(Math.sin(pan), this.ctx_audio.currentTime);
    this.nodes.pan_droite.gain.setValueAtTime(Math.cos(pan), this.ctx_audio.currentTime);
  }

  set_vitesse (valeur) {

    if(!valeur.actif) {
      valeur.vitesse = 0.5;
      valeur.mode = 1;
    }

    if (valeur.vitesse <.5) {
      this.parametres.vitesse = Math.pow(valeur.vitesse + 0.5, valeur.mode); // facture de vitesse, .5 = demi-vitesse, 2 = double vitesse
    } else {
      this.parametres.vitesse = Math.pow(valeur.vitesse * 2, valeur.mode);
    }
    this.update_tracks();
  }

  set_selecteur (valeur) {

    if(!valeur.actif) {
      valeur.debut = 0;
      valeur.longueur = 1;
    }

    this.parametres.debut = (valeur.debut * this.audio_buffer.duration || 0);
    this.parametres.longueur = (valeur.longueur * this.audio_buffer.duration || 0);

    // Visuel
    this.wavesurfer.clearRegions();
    this.wavesurfer.addRegion({id: `selected-${this.fnfn_id}`, start: this.parametres.debut, end: this.parametres.debut + this.parametres.longueur, color: '#323232'});
  }

  set_metronome (valeur) {

    // Rythme aleatoire
    this.parametres.metronome_actif = valeur.actif;
    this.parametres.syncope = valeur.syncope;
    this.parametres.aleatoire = valeur.aleatoire;
    this.parametres.bpm = Math.pow(valeur.bpm, 2) * Globales.modules.metronome.max_bpm + Globales.modules.metronome.min_bpm;
  }

  // TODO Confirmer que ca fonctionne
  set_reverberation (valeur) {
    if(!valeur.actif) valeur.wet = 0;

    this.nodes.reverberation_dry.gain.setValueAtTime(1 - valeur.wet, this.ctx_audio.currentTime);
    this.nodes.reverberation_wet.gain.setValueAtTime(valeur.wet, this.ctx_audio.currentTime);

    // Son du convolver
    fetch(valeur.url).then((response) => {
      return response.arrayBuffer();
    }).then((buffer) => {
      return this.buffer2audio_buffer(buffer);
    }).then((audio_buffer) => {
      this.nodes.convolver.buffer = audio_buffer;
    });
  }

  set_filtre (valeur) {

    if(!valeur.actif) {
      valeur.debut = 0.5;
      valeur.longueur = 0;
    }

    let frequence = valeur.debut + valeur.longueur / 2;
    let resonnance = valeur.longueur;

    if(frequence < 0.5) {
      this.nodes.lowpass_filter.frequency.value = Math.pow(frequence / 0.5, 2) * 19900 + 100;
      this.nodes.highpass_filter.frequency.value = 20;
      this.nodes.bandpass_filter.frequency.value = this.nodes.lowpass_filter.frequency.value;
    }
    else {
      this.nodes.lowpass_filter.frequency.value = 20000;
      this.nodes.highpass_filter.frequency.value = Math.pow((frequence - 0.5) / 0.5, 2) * 19980 + 20;
      this.nodes.bandpass_filter.frequency.value = this.nodes.highpass_filter.frequency.value;
    }

    this.nodes.bandpass_filter.gain.value = resonnance * 36;
  }

  set_loop (valeur) {
    this.parametres.loop = valeur;
    // TODO Faire jouer automaituqment valeur ? this.set_interval_metronome() : this.stop_metronome(); 
  }

  set_sens (valeur) {
    this.parametres.sens = valeur;
    this.update_tracks();
  }

  // TODO plante dans Safari
  crop () {
    this.audio_buffer = crop_audio_buffer(this.ctx_audio, this.audio_buffer, this.parametres.debut, this.parametres.debut + this.parametres.longueur, null);
    this.wavesurfer.loadDecodedBuffer(this.audio_buffer);
  }

  update_tracks () {
    _.each(this.tracks, (track) => {
      track.source.playbackRate.setValueAtTime(this.parametres.vitesse * this.parametres.sens, this.ctx_audio.currentTime);
    });
  }

  exporter () {
    return new Promise ((resolve) => {
      this.session.recorder.onstop = () => { 
        let blob = this.session.blob = new Blob(this.session.chunks, { 'type': 'audio/ogg; codecs=opus' }); 
        this.session.chunks = [];

        // Il doit y avoir moyen de faire plus simple ...
        // Marche pas
        new Response(blob).arrayBuffer().then((buffer) => {
          return this.buffer2audio_buffer(buffer);
        }).then((audio_buffer) => {
          return toWav(audio_buffer);
        }).then((wav_buffer) => {
          return new Response(wav_buffer).blob();
        }).then((audio_blob) => {
          //resolve(audio_blob);
          resolve(this.session.blob);
        })
      };
      this.session.recorder.stop();
    }) 
  }

  start_session () {
    this.session.recorder.start();
  }

  buffer2audio_buffer (buffer) {

    // Hack Safari
    if(this.is_webkitAudioContext) { return this.ctx_audio.createBuffer(buffer, false); }

    // Firefox et Chrome
    else { return this.ctx_audio.decodeAudioData(buffer); }
  }
}

export default Mixer;

// https://miguelmota.com/bytes/slice-audiobuffer/
function crop_audio_buffer(ctx_audio, buffer, begin, end) {

  let channels = buffer.numberOfChannels;
  let rate = buffer.sampleRate;

  let startOffset = rate * begin;
  let endOffset = rate * end;
  let frameCount = endOffset - startOffset;

  let newArrayBuffer = ctx_audio.createBuffer(channels, endOffset - startOffset, rate);
  var anotherArray = new Float32Array(frameCount);
  var offset = 0;

  for (var channel = 0; channel < channels; channel++) {
    buffer.copyFromChannel(anotherArray, channel, startOffset);
    newArrayBuffer.copyToChannel(anotherArray, channel, offset);
  }

  return newArrayBuffer;
}


