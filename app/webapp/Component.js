sap.ui.define(
  ["sap/ui/core/UIComponent", "sap/ui/Device", "./model/models"],
  function (UIComponent, Device, models) {
    "use strict";

    return UIComponent.extend("com.moyo.demo.myfiorielementsproject.Component", {
      metadata: {
        manifest: "json",
      },

      init: function () {
        UIComponent.prototype.init.apply(this, arguments);

        this.setModel(models.createDeviceModel(), "device");

        this.getRouter().initialize();
      },

      getContentDensityClass: function () {
        if (!this._sContentDensityClass) {
          this._sContentDensityClass = Device.support.touch
            ? "sapUiSizeCozy"
            : "sapUiSizeCompact";
        }
        return this._sContentDensityClass;
      },
    });
  }
);