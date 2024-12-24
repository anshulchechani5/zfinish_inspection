sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, Filter, FilterOperator, Fragment, JSONModel) {
        "use strict";

        return Controller.extend("zfinishinspection.controller.Finish_Inspection", {
            onInit: function () {
                var dt = new Date();
                var dt1 = dt.getDate() + '-' + Number(dt.getMonth() + 1) + '-' + dt.getFullYear();
                var dt2 = dt1.split("-")

                if (dt2[1].length != 2) {
                    var dt3 = dt2[0] + "-" + 0 + dt2[1] + "-" + dt2[2]
                } else {
                    dt3 = dt2
                }
                var oInputForPostDt = this.getView().byId("PostingDate");
                oInputForPostDt.setValue(dt3)
                // Created by Mr.Dev
                this.getView().setModel(new sap.ui.model.json.JSONModel(), "oTableDataModel");
                this.getView().getModel("oTableDataModel").setProperty("/aTableData", []);

                var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZTROLLY_TF_BIN")
                this.getView().setModel(new sap.ui.model.json.JSONModel(), "oSetnoModel")
                var oInput = this.getView().byId("StocLoc"); 
                var oInput1 = this.getView().byId("ReceivingSloc");
                oInput.setValue("FN01");
                oInput1.setValue("INS1"); 
                oModel.read("/Set_No", {
                    urlParameters:{
                        "$top" : "50000"
                    },
                    success: function(oresponse){
                        this.getView().getModel("oSetnoModel").setProperty("/aSetno", oresponse.results)
                    }.bind(this)
                })
            },
            SetNumbersFunction: function () {
                var oModel = this.getView().getModel();
                var SetNum = this.getView().byId("SetNumber").getValue();
                var StocLoc = this.getView().byId("StocLoc").getValue();
                var aNewArr = [];
                var oFilter = new sap.ui.model.Filter("SetNo", "EQ", SetNum);
                var oFilter1 = new sap.ui.model.Filter("StorageLocation", "EQ", StocLoc);

                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Fetching Data",
                    text: "Please wait",
                });
                oBusyDialog.open();

                oModel.read("/Ztrolly", {
                    filters: [oFilter, oFilter1],
                    success: function (oresponse) {
                        oresponse.results.map(function (items) {
                            var obj = {
                                // "Check": "Devendra", 
                                "Plant": items.Plant,
                                "Material": items.Material,
                                "StorageLocation": items.StorageLocation,
                                "ProductDescription": items.ProductDescription,
                                "Batch": items.Batch,
                                "MatlWrhsStkQtyInMatlBaseUnit": items.MatlWrhsStkQtyInMatlBaseUnit,
                                "MaterialBaseUnit": items.MaterialBaseUnit,
                                "SDDocument": items.SDDocument,
                                "SDDocumentItem": items.SDDocumentItem,
                                "SetNo": items.SetNo,
                                "Remark": items.Remark === undefined ? "" : items.Remark,
                            }
                            aNewArr.push(obj);
                        })
                        this.getView().getModel("oTableDataModel").setProperty("/aTableData", aNewArr)
                        oBusyDialog.close();
                        this.EmptyRowCount();

                        // MessageBox.show("Data Saved Successfully", {
                        //     title: "Warning!!!!!!",
                        //     icon: MessageBox.Icon.SUCCESS
                        // });
                    }.bind(this),
                    error: function (error) {
                        oBusyDialog.close();
                        MessageBox.show("Data Not Saved Successfully", {
                            title: "Warning!!!!!!",
                            icon: MessageBox.Icon.ERROR
                        });
                    }

                })

            },
            DeletaTableData: function (oEvent) {
                var aNewArr = [];
                var aIndices = this.byId("table1").getSelectedIndices();
                var aIndices11 = [];
                var len = aIndices.length;
                if (len === 0) {
                    MessageBox.show("Choose at Least One Row", {
                        title: "Warning",
                        icon: MessageBox.Icon.ERROR
                    });
                }
                else {
                    var oTableModel = this.getView().getModel("oTableDataModel");
                    var aTableArr = oTableModel.getProperty("/aTableData");

                    for (var i = 0; i < aIndices.length; i++) {
                        aNewArr.push(aTableArr[aIndices[i]]);
                    }
                    aNewArr.map(function (item) {
                        var Material = item.Material;
                        var Batch = item.Batch;
                        var MatlWrhsStkQtyInMatlBaseUnit = item.MatlWrhsStkQtyInMatlBaseUnit;
                        var StorageLocation = item.StorageLocation;
                        var ProductDescription = item.ProductDescription;
                        var MaterialBaseUnit = item.MaterialBaseUnit;
                        var SDDocument = item.SDDocument;
                        var SDDocumentItem = item.SDDocumentItem;
                        var SetNo = item.SetNo;
                        var Remark = item.Remark;
                        var Plant = item.Plant;

                        var iIndex = "";
                        aTableArr.map(function (item, index) {
                            if (Material === item.Material && Batch === item.Batch && MatlWrhsStkQtyInMatlBaseUnit === item.MatlWrhsStkQtyInMatlBaseUnit && StorageLocation === item.StorageLocation &&
                                ProductDescription === item.ProductDescription
                                && MaterialBaseUnit === item.MaterialBaseUnit && SDDocument === item.SDDocument
                                && Plant === item.Plant && SDDocumentItem === item.SDDocumentItem && SetNo === item.SetNo && Remark === item.Remark) {
                                iIndex = index;
                            }
                        })
                        aTableArr.splice(iIndex, 1);
                    })
                    var arr2 = aIndices.map(function (entry) {
                        return entry + 1;
                    });
                    MessageBox.show("The Row you Deleted is " + arr2, {
                        title: "Warning",
                        icon: MessageBox.Icon.SUCCESS
                    });
                    oTableModel.setProperty("/aTableItem", aTableArr)

                    this.EmptyRowCount();
                }

            },
            SaveTableData: function () {
                var PostingDate = this.getView().byId("PostingDate").getValue();
                var OperatorName = this.getView().byId("OperatorName").getValue();
                var FinishMc = this.getView().byId("FinishMc").getValue();
                var TrollyNumber = this.getView().byId("TrollyNumber").getValue();
                var HeaderRemark = this.getView().byId("HeaderRemark").getValue();
                var DataEntryOperator = this.getView().byId("DataEntryOperatorID").getValue();
                var StocLoc = this.getView().byId("StocLoc").getValue();
                var ReceivingSloc = this.getView().byId("ReceivingSloc").getValue();
                var NoOfPieces = this.getView().byId("NoOfPieces").getValue();
                var TotalQty = this.getView().byId("TotalQty").getValue();
                var Shift = this.getView().byId("Shift").getValue();
                var SetNumber = this.getView().byId("SetNumber").getValue();
                var oBusyDialog = new sap.m.BusyDialog({
                    title: "Saving Data",
                    text: "Please wait"
                });
                oBusyDialog.open();
                var Finish_Inspection_Table_Data = [];
                var aIndices = this.byId("table1").getSelectedIndices();
                var TableModelRemark = this.getView().getModel("oTableDataModel").getProperty("/aTableData");
                var oTableModel = this.getView().getModel("oTableDataModel");
                var aTableArr = oTableModel.getProperty("/aTableData");
                for (var i = 0; i < aIndices.length; i++) {
                    var newVar = TableModelRemark[aIndices[i]].Remark;
                    if( newVar === "" ){
                        break;

                    }
                    else{
                        Finish_Inspection_Table_Data.push(aTableArr[aIndices[i]]);
                        
                    }
                }
                var url = "/sap/bc/http/sap/zpp_trolly_tf_http?sap-client=080";
                if ( Finish_Inspection_Table_Data.length === 0 && newVar != "" ) {
                    oBusyDialog.close();
                    // MessageBox.show("Devsa Rathor", {
                    MessageBox.show("Choose at Least One Row", {
                        title: "Warning",
                        icon: MessageBox.Icon.ERROR
                    });
                }
                else if( newVar === "" ){
                    oBusyDialog.close();
                    MessageBox.show("Please Enter The Remark field of the selected row of the table ", {
                        title: "Warning",
                        icon: MessageBox.Icon.ERROR
                    });
                }
                else if (PostingDate === "" || OperatorName === "" || FinishMc === "" || TrollyNumber === "" || HeaderRemark === "" || DataEntryOperator === "" || StocLoc === "" || ReceivingSloc === "" || NoOfPieces === "" || TotalQty === "" || Shift === "" || SetNumber === "") {
                    oBusyDialog.close();
                    if (PostingDate === "") {
                        this.getView().byId("PostingDate").setValueState("Error");
                        this.getView().byId("PostingDate").setValueState("Please Enter Posting Date");
                    }
                    if (OperatorName === "") {
                        this.getView().byId("OperatorName").setValueState("Error");
                        this.getView().byId("OperatorName").setValueState("Please Enter Orerator Name");
                    }
                    if (FinishMc === "") {
                        this.getView().byId("FinishMc").setValueState("Error");
                        this.getView().byId("FinishMc").setValueState("Please Enter Finish Mc");
                    }
                    if (TrollyNumber === "") {
                        this.getView().byId("TrollyNumber").setValueState("Error");
                        this.getView().byId("TrollyNumber").setValueState("Please Enter Trolly Number");
                    }
                    if (HeaderRemark === "") {
                        this.getView().byId("HeaderRemark").setValueState("Error");
                        this.getView().byId("HeaderRemark").setValueState("Please Enter Header Remark");
                    }
                    if (DataEntryOperator === "") {
                        this.getView().byId("DataEntryOperator").setValueState("Error");
                        this.getView().byId("DataEntryOperator").setValueState("Please Enter Data Entry Operator");
                    }
                    if (StocLoc === "") {
                        this.getView().byId("StocLoc").setValueState("Error");
                        this.getView().byId("StocLoc").setValueState("Please Enter Storage Location");
                    }
                    if (ReceivingSloc === "") {
                        this.getView().byId("ReceivingSloc").setValueState("Error");
                        this.getView().byId("ReceivingSloc").setValueState("Please Enter Receiving Storage Location");
                    }
                    if (NoOfPieces === "") {
                        this.getView().byId("NoOfPieces").setValueState("Error");
                        this.getView().byId("NoOfPieces").setValueState("Please Enter No of Pieces");
                    }
                    if (TotalQty === "") {
                        this.getView().byId("TotalQty").setValueState("Error");
                        this.getView().byId("TotalQty").setValueState("Please Enter Total Qty");
                    }
                    if (Shift === "") {
                        this.getView().byId("Shift").setValueState("Error");
                        this.getView().byId("Shift").setValueState("Please Select Shift");
                    }
                    if (SetNumber === "") {
                        this.getView().byId("SetNumber").setValueState("Error");
                        this.getView().byId("SetNumber").setValueState("Please Enter Set Number");
                    }
                }
                else {
                    $.ajax({
                        type: "post",
                        url: url,
                        data: JSON.stringify({
                            tabledata: Finish_Inspection_Table_Data,
                            // headerData: MyArray,
                            PostingDate: this.getView().byId("PostingDate").getValue(),
                            OperatorName: this.getView().byId("OperatorName").getValue(),
                            FinishMc: this.getView().byId("FinishMc").getValue(),
                            TrollyNumber: this.getView().byId("TrollyNumber").getValue(),
                            HeaderRemark: this.getView().byId("HeaderRemark").getValue(),
                            DataEntryOperator: this.getView().byId("DataEntryOperatorID").getValue(),
                            StocLoc: this.getView().byId("StocLoc").getValue(),
                            ReceivingSloc: this.getView().byId("ReceivingSloc").getValue(),
                            NoOfPieces: this.getView().byId("NoOfPieces").getValue(),
                            TotalQty: this.getView().byId("TotalQty").getValue(),
                            Shift: this.getView().byId("Shift").getValue(),
                            SetNumber: this.getView().byId("SetNumber").getValue(),
                        }),
                        contentType: "application/json; charset=utf-8",
                        traditional: true,
                        success: function (data) {
                            oBusyDialog.close();
                            var create=data.split(' ').slice(0, 1)[0];
                            if( create === 'ERROR'){
                                MessageBox.error(data);
                            }
                            else{
                            MessageBox.alert( data , {
                                onClose: function (oAction) {
                                    if (oAction === MessageBox.Action.OK) {
                                         window.location.reload();
                                    }
                                }});
                              }
                        }.bind(this),
                        error: function (error) {
                            oBusyDialog.close();
                            MessageBox.show("error", {
                                title: "Warning",
                                icon: MessageBox.Icon.ERROR
                            });
                        }

                    });
                }
            },
            OperatorNamehandlef4: function () {
                var oView = this.getView();

                if (!this._pValueHelpDialog) {
                    this._pValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "zfinishinspection.fragments.OperatorName",
                        controller: this
                    }).then(function (oValueHelpDialog) {
                        oView.addDependent(oValueHelpDialog);
                        return oValueHelpDialog;
                    });
                }
                this._pValueHelpDialog.then(function (oValueHelpDialog) {
                    // this._configValueHelpDialog();
                    oValueHelpDialog.open();
                }.bind(this));
            },
            handleValueHelpClose: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem"),
                    oInput = this.byId("OperatorName");

                if (!oSelectedItem) {
                    oInput.resetProperty("value");
                    return;
                }

                oInput.setValue(oSelectedItem.getCells()[3].getTitle());
                this.getView().byId("OperatorName").setValueState("None");
            },
            handleSearch: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter("Empname", FilterOperator.Contains, sValue);
                var oBinding = oEvent.getSource().getBinding("items");
                oBinding.filter([oFilter]);
            },
            DataEntryOperatorhandlef4: function (oEvent) {
                var oView = this.getView();

                if (!this._pValueHelpDialog11) {
                    this._pValueHelpDialog11 = Fragment.load({
                        id: oView.getId(),
                        name: "zfinishinspection.fragments.DataEntryOperator",
                        controller: this
                    }).then(function (oValueHelpDialog11) {
                        oView.addDependent(oValueHelpDialog11);
                        return oValueHelpDialog11;
                    });
                }
                this._pValueHelpDialog11.then(function (oValueHelpDialog11) {
                    // this._configValueHelpDialog();
                    oValueHelpDialog11.open();
                }.bind(this));
            },
            handleValueHelpCloseforDataEntryOperator: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem"),
                    oInput1 = this.byId("DataEntryOperatorID");

                if (!oSelectedItem) {
                    oInput1.resetProperty("value");
                    return;
                }

                oInput1.setValue(oSelectedItem.getCells()[3].getTitle());
            },



            EmptyRowCount: function () {
                var oTableData = this.getView().getModel("oTableDataModel").getProperty("/aTableData");
                var ArrayVar = [];
                oTableData.map(function (items) {
                    var QuantityVar = parseInt(items.MatlWrhsStkQtyInMatlBaseUnit);
                    var QuantVar = QuantityVar == NaN ? 0 : QuantityVar;
                    ArrayVar.push(QuantVar);

                })
                var totalSum = 0;
                var arrayLen1 = ArrayVar.length;
                var arrayLen2 = arrayLen1 - 1;
                for (var i = 0; i < arrayLen1; i++) {
                    totalSum += ArrayVar[i];
                }
                var oInputForTotalPieces = this.getView().byId("NoOfPieces");
                oInputForTotalPieces.setValue(arrayLen1)
                var oInputForTotalQty = this.getView().byId("TotalQty");
                oInputForTotalQty.setValue(totalSum)

            },

            ValidateErrorFun: function () {
                var PostingDate = this.getView().byId("PostingDate").getValue();
                var OperatorName = this.getView().byId("OperatorName").getValue();
                var FinishMc = this.getView().byId("FinishMc").getValue();
                var TrollyNumber = this.getView().byId("TrollyNumber").getValue();
                var HeaderRemark = this.getView().byId("HeaderRemark").getValue();
                var DataEntryOperator = this.getView().byId("DataEntryOperatorID").getValue();
                var StocLoc = this.getView().byId("StocLoc").getValue();
                var ReceivingSloc = this.getView().byId("ReceivingSloc").getValue();
                var NoOfPieces = this.getView().byId("NoOfPieces").getValue();
                var TotalQty = this.getView().byId("TotalQty").getValue();
                var Shift = this.getView().byId("Shift").getValue();
                var SetNumber = this.getView().byId("SetNumber").getValue();
                if (PostingDate!= "") {
                    this.getView().byId("PostingDate").setValueState("None");
                }
                if (FinishMc != "") {
                    this.getView().byId("FinishMc").setValueState("None");
                }
                if (TrollyNumber != "") {
                    this.getView().byId("TrollyNumber").setValueState("None");
                }
                if (HeaderRemark != "") {
                    this.getView().byId("HeaderRemark").setValueState("None");
                }
                if (StocLoc != "") {
                    this.getView().byId("StocLoc").setValueState("None");
                }
                if (ReceivingSloc != "") {
                    this.getView().byId("ReceivingSloc").setValueState("None");
                }
                if (NoOfPieces != "") {
                    this.getView().byId("NoOfPieces").setValueState("None");
                }
                if (TotalQty != "") {
                    this.getView().byId("TotalQty").setValueState("None");
                }
                if (Shift != "") {
                    this.getView().byId("Shift").setValueState("None");
                }
                if (SetNumber != "") {
                    this.getView().byId("SetNumber").setValueState("None");
                }
            },
        });
    });
