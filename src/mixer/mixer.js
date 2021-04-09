import WaveSurfer from 'wavesurfer.js';
import Regions from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';
import Enregistreur from '../enregistreur.js';

import Track from "./track.js";
import Globales from "../globales.js";

class Mixer {
  constructor (fonofone) {
    this.waveform_element_id = fonofone.waveform_id;
    this.fnfn_id = fonofone.id;
    this.ctx_audio = fonofone.ctx_audio;
    this.is_webkitAudioContext = (this.ctx_audio.constructor.name == "webkitAudioContext"); // Test safari
    this.audio_buffer = this.ctx_audio.createBufferSource();
    this.etat = { chargement: true, jouer: false, loop: false, metronome: false, en_enregistrement: false, en_session: false };
    this.parametres = {};
    this.tracks = [];
    this.tracks_timeouts = [];
    this.prochaines_tracks = [];
    this.nodes = {};

    // Enregistrement de session
    this.nodes.media_stream_destination = this.ctx_audio.createMediaStreamDestination();
    this.enregistreur = new Enregistreur(this.ctx_audio, this.nodes.media_stream_destination.stream);

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
    this.nodes.master.connect(fonofone.noeud_sortie);

    // Sortie controllable de l'externe du Fonofone
    fonofone.noeud_sortie.connect(this.ctx_audio.destination);
    fonofone.noeud_sortie.connect(this.nodes.media_stream_destination);
  }

  charger_blob (blob) {
    return new Promise((resolve) => {
      new Response(blob).arrayBuffer().then((array_buffer) => {
        return this.buffer2audio_buffer(array_buffer);
      }).then((audio_buffer) => {
        this.audio_buffer = audio_buffer;
        if(this.audio_buffer.numberOfChannels < 2) {
          this.audio_buffer = mono2stereo(this.audio_buffer);
        }
        resolve(true);
      });
    });
  }

  toggle_pause () {
    if(this.tracks.length > 0 || this.tracks_timeouts > 0) {
      this.etat.jouer = false;

      // Arreter les tracks qui jouent ou qui vont jouer
      _.each(this.tracks, (track) => { track.source.stop(); });
      _.each(this.tracks_timeouts, (timeout) => { clearTimeout(timeout); });
      this.tracks = [];
      this.tracks_timeouts = [];
    }
    else {
      this.lancer();
    }
  }

  lancer () {
    this.etat.jouer = true;
    if(this.ctx_audio.state == "running") {
      this.jouer();
    } else { // Politique autoplay
      this.ctx_audio.resume().then(() => { this.jouer(); });
    }
  }

  jouer () {

    // Ne pas jouer au chargement
    if(this.etat.chargement) return;

    // Enregistrer
    if(this.etat.en_session && !this.etat.en_enregistrement) this.debuter_session();

    // Creer et lancer la track
    let track = new Track(this.ctx_audio, this.audio_buffer, this.nodes.n0, this.parametres);
    this.tracks.push(track);

    // Lors de la fin
    track.source.onended = () => { 

      // Supprimer la track de la liste
      this.tracks.splice(this.tracks.indexOf(track), 1); 

      // Loop sans metronome
      if(this.tracks.length == 0 && this.etat.loop && !this.etat.metronome) {
        this.jouer();
      }
    }

    // Loop avec metronome
    if(this.etat.metronome && this.etat.loop) {
      this.planifier_prochain_metronome();
    }
  }

  planifier_prochain_metronome () {
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

    // Planifier la track et en garder une trace
    let track_timeout = setTimeout(() => {
      this.jouer();
      this.tracks_timeouts.splice(this.tracks_timeouts.indexOf(track_timeout), 1); 
    }, interval);
    this.tracks_timeouts.push(track_timeout);
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
    this.parametres.longueur = Math.max(valeur.longueur * this.audio_buffer.duration || 0, Globales.modules.selecteur.duration_min);
  }

  set_metronome (valeur) {

    // Rythme aleatoire
    this.etat.metronome = valeur.actif;
    this.parametres.syncope = valeur.syncope;
    this.parametres.aleatoire = valeur.aleatoire;
    this.parametres.bpm = Math.pow(valeur.bpm, 2) * (Globales.modules.metronome.max_bpm - Globales.modules.metronome.min_bpm) + Globales.modules.metronome.min_bpm;
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
    this.etat.loop = valeur;

    if(this.etat.metronome && this.etat.loop && this.etat.jouer) {
      this.planifier_prochain_metronome();
    }
  }

  set_sens (valeur) {
    this.parametres.sens = valeur;
    this.update_tracks();
  }

  crop () {
    return this.audio_buffer = crop_audio_buffer(this.ctx_audio, this.audio_buffer, this.parametres.debut, this.parametres.debut + this.parametres.longueur);
  }

  update_tracks () {
    _.each(this.tracks, (track) => {
      track.source.playbackRate.setValueAtTime(this.parametres.vitesse * this.parametres.sens, this.ctx_audio.currentTime);
    });
  }

  debuter_session () {
    // TODO Attendre d'etre en mode jouer
    if(this.etat.jouer) {
      this.enregistreur.debuter();
      this.etat.en_enregistrement = true;
    }
  }

  terminer_session () {
    if(this.etat.en_enregistrement) {
      this.etat.en_enregistrement = false;
      return this.enregistreur.terminer();
    }
    else {
      return new Promise((resolve) => { resolve(null); });
    }
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

  let channel0 = buffer.getChannelData(0);
  let channel1 = buffer.getChannelData(1);
  let offset = Math.round(startOffset);

  for(let i = 0; i < frameCount; i++) {
    newArrayBuffer.getChannelData(0)[i] = channel0[i + offset];
    newArrayBuffer.getChannelData(1)[i] = channel1[i + offset];
  }

  return newArrayBuffer;
}

function mono2stereo (mono) {
  let stereo = this.ctx_audio.createBuffer(2, mono.length, mono.sampleRate);
  for(let i = 0; i < mono.length; i++) {
    stereo.getChannelData(0)[i] = mono.getChannelData(0)[i];
    stereo.getChannelData(1)[i] = mono.getChannelData(0)[i];
  }
  return stereo;
}


