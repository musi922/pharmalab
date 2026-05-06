sap.ui.define(
    [
      "./BaseController",
      "sap/ui/model/json/JSONModel",
      "sap/ui/model/Filter",
      "sap/ui/model/FilterOperator",
      "sap/m/MessageToast"
    ],
    function (BaseController, JSONModel, Filter, FilterOperator, MessageToast) {
      "use strict";

      return BaseController.extend("com.moyo.demo.myfiorielementsproject.controller.Main", {
        onInit: function () {
        },

        onSearch: function (oEvent) {
          const aFilters = [];
          const sQuery = oEvent.getParameter("query");
          if (sQuery && sQuery.length > 0) {
            const filter = new Filter("Name", FilterOperator.Contains, sQuery);
            aFilters.push(filter);
          }

          const oTable = this.byId("mainTable");
          const oBinding = oTable.getBinding("items");
          oBinding.filter(aFilters, "Application");
        },

        onAddPress: function () {
          MessageToast.show("Add action triggered");
        },

        onSortPress: function () {
          MessageToast.show("Sort action triggered");
        }
      });
    }
  ); 