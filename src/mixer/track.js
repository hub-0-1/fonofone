class Track {
  constructor (context, audio_buffer, master, debut, duree, vitesse) {

    // TODO refact constantes 
    let attack = 1;
    let release = 1;

    // Initialisation
    this.source = context.createBufferSource();
    this.source.buffer = audio_buffer;
    this.source.connect(master);

    this.source.playbackRate.setValueAtTime(vitesse, context.currentTime);

    // Jouer
    //this.source.start(content.currentTime, debut, attack + duree + release)
    this.source.start();
  }
}

export default Track;
