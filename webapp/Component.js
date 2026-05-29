sap.ui.define([
    "sap/ui/core/UIComponent",
    "fi18n/form/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("fi18n.form.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();
        }
    });
});