sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/ui/core/routing/History"],
    function (Controller, History) {
      "use strict";

      return Controller.extend("com.moyo.demo.myfiorielementsproject.controller.BaseController", {
        getRouter: function () {
          return this.getOwnerComponent().getRouter();
        },

        getModel: function (sName) {
          return this.getView().getModel(sName) || this.getOwnerComponent().getModel(sName);
        },

        setModel: function (oModel, sName) {
          return this.getView().setModel(oModel, sName);
        },

        getResourceBundle: function () {
          return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        onNavBack: function () {
          const oHistory = History.getInstance();
          const sPreviousHash = oHistory.getPreviousHash();
          if (sPreviousHash !== undefined) {
            window.history.go(-1);
          }
        },
      });
    }
  ); 