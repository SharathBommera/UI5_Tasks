sap.ui.define([
  "sap/ui/core/mvc/Controller"
], (BaseController) => {
  "use strict";

  return BaseController.extend("fi18n.form.controller.App", {
      onInit() {
        var oMessageStrip = this.getView().byId("_IDGenMessageStrip");

            if (oMessageStrip) {
                oMessageStrip.setText("Welcome to Phoenix Business Consulting");
                oMessageStrip.setColorSet("ColorSet1");
                oMessageStrip.setColorScheme(1);

            }
      }
  });
});