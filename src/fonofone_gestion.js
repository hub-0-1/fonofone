window.GFonofone = (function () {
  var instance;

  function createInstance() {
    return {
      prochainIndex: 0
    }
  }

  return {
    getInstance: function () {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    },

    getProchainIndex: function () {
      let prochain = this.getInstance().prochainIndex;
      prochain += 1;
      return prochain;
    }
  };
})();
