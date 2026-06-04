# UI5_Tasks — Complete Code Walkthrough
> **Repo:** `SharathBommera/UI5_Tasks` · Latest commit on `main`  
> **App Title:** Form With I18N Description  
> **Namespace:** `fi18n.form`  
> **UI5 Version:** 1.148.0 · Theme: `sap_horizon`

---

## Project Structure (Quick Map)

```
webapp/
├── Component.js                    ← App entry point
├── manifest.json                   ← App descriptor
├── view/
│   ├── App.view.xml                ← Shell wrapper
│   ├── form.view.xml               ← Main list/table screen
│   ├── AddEditEntry.view.xml       ← Create / View / Edit screen
│   ├── Dialog.fragment.xml         ← Sort dialog (fragment)
│   └── RoleValueHelp.fragment.xml  ← Role selector dialog (fragment)
├── controller/
│   ├── App.controller.js
│   ├── form.controller.js
│   └── AddEditEntry.controller.js
├── model/
│   ├── formatter.js                ← Date/DateTime formatters
│   └── models.js                  ← Device model factory
└── i18n/
    └── i18n.properties             ← Translatable strings
```

---

## 1. manifest.json — The App Descriptor

The manifest is the **single source of truth** for the entire app — identity, libraries, models, routing, and theming. It replaces older approaches like bootstrap attributes or hardcoded rootView in Component.js.

```json
"_version": "1.84.0"
```
Descriptor schema version. Tells the UI5 framework how to interpret this file.

---

### `sap.app` — Application Identity

```json
"id": "fi18n.form"
```
Unique ID of the app — must match the namespace used in all JS modules (`fi18n.form.controller.form`, etc.).

```json
"type": "application"
```
This is a standalone Fiori app (not a library or component).

```json
"i18n": "i18n/i18n.properties"
```
Path to the i18n resource bundle. Used for all translatable texts.

```json
"title": "{{appTitle}}",
"description": "{{appDescription}}"
```
Double-curly syntax means these values are resolved from `i18n.properties` at runtime — not hardcoded.

```json
"sourceTemplate": { "id": "@sap/generator-fiori:basic", "version": "1.24.0" }
```
Metadata from the Fiori App Generator (SAP BAS). No functional impact.

---

### `sap.ui` — UI Technology Settings

```json
"technology": "UI5"
```
States the rendering technology is SAPUI5/OpenUI5.

```json
"deviceTypes": { "desktop": true, "tablet": true, "phone": true }
```
Declares this app is responsive and should run on all device types.

---

### `sap.ui5` — The Core Runtime Configuration

#### `flexEnabled: true`
Opts in to UI Adaptation / Key User Features (SAPUI5 Flexibility). Allows admins to personalize UI at runtime using LREP.

#### `dependencies`
```json
"minUI5Version": "1.148.0",
"libs": { "sap.ui.layout": {}, "sap.m": {}, "sap.ui.core": {} }
```
- `sap.m` — Mobile-first controls (Button, Input, Table, Page, etc.)
- `sap.ui.layout` — Layout controls like SimpleForm, ResponsiveGridLayout
- `sap.ui.core` — Core framework (no UI controls, just services)

#### `contentDensities`
```json
"compact": true, "cozy": true
```
Supports both compact (desktop/mouse) and cozy (touch/tablet) density. The framework picks automatically based on device.

#### `models`
```json
"i18n": {
    "type": "sap.ui.model.resource.ResourceModel",
    "settings": { "bundleName": "fi18n.form.i18n.i18n" }
}
```
Registers the i18n model globally on the component. Any view can bind `{i18n>key}` without creating the model manually.

#### `resources`
```json
"css": [{ "uri": "css/style.css" }]
```
Loads a custom stylesheet for the app.

#### `routing`
This is the **navigation backbone** of the app.

```json
"config": {
    "routerClass": "sap.m.routing.Router",
    "controlAggregation": "pages",
    "controlId": "app",
    "type": "View",
    "viewType": "XML",
    "path": "fi18n.form.view",
    "async": true
}
```
- `sap.m.routing.Router` — Mobile-optimized router with page transitions
- `controlId: "app"` — The `<App>` control in App.view.xml with id="app" acts as the navigation container
- `controlAggregation: "pages"` — Views are placed into the `pages` aggregation of `<App>`
- `async: true` — Views are loaded asynchronously (performance best practice)
- `path: "fi18n.form.view"` — Namespace prefix for all view names

