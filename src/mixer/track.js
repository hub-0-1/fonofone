class Track {
  constructor (context, audio_buffer, convolver, debut, longueur, vitesse) {

    let attack = 0.1;
    let release = 0.1;

    // Initialisation
    let source = context.createBufferSource();
    let enveloppe = context.createGain();
    let now = context.currentTime;

    source.buffer = audio_buffer;
    source.connect(enveloppe);
    enveloppe.connect(convolver);
    source.playbackRate.setValueAtTime(vitesse, context.currentTime);

    // Enveloppe
    enveloppe.gain.setValueAtTime         (0, now);
    enveloppe.gain.linearRampToValueAtTime(1, now + attack);
    enveloppe.gain.linearRampToValueAtTime(1, now + attack + longueur);
    enveloppe.gain.linearRampToValueAtTime(0, now + attack + longueur + release);

    source.start(context.currentTime, debut, attack + longueur + release);
  }
}

export default Track;
