const mimeType = "audio/webm";

export default class Enregistreur {
  constructor(stream) {
    this.recorder = new MediaRecorder(stream, { mimeType });
    this.chunks = [];
    this.recorder.ondataavailable = (evt) => { this.chunks.push(evt.data); };
  }

  debuter () {
    this.recorder.start();
  }

  terminer () {
    return new Promise ((resolve) => {
      this.recorder.onstop = () => { 
        let blob = new Blob(this.chunks);
        this.chunks = [];
        resolve(blob); 
      };
      this.recorder.stop();
    });
  }
}