```json
"routes": [
    { "name": "Routeform",  "pattern": "",              "target": ["Targetform"] },
    { "name": "RouteAdd",   "pattern": "add",           "target": ["TargetAddEdit"] },
    { "name": "RouteEdit",  "pattern": "edit/{rowIndex}","target": ["TargetAddEdit"] }
]
```
- `Routeform` — Default route (empty hash `#`) → shows the table list view
- `RouteAdd` — Hash `#add` → shows the Create form
- `RouteEdit` — Hash `#edit/3` → shows the Edit form for row index 3. `{rowIndex}` is a URL parameter

```json
"targets": {
    "Targetform":   { "id": "form",         "name": "form" },
    "TargetAddEdit":{ "id": "AddEditEntry", "name": "AddEditEntry" }
}
```
Maps target names to view files. `name: "form"` resolves to `fi18n.form.view.form` (using the `path` prefix from config).

#### `rootView`
```json
"viewName": "fi18n.form.view.App", "type": "XML", "id": "App", "async": true
```
The very first view that loads. It contains only the `<App>` shell. The router then injects subsequent views into it.

---

## 2. Component.js — Application Bootstrap

```js
sap.ui.define([
    "sap/ui/core/UIComponent",
    "fi18n/form/model/models"
], (UIComponent, models) => {
```
Loads `UIComponent` (the base class for all UI5 apps) and the local `models.js` module.

```js
return UIComponent.extend("fi18n.form.Component", {
    metadata: {
        manifest: "json",
        interfaces: ["sap.ui.core.IAsyncContentCreation"]
    },
```
- `manifest: "json"` — Tells the framework to read all config from `manifest.json` (no hardcoding in Component.js)
- `IAsyncContentCreation` — Async loading interface; prevents the framework from waiting for synchronous instantiation

```js
    init() {
        UIComponent.prototype.init.apply(this, arguments);  // Always call super
        this.setModel(models.createDeviceModel(), "device"); // Register device model
        this.getRouter().initialize();                       // Start routing
    }
```
Three critical lines:
1. `super.init()` triggers manifest parsing, model setup, and root view loading
2. `createDeviceModel()` makes device info (phone/tablet/desktop) available in all views via `{device>/phone}`
3. `initialize()` activates the router so it can match the current URL hash

---

## 3. model/models.js — Device Model Factory

