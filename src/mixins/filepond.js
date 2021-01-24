import * as FilePond from 'filepond';
import 'filepond/dist/filepond.min.css';

export default {
  methods: {
    init_filepond: function () {

      // Upload fichiers
      this.outils.filepond = FilePond.create({ 
        name: 'filepond',
        credits: false
      });

      this.$refs.filepond.appendChild(this.outils.filepond.element);

      let filepond = this.$refs.filepond.firstChild;
      filepond.addEventListener('FilePond:addfile', e => { 
        let fichier = e.detail.file;

        if(fichier.fileType.match(/audio/)) {
          this.update_fichier_audio(fichier.file);
          this.panneaux.importation = false;
        } else if (fichier.fileExtension == "fnfn") { // TODO, semble manquer un repaint
          this.importer(fichier.file);
          this.panneaux.importation = false;
        } else {
          throw "type de fichier non valide";
        }
      });
    }
  },
  mounted: function () {
    this.init_filepond();
  }
}
