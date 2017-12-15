sap.ui.controller("vehicle_service_history_inquiry.ext.controller.ListReportExt", {

	onPrintRCTI: function(event){
		
		var documentNumber = event.getParameter("item").getText();
			
		sap.m.URLHelper.redirect("/sap/opu/odata/sap/ZWTY_WARRANTY_CLAIMS_SRV/DocumentSet(DocumentNumber='" + 
			documentNumber + "',DocumentType='RCTI')/$value", true);
			
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
	}
	
});