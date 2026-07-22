sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/core/Fragment",
    "sap/m/MessageStrip"
], (Controller, JSONModel, MessageToast, Filter, FilterOperator, Sorter, Fragment, MessageStrip) => {
    "use strict";

    return Controller.extend("fi18n.form.controller.form", {

        onInit() {
            var oData = {
                inResult: "Pass",
                inName: "",
                inAge: "",
                inRoleSelected: "",
                inRoleCustom: "",
                inEmail: "",
                inaddresses: [{ value: "" }],
                inDob: null,
                inDos: null,
                inResultS: "",
                inIdS: "",
                inNameS: "",
                inAgeS: "",
                inRoleS: "",
                inEmailS: "",
                inAdressS: "",
                inDobS: null,
                inDosS: null,
                roles: [
                    { key: "DEV", name: "Developer" },
                    { key: "MGR", name: "Manager" },
                    { key: "QA", name: "Quality Analyst" },
                    { key: "UX", name: "UI Designer" },
                    { key: "HR", name: "HR Specialist" },
                    { key: "OTH", name: "Others" }
                ],
                Table: [
                    { outResult: "Pass", outId: 1, outName: "Arjun Reddy", outAge: 24, outRole: "Developer", outEmail: "arjun.r@test.com", outAddress: "Hitech City\nHyderabad", outDob: new Date(1999, 10, 15), outDos: new Date(2026, 0, 10, 10, 30, 0) },
                    { outResult: "Fail", outId: 2, outName: "Sarah Connor", outAge: 35, outRole: "Manager", outEmail: "s.connor@test.com", outAddress: "404 Tech Lane\nBangalore", outDob: new Date(1989, 4, 12), outDos: new Date(2026, 1, 14, 14, 45, 0) },
                    { outResult: "Pass", outId: 3, outName: "Vikram Singh", outAge: 28, outRole: "Quality Analyst", outEmail: "vik.singh@test.com", outAddress: "Gachibowli\nHyderabad", outDob: new Date(1996, 2, 8), outDos: new Date(2026, 2, 2, 9, 15, 0) },
                    { outResult: "Pass", outId: 4, outName: "Emily Davis", outAge: 30, outRole: "UI Designer", outEmail: "emily.davis@test.com", outAddress: "123 Design Street\nBangalore", outDob: new Date(1994, 6, 20), outDos: new Date(2026, 3, 18, 16, 0, 0) },
                    { outResult: "Fail", outId: 5, outName: "Michael Brown", outAge: 40, outRole: "HR Specialist", outEmail: "m.brown@test.com", outAddress: "505 HR Avenue\nBangalore", outDob: new Date(1984, 9, 5), outDos: new Date(2026, 4, 25, 11, 30, 0) },
                    { outResult: "Pass", outId: 6, outName: "Ananya Sharma", outAge: 26, outRole: "Developer", outEmail: "ananya.sharma@test.com", outAddress: "789 Innovation Blvd\nBangalore", outDob: new Date(1996, 5, 10), outDos: new Date(2026, 5, 15, 13, 45, 0) },
                    { outResult: "Fail", outId: 7, outName: "David Wilson", outAge: 32, outRole: "Manager", outEmail: "d.wilson@test.com", outAddress: "101 Management St\nBangalore", outDob: new Date(1992, 7, 18), outDos: new Date(2026, 6, 30, 15, 20, 0) },
                    { outResult: "Pass", outId: 8, outName: "Priya Patel", outAge: 29, outRole: "Quality Analyst", outEmail: "priya.patel@test.com", outAddress: "321 Quality Ave\nBangalore", outDob: new Date(1993, 1, 25), outDos: new Date(2026, 7, 12, 12, 15, 0) },
                    { outResult: "Pass", outId: 9, outName: "Rohan Mehta", outAge: 27, outRole: "UI Designer", outEmail: "rohan.mehta@test.com", outAddress: "654 Design Street\nHyderabad", outDob: new Date(1997, 3, 5), outDos: new Date(2026, 8, 20, 14, 0, 0) },
                    { outResult: "Fail", outId: 10, outName: "Sara Lee", outAge: 31, outRole: "HR Specialist", outEmail: "sara.lee@test.com", outAddress: "505 HR Avenue\nBangalore", outDob: new Date(1993, 8, 15), outDos: new Date(2026, 9, 5, 10, 30, 0) }
                ],
                SelectedRow: {
                    outId: "", outResult: "Pass", outName: "", outAge: "", outRole: "", outEmail: "", outAddress: "", outDob: null, outDos: null
                },
                isEditMode: false,
                isCreateMode: true
            };

            var oComponent = this.getOwnerComponent();
            if (!oComponent.getModel("form")) {
                var oModel = new JSONModel(oData);
                oComponent.setModel(oModel, "form");
            }
            this._mDialogs = {};

            var oView = this.getView();

            Fragment.load({
                id: oView.getId(),
                name: "fi18n.form.fragment.Message",
                controller: this
            }).then(function (oFragment) {
                oView.addDependent(oFragment);
                var oMessageContainer = oView.byId("_IDGenVBox4");
                if (oMessageContainer) {
                    oMessageContainer.addItem(oFragment);
                }
            });
        },

        onAddNavPress: function () {
            var oTable = this.getView().byId("dataTable");
            var oBinding = oTable.getBinding("items");
            var tableLength = oBinding.getLength();

            this.getOwnerComponent().getRouter().navTo("RouteAdd", {
                rowIndex: tableLength + 1
            });
        },

        onRowPress: function (oEvent) {
            var oItem = oEvent.getParameter("listItem");
            var oBindCon = oItem.getBindingContext("form");
            var sId = oBindCon.getProperty("outId");

            this.getOwnerComponent().getRouter().navTo("RouteEdit", {
                rowIndex: sId,
                "?query": {
                    role: oBindCon.getProperty("outRole")
                }
            });
        },

        handleValueHelp: function (oEvent) {
            var oView = this.getView();
            if (!this._oRoleValueHelpDialog) {
                Fragment.load({
                    id: oView.getId(),
                    name: "fi18n.form.fragment.RoleValueHelp",
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
            var oModel = this.getOwnerComponent().getModel("form");
            if (oSelectedItem) {
                var sRoleName = oSelectedItem.getBindingContext("form").getProperty("name");
                oModel.setProperty("/inRoleS", sRoleName);
            }
            oEvent.getSource().getBinding("items").filter([]);
        },

        onSearch: function (event) {
            var aFilter = [];
            var searchValue = event.getParameter("query");

            if (searchValue && searchValue.length > 0) {
                var oFilterResult = new Filter("outResult", FilterOperator.Contains, searchValue);
                var oFilterName = new Filter("outName", FilterOperator.Contains, searchValue);
                var oFilterRole = new Filter("outRole", FilterOperator.Contains, searchValue);
                var oFilterEmail = new Filter("outEmail", FilterOperator.Contains, searchValue);
                var oFilterAddress = new Filter("outAddress", FilterOperator.Contains, searchValue);
                var oMultiFilter;

                if (!isNaN(searchValue)) {
                    var iNumValue = parseInt(searchValue, 10);
                    var oFilterId = new Filter("outId", FilterOperator.EQ, iNumValue);
                    var oFilterAge = new Filter("outAge", FilterOperator.EQ, iNumValue);
                    oMultiFilter = new Filter([oFilterResult, oFilterName, oFilterId, oFilterAge, oFilterRole, oFilterEmail, oFilterAddress], false);
                } else {
                    oMultiFilter = new Filter([oFilterResult, oFilterName, oFilterRole, oFilterEmail, oFilterAddress], false);
                }
                aFilter.push(oMultiFilter);
            }
            this.getView().byId("dataTable").getBinding("items").filter(aFilter);
        },

        onSearchTop: function () {
            var aFilterS = [];
            var oModel = this.getOwnerComponent().getModel("form");

            var sId = oModel.getProperty("/inIdS");
            var sName = oModel.getProperty("/inNameS");
            var sAge = oModel.getProperty("/inAgeS");
            var sRole = oModel.getProperty("/inRoleS");
            var sEmail = oModel.getProperty("/inEmailS");
            var sAddress = oModel.getProperty("/inAdressS");
            var oDobDate = oModel.getProperty("/inDobS");
            var oDosDateTime = oModel.getProperty("/inDosS");

            var aSelectedResults = this.getView().byId("searchResult").getSelectedKeys();

            if (aSelectedResults && aSelectedResults.length > 0) {
                var aResultFilters = aSelectedResults.map(function (sKey) { return new Filter("outResult", FilterOperator.EQ, sKey); });
                aFilterS.push(new Filter(aResultFilters, false));
            }

            if (sId) { aFilterS.push(new Filter("outId", FilterOperator.EQ, parseInt(sId, 10))); }
            if (sAge) { aFilterS.push(new Filter("outAge", FilterOperator.EQ, parseInt(sAge, 10))); }
            if (sName) { aFilterS.push(new Filter("outName", FilterOperator.Contains, sName)); }
            if (sRole) { aFilterS.push(new Filter("outRole", FilterOperator.Contains, sRole)); }
            if (sEmail) { aFilterS.push(new Filter("outEmail", FilterOperator.Contains, sEmail)); }
            if (sAddress) { aFilterS.push(new Filter("outAddress", FilterOperator.Contains, sAddress)); }
            if (oDobDate) { aFilterS.push(new Filter("outDob", FilterOperator.EQ, oDobDate)); }
            if (oDosDateTime) { aFilterS.push(new Filter("outDos", FilterOperator.EQ, oDosDateTime)); }

            this.getView().byId("dataTable").getBinding("items").filter(aFilterS);
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
                else if (sPath === "Address") { sPath = "outAddress"; }
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
                    name: "fi18n.form.fragment." + sName,
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    if (fInit) { fInit(oDialog); }
                    return oDialog;
                });
            }
            this._mDialogs[sName].then(function (oDialog) { oDialog.open(sPage); });
        },

        handleOpenDialog: function () { this._openDialog("Dialog"); },

    });
});