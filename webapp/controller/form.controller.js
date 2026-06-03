sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/core/Fragment"
], (Controller, JSONModel, MessageToast, Filter, FilterOperator, Sorter, Fragment) => {
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
                    { key: "UX", name: "UX/UI Designer" },
                    { key: "HR", name: "HR Specialist" },
                    { key: "OTH", name: "Others" }
                ],
                Table: [
                    { outResult: "Pass", outId: 1, outName: "Arjun Reddy", outAge: 24, outRole: "Developer", outEmail: "arjun.r@test.com", outAddress: "Hitech City\nHyderabad", outDob: new Date(1999, 10, 15), outDos: new Date(2026, 0, 10, 10, 30, 0) },
                    { outResult: "Fail", outId: 2, outName: "Sarah Connor", outAge: 35, outRole: "Manager", outEmail: "s.connor@test.com", outAddress: "404 Tech Lane\nBangalore", outDob: new Date(1989, 4, 12), outDos: new Date(2026, 1, 14, 14, 45, 0) },
                    { outResult: "Pass", outId: 3, outName: "Vikram Singh", outAge: 28, outRole: "Quality Analyst", outEmail: "vik.singh@test.com", outAddress: "Gachibowli\nHyderabad", outDob: new Date(1996, 2, 8), outDos: new Date(2026, 2, 2, 9, 15, 0) },
                    { outResult: "Pass", outId: 4, outName: "Emily Chen", outAge: 26, outRole: "UX/UI Designer", outEmail: "echen@test.com", outAddress: "101 Art Ave\nPune", outDob: new Date(1998, 7, 21), outDos: new Date(2026, 2, 10, 11, 0, 0) },
                    { outResult: "Fail", outId: 5, outName: "James Holden", outAge: 32, outRole: "System Admin", outEmail: "j.holden@test.com", outAddress: "Sector 5\nNoida", outDob: new Date(1992, 11, 5), outDos: new Date(2026, 3, 5, 16, 20, 0) },
                    { outResult: "Pass", outId: 6, outName: "Anita Desai", outAge: 29, outRole: "HR Specialist", outEmail: "anita.d@test.com", outAddress: "Bandra West\nMumbai", outDob: new Date(1995, 6, 30), outDos: new Date(2026, 3, 18, 10, 5, 0) },
                    { outResult: "Fail", outId: 7, outName: "Rahul Sharma", outAge: 23, outRole: "Intern", outEmail: "rahul.s@test.com", outAddress: "MG Road\nDelhi", outDob: new Date(2001, 1, 14), outDos: new Date(2026, 4, 1, 8, 30, 0) },
                    { outResult: "Pass", outId: 8, outName: "Linda Park", outAge: 41, outRole: "Scrum Master", outEmail: "lpark@test.com", outAddress: "Silicon Park\nChennai", outDob: new Date(1983, 8, 22), outDos: new Date(2026, 4, 15, 13, 10, 0) },
                    { outResult: "Pass", outId: 9, outName: "Omar Farooq", outAge: 27, outRole: "Developer", outEmail: "omar.f@test.com", outAddress: "Jubilee Hills\nHyderabad", outDob: new Date(1997, 3, 10), outDos: new Date(2026, 5, 1, 15, 55, 0) },
                    { outResult: "Pass", outId: 10, outName: "Maria Garcia", outAge: 30, outRole: "Data Scientist", outEmail: "maria.g@test.com", outAddress: "Whitefield\nBangalore", outDob: new Date(1994, 9, 5), outDos: new Date(2026, 5, 12, 17, 40, 0) }
                ],
                SelectedRowPath: "",
                SelectedRow: {}
            };

            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel, "form");
            this._mDialogs = {};

        },

        onSubmit() {
            var oModel = this.getView().getModel("form");

            if (!oModel.getProperty("/inName") || !oModel.getProperty("/inEmail") || !oModel.getProperty("/inDob")) {
                MessageToast.show("Please fill in all required fields (Name, Email, and Date of Birth)!");
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

            var sFinalRole = oModel.getProperty("/inRoleSelected");
            if (sFinalRole === "Others") {
                sFinalRole = oModel.getProperty("/inRoleCustom");
                if (!sFinalRole || sFinalRole.trim() === "") {
                    MessageToast.show("Please specify your custom role!");
                    return;
                }
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
                outId: id,
                outName: oModel.getProperty("/inName"),
                outAge: parseInt(oModel.getProperty("/inAge"), 10),
                outRole: sFinalRole,
                outEmail: oModel.getProperty("/inEmail"),
                outAddress: String(sMergedAddress),
                outDob: oModel.getProperty("/inDob"),
                outDos: oModel.getProperty("/inDos")
            });

            oModel.setProperty("/Table", currentTableData);

            oModel.setProperty("/inName", "");
            oModel.setProperty("/inAge", "");
            oModel.setProperty("/inRoleSelected", "");
            oModel.setProperty("/inRoleCustom", "");
            oModel.setProperty("/inEmail", "");
            oModel.setProperty("/inaddresses", [{ value: "" }]);
            oModel.setProperty("/inResult", "Pass");
            oModel.setProperty("/inDob", null);
            oModel.setProperty("/inDos", null);

            MessageToast.show("Data added successfully!");
        },

        handleValueHelp: function (oEvent) {
            var oView = this.getView();
            this._sValueHelpTriggerId = oEvent.getSource().getId();

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
            var oModel = this.getView().getModel("form");

            if (oSelectedItem) {
                var oContext = oSelectedItem.getBindingContext("form");
                var sRoleName = oContext.getProperty("name");

                if (this._sValueHelpTriggerId && this._sValueHelpTriggerId.includes("inInput3")) {
                    oModel.setProperty("/inRoleS", sRoleName);
                } else {
                    oModel.setProperty("/inRoleSelected", sRoleName);
                }
            }
            oEvent.getSource().getBinding("items").filter([]);
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
                var oFilterRole = new Filter("outRole", FilterOperator.Contains, searchValue);
                var oFilterEmail = new Filter("outEmail", FilterOperator.Contains, searchValue);
                var oFilterAddress = new Filter("outAddress", FilterOperator.Contains, searchValue);

                var oMultiFilter;

                if (!isNaN(searchValue)) {
                    var iNumValue = parseInt(searchValue, 10);
                    var oFilterId = new Filter("outId", FilterOperator.EQ, iNumValue);
                    var oFilterAge = new Filter("outAge", FilterOperator.EQ, iNumValue);

                    oMultiFilter = new Filter([
                        oFilterResult, oFilterName, oFilterId, oFilterAge,
                        oFilterRole, oFilterEmail, oFilterAddress
                    ], false);
                } else {
                    oMultiFilter = new Filter([
                        oFilterResult, oFilterName, oFilterRole,
                        oFilterEmail, oFilterAddress
                    ], false);
                }

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
            var sAddress = oModel.getProperty("/inAdressS");
            var oDobDate = oModel.getProperty("/inDobS");
            var oDosDateTime = oModel.getProperty("/inDosS");

            var aSelectedResults = this.getView().byId("searchResult").getSelectedKeys();

            if (aSelectedResults && aSelectedResults.length > 0) {
                var aResultFilters = aSelectedResults.map(function (sKey) {
                    return new Filter("outResult", FilterOperator.EQ, sKey);
                });
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
                else if (sPath === "Address") { sPath = "outAddress"; }
                else if (sPath === "Date of Birth") { sPath = "outDob"; }
                else if (sPath === "Date and Time of Submission") { sPath = "outDos"; }

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

        onRowPress: function (oEvent) {
            var oItem = oEvent.getParameter("listItem");
            var oModel = this.getView().getModel("form");

            this._sCurrentRowPath = oItem.getBindingContext("form").getPath();

            var oClickedRowData = JSON.parse(JSON.stringify(oModel.getProperty(this._sCurrentRowPath)));
            oModel.setProperty("/SelectedRow", oClickedRowData);

            this.getView().byId("edit").setVisible(true);
            this.getView().byId("save").setVisible(false);
            this.getView().byId("cancel").setVisible(false);

            var aInputIds = ["_IDGenText24", "_IDGenText19", "_IDGenText20", "_IDGenText22", "_IDGenText21", "_IDGenTextArea2", "_IDGenText25", "_IDGenText26"];
            aInputIds.forEach(function (sId) {
                var oControl = this.getView().byId(sId);
                if (oControl) { oControl.setEditable(false); }
            }.bind(this));

            var oNavContainer = this.getView().byId("navCon");
            oNavContainer.to(this.getView().byId("page2"), "slide");
        },

        onNavBackToForm: function () {
            var oNavContainer = this.getView().byId("navCon");
            oNavContainer.to(this.getView().byId("page1"), "show");
        },

        handleEditPress: function () {
            this.getView().byId("edit").setVisible(false);
            this.getView().byId("save").setVisible(true);
            this.getView().byId("cancel").setVisible(true);

            var aInputIds = ["_IDGenText24", "_IDGenText19", "_IDGenText20", "_IDGenText22", "_IDGenText21", "_IDGenTextArea2", "_IDGenText25", "_IDGenText26"];
            aInputIds.forEach(function (sId) {
                var oControl = this.getView().byId(sId);
                if (oControl) { oControl.setEditable(true); }
            }.bind(this));
        },

        handleSavePress: function () {
            var oModel = this.getView().getModel("form");
            var oEditedRow = oModel.getProperty("/SelectedRow");

            if (!oEditedRow.outName || !oEditedRow.outEmail) {
                MessageToast.show("Name and Email are mandatory fields!");
                return;
            }

            if (oEditedRow.outAge) {
                oEditedRow.outAge = parseInt(oEditedRow.outAge, 10);
            }

            oModel.setProperty(this._sCurrentRowPath, oEditedRow);

            this.getView().byId("edit").setVisible(true);
            this.getView().byId("save").setVisible(false);
            this.getView().byId("cancel").setVisible(false);

            var aInputIds = ["_IDGenText24", "_IDGenText19", "_IDGenText20", "_IDGenText22", "_IDGenText21", "_IDGenTextArea2", "_IDGenText25", "_IDGenText26"];
            aInputIds.forEach(function (sId) {
                var oControl = this.getView().byId(sId);
                if (oControl) { oControl.setEditable(false); }
            }.bind(this));

            MessageToast.show("Changes saved successfully!");
        },

        handleCancelPress: function () {
            var oModel = this.getView().getModel("form");

            var oOriginalRowData = JSON.parse(JSON.stringify(oModel.getProperty(this._sCurrentRowPath)));
            oModel.setProperty("/SelectedRow", oOriginalRowData);

            this.getView().byId("edit").setVisible(true);
            this.getView().byId("save").setVisible(false);
            this.getView().byId("cancel").setVisible(false);

            var aInputIds = ["_IDGenText24", "_IDGenText19", "_IDGenText20", "_IDGenText22", "_IDGenText21", "_IDGenTextArea2", "_IDGenText25", "_IDGenText26"];
            aInputIds.forEach(function (sId) {
                var oControl = this.getView().byId(sId);
                if (oControl) { oControl.setEditable(false); }
            }.bind(this));

            MessageToast.show("Editing canceled.");
        },

        handleOpenDialog: function () { this._openDialog("Dialog"); },
        handleOpenDialogFilter: function () { this._openDialog("Dialog", "filter"); },
        handleOpenDialogFilterPreselected: function () { this._openDialog("DialogPreselected", "filter"); },
        handleOpenDialogPresetFilterItems: function () { this._openDialog("DialogPreset", "filter", this._presetFiltersInit); }
    });
});


