sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "sap/m/MessageBox"
], function (ControllerExtension, MessageBox) {
    "use strict";

    return ControllerExtension.extend("project1.ext.controller.ProductsObjectPage", {
        override: {
            /**
             * Initialize the message manager listener to catch all errors
             * and show them in a custom MessageBox.
             */
            onInit: function () {
                var oMessageManager = sap.ui.getCore().getMessageManager();
                var oMessageModel = oMessageManager.getMessageModel();
                var oView = this.getView();
                var oResourceBundle = oView.getModel("i18n").getResourceBundle();

                oMessageModel.bindList("/", undefined, []).attachChange(function (oEvent) {
                    var aMessages = oMessageManager.getMessageModel().getData();
                    // Filter for error messages that haven't been shown in a MessageBox yet
                    var aErrors = aMessages.filter(function (m) {
                        return m.getType() === "Error" && !m.getTechnical() && !m.__shownInMessageBox;
                    });

                    if (aErrors.length > 0) {
                        // Mark as shown to avoid duplicate popups
                        aErrors.forEach(m => m.__shownInMessageBox = true);

                        var sMessage = aErrors.map(m => m.getMessage()).join("\n\n");

                        // Show the bespoke Freestyle-style MessageBox
                        MessageBox.error(sMessage, {
                            title: oResourceBundle.getText("VALIDATION_ERROR_TITLE"),
                            id: "freestyleValidationMessageBox",
                            actions: [oResourceBundle.getText("MANAGE_PRODUCTS"), oResourceBundle.getText("CLOSE")],
                            emphasizedAction: oResourceBundle.getText("MANAGE_PRODUCTS"),
                            onClose: function (sAction) {
                                if (sAction === oResourceBundle.getText("MANAGE_PRODUCTS")) {
                                    oView.getController().getOwnerComponent().getRouter().navTo("ProductsMain");
                                }
                                // Optionally clear messages on close
                                oMessageManager.removeAllMessages();
                            }
                        });
                    }
                });
            },

            editFlow: {
                onBeforeSave: function (mParameters) {
                    // Standard client-side check can stay as a first gatekeeper
                    var oView = this.getView();
                    var oContext = oView.getBindingContext();
                    var oResourceBundle = oView.getModel("i18n").getResourceBundle();

                    var sName = oContext.getProperty("name");
                    var fPrice = oContext.getProperty("unitPrice");

                    if (!sName || (typeof sName === "string" && sName.trim() === "") || fPrice <= 0) {
                        // The MessageManager listener above will handle showing the MessageBox 
                        // if we add a message here, or we can just let it fall through 
                        // and the backend will return the friendly message we mapped.
                        return Promise.resolve();
                    }

                    return Promise.resolve();
                }
            }
        },

        onPostComment: function (oEvent) {
            var oView = this.getView();
            var sComment = oEvent.getParameter("value");
            var oResourceBundle = oView.getModel("i18n").getResourceBundle();

            // Try to find the list by searching all controls if specific IDs fail
            var oList = oView.byId("project1::ProductsObjectPage--commentsList") ||
                oView.byId("commentsList") ||
                sap.ui.getCore().byId(oView.getId() + "--commentsList");

            if (!oList) {
                // Last resort: search by ID suffix
                var aControls = oView.findAggregatedObjects(true, function (oControl) {
                    return oControl.getId && oControl.getId().endsWith("--commentsList");
                });
                if (aControls.length > 0) {
                    oList = aControls[0];
                }
            }

            if (!oList) {
                sap.m.MessageBox.error("Technical Error: Could not locate the comments list control. Please check the console.");
                console.error("Comments list not found. View ID:", oView.getId());
                return;
            }

            var oBinding = oList.getBinding("items");
            if (!oBinding) {
                sap.m.MessageBox.error("Technical Error: List exists but has no binding.");
                return;
            }

            var oContext = oView.getBindingContext();
            var sProductID = oContext.getProperty("ID");

            var oNewContext = oBinding.create({
                "comment": sComment,
                "product_ID": sProductID
            });

            sap.m.MessageToast.show("Posting note...");

            oNewContext.created().then(function () {
                sap.m.MessageToast.show("Note posted successfully!");
            }, function (oError) {
                sap.m.MessageBox.error("Failed to post note: " + (oError.message || "Unknown error"));
                console.error("Post Note Error:", oError);
            });
        }
    });
});
