sap.ui.define([
    "sap/ui/core/mvc/Controller", 
    "sap/ui/model/json/JSONModel", 
    "sap/m/MessageToast", 
    "sap/ui/model/Filter", 
    "sap/ui/model/FilterOperator", 
    "sap/ui/model/Sorter", 
    "sap/m/ViewSettingsItem",
    "sap/ui/core/CustomData",
    "sap/ui/core/Fragment"
], (Controller, JSONModel, MessageToast, Filter, FilterOperator, Sorter, ViewSettingsItem, CustomData, Fragment) => {
    "use strict";

    return Controller.extend("fi18n.form.controller.form", {

        onInit() {
            var oData = {
                inResult: "Pass",
                inName: "",
                inAge: "",
                inRole: "",
                inEmail: "",
                inaddresses: [{ value: "" }],
                inResultS: "",
                inIdS: "",
                inNameS: "",
                inAgeS: "",
                inRoleS: "",
                inEmailS: "",
                Table: []
            };

            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "form");
            
            this._mDialogs = {};
        },

        onSubmit() {
            var oModel = this.getView().getModel("form");

            if (!oModel.getProperty("/inName") || !oModel.getProperty("/inEmail")) {
                MessageToast.show("Please fill in all required fields (Name and Email)!");
                return;
            }

            if (!isNaN(oModel.getProperty("/inName"))) {
                MessageToast.show("Please enter a valid Name!");
                return;
            }

            if (isNaN(oModel.getProperty("/inAge"))) {
                MessageToast.show("Please enter a valid number for Age!");
                return;
            }

            var aAllAddresses = oModel.getProperty("/inaddresses") || [];
            var aValidTexts = aAllAddresses.map(function (item) {
                return item.value;
            }).filter(function (text) {
                return text && text.trim().length > 0;
            });
            var sMergedAddress = aValidTexts.join("\n");

            var id = oModel.getProperty("/Table").length + 1;
            var currentTableData = oModel.getProperty("/Table");

            currentTableData.push({
                outResult: oModel.getProperty("/inResult"),
                outId: String(id),
                outName: oModel.getProperty("/inName"),
                outAge: String(oModel.getProperty("/inAge")),
                outRole: oModel.getProperty("/inRole"),
                outEmail: oModel.getProperty("/inEmail"),
                outAddress: sMergedAddress
            });

            oModel.setProperty("/Table", currentTableData);

            oModel.setProperty("/inName", "");
            oModel.setProperty("/inAge", "");
            oModel.setProperty("/inRole", "");
            oModel.setProperty("/inEmail", "");
            oModel.setProperty("/inaddresses", [{ value: "" }]);
            oModel.setProperty("/inResult", "Pass");

            MessageToast.show("Data added successfully!");
        },

        onAddAddress: function () {
            var oModel = this.getView().getModel("form");
            var aAddresses = oModel.getProperty("/inaddresses");

            aAddresses.push({ value: "" });
            oModel.setProperty("/inaddresses", aAddresses);
        },

        onRemoveAddress: function (oEvent) {
            var oModel = this.getView().getModel("form");
            var sPath = oEvent.getSource().getBindingContext("form").getPath();
            var i = parseInt(sPath.split("/").pop(), 10);

            var aAddresses = oModel.getProperty("/inaddresses");
            aAddresses.splice(i, 1);
            oModel.setProperty("/inaddresses", aAddresses);
        },

        onSearch: function (event) {
            var aFilter = [];
            var searchValue = event.getParameter("query");
            if (searchValue && searchValue.length > 0) {
                var oFilterResult = new Filter("outResult", FilterOperator.Contains, searchValue);
                var oFilterName = new Filter("outName", FilterOperator.Contains, searchValue);
                var oFilterAge = new Filter("outAge", FilterOperator.Contains, searchValue);
                var oFilterRole = new Filter("outRole", FilterOperator.Contains, searchValue);
                var oFilterEmail = new Filter("outEmail", FilterOperator.Contains, searchValue);
                var oFilterAddress = new Filter("outAddress", FilterOperator.Contains, searchValue);

                var oMultiFilter = new Filter([oFilterResult, oFilterName, oFilterAge, oFilterRole, oFilterEmail, oFilterAddress], false);
                aFilter.push(oMultiFilter);

                MessageToast.show("Searching for: " + searchValue);
            } else {
                MessageToast.show("Search cleared. Showing all data.");
            }
            var oTable = this.getView().byId("dataTable");
            var oBinding = oTable.getBinding("items");
            oBinding.filter(aFilter);
        },

        onSearchTop: function () {
            var aFilterS = [];
            var oModel = this.getView().getModel("form");

            var sId = oModel.getProperty("/inIdS");
            var sName = oModel.getProperty("/inNameS");
            var sAge = oModel.getProperty("/inAgeS");
            var sRole = oModel.getProperty("/inRoleS");
            var sEmail = oModel.getProperty("/inEmailS");

            var aSelectedResults = this.getView().byId("searchResult").getSelectedKeys();

            if (aSelectedResults && aSelectedResults.length > 0) {
                var aResultFilters = aSelectedResults.map(function (sKey) {
                    return new Filter("outResult", FilterOperator.EQ, sKey);
                });

                aFilterS.push(new Filter(aResultFilters, false));
            }

            if (sId) { aFilterS.push(new Filter("outId", FilterOperator.Contains, sId)); }
            if (sName) { aFilterS.push(new Filter("outName", FilterOperator.Contains, sName)); }
            if (sAge) { aFilterS.push(new Filter("outAge", FilterOperator.Contains, sAge)); }
            if (sRole) { aFilterS.push(new Filter("outRole", FilterOperator.Contains, sRole)); }
            if (sEmail) { aFilterS.push(new Filter("outEmail", FilterOperator.Contains, sEmail)); }

            var oTableS = this.getView().byId("dataTable");
            var oBindingS = oTableS.getBinding("items");

            if (aFilterS.length > 0) {
                oBindingS.filter(aFilterS);
                MessageToast.show("Searching With Individual Filters.");
            } else {
                oBindingS.filter([]);
                MessageToast.show("Search cleared. Showing all data.");
            }
        },

        handleConfirm: function (oEvent) {
            var oTable = this.getView().byId("dataTable");
            var oBinding = oTable.getBinding("items");
            var mParams = oEvent.getParameters();
            var aSorters = [];

            if (mParams.sortItem) {
                var sPath = mParams.sortItem.getText();
                
                if (sPath === "Result") { sPath = "outResult"; }
                else if (sPath === "ID") { sPath = "outId"; }
                else if (sPath === "Name") { sPath = "outName"; }
                else if (sPath === "Age") { sPath = "outAge"; }
                else if (sPath === "Role") { sPath = "outRole"; }
                else if (sPath === "Email") { sPath = "outEmail"; }

                var bDescending = mParams.sortDescending;
                aSorters.push(new Sorter(sPath, bDescending));
            }

            oBinding.sort(aSorters);
        },

        _openDialog: function (sName, sPage, fInit) {
            var oView = this.getView();

            if (!this._mDialogs[sName]) {
                this._mDialogs[sName] = Fragment.load({
                    id: oView.getId(),
                    name: "fi18n.form.view." + sName,
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    if (fInit) {
                        fInit(oDialog);
                    }
                    return oDialog;
                });
            }
            this._mDialogs[sName].then(function (oDialog) {
                oDialog.open(sPage);
            });
        },

        handleOpenDialog: function () {
            this._openDialog("Dialog");
        },

        handleOpenDialogFilter: function () {
            this._openDialog("Dialog", "filter");
        },

        handleOpenDialogFilterPreselected: function () {
            this._openDialog("DialogPreselected", "filter");
        },

        handleOpenDialogPresetFilterItems: function () {
            this._openDialog("DialogPreset", "filter", this._presetFiltersInit);
        }

    });
});