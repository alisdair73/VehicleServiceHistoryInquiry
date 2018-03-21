sap.ui.controller("vehicle_service_history_inquiry.ext.controller.ListReportExt", {

    onInitSmartFilterBarExtension: function(oEvent){
		this.byId("downloadToExcel").setIcon("sap-icon://excel-attachment");
    },
    
    onAfterRendering: function() {
    	
    	if(this.byId("listReport")._getRowCount() > 0){
    		this.byId("downloadToExcel").setEnabled(true);
    	} else {
    		this.byId("downloadToExcel").setEnabled(false);
    	}
    	
    },
    
	onPrintRCTI: function(event){
		
		var documentNumber = event.getParameter("item").getText();
			
		sap.m.URLHelper.redirect("/sap/opu/odata/sap/ZWTY_WARRANTY_CLAIMS_SRV/DocumentSet(DocumentNumber='" + 
			documentNumber + "',DocumentType='ZSRA',LogResult=true)/$value", true);
			
		var downloadedAttachments = event.getSource().getItems().filter(function(attachment){
			return attachment.getIcon() === "sap-icon://complete" && attachment.getText() !== documentNumber;
		});
			
		if(downloadedAttachments){
			var numberOfDownloadedAttachments = downloadedAttachments.length + 1; //Include this document
			if (event.getSource().getItems().length === numberOfDownloadedAttachments){
				var buttonSource = this.getView().byId(event.getSource().data("buttonId"));
				buttonSource.setIcon("sap-icon://complete");
				buttonSource.setType("Emphasized");
			}
		}
	},
	
	onShowRCTIDocuments: function(event){

		// create menu only once
		 if (!this._RCTIMenu) {
		 	this._RCTIMenu = sap.ui.xmlfragment("vehicle_service_history_inquiry.ext.fragment.RctiMenu", this);
		 	this.getView().addDependent(this._RCTIMenu);
		 }

		var path = event.getSource().getParent().getBindingContext().sPath + "/to_rcti";
		var oItemTemplate = new sap.m.MenuItem({
			"text" : "{companyCode}-{documentNumber}-{fiscalYear}",
			"icon" : "{= ${lastProcessedAt} === '0' ? '':'sap-icon://complete'}",
			"tooltip" : "{= ${lastProcessedAt} === '0' ? '':'RCTI has been downloaded'}"
		});
  
		sap.ui.getCore().byId("RCTIMenu").bindItems(path, oItemTemplate);
		sap.ui.getCore().byId("RCTIMenu").data("buttonId", event.getSource().getId());
		this._RCTIMenu.openBy(event.getSource());
	},
	
	onDownload: function(event){

		var smartTable = this.byId("listReport");
		var parameters = [];
		
		var fDownloadXls = function() {
			
			var oRowBinding = smartTable._getRowBinding();
			if(oRowBinding){
				if (oRowBinding.sSortParams) {
					parameters.push(oRowBinding.sSortParams);
				}
				if (oRowBinding.sFilterParams) {
					parameters.push(oRowBinding.sFilterParams);
				}
				if (oRowBinding.sCustomParams) {
					parameters.push(oRowBinding.sCustomParams);
				}
	
				var sUrl =  "/honda/service_history/excel_download/ZWTY_C_SERVICE_HISTORY?" 
				+ parameters.join("&") + "&$expand=to_claimStatus%2cto_loadStatus";
	
				// check for length of URL -> URLs longer than 2048 chars aren't supported in some browsers (e.g. Internet Explorer)
				if (sUrl && sUrl.length > 2048 && sap.ui.Device.browser.msie) {
					// thrown info to user!
					sap.m.MessageBox.error(sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("DOWNLOAD_TOO_COMPLEX_TEXT"));
					return;
				}
				window.open(sUrl);
			}
		}.bind(this);

		var iRowCount = smartTable._getRowCount();

		if (iRowCount > 10000) {
			sap.m.MessageBox.confirm(sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("DOWNLOAD_CONFIRMATION_TEXT", iRowCount), {
				actions: [
					sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO
				],
				onClose: function(oAction) {
					if (oAction === sap.m.MessageBox.Action.YES) {
						fDownloadXls();
					}
				}
			});
		} else {
			fDownloadXls();
		}
	}	
	
});