```js
sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/Device"], function (JSONModel, Device) {
    return {
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        }
    };
});
```
`sap.ui.Device` is a built-in object that contains info like `Device.system.phone`, `Device.os.name`, etc.  
`OneWay` binding means the view reads device data but cannot write back to it (sensible — you can't change the device from a form).

---

## 4. model/formatter.js — Custom Formatter Functions

Formatters are pure functions used in XML bindings to transform raw model data into display strings.

```js
sap.ui.define(["sap/ui/core/format/DateFormat"], function (DateFormat) {
    return {
```

**`formatDate`**
```js
formatDate: function (oDate) {
    if (!oDate) { return ""; }
    var oDateTimeInstance = DateFormat.getDateInstance({ pattern: "dd-MMM-yyyy" });
    return oDateTimeInstance.format(new Date(oDate));
}
```
- Receives a raw Date object from the model
- Returns a formatted string like `15-Nov-1999`
- Guards against null/undefined with `if (!oDate) return ""`

**`formatDateTime`**
```js
formatDateTime: function (oDate) {
    if (!oDate) { return ""; }
    var oDateTimeInstance = DateFormat.getDateTimeInstance({ pattern: "dd/MM/yyyy HH:mm:ss" });
    return oDateTimeInstance.format(new Date(oDate));
}
```
Same pattern but uses `getDateTimeInstance` for full timestamp formatting like `10/01/2026 10:30:00`.

**How it's used in the view:**
```xml
core:require="{formatter: 'fi18n/form/model/formatter'}"
...
<Text text="{path: 'form>outDob', formatter: 'formatter.formatDate'}" />
```
`core:require` injects the formatter object into the view scope so it can be referenced by name.

---

## 5. i18n/i18n.properties

```properties
appTitle=Form With I18N Description
appDescription=An SAP Fiori application.
name=Enter Name
age=Enter Age
role=Enter Role
email=Enter Email
submit=Submit1
OutputText=My name is {0}, my age is {1}, and my role is {2}. My email is {3}.
```
- Keys like `appTitle` are referenced in manifest.json as `{{appTitle}}`
- Keys like `name` can be used in views as `{i18n>name}`
- `{0}`, `{1}` are positional placeholders for parameterized messages

---

## 6. App.view.xml — Shell Container

```xml
<mvc:View controllerName="fi18n.form.controller.App" displayBlock="true"
    xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m" xmlns:l="sap.ui.layout" height="100%">
    <App id="app">
    </App>
</mvc:View>
```
This is the outer shell. The `<App>` control with `id="app"` is what the router targets (matching `controlId: "app"` in manifest routing config). The router dynamically injects the page views into its `pages` aggregation.  
The App controller (`App.controller.js`) is minimal — just an empty `onInit`.

---

## 7. form.view.xml — Main Table Screen

This is the primary screen showing a list of records with filter, search, and sort capabilities.

### View Declaration
```xml
<mvc:View controllerName="fi18n.form.controller.form"
    xmlns:t="sap.ui.table"
    xmlns:l="sap.ui.layout"
    xmlns:form="sap.ui.layout.form"
    xmlns:f="sap.f"
    xmlns:fb="sap.ui.comp.filterbar"
    core:require="{formatter: 'fi18n/form/model/formatter'}">
```
Multiple XML namespaces are declared. `core:require` loads the formatter synchronously into the view scope.

### DynamicPage Layout
```xml
<f:DynamicPage id="page1">
```
`sap.f.DynamicPage` is a Fiori 3 layout control with a collapsible header and sticky title. It has three zones: `title`, `header`, and `content`.

### FilterBar (Header Section)
```xml
<fb:FilterBar id="filterbar" persistencyKey="myPersKey" search=".onSearchTop" useToolbar="false">
```
`sap.ui.comp.FilterBar` is a Smart Controls filterbar.
- `persistencyKey` — Saves filter variant state (tied to SmartVariantManagement)
- `search=".onSearchTop"` — Fires when the user clicks "Go"
- `useToolbar="false"` — Hides the integrated toolbar (external toolbar is used instead)

Each filter field is a `FilterGroupItem`:
```xml
<fb:FilterGroupItem name="Result" label="Result" groupName="FormGroup" visibleInFilterBar="true">
    <fb:control>
        <MultiComboBox id="searchResult">
            <core:Item key="Pass" text="Pass"/>
            <core:Item key="Fail" text="Fail"/>
        </MultiComboBox>
    </fb:control>
</fb:FilterGroupItem>
```
- Fields like `ID`, `Name`, `Email` use `Input` bound to `{form>/inIdS}` etc. in the model
- `Age`, `Role`, `Address`, `Date of Birth`, `Date of Submission` are `visible="false"` — they appear in "Adapt Filters" but not by default
- The Date fields use `sap.ui.model.type.Date` and `sap.ui.model.type.DateTime` for type-safe binding

### Toolbar (Content Section)
```xml
<SearchField search=".onSearch" />
<Button icon="sap-icon://sorting-ranking" press=".handleOpenDialog"/>
<Button icon="sap-icon://add" text="Add New Entry" type="Emphasized" press=".onAddNavPress"/>
```
- `SearchField` — free-text search across multiple columns
- Sort button — opens `Dialog.fragment.xml` (ViewSettingsDialog)
- Add button — navigates to `RouteAdd`

### Table
```xml
<Table items="{form>/Table}" id="dataTable" itemPress=".onRowPress">
```
`sap.m.Table` bound to the `Table` array in the JSON model. `itemPress` fires when a row is clicked.

Columns are defined as `<Column>` headers; each row is a `<ColumnListItem>` with `type="Active"` (enables press event).

**Expression Binding for icons:**
```xml
<core:Icon
    src="{= ${form>outResult} === 'Pass' ? 'sap-icon://accept' : 'sap-icon://decline'}"
    color="{= ${form>outResult} === 'Pass' ? 'Positive' : 'Negative'}"/>
```
A ternary expression inside `{= }` — renders a green checkmark for Pass, red X for Fail.

**Formatter binding:**
```xml
<Text text="{path: 'form>outDob', formatter: 'formatter.formatDate'}" />
```
Uses the formatter loaded via `core:require` to display the date in human-readable form.

---

## 8. AddEditEntry.view.xml — Create / View / Edit Screen

This single view handles three modes: **Create**, **View** (read-only), and **Edit** — controlled by `isCreateMode` and `isEditMode` booleans in the model.

### Page Header
```xml
<Page title="{= ${form>/isCreateMode} ? 'Create New Record' : 'Person Details' }"
      showNavButton="true" navButtonPress=".onNavBack">
```
Dynamic title using expression binding — changes based on mode.

```xml
<Button text="Edit"   press=".handleEditPress"  visible="{= !${form>/isCreateMode} && !${form>/isEditMode} }"/>
<Button text="Save"   press=".handleSavePress"  visible="{form>/isEditMode}"/>
<Button text="Cancel" press=".handleCancelPress" visible="{form>/isEditMode}"/>
```
Three buttons in header, each conditionally visible:
- **Edit** — shown only in View mode (not create, not editing)
- **Save/Cancel** — shown only when `isEditMode = true`

### SimpleForm
```xml
<form:SimpleForm layout="ResponsiveGridLayout" editable="{= ${form>/isCreateMode} || ${form>/isEditMode} }">
```
`editable` is an expression — form fields become editable only in Create or Edit mode.

**ID field (View mode only):**
```xml
<Label text="ID" visible="{= !${form>/isCreateMode} }"/>
<Text text="{form>/SelectedRow/outId}" visible="{= !${form>/isCreateMode} }"/>
```
Hidden during Create (no ID yet); shown in View/Edit.

**Role with Value Help:**
```xml
<Input id="F-RoleAddEdit" value="{form>/SelectedRow/outRole}"
       showValueHelp="{= ${form>/isCreateMode} || ${form>/isEditMode} }"
       valueHelpRequest=".handleValueHelp"/>
```
The value help icon (F4) only appears in edit modes.

**Conditional "Specify New Role" field:**
```xml
<Label text="Specify New Role" visible="{= ${form>/SelectedRow/outRole} === 'Others' }"/>
<Input value="{form>/SelectedRow/outRoleCustom}" visible="{= ${form>/SelectedRow/outRole} === 'Others' }"/>
```
Appears dynamically when user selects "Others" from the role dropdown.

**Dynamic address list:**
```xml
<VBox items="{form>/SelectedRow/inaddresses}">
    <items>
        <HBox alignItems="Center">
            <TextArea value="{form>value}" rows="2" width="300px"/>
            <Button icon="sap-icon://delete" press=".onRemoveAddress"
                    visible="{= ${form>/isCreateMode} || ${form>/isEditMode} }"/>
        </HBox>
    </items>
</VBox>
<Button icon="sap-icon://add" press=".onAddAddress"/>
```
Address is an array of `{value: "..."}` objects. Each entry renders a TextArea + Delete button. The Add Address button appends a new empty entry.

**Submit button (Create mode only):**
```xml
<Button text="Submit" press=".onSubmitEntry" visible="{form>/isCreateMode}"/>
```

---

## 9. Dialog.fragment.xml — Sort Dialog

```xml
<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core">
    <ViewSettingsDialog id="_IDGenViewSettingsDialog1" confirm=".handleConfirm">
        <sortItems>
            <ViewSettingsItem text="ID" key="ID" selected="true"/>
            <ViewSettingsItem text="Name" key="Name"/>
            ...
        </sortItems>
    </ViewSettingsDialog>
</core:FragmentDefinition>
```
`sap.m.ViewSettingsDialog` is a standard SAP dialog for sort/filter/group settings. Here only `sortItems` are defined. `confirm=".handleConfirm"` fires when user confirms a sort selection.

---

## 10. RoleValueHelp.fragment.xml — Role Selector

```xml
<SelectDialog title="Select Role" noDataText="No Roles Found"
              search=".onRoleValueHelpSearch" confirm=".onRoleValueHelpConfirm"
              items="{path: 'form>/roles'}">
    <StandardListItem type="Active"
                      title="{form>name}" description="{form>key}"
                      icon="sap-icon://person-placeholder"/>
</SelectDialog>
```
`sap.m.SelectDialog` renders a searchable list of roles.
- `items` is bound to `form>/roles` array in the JSON model
- Each item shows the role name as title and the key (DEV, MGR, etc.) as description
- Search triggers `onRoleValueHelpSearch`; confirming a selection triggers `onRoleValueHelpConfirm`

---

## 11. form.controller.js — Main List Controller

### `onInit()`
Sets up the entire JSON model with form data and sample table rows.

```js
var oData = {
    inResult: "Pass", inName: "", inAge: "", ...  // form input defaults
    inResultS: "", inIdS: "", inNameS: "", ...      // filter bar search fields
    roles: [{ key: "DEV", name: "Developer" }, ...], // role master data
    Table: [                                          // initial 10 sample rows
        { outResult: "Pass", outId: 1, outName: "Arjun Reddy", outAge: 24, ... },
        ...
    ],
    SelectedRow: { outId: "", outResult: "Pass", outName: "", ... },
    isEditMode: false,
    isCreateMode: true
};
```

```js
var oComponent = this.getOwnerComponent();
if (!oComponent.getModel("form")) {
    var oModel = new JSONModel(oData);
    oComponent.setModel(oModel, "form");
}
```
The model is set **on the component** (not the view) so it's shared across all views in the app — `AddEditEntry` reads the same "form" model.

The `if (!oComponent.getModel("form"))` guard prevents re-initializing the model if the user navigates back to this view.

### `onAddNavPress()`
```js
this.getOwnerComponent().getRouter().navTo("RouteAdd");
```
Navigates to the Add route (hash becomes `#add`).

### `onRowPress()`
```js
var sRowPath = oItem.getBindingContext("form").getPath(); // e.g. /Table/2
var sIndex = sRowPath.split("/").pop();                   // "2"
this.getOwnerComponent().getRouter().navTo("RouteEdit", { rowIndex: sIndex });
```
Extracts the row index from the binding path and passes it as a URL parameter.

### `handleValueHelp()` / `onRoleValueHelpSearch()` / `onRoleValueHelpConfirm()`
Lazily loads `RoleValueHelp.fragment.xml` using `Fragment.load()`. The dialog is cached in `this._oRoleValueHelpDialog` to avoid re-loading. On confirm, sets `/inRoleS` (search filter field) in the model.

### `onSearch()` — SearchField handler
```js
var oMultiFilter = new Filter([oFilterResult, oFilterName, ...], false);
// false = OR logic (any field can match)
```
Applies OR filters across Result, Name, Role, Email, Address. For numeric input, also filters by ID and Age with exact match (`FilterOperator.EQ`).

### `onSearchTop()` — FilterBar "Go" handler
Reads all filter field values from the model and builds individual `Filter` objects. All active filters are combined with AND logic (default when pushing into an array).

### `handleConfirm()` — Sort confirm
```js
var sPath = mParams.sortItem.getText(); // e.g. "Name"
if (sPath === "Name") { sPath = "outName"; }
// ... maps display label to model property
aSorters.push(new Sorter(sPath, bDescending));
oBinding.sort(aSorters);
```
Maps the user-visible column label to the actual model property name, then applies the sorter to the table binding.

### `_openDialog()` — Fragment loader utility
```js
_openDialog: function (sName, sPage, fInit) {
    if (!this._mDialogs[sName]) {
        this._mDialogs[sName] = Fragment.load({...}).then(function (oDialog) {
            oView.addDependent(oDialog);
            if (fInit) { fInit(oDialog); }
            return oDialog;
        });
    }
    this._mDialogs[sName].then(function (oDialog) { oDialog.open(sPage); });
}
```
A reusable lazy-load pattern for fragments. `_mDialogs` is a map keyed by fragment name. Promise is stored so re-opens skip the load step.

---

## 12. AddEditEntry.controller.js — Create/View/Edit Controller

### `onInit()`
```js
oRouter.getRoute("RouteAdd").attachPatternMatched(this._onRouteAddMatched, this);
oRouter.getRoute("RouteEdit").attachPatternMatched(this._onRouteEditMatched, this);
```
Attaches route-specific handlers instead of a generic `routeMatched` event. This is the correct pattern in multi-view apps.

### `_onRouteAddMatched()`
```js
oModel.setProperty("/isCreateMode", true);
oModel.setProperty("/isEditMode", false);
oModel.setProperty("/SelectedRow", { outId: "", outResult: "Pass", ... });
```
Resets the SelectedRow to a blank template and sets Create mode flags.

### `_onRouteEditMatched()`
```js
var sIndex = oEvent.getParameter("arguments").rowIndex;  // URL param
this._sCurrentRowPath = "/Table/" + sIndex;              // Save for Save handler

var oOriginalRowData = JSON.parse(JSON.stringify(         // Deep clone
    oModel.getProperty(this._sCurrentRowPath)
));
```
Deep clone prevents mutating the original table row while the user is editing.

```js
if (oOriginalRowData.outDob) {
    oOriginalRowData.outDob = new Date(oOriginalRowData.outDob);
}
```
Dates stored in JSON models may lose their `Date` type. They're restored here.

```js
// Convert newline-separated address string → array of {value}
oOriginalRowData.inaddresses = oOriginalRowData.outAddress.split("\n").map(
    sAddr => ({ value: sAddr })
);
```
The address is stored as a single `\n`-delimited string in the table but needs to be an array for the dynamic address VBox in the form.

```js
// Detect "Others" role
var bIsStandard = aRoles.some(r => r.name === oOriginalRowData.outRole);
if (!bIsStandard && oOriginalRowData.outRole) {
    oOriginalRowData.outRoleCustom = oOriginalRowData.outRole;
    oOriginalRowData.outRole = "Others";
}
```
If the stored role isn't in the standard list, it must be a custom "Others" role — so it's split into the standard key ("Others") and the custom text.

### `onNavBack()`
```js
var sPreviousHash = History.getInstance().getPreviousHash();
if (sPreviousHash !== undefined) {
    window.history.go(-1);
} else {
    this.getOwnerComponent().getRouter().navTo("Routeform", {}, true);
}
```
Uses browser history if available. Falls back to explicit navigation to the list view for direct-URL access.

### `onAddAddress()` / `onRemoveAddress()`
```js
// Add: push new empty entry
aAddresses.push({ value: "" });

// Remove: get index from binding path, splice
var iIndex = parseInt(sPath.split("/").pop(), 10);
aAddresses.splice(iIndex, 1);
```

### `_processFormSaving()` — Shared pre-save logic
```js
// Convert address array → single string
var aValidTexts = aAddrRows
    .map(item => item.value)
    .filter(t => t && t.trim().length > 0);
oTargetData.outAddress = aValidTexts.join("\n");

// Handle "Others" role
if (oTargetData.outRole === "Others") {
    if (!oTargetData.outRoleCustom || oTargetData.outRoleCustom.trim() === "") {
        MessageToast.show("Please specify custom role!");
        return null;  // null = abort save
    }
    oTargetData.outRole = oTargetData.outRoleCustom;
}
```
This function is called by both `onSubmitEntry` and `handleSavePress` to avoid code duplication.

### `onSubmitEntry()` — Create new record
```js
if (!oNewData.outName || !oNewData.outEmail) {
    MessageToast.show("Please fill required fields!");
    return;
}
var oValidatedData = this._processFormSaving(oNewData);
if (!oValidatedData) { return; }

oValidatedData.outId = aTableData.length + 1;  // Auto-generate ID
aTableData.push(oValidatedData);
oModel.setProperty("/Table", aTableData);

MessageToast.show("Data added successfully!");
this.onNavBack();
```

### `handleSavePress()` — Update existing record
```js
oModel.setProperty(this._sCurrentRowPath, oValidatedData); // Write back to Table[n]
oModel.setProperty("/isEditMode", false);
MessageToast.show("Row updates saved successfully!");
this.onNavBack();
```

### `handleCancelPress()`
```js
handleCancelPress: function () { this.onNavBack(); }
```
Simply navigates back — the original data is still in the Table (the SelectedRow was a clone).

---

## Summary: Key Design Decisions

| Decision | Why |
|---|---|
| Model on component, not view | Shared state across form + list views |
| Deep clone in `_onRouteEditMatched` | Prevent live mutation of table data |
| `_processFormSaving()` helper | DRY — used by both Create and Edit flows |
| `Fragment.load()` with caching | Lazy-load dialogs once, reuse on re-open |
| Expression bindings (`{= ... }`) | Mode-driven UI without controller logic |
| Formatter via `core:require` | Clean separation of display logic |
| `History.getInstance()` in back nav | Handles both in-app and direct-URL scenarios |
| FilterBar `persistencyKey` | Enables variant management for filter state |
