sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, MessageToast, History, Fragment, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("fi18n.form.controller.AddEditEntry", {

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteAdd").attachPatternMatched(this._onRouteAddMatched, this);
            oRouter.getRoute("RouteEdit").attachPatternMatched(this._onRouteEditMatched, this);

            var oView = this.getView();

            Fragment.load({
                id: oView.getId(),
                name: "fi18n.form.view.Message",
                controller: this
            }).then(function (oFragment) {
                oView.addDependent(oFragment);
                var oMessageContainer = oView.byId("_IDGenVBox5");
                if (oMessageContainer) {
                    oMessageContainer.addItem(oFragment);
                }
            });
        },

        _onRouteAddMatched: function () {
            var oModel = this.getOwnerComponent().getModel("form");
            oModel.setProperty("/isCreateMode", true);
            oModel.setProperty("/isEditMode", false);

            oModel.setProperty("/SelectedRow", {
                outId: "", outResult: "Pass", outName: "", outAge: "", outRole: "", outRoleCustom: "", outEmail: "", outAddress: "",
                inaddresses: [{ value: "" }], outDob: null, outDos: null
            });
        },

        _onRouteEditMatched: function (oEvent) {
            var sId = oEvent.getParameter("arguments").rowIndex;
            var oModel = this.getOwnerComponent().getModel("form");
            var aTable = oModel.getProperty("/Table");
            var iIndex = aTable.findIndex(function (r) {
                return String(r.outId) === String(sId);
            });

            this._sCurrentRowPath = "/Table/" + iIndex;

            oModel.setProperty("/isCreateMode", false);
            oModel.setProperty("/isEditMode", false);

            var oOriginalRowData = JSON.parse(JSON.stringify(oModel.getProperty(this._sCurrentRowPath)));

            if (oOriginalRowData.outDob) { oOriginalRowData.outDob = new Date(oOriginalRowData.outDob); }
            if (oOriginalRowData.outDos) { oOriginalRowData.outDos = new Date(oOriginalRowData.outDos); }

            if (oOriginalRowData.outAddress) {
                oOriginalRowData.inaddresses = oOriginalRowData.outAddress.split("\n").map(function (sAddr) {
                    return { value: sAddr };
                });
            } else {
                oOriginalRowData.inaddresses = [{ value: "" }];
            }

            var aRoles = oModel.getProperty("/roles") || [];
            var bIsStandard = aRoles.some(function (r) { return r.name === oOriginalRowData.outRole; });
            if (!bIsStandard && oOriginalRowData.outRole) {
                oOriginalRowData.outRoleCustom = oOriginalRowData.outRole;
                oOriginalRowData.outRole = "Others";
            }

            oModel.setProperty("/SelectedRow", oOriginalRowData);
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("Routeform", {}, true);
            }
        },

        onAddAddress: function () {
            var oModel = this.getOwnerComponent().getModel("form");
            var aAddresses = oModel.getProperty("/SelectedRow/inaddresses") || [];
            aAddresses.push({ value: "" });
            oModel.setProperty("/SelectedRow/inaddresses", aAddresses);
        },

        onRemoveAddress: function (oEvent) {
            var oModel = this.getOwnerComponent().getModel("form");
            var sPath = oEvent.getSource().getBindingContext("form").getPath();
            var iIndex = parseInt(sPath.split("/").pop(), 10);
            var aAddresses = oModel.getProperty("/SelectedRow/inaddresses");

            aAddresses.splice(iIndex, 1);
            oModel.setProperty("/SelectedRow/inaddresses", aAddresses);
        },

        _processFormSaving: function (oTargetData) {
            var aAddrRows = oTargetData.inaddresses || [];
            var aValidTexts = aAddrRows.map(function (item) { return item.value; }).filter(function (t) { return t && t.trim().length > 0; });
            oTargetData.outAddress = aValidTexts.join("\n");

            if (oTargetData.outRole === "Others") {
                if (!oTargetData.outRoleCustom || oTargetData.outRoleCustom.trim() === "") {
                    MessageToast.show("Please specify custom role!");
                    return null;
                }
                oTargetData.outRole = oTargetData.outRoleCustom;
            }
            if (oTargetData.outAge) { oTargetData.outAge = parseInt(oTargetData.outAge, 10); }
            return oTargetData;
        },

        onSubmitEntry: function () {
            var oModel = this.getOwnerComponent().getModel("form");
            var oNewData = JSON.parse(JSON.stringify(oModel.getProperty("/SelectedRow")));

            if (!oNewData.outName || !oNewData.outEmail) {
                MessageToast.show("Please fill required fields!");
                return;
            }

            var oValidatedData = this._processFormSaving(oNewData);
            if (!oValidatedData) { return; }

            var aTableData = oModel.getProperty("/Table");
            oValidatedData.outId = aTableData.length + 1;

            aTableData.push(oValidatedData);
            oModel.setProperty("/Table", aTableData);

            MessageToast.show("Data added successfully!");
            this.onNavBack();
        },

        handleEditPress: function () {
            this.getOwnerComponent().getModel("form").setProperty("/isEditMode", true);
        },

        handleSavePress: function () {
            var oModel = this.getOwnerComponent().getModel("form");
            var oEditedData = JSON.parse(JSON.stringify(oModel.getProperty("/SelectedRow")));

            if (!oEditedData.outName || !oEditedData.outEmail) {
                MessageToast.show("Name and Email are required fields!");
                return;
            }

            var oValidatedData = this._processFormSaving(oEditedData);
            if (!oValidatedData) { return; }

            oModel.setProperty(this._sCurrentRowPath, oValidatedData);
            oModel.setProperty("/isEditMode", false);
            MessageToast.show("Row updates saved successfully!");
            this.onNavBack();
        },

        handleCancelPress: function () {
            this.onNavBack();
        },

        handleValueHelp: function (oEvent) {
            var oView = this.getView();
            if (!this._oRoleValueHelpDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "fi18n.form.view.RoleValueHelp",
                    controller: this
                }).then(function (oDialog) {
                    this._oRoleValueHelpDialog = oDialog;
                    oView.addDependent(this._oRoleValueHelpDialog);
                    this._oRoleValueHelpDialog.open();
                }.bind(this));
            } else {
                this._oRoleValueHelpDialog.open();
            }
        },

        onRoleValueHelpSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("name", FilterOperator.Contains, sValue);
            oEvent.getSource().getBinding("items").filter([oFilter]);
        },

        onRoleValueHelpConfirm: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            if (oSelectedItem) {
                var sRoleName = oSelectedItem.getBindingContext("form").getProperty("name");
                this.getOwnerComponent().getModel("form").setProperty("/SelectedRow/outRole", sRoleName);
            }
        }
    });
});