sap.ui.define([
    "sap/ui/core/format/DateFormat"
], function (DateFormat) {
    "use strict";

    return {

        formatDate: function (oDate) {
            if (!oDate) {
                return "";
            }
            var oDateTimeInstance = DateFormat.getDateInstance({
                pattern: "dd-MMM-yyyy"
            });
            return oDateTimeInstance.format(new Date(oDate));
        },

        formatDateTime: function (oDate) {
            if (!oDate) {
                return "";
            }
            var oDateTimeInstance = DateFormat.getDateTimeInstance({
                pattern: "dd/MM/yyyy, HH:mm:ss"
            });
            return oDateTimeInstance.format(new Date(oDate));
        }
    };
});