import * as FilePond from 'filepond';
import 'filepond/dist/filepond.min.css';

export default {
  methods: {
    // Passer l'element, et une liste de callbacks
    init_filepond: function (parent_el, callback) {

      // Upload fichiers
      this.filepond = FilePond.create({ 
        name: 'filepond',
        credits: false
      });

      //  filepond.labelIdle = this.$t("filepond.idle");
      parent_el.appendChild(this.filepond.element);
      this.filepond.element.addEventListener('FilePond:addfile', (e) => { callback(e.detail.file); });
    }
  }
}
