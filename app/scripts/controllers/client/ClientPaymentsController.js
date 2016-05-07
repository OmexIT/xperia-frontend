(function (module) {
    mifosX.controllers = _.extend(module, {
        ClientPaymentsController: function (scope, routeParams, route, location, resourceFactory, http, $modal, API_VERSION, $rootScope, $upload, dateFilter, $sce,$location) {
            scope.client = [];
            scope.identitydocuments = [];
            scope.buttons = [];
            scope.clientdocuments = [];
            scope.staffData = {};
            scope.formData = {};
            scope.openLoan = true;
            scope.openSaving = true;
            scope.updateDefaultSavings = false;
            scope.showPaymentDetails = true;
            scope.isTransaction = true;
            scope.paymentTypes = [];
            scope.restrictDate = new Date();
            scope.formData.submittedOnDate = new Date();
            scope.formData.totalAmount = 0;
            scope.savingAccountCharges = 0;
            scope.savingChargesDescription = " ";
            scope.addLoanCharges = false;
            scope.addSavingsCharges = false;
            scope.savingData={};
            scope.LoanData={};
            scope.payCharge={};
            scope.showSavingCharges = false;
            scope.showLoanCharge = false;
            scope.id=0;
            scope.chargeid1=0;
            scope.waiveSavingChargeData ={};
            scope.chargeAmount=0;
            scope.pageUrl=$location.path();
            scope.pageUrlSplit=[];
            scope.pageUrlSplit=scope.pageUrl.split("/");
            scope.isDisabled = true;
            scope.showinstallmentCharge=false;
            scope.mpesaAmount;
            scope.mpetxnsacode;
            scope.TxnDate;
            scope.mpesaPayment=false;
            scope.showError=false;
            scope.txnId;
            scope.isDisabled = true;
            scope.showError=false;
            scope.LoanAccountNo=0;
            scope.showErrorMsg = false;
            /*
            storing the previous value of loan and savings Account
            * */
            scope.oldLoanAmount=[];
            scope.oldSavingsAmount=[];
            scope.oldsum=0;
            scope.totalAmount="";
            scope.p=false;

            if(routeParams.amount!=null&& routeParams.mpetxnsacode!=null){
                scope.mpesaPayment=true;
                scope.mpesaAmount=routeParams.amount;
                scope.mpetxnsacode=routeParams.mpetxnsacode;
                scope.TxnDate=dateFilter(routeParams.txnDate, 'dd MMMM yyyy');
                  scope.txnId=routeParams.txnId;
            }
            scope.routeToLoan = function (id) {
                location.path('/viewloanaccount/' + id);
            };
            scope.routeToSaving = function (id, depositTypeCode) {
                if (depositTypeCode === "depositAccountType.savingsDeposit") {
                    location.path('/viewsavingaccount/' + id);
                } else if (depositTypeCode === "depositAccountType.fixedDeposit") {
                    location.path('/viewfixeddepositaccount/' + id);
                } else if (depositTypeCode === "depositAccountType.recurringDeposit") {
                    location.path('/viewrecurringdepositaccount/' + id);
                }
            };
            scope.haveFile = [];
            resourceFactory.clientResource.get({clientId: routeParams.id}, function (data) {
                scope.client = data;
                scope.isClosedClient = scope.client.status.value == 'Closed';
                scope.staffData.staffId = data.staffId;
                if (data.imagePresent) {
                    http({
                        method: 'GET',
                        url: $rootScope.hostUrl + API_VERSION + '/clients/' + routeParams.id + '/images?maxHeight=150'
                    }).then(function (imageData) {
                        scope.image = imageData.data;
                    });

                }
                http({
                    method: 'GET',
                    url: $rootScope.hostUrl + API_VERSION + '/clients/' + routeParams.id + '/documents'
                }).then(function (docsData) {
                    var docId = -1;
                    for (var i = 0; i < docsData.data.length; ++i) {
                        if (docsData.data[i].name == 'clientSignature') {
                            docId = docsData.data[i].id;
                            scope.signature_url = $rootScope.hostUrl + API_VERSION + '/clients/' + routeParams.id + '/documents/' + docId + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
                        }
                    }
                });


                var clientStatus = new mifosX.models.ClientStatus();

                if (clientStatus.statusKnown(data.status.value)) {
                    scope.buttons = clientStatus.getStatus(data.status.value);
                }

                if (data.status.value == "Pending" || data.status.value == "Active") {
                    if (data.staffId) {

                    }
                    else {
                        scope.buttons.push(clientStatus.getStatus("Assign Staff"));
                    }
                }

                scope.buttonsArray = {
                    options: [
                        {
                            name: "button.clientscreenreports"
                        }
                    ]
                };
                scope.buttonsArray.singlebuttons = scope.buttons;

                resourceFactory.runReportsResource.get({reportSource: 'ClientSummary', genericResultSet: 'false', R_clientId: routeParams.id}, function (data) {
                    scope.client.ClientSummary = data[0];
                });
            });
            scope.deleteClient = function () {
                $modal.open({
                    templateUrl: 'deleteClient.html',
                    controller: ClientDeleteCtrl
                });
            };
            scope.uploadPic = function () {
                $modal.open({
                    templateUrl: 'uploadpic.html',
                    controller: UploadPicCtrl
                });
            };
            var UploadPicCtrl = function ($scope, $modalInstance) {
                $scope.onFileSelect = function ($files) {
                    scope.file = $files[0];
                };
                $scope.upload = function () {
                    if (scope.file) {
                        $upload.upload({
                            url: $rootScope.hostUrl + API_VERSION + '/clients/' + routeParams.id + '/images',
                            data: {},
                            file: scope.file
                        }).then(function (imageData) {
                            // to fix IE not refreshing the model
                            if (!scope.$$phase) {
                                scope.$apply();
                            }
                            $modalInstance.close('upload');
                            route.reload();
                        });
                    }
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
            scope.uploadSig = function () {
                $modal.open({
                    templateUrl: 'uploadsig.html',
                    controller: UploadSigCtrl
                });
            };
            var UploadSigCtrl = function ($scope, $modalInstance) {
                $scope.onFileSelect = function ($files) {
                    scope.file = $files[0];
                };
                $scope.upload = function () {
                    if (scope.file) {
                        $upload.upload({
                            url: $rootScope.hostUrl + API_VERSION + '/clients/' + routeParams.id + '/documents',
                            data: {
                                name: 'clientSignature',
                                description: 'client signature'
                            },
                            file: scope.file
                        }).then(function (imageData) {
                            // to fix IE not refreshing the model
                            if (!scope.$$phase) {
                                scope.$apply();
                            }
                            $modalInstance.close('upload');
                            route.reload();
                        });
                    }
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.unassignStaffCenter = function () {
                $modal.open({
                    templateUrl: 'clientunassignstaff.html',
                    controller: ClientUnassignCtrl
                });
            };
            var ClientDeleteCtrl = function ($scope, $modalInstance) {
                $scope.delete = function () {
                    resourceFactory.clientResource.delete({clientId: routeParams.id}, {}, function (data) {
                        $modalInstance.close('delete');
                        location.path('/clients');
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
            var ClientUnassignCtrl = function ($scope, $modalInstance) {
                $scope.unassign = function () {
                    resourceFactory.clientResource.save({clientId: routeParams.id, command: 'unassignstaff'}, scope.staffData, function (data) {
                        $modalInstance.close('unassign');
                        route.reload();
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

    scope.init=function()
            {
                scope.addSavingsCharges = false;
                scope.addLoanCharges = false;
                scope.showSavingCharges = false;
                scope.showLoanCharge = false;
                scope.oldTotalAmount=false;
                scope.p=true;
                scope.totalAmount= scope.formData.totalAmount;
                //scope.formData.totalAmount = scope.formData.totalAmount;
                resourceFactory.clientAccountChargeResource.get({
                    clientId: routeParams.id,
                    command: 'loanrepaymentamount'
                }, function (data) {
                    scope.clientAccounts = data;
                    if (data.paymentTypeOptions != null) {
                        scope.paymentTypes = data.paymentTypeOptions;
                        scope.formData.paymentTypeId = data.paymentTypeOptions[0].id;
                    }
                    if (data.savingsCharges) {
                        scope.savingsCharges = data.savingsCharges;
                    }
                    if (data.loanCharges) {
                        scope.loanCharges = data.loanCharges;
                    }
                    if (data.loanAccounts) {
                        scope.loanAccounts = data.loanAccounts || [];
                        for (var i in scope.loanAccounts) {
                            scope.charges = 0;
                            scope.chargeDescription = " ";
                            scope.loanAccounts[i].relativeUrl = "loans/" + scope.loanAccounts[i].id + "/repayment?command=repayment";
                            scope.loanAccounts[i].repaymentAmount = scope.loanAccounts[i].loanrepaymentamount;
                            for (var j in scope.loanCharges) {
                                if (scope.loanAccounts[i].id == scope.loanCharges[j].id) {
                                    scope.charges = scope.charges + scope.loanCharges[j].chargeDue;
                                    scope.chargeDescription = scope.chargeDescription + "\n" + scope.loanCharges[j].chargeName + "=" +
                                    scope.loanCharges[j].chargeDue + "\n";
                                }
                            }
                            scope.loanAccounts[i].charges1 = scope.charges;
                            scope.loanAccounts[i].chargeDescription1 = scope.chargeDescription;
                            //store the previous value into the loanAccounts
                            scope.loanAccounts[i].value = scope.oldLoanAmount[i];
                            scope.oldLoanAmount[i] =0;
                            //scope.formData.totalAmount = scope.formData.totalAmount + scope.oldLoanAmount[i];
                        }
                        scope.loanAccounts[i].charges1 = scope.charges;
                        scope.loanAccounts[i].chargeDescription1 = scope.chargeDescription;
                    }

                    if (data.savingsAccounts) {
                        scope.savingsAccounts = data.savingsAccounts || [];
                        for (var i in data.savingsAccounts) {
                            scope.savingAccountCharges = 0;
                            scope.savingChargesDescription = " ";
                            scope.savingsAccounts[i].relativeUrl = "savingsaccounts/" + scope.savingsAccounts[i].id + "/transactions?command=deposit";
                            scope.savingsAccounts[i].depositAmount = 0;
                            for (var j in scope.savingsCharges) {
                                if (scope.savingsAccounts[i].id == scope.savingsCharges[j].id) {
                                    scope.savingAccountCharges = scope.savingAccountCharges + scope.savingsCharges[j].chargeDue;
                                    scope.savingChargesDescription = scope.savingChargesDescription + "\n" + scope.savingsCharges[j].chargeName + "=" +
                                    scope.savingsCharges[j].chargeDue + "\n";
                                }

                            }
                            scope.savingsAccounts[i].charges2 = scope.savingAccountCharges;
                            scope.savingsAccounts[i].chargeDescription2 = scope.savingChargesDescription;
                            // for displaying the old  savings values on the  screen
                            scope.savingsAccounts[i].value = scope.oldSavingsAmount[i];
                            scope.oldSavingsAmount[i] =0;
                            // scope.formData.totalAmount = scope.formData.totalAmount + scope.oldSavingsAmount[i];
                        }
                        scope.savingsAccounts[i].charges2 = scope.savingAccountCharges;
                        scope.savingsAccounts[i].chargeDescription2 = scope.savingChargesDescription;

                    }
                    if (data.savingsAccounts) {
                        for (var i in data.savingsAccounts) {
                            if (data.savingsAccounts[i].status.value == "Active") {
                                scope.updateDefaultSavings = true;
                                break;
                            }
                        }
                    }
            });
            };

//       on changing the date:-

            //definr new function
            scope.calculate=function() {
                scope.formData.totalAmount = 0;
                for (var l in scope.loanAccounts) {
                    if (scope.loanAccounts[l].active) {
                        if (scope.loanAccounts[l].repaymentAmount != null && scope.loanAccounts[l].repaymentAmount != "") {

                            scope.formData.totalAmount = scope.formData.totalAmount + scope.oldLoanAmount[l];
                        }
                    }
                }

            }
            scope.$watch('formData.submittedOnDate',function(){
                scope.onDateChange();
            });
            scope.onDateChange = function () {
                scope.oldTotalAmount=false;
                scope.addSavingsCharges=false;
                scope.showLoanCharge = false;
                scope.showinstallmentCharge =false;
                scope.addLoanCharges = false;
                scope.showSavingCharges = false;
                //scope.totalAmount = scope.formData.totalAmount;
                     var params = {};
               // params.dateFormat = scope.df;
                params.submittedOnDate = dateFilter(this.formData.submittedOnDate, scope.df);
                //alert(params.transactionDate);
                params.clientId = routeParams.id;
                params.command = 'loanrepaymentamount';

                resourceFactory.clientAccountChargeResource.get(params, function (data) {
                    scope.clientAccounts = data;
                    scope.formData.totalAmount =0;
                    if (data.paymentTypeOptions != null) {
                        scope.paymentTypes = data.paymentTypeOptions;
                        scope.formData.paymentTypeId = data.paymentTypeOptions[0].id;
                    }
                    if (data.loanCharges) {
                        scope.loanCharges = data.loanCharges;
                    }
                    if (data.savingsCharges) {
                        scope.savingsCharges = data.savingsCharges;
                    }
                    if (data.loanAccounts) {
                        scope.loanAccounts = data.loanAccounts || [];
                        for (var i in scope.loanAccounts) {
                            scope.charges = 0;
                            scope.chargeDescription = " ";
                            scope.loanAccounts[i].relativeUrl = "loans/" + scope.loanAccounts[i].id + "/repayment?command=repayment";
                            scope.loanAccounts[i].repaymentAmount = scope.loanAccounts[i].loanrepaymentamount;
                            //scope.formData.totalAmount = scope.formData.totalAmount + scope.loanAccounts[i].loanrepaymentamount;
                            for (var j in scope.loanCharges) {
                                if (scope.loanAccounts[i].id == scope.loanCharges[j].id) {
                                    scope.charges = scope.charges + scope.loanCharges[j].chargeDue;
                                    scope.chargeDescription = scope.chargeDescription + "\n" + scope.loanCharges[j].chargeName + "=" +
                                    scope.loanCharges[j].chargeDue + "\n";
                                }
                            }
                            scope.loanAccounts[i].charges1 = scope.charges;
                            scope.loanAccounts[i].chargeDescription1 = scope.chargeDescription;
                            //store the previous value into the loanAccounts
                             scope.loanAccounts[i].value=scope.oldLoanAmount[i];
                            scope.loanAccounts[i].repaymentAmount =scope.oldLoanAmount[i];
                            scope.formData.totalAmount = scope.formData.totalAmount + scope.oldLoanAmount[i];

                        }
                    }
                    if (data.savingsAccounts) {
                        scope.savingsAccounts = data.savingsAccounts || [];
                        for (var i in scope.savingsAccounts) {
                            scope.savingAccountCharges = 0;
                            scope.savingChargesDescription = " ";
                            scope.savingsAccounts[i].relativeUrl = "savingsaccounts/" + scope.savingsAccounts[i].id + "/transactions?command=deposit";
                            scope.savingsAccounts[i].depositAmount = "";
                           // alert("5");
                            for (var j in scope.savingsCharges) {
                                if (scope.savingsAccounts[i].id == scope.savingsCharges[j].id) {
                                    scope.savingAccountCharges = scope.savingAccountCharges + scope.savingsCharges[j].chargeDue;
                                    scope.savingChargesDescription = scope.savingChargesDescription + "\n" + scope.savingsCharges[j].chargeName + "=" +
                                    scope.savingsCharges[j].chargeDue + "\n";
                                }
                            }
                            scope.savingsAccounts[i].charges2 = scope.savingAccountCharges;
                            scope.savingsAccounts[i].chargeDescription2 = scope.savingChargesDescription;
                            // for displaying the old  savings values on the  screen
                            scope.savingsAccounts[i].value=scope.oldSavingsAmount[i];
                            scope.savingsAccounts[i].depositAmount = scope.oldSavingsAmount[i];
                            scope.formData.totalAmount = scope.formData.totalAmount + scope.oldSavingsAmount[i];

                        }
                    }
                    if (data.savingsAccounts) {
                        for (var i in data.savingsAccounts) {
                            if (data.savingsAccounts[i].status.value == "Active") {
                                scope.updateDefaultSavings = true;
                                break;
                            }
                        }
                    }
                });

            };


            scope.keyPress = function(){

                scope.formData.totalAmount = 0;
                scope.oldTotalAmount=true;
                for (var l in scope.loanAccounts) {
                    if (scope.loanAccounts[l].active) {
                        if(angular.isUndefined(scope.loanAccounts[l].repaymentAmount)){
                            scope.loanAccounts[l].repaymentAmount = 0;
                            scope.oldLoanAmount[l] = scope.loanAccounts[l].repaymentAmount;
                            scope.formData.totalAmount = scope.formData.totalAmount + scope.loanAccounts[l].repaymentAmount;
                        } else if (scope.loanAccounts[l].repaymentAmount != null && scope.loanAccounts[l].repaymentAmount != "") {
                             scope.oldLoanAmount[l] = scope.loanAccounts[l].repaymentAmount;
                            scope.formData.totalAmount = scope.formData.totalAmount + scope.loanAccounts[l].repaymentAmount;
                        }
                        else if(scope.oldLoanAmount[l]!=null&& scope.oldLoanAmount[l]!=""){
                            scope.formData.totalAmount = scope.formData.totalAmount + scope.oldLoanAmount[l];

                        }

                    }
                    else{
                        scope.loanAccounts[l].repaymentAmount=0;
                        scope.oldLoanAmount[l]=0;
                       }
                }

                for (var l in scope.savingsAccounts) {
                    if (scope.savingsAccounts[l].active) {
                        if(angular.isUndefined(scope.savingsAccounts[l].depositAmount)){
                            scope.savingsAccounts[l].depositAmount= 0;
                            scope.oldSavingsAmount[l] = scope.savingsAccounts[l].depositAmount;
                            scope.formData.totalAmount = scope.formData.totalAmount +scope.savingsAccounts[l].depositAmount;
                        }
                        else if (scope.savingsAccounts[l].depositAmount != null && scope.savingsAccounts[l].depositAmount != "") {
                            scope.oldSavingsAmount[l] = scope.savingsAccounts[l].depositAmount;
                            scope.formData.totalAmount = scope.formData.totalAmount + scope.savingsAccounts[l].depositAmount;

                        }

                         else  if   (scope.oldSavingsAmount[l] != null && scope.oldSavingsAmount[l] != "") {
                                scope.formData.totalAmount = scope.formData.totalAmount + scope.oldSavingsAmount[l];
                            }
                        }

                    else {
                        scope.oldSavingsAmount[l]=0;
                        scope.savingsAccounts[l].value=0;
                        scope.savingsAccounts[l].depositAmount = 0;

                    }
                }
               //scope.formData.totalAmount=scope.formData.totalAmount;
               };

            //for adding the Loan Charges:-
            scope.showAddLoanCharges = function (id) {
                scope.showSavingCharges = false;
                scope.addSavingsCharges = false;
                scope.addLoanCharges = true;
                scope.showLoanCharge = false;
                scope.showinstallmentCharge =false;
                scope.charges = [];
                scope.isCollapsed = true;
                scope.oldTotalAmount=false;
                scope.loanId = id;
                scope.oldTotalAmount=false;
                scope.formData.chargeId="";
                scope.LoanData.dueDate="";
                scope.formData.dueDate=" ";
                scope.totalAmount = scope.formData.totalAmount;
                resourceFactory.loanChargeTemplateResource.get({loanId: scope.loanId}, function (data) {
                    scope.charges = data.chargeOptions;

                    //scope.isCollapsed = false;
                });

                scope.selectCharge = function () {

                    resourceFactory.chargeResource.get({
                        chargeId: scope.formData.chargeId,

                    template: true
                    }, function (data) {
                        scope.isCollapsed = false;
                        scope.chargeData = data;
                        scope.formData.amount = data.amount;
                        scope.LoanData.amount=  data.amount;
                        scope.LoanData.chargeId= scope.formData.chargeId
                        scope.LoanData.locale=scope.optlang.code;
                        scope.LoanData.dateFormat=scope.df;

                    });
                };
                       scope.submitLoanCharge = function () {
                    this.formData.locale = scope.optlang.code;
                    this.formData.dateFormat = scope.df;
                    if (this.formData.dueDate) {
                        this.formData.dueDate = dateFilter(this.formData.dueDate, scope.df);
                        scope.LoanData.dueDate = dateFilter(this.formData.dueDate,scope.df);
                    }
                    resourceFactory.loanResource.save({
                        resourceType: 'charges',
                        loanId: scope.loanId
                    }, scope.LoanData, function (data) {

                        scope.onDateChange();

                    });
                };

                scope.cancleLoanCharge = function () {
                    scope.addLoanCharges = false;
                };
            }



            scope.savingCharges = function (id) {
                scope.id = id;
                if(scope.showSavingCharges==false){
                    scope.showSavingCharges = true;
                }
                else
                {
                    scope.showSavingCharges = false;
                }
                scope.addLoanCharges = false;
                scope.addSavingsCharges = false;
                scope.showLoanCharge = false;
                scope.showinstallmentCharge =false;
            };
                  scope.waiveSavingCharges = function (id,chargeId){
                      scope.oldTotalAmount=false;
                  scope.waiveSavingChargeData.accountId=id;
                  scope.waiveSavingChargeData.resourceType='charges';
                  scope.waiveSavingChargeData.chargeId= chargeId;
                  scope.waiveSavingChargeData.command= 'waive';
                  scope.waiveData={};
                  scope.waiveData.dateFormat=scope.df;
                  scope.waiveData.locale=scope.optlang.code;
                  //scope.totalAmount = scope.formData.totalAmount;
                  resourceFactory.savingsResource.save(scope.waiveSavingChargeData,scope.waiveData , function (data) {
                     // route.reload();
                      //added
                     // scope.init();
                      scope.onDateChange();
                   });
                  };
            scope.savingChargesCancel = function(){
                scope.showSavingCharges = false;
            }
            scope.loancharge = function(id){
                scope.id = id;
                if(scope.showLoanCharge==false){
                    scope.showLoanCharge=true;
                }
                else
                {
                    scope.showLoanCharge=false
                }
                scope.showSavingCharges = false;
                scope.addLoanCharges = false;
                scope.addSavingsCharges = false;
                scope.showinstallmentCharge =false;

            }
            scope.waiveloanCharges = function (id,chargeId){
                scope.oldTotalAmount=false;
                //scope.totalAmount = scope.formData.totalAmount;
                resourceFactory.LoanAccountResource.get({loanId: id, resourceType: 'charges', chargeId: chargeId}, function (data) {
                    if (data.chargeTimeType.value !== "Specified due date" && data.installmentChargeData) {
                        scope.showinstallmentCharge=true;
                        scope.showLoanCharge=false;
                        scope.installmentCharges = data.installmentChargeData;
                        scope.chargeid1=chargeId;
                        scope.formData.installmentNumber = data.installmentChargeData[0].installmentNumber;
                        scope.installmentchargeField = true;
                    } else {
                        scope.installmentchargeField = false;
                        scope.showwaiveforspecicficduedate = true;
                        scope.LoanwaiveData={};
                        scope.LoanwaiveData.dateFormat=scope.df;
                        scope.LoanwaiveData.locale=scope.optlang.code;
                        resourceFactory.LoanAccountResource.save({loanId: id, resourceType: 'charges', chargeId: chargeId, 'command': 'waive'}, scope.LoanwaiveData, function (data) {
                           // route.reload();
                            //scope.init();
                            scope.onDateChange();
                        });
                    }
                });

            };
            scope.waiveloanInstallmentCharges = function(id,chargeId){
                       scope.installmentchargeField = false;
                        scope.showwaiveforspecicficduedate = true;
                        scope.LoanwaiveData={};
                        scope.LoanwaiveData.installmentNumber=this.formData.installmentNumber;
                        scope.LoanwaiveData.dateFormat=scope.df;
                        scope.LoanwaiveData.locale=scope.optlang.code;
                        resourceFactory.LoanAccountResource.save({loanId: id, resourceType: 'charges', chargeId: chargeId, 'command': 'waive'}, scope.LoanwaiveData, function (data) {
                            scope.onDateChange();
                        });
            };
                scope.loanInstallmentChargesCancel = function(){
                    scope.showinstallmentCharge =false;
                }

            scope.loanChargesCancel = function(){
                scope.showLoanCharge=false;
            }

            //complete the add Loan Charges:-


            //for addding savings Charges:-

            scope.showAddSavingsCharges = function (id) {
                scope.oldTotalAmount=false;
                scope.showSavingCharges = false;
                scope.addLoanCharges = false;
                scope.showLoanCharge = false;
                scope.addSavingsCharges = true;
                scope.isCollapsed = true;
                scope.showinstallmentCharge =false;
                scope.offices = [];
                scope.cancelRoute = id;
                scope.totalAmount = scope.formData.totalAmount;
                scope.date = {};
                scope.formData.chargeId="";

                resourceFactory.savingsChargeResource.get({
                    accountId: routeParams.id,
                    resourceType: 'template'
                }, function (data) {
                    scope.chargeOptions = data.chargeOptions;
                    //scope.isCollapsed = false;
                });

                scope.chargeSelected = function (id) {
                    scope.chargeId=id;
                    resourceFactory.chargeResource.get({chargeId: id, template: 'true'}, function (data) {
                        scope.chargeCalculationType = data.chargeCalculationType.id;
                        scope.chargeTimeType = data.chargeTimeType.id;
                        scope.chargeDetails = data;
                        scope.isCollapsed = false;
                        scope.formData.amount = data.amount;
                        scope.withDrawCharge = data.chargeTimeType.value === "Withdrawal Fee" ? true : false;
                        scope.formData.feeInterval = data.feeInterval;
                        if (data.chargeTimeType.value === "Annual Fee" || data.chargeTimeType.value === "Monthly Fee") {
                            scope.chargeTimeTypeAnnualOrMonth = true;
                        }
                    });
                };
                scope.canceSavingsCharges = function () {
                    scope.addSavingsCharges = false;
                };
                scope.submitSavingsCharge = function () {
                    this.formData.locale = scope.optlang.code;
                    if (scope.withDrawCharge !== true) {
                        if (scope.chargeTimeTypeAnnualOrMonth === true) {
                            this.formData.monthDayFormat = "dd MMMM";
                            if (scope.date.due) {
                                this.formData.feeOnMonthDay = dateFilter(scope.date.due, 'dd MMMM');
                            } else {
                                this.formData.feeOnMonthDay = "";
                            }
                        } else {
                            this.formData.dateFormat = scope.df;
                           scope.savingData.dateFormat=scope.df;
                            if (scope.date.specificduedate) {
                                this.formData.dueDate = dateFilter(scope.date.specificduedate, scope.df);
                                scope.savingData.dueDate=dateFilter(scope.date.specificduedate, scope.df);
                            } else {
                                this.formData.dueDate = "";
                            }
                        }
                    }
                    scope.savingData.amount=this.formData.amount;
                    scope.savingData.feeInterval=scope.formData.feeInterval;
                    scope.savingData.locale=scope.optlang.code;
                    scope.savingData.feeOnMonthDay=this.formData.feeOnMonthDay;
                    scope.savingData.chargeId=scope.chargeId;
                    scope.savingData.monthDayFormat= "dd MMMM";
                    //scope.savingData.officeId=1;
                    resourceFactory.savingsChargeResource.save({accountId: id}, scope.savingData, function (data) {
                       // route.reload();
                        scope.onDateChange();
                        //scope.init();
                    });

                }

            }
            scope.init();

//complete the add savings Charges:-


            scope.submitPayments = function () {
                var requests = [];
                var d = scope.formData.submittedOnDate;
                var today = formatDate(d);
               if(routeParams.amount!=null&& routeParams.mpetxnsacode!=null) {
                   var today=scope.TxnDate;
                }
                var submitProcess = false;
                var requestId = 1;
                var req = 0;
                //Header Requests
                var headers = [{name: "Content-type", value: "application/json"}];
                for(var l in scope.loanAccounts) {
                    if (scope.loanAccounts[l].active) {
                        /*if old value of Loan Accoount is present
                        * */
                        if(scope.oldLoanAmount[l]!=null&& scope.oldLoanAmount[l]!=""){
                            if (scope.loanAccounts[l].repaymentAmount != null && scope.loanAccounts[l].repaymentAmount != "") {}
                                 else {
                                scope.loanAccounts[l].repaymentAmount = scope.oldLoanAmount[l];
                            }
                        }
                        if (scope.loanAccounts[l].repaymentAmount != null && scope.loanAccounts[l].repaymentAmount != "") {
                            var actualDisbursementDate = new Date(scope.loanAccounts[l].timeline.actualDisbursementDate);
                            if(d >= actualDisbursementDate){
                                submitProcess = true;
                                var request = {};
                                request.requestId = requestId;
                                request.relativeUrl = "loans/" + scope.loanAccounts[l].id + "/repayment?command=repayment";
                                request.method = "POST";
                                request.headers = headers;
                                var bodyJson = "{";
                                bodyJson += "\"transactionAmount\":\"" + scope.loanAccounts[l].repaymentAmount + "\"";
                                bodyJson += ",\"transactionDate\":\"" + today + "\"";


                                if (scope.formData.paymentTypeId != undefined) {
                                    bodyJson += ",\"paymentTypeId\":\"" + scope.formData.paymentTypeId + "\"";
                                }

                                if(routeParams.amount!=null&& routeParams.mpetxnsacode!=null) {
                                    bodyJson += ",\"receiptNumber\":\"" + scope.mpetxnsacode + "\"";

                                }
                                else{
                                    bodyJson += ",\"receiptNumber\":\"" + scope.formData.receiptNumber + "\"";
                                }
                                if (scope.formData.accountNumber != undefined) {
                                    bodyJson += ",\"accountNumber\":\"" + scope.formData.accountNumber + "\"";
                                }
                                if (scope.formData.checkNumber != undefined) {
                                    bodyJson += ",\"checkNumber\":\"" + scope.formData.checkNumber + "\"";
                                }
                                if (scope.formData.routingCode != undefined) {
                                    bodyJson += ",\"routingCode\":\"" + scope.formData.routingCode + "\"";
                                }
                                if (scope.formData.bankNumber != undefined) {
                                    var banknumber = dateFilter(scope.formData.bankNumber, scope.df);
                                    bodyJson += ",\"bankNumber\":\"" + banknumber + "\"";
                                }

                                bodyJson += ",\"locale\":\"en\"";
                                bodyJson += ",\"dateFormat\":\"dd MMMM yyyy\"";
                                bodyJson += "}";
                                request.body = bodyJson;

                                requests[req++] = request;
                                requestId++


                            } else{
                                submitProcess = false;
                                alert("Loan Account : " + scope.loanAccounts[l].id + "\nTransaction date cannot be before account activation date.");
                                return;
                            }

                        }
                    }
                }
                for(var s in scope.savingsAccounts) {
                    if (scope.savingsAccounts[s].active) {
                        if(scope.oldSavingsAmount[s]!=null&& scope.oldSavingsAmount[s]!=""){
                            if(scope.savingsAccounts[s].depositAmount != null && scope.savingsAccounts[s].depositAmount != ""){

                            }
                            else {
                                   scope.savingsAccounts[s].depositAmount = scope.oldSavingsAmount[s];
                            }
                        }
                        if (scope.savingsAccounts[s].depositAmount != null && scope.savingsAccounts[s].depositAmount != "") {
                            var activatedOnDate = new Date(scope.savingsAccounts[s].timeline.activatedOnDate);
                            if(d >= activatedOnDate){

                                submitProcess = true;
                                var request = {};
                                request.requestId = requestId;
                                request.relativeUrl = "savingsaccounts/" + scope.savingsAccounts[s].id + "/transactions?command=deposit";
                                request.method = "POST";
                                request.headers = headers;
                                var bodyJson = "{";
                                bodyJson += "\"transactionAmount\":\"" + scope.savingsAccounts[s].depositAmount + "\"";
                                bodyJson += ",\"transactionDate\":\"" + today + "\"";

                                if (scope.formData.paymentTypeId != undefined) {
                                    bodyJson += ",\"paymentTypeId\":\"" + scope.formData.paymentTypeId + "\"";
                                }

                                if(routeParams.amount!=null&& routeParams.mpetxnsacode!=null) {
                                    bodyJson += ",\"receiptNumber\":\"" + scope.mpetxnsacode + "\"";

                                }
                                else{
                                    bodyJson += ",\"receiptNumber\":\"" + scope.formData.receiptNumber + "\"";
                                }
                                if (scope.formData.accountNumber != undefined) {
                                    bodyJson += ",\"accountNumber\":\"" + scope.formData.accountNumber + "\"";
                                }
                                if (scope.formData.checkNumber != undefined) {
                                    bodyJson += ",\"checkNumber\":\"" + scope.formData.checkNumber + "\"";
                                }
                                if (scope.formData.routingCode != undefined) {
                                    bodyJson += ",\"routingCode\":\"" + scope.formData.routingCode + "\"";
                                }
                                if (scope.formData.bankNumber != undefined) {
                                    var banknumber = dateFilter(scope.formData.bankNumber, scope.df);
                                    bodyJson += ",\"bankNumber\":\"" + banknumber + "\"";
                                }

                                bodyJson += ",\"locale\":\"en\"";
                                bodyJson += ",\"dateFormat\":\"dd MMMM yyyy\"";
                                bodyJson += "}";
                                request.body = bodyJson;

                                requests[req++] = request;
                                requestId++

                            } else {
                                submitProcess = false;
                                alert("Saving Account : " + scope.savingsAccounts[s].id + "\nTransaction date cannot be before account activation date.");
                                return;
                            }
                        }
                    }
              }

                for (var s in scope.savingsAccounts) {
                    if (scope.savingsAccounts[s].active) {
                        for (var J in  scope.savingsCharges) {
                        if (scope.savingsAccounts[s].depositAmount != null && scope.savingsAccounts[s].depositAmount != ""&& scope.savingsAccounts[s].depositAmount >0) {
                            if (scope.savingsAccounts[s].accountNo == scope.savingsCharges[J].accountNo) {

                                if(scope.formData.receiptNumber!= null && scope.formData.bankNumber) {
                                    if (scope.savingsAccounts[s].depositAmount < scope.savingsCharges[J].chargeDue) {
                                        scope.chargeAmount = scope.savingsAccounts[s].depositAmount;
                                        scope.savingsAccounts[s].depositAmount = scope.savingsAccounts[s].depositAmount - scope.savingsCharges[J].chargeDue;
                                    }
                                    else {
                                        scope.chargeAmount = scope.savingsCharges[J].chargeDue;
                                        scope.savingsAccounts[s].depositAmount = scope.savingsAccounts[s].depositAmount - scope.savingsCharges[J].chargeDue;
                                    }
                                }

                            var activatedOnDate = new Date(scope.savingsAccounts[s].timeline.activatedOnDate);
                            if (d >= activatedOnDate) {
                                submitProcess = true;
                                var request = {};
                                request.requestId = requestId;
                                request.relativeUrl = "savingsaccounts/" + scope.savingsAccounts[s].id + "/charges/" + scope.savingsCharges[J].chargeId + "?" + "command=paycharge";
                                request.method = "POST";
                                request.headers = headers;
                                var bodyJson = "{";
                                bodyJson += "\"amount\":\"" + scope.chargeAmount + "\"";
                                bodyJson += ",\"dueDate\":\"" + today + "\"";
                                if (scope.formData.paymentTypeId != undefined) {
                                    bodyJson += ",\"paymentTypeId\":\"" + scope.formData.paymentTypeId + "\"";
                                }


                                if(routeParams.amount!=null&& routeParams.mpetxnsacode!=null) {
                                    bodyJson += ",\"receiptNumber\":\"" + scope.mpetxnsacode + "\"";

                                }
                                else{
                                    bodyJson += ",\"receiptNumber\":\"" + scope.formData.receiptNumber + "\"";
                                }
                                if (scope.formData.accountNumber != undefined) {
                                    bodyJson += ",\"accountNumber\":\"" + scope.formData.accountNumber + "\"";
                                }
                                if (scope.formData.checkNumber != undefined) {
                                    bodyJson += ",\"checkNumber\":\"" + scope.formData.checkNumber + "\"";
                                }
                                if (scope.formData.routingCode != undefined) {
                                    bodyJson += ",\"routingCode\":\"" + scope.formData.routingCode + "\"";
                                }
                                if (scope.formData.bankNumber != undefined) {
                                    var banknumber = dateFilter(scope.formData.bankNumber, scope.df);
                                    bodyJson += ",\"bankNumber\":\"" + banknumber + "\"";
                                }
                                bodyJson += ",\"locale\":\"en\"";
                                bodyJson += ",\"dateFormat\":\"dd MMMM yyyy\"";
                                bodyJson += "}";
                                request.body = bodyJson;

                                requests[req++] = request;
                                requestId++

                            } else {
                                submitProcess = false;
                                alert("Saving Account : " + scope.savingsAccounts[s].id + "\nTransaction date cannot be before account activation date.");
                                return;
                            }
                        }
                        }
                    }}}
                if(scope.mpesaAmount!=null) {
                    scope.formData.receiptNumber=scope.mpetxnsacode;
                    if (scope.mpesaAmount != scope.formData.totalAmount) {
                        submitProcess = false;
                        scope.showError=true;
                    }
                }
                if (scope.formData.receiptNumber == null) {
                    alert("please enter recipt number");
                    return;
                }
                if (scope.formData.bankNumber == null) {
                    alert("please enter bank date");
                    return;
                }

                if(submitProcess){
                    http({
                        method: 'POST',
                        url: $rootScope.hostUrl + API_VERSION + '/batches?enclosingTransaction=true',
                        dataType: 'json',
                        data: requests
                    }).success(function(data,status){
                        if(data.length==0){
                            scope.showError=true;
                           // alert("Loan Transaction cannot be before the last transaction date");
                            return;
                        }else{
                            if(data.length ==1 && data[0].body != null){

                                if(data[0].body.indexOf('Developer') > 0 || data[0].body.indexOf('developer') > 0){
                                    scope.Error = data[0].body;
                                    scope.showErrorMsg=true;
                                    return;
                                } else  if(data[0].body.indexOf('Exception') > 0){
                                    var index1 = data[0].body.indexOf('Exception');
                                    scope.Error = data[0].body.substring(index1 + 11, data[0].body.length -1);
                                    scope.showErrorMsg=true;
                                    return;
                                }


                            }
                            for (var i = 0; i < data.length; i++) {
                                if (data[i].statusCode === 200)
                                    if(routeParams.amount!=null&& routeParams.mpetxnsacode!=null) {
                                        http({
                                            method: 'GET',
                                            url: 'http://localhost:9292/mpesa/postpayment?id=' + scope.txnId
                                        }).success(function (data) {
                                        });
                                    }
                                    location.path('/viewclient/' + routeParams.id);
                            }}
                    }).error(function(error){
                    });


                }
                else{
                    if(scope.mpesaAmount!=null){}
                    else {
                        alert("Please enter amount");
                    }
                     submitProcess = false;
                       alert("Saving Account : "+scope.savingsAccounts[s].id+"\nTransaction date cannot be before account activation date.");
                        return;
                            }
                        }


            scope.submitPaymentsAndPrint = function() {
                var requests = [];
                var d = scope.formData.submittedOnDate;
                var today = formatDate(d);
                if (routeParams.amount != null && routeParams.mpetxnsacode != null) {
                    var today = scope.TxnDate;
                }
                var submitProcess = false;
                var requestId = 1;
                var req = 0;
                //Header Requests
                var headers = [{name: "Content-type", value: "application/json"}];
                for (var l in scope.loanAccounts) {
                    if (scope.loanAccounts[l].active) {
                        //if the loan Account is already present
                        if(scope.oldLoanAmount[l]!=null&& scope.oldLoanAmount[l]!=""){
                            if (scope.loanAccounts[l].repaymentAmount != null && scope.loanAccounts[l].repaymentAmount != "") {}
                            else {
                                scope.loanAccounts[l].repaymentAmount = scope.oldLoanAmount[l];
                            }
                        }
                        if (scope.loanAccounts[l].repaymentAmount != null && scope.loanAccounts[l].repaymentAmount != "") {
                            var actualDisbursementDate = new Date(scope.loanAccounts[l].timeline.actualDisbursementDate);
                            if (d >= actualDisbursementDate) {
                                submitProcess = true;
                                var request = {};
                                request.requestId = requestId;
                                request.relativeUrl = "loans/" + scope.loanAccounts[l].id + "/repayment?command=repayment";
                                request.method = "POST";
                                request.headers = headers;
                                var bodyJson = "{";
                                bodyJson += "\"transactionAmount\":\"" + scope.loanAccounts[l].repaymentAmount + "\"";
                                bodyJson += ",\"transactionDate\":\"" + today + "\"";
                                if (scope.formData.paymentTypeId != undefined) {
                                    bodyJson += ",\"paymentTypeId\":\"" + scope.formData.paymentTypeId + "\"";
                                }
                                if (routeParams.amount != null && routeParams.mpetxnsacode != null) {
                                    bodyJson += ",\"receiptNumber\":\"" + scope.mpetxnsacode + "\"";

                                }
                                else {
                                    bodyJson += ",\"receiptNumber\":\"" + scope.formData.receiptNumber + "\"";
                                }
                                if (scope.formData.accountNumber != undefined) {
                                    bodyJson += ",\"accountNumber\":\"" + scope.formData.accountNumber + "\"";
                                }
                                if (scope.formData.checkNumber != undefined) {
                                    bodyJson += ",\"checkNumber\":\"" + scope.formData.checkNumber + "\"";
                                }
                                if (scope.formData.routingCode != undefined) {
                                    bodyJson += ",\"routingCode\":\"" + scope.formData.routingCode + "\"";
                                }

                                if (scope.formData.bankNumber != undefined) {
                                    var banknumber = dateFilter(scope.formData.bankNumber, scope.df);
                                    bodyJson += ",\"bankNumber\":\"" + banknumber + "\"";

                                    bodyJson += ",\"locale\":\"en\"";
                                    bodyJson += ",\"dateFormat\":\"dd MMMM yyyy\"";
                                    bodyJson += "}";
                                    request.body = bodyJson;

                                    requests[req++] = request;
                                    requestId++
                                } else {
                                    submitProcess = false;
                                    alert("Loan Account : " + scope.loanAccounts[l].id + "\nTransaction date cannot be before account activation date.");

                                    return;
                                }
                            }
                        }
                    }
                }
                for (var s in scope.savingsAccounts) {
                    if (scope.savingsAccounts[s].active) {
                        if(scope.oldSavingsAmount[s]!=null&& scope.oldSavingsAmount[s]!=""){
                            if(scope.savingsAccounts[s].depositAmount != null && scope.savingsAccounts[s].depositAmount != ""){

                            }
                            else {
                                scope.savingsAccounts[s].depositAmount = scope.oldSavingsAmount[s];
                            }
                        }
                        if (scope.savingsAccounts[s].depositAmount != null && scope.savingsAccounts[s].depositAmount != "") {
                            var activatedOnDate = new Date(scope.savingsAccounts[s].timeline.activatedOnDate);
                            if (d >= activatedOnDate) {
                                submitProcess = true;
                                var request = {};
                                request.requestId = requestId;
                                request.relativeUrl = "savingsaccounts/" + scope.savingsAccounts[s].id + "/transactions?command=deposit";
                                request.method = "POST";
                                request.headers = headers;
                                var bodyJson = "{";
                                bodyJson += "\"transactionAmount\":\"" + scope.savingsAccounts[s].depositAmount + "\"";
                                bodyJson += ",\"transactionDate\":\"" + today + "\"";
                                if (scope.formData.paymentTypeId != undefined) {
                                    bodyJson += ",\"paymentTypeId\":\"" + scope.formData.paymentTypeId + "\"";
                                }
                                if (routeParams.amount != null && routeParams.mpetxnsacode != null) {
                                    bodyJson += ",\"receiptNumber\":\"" + scope.mpetxnsacode + "\"";

                                }
                                else {
                                    bodyJson += ",\"receiptNumber\":\"" + scope.formData.receiptNumber + "\"";
                                }
                                if (scope.formData.accountNumber != undefined) {
                                    bodyJson += ",\"accountNumber\":\"" + scope.formData.accountNumber + "\"";
                                }
                                if (scope.formData.checkNumber != undefined) {
                                    bodyJson += ",\"checkNumber\":\"" + scope.formData.checkNumber + "\"";
                                }
                                if (scope.formData.routingCode != undefined) {
                                    bodyJson += ",\"routingCode\":\"" + scope.formData.routingCode + "\"";
                                }

                                if (scope.formData.bankNumber != undefined) {
                                    var banknumber = dateFilter(scope.formData.bankNumber, scope.df);
                                    bodyJson += ",\"bankNumber\":\"" + banknumber + "\"";
                                }
                                bodyJson += ",\"locale\":\"en\"";
                                bodyJson += ",\"dateFormat\":\"dd MMMM yyyy\"";
                                bodyJson += "}";
                                request.body = bodyJson;

                                requests[req++] = request;
                                requestId++

                            } else {
                                submitProcess = false;
                                alert("Saving Account : " + scope.savingsAccounts[s].id + "\nTransaction date cannot be before account activation date.");

                                return;
                            }
                        }
                    }
                }
                for (var s in scope.savingsAccounts) {
                    if (scope.savingsAccounts[s].active) {
                        for (var J in  scope.savingsCharges) {
                            if (scope.savingsAccounts[s].depositAmount != null && scope.savingsAccounts[s].depositAmount != "" && scope.savingsAccounts[s].depositAmount > 0) {
                                if (scope.savingsAccounts[s].accountNo == scope.savingsCharges[J].accountNo) {
                                    if (scope.savingsAccounts[s].depositAmount < scope.savingsCharges[J].chargeDue) {
                                        scope.chargeAmount = scope.savingsAccounts[s].depositAmount;
                                        scope.savingsAccounts[s].depositAmount = scope.savingsAccounts[s].depositAmount - scope.savingsCharges[J].chargeDue;

                                    }
                                    else {
                                        scope.chargeAmount = scope.savingsCharges[J].chargeDue;
                                        scope.savingsAccounts[s].depositAmount = scope.savingsAccounts[s].depositAmount - scope.savingsCharges[J].chargeDue;

                                    }

                                    var activatedOnDate = new Date(scope.savingsAccounts[s].timeline.activatedOnDate);
                                    if (d >= activatedOnDate) {
                                        submitProcess = true;
                                        var request = {};
                                        request.requestId = requestId;
                                        request.relativeUrl = "savingsaccounts/" + scope.savingsAccounts[s].id + "/charges/" + scope.savingsCharges[J].chargeId + "?" + "command=paycharge";
                                        request.method = "POST";
                                        request.headers = headers;
                                        var bodyJson = "{";
                                        bodyJson += "\"amount\":\"" + scope.chargeAmount + "\"";
                                        bodyJson += ",\"dueDate\":\"" + today + "\"";
                                        if (scope.formData.paymentTypeId != undefined) {
                                            bodyJson += ",\"paymentTypeId\":\"" + scope.formData.paymentTypeId + "\"";
                                        }
                                        if (routeParams.amount != null && routeParams.mpetxnsacode != null) {
                                            bodyJson += ",\"receiptNumber\":\"" + scope.mpetxnsacode + "\"";

                                        }
                                        else {
                                            bodyJson += ",\"receiptNumber\":\"" + scope.formData.receiptNumber + "\"";
                                        }
                                        if (scope.formData.accountNumber != undefined) {
                                            bodyJson += ",\"accountNumber\":\"" + scope.formData.accountNumber + "\"";
                                        }
                                        if (scope.formData.checkNumber != undefined) {
                                            bodyJson += ",\"checkNumber\":\"" + scope.formData.checkNumber + "\"";
                                        }
                                        if (scope.formData.routingCode != undefined) {
                                            bodyJson += ",\"routingCode\":\"" + scope.formData.routingCode + "\"";
                                        }

                                        if (scope.formData.bankNumber != undefined) {
                                            var banknumber = dateFilter(scope.formData.bankNumber, scope.df);
                                            bodyJson += ",\"bankNumber\":\"" + banknumber + "\"";

                                        }
                                        bodyJson += ",\"locale\":\"en\"";
                                        bodyJson += ",\"dateFormat\":\"dd MMMM yyyy\"";
                                        bodyJson += "}";
                                        request.body = bodyJson;

                                        requests[req++] = request;
                                        requestId++

                                    } else {
                                        submitProcess = false;
                                        alert("Saving Account : " + scope.savingsAccounts[s].id + "\nTransaction date cannot be before account activation date.");
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
                if (scope.mpesaAmount != null) {
                    scope.formData.receiptNumber = scope.mpetxnsacode;
                    if (scope.mpesaAmount != scope.formData.totalAmount) {
                        submitProcess = false;
                        scope.showError = true;
                    }
                }
                if (submitProcess) {
                    http({
                        method: 'POST',
                        url: $rootScope.hostUrl + API_VERSION + '/batches/?enclosingTransaction=true',
                        dataType: 'json',
                        data: requests
                    }).success(function(data){
                        if(data.length==0){
                            scope.showError=true;
                           // alert("Loan Transaction cannot be before the last transaction date");
                            return;
                        } else {
                            if(data.length ==1 && data[0].body != null){

                                if(data[0].body.indexOf('Developer') > 0 || data[0].body.indexOf('developer') > 0){
                                    scope.Error = data[0].body;
                                    scope.showErrorMsg=true;
                                    return;
                                } else  if(data[0].body.indexOf('Exception') > 0){
                                    var index1 = data[0].body.indexOf('Exception');
                                    scope.Error = data[0].body.substring(index1 + 11, data[0].body.length -1);
                                    scope.showErrorMsg=true;
                                    return;
                                }


                            }
                            for (var i = 0; i < data.length; i++) {
                                if (data[i].statusCode === 200) {
                                    if (routeParams.amount != null && routeParams.mpetxnsacode != null) {
                                        http({
                                            method: 'GET',
                                            url: 'http://localhost:9292/mpesa/postpayment?id=' + scope.txnId
                                        }).success(function (data) {
                                        });
                                    }
                                    scope.isDisabled = false;
                                    var tDate = dateFilter(scope.formData.submittedOnDate, 'yyyy-MM-dd');
                                    var reciptNo = scope.formData.receiptNumber;
                                    if (routeParams.amount != null && routeParams.mpetxnsacode != null) {
                                        tDate = dateFilter(routeParams.txnDate, 'yyyy-MM-dd');
                                        reciptNo = scope.mpetxnsacode;
                                    }


                                    scope.printbtn = true;
                                    scope.hidePentahoReport = true;
                                    scope.formData.outputType = 'PDF';
                                    scope.baseURL = $rootScope.hostUrl + API_VERSION + "/runreports/" + encodeURIComponent("Payment Receipts");
                                    scope.baseURL += "?output-type=" + encodeURIComponent(scope.formData.outputType) + "&tenantIdentifier=" + $rootScope.tenantIdentifier + "&locale=" + scope.optlang.code;

                                    var reportParams = "";
                                    var paramName = "R_clientId";
                                    reportParams += encodeURIComponent(paramName) + "=" + encodeURIComponent(routeParams.id) + "&";
                                    paramName = "R_tDate";
                                    reportParams += encodeURIComponent(paramName) + "=" + encodeURIComponent(tDate) + "&";
                                    paramName = "R_reciptNo";
                                    if (reciptNo == undefined || reciptNo == "" || paramName == "-") {
                                        reciptNo = "-";
                                    }
                                    reportParams += encodeURIComponent(paramName) + "=" + encodeURIComponent(reciptNo);
                                    if (reportParams > "") {
                                        scope.baseURL += "&" + reportParams;
                                    }
                                    // allow untrusted urls for iframe http://docs.angularjs.org/error/$sce/insecurl
                                    scope.baseURL = $sce.trustAsResourceUrl(scope.baseURL);

                                }
                            }
                        }
                    }).error(function (data) {
                    });
                } else {

                    if (scope.mpesaAmount != null) {
                    }
                    else {
                        alert("Please enter amount");
                    }
                }
            }
                scope.printReport = function () {
                    window.print();
                    window.close();
                };

            var m_names = new Array("January", "February", "March",
                "April", "May", "June", "July", "August", "September",
                "October", "November", "December");

            function formatDate(d) {
                var month = d.getMonth();
                var day = d.getDate();
                day = day + "";

                if (day.length == 1){
                    day = "0" + day;
                }
                return day + ' ' + m_names[month] + ' ' + d.getFullYear();
            };

            scope.isClosed = function (loanaccount) {
                if (loanaccount.status.code === "loanStatusType.closed.written.off" ||
                    loanaccount.status.code === "loanStatusType.closed.obligations.met" ||
                    loanaccount.status.code === "loanStatusType.closed.reschedule.outstanding.amount" ||
                    loanaccount.status.code === "loanStatusType.withdrawn.by.client" ||
                    loanaccount.status.code === "loanStatusType.rejected") {
                    return true;
                } else {
                    return false;
                }
            };
            scope.isSavingClosed = function (savingaccount) {
                if (savingaccount.status.code === "savingsAccountStatusType.withdrawn.by.applicant" ||
                    savingaccount.status.code === "savingsAccountStatusType.closed" ||
                    savingaccount.status.code === "savingsAccountStatusType.pre.mature.closure" ||
                    savingaccount.status.code === "savingsAccountStatusType.rejected") {
                    return true;
                } else {
                    return false;
                }
            };
            scope.setLoan = function () {
                if (scope.openLoan) {
                    scope.openLoan = false
                } else {
                    scope.openLoan = true;
                }
            };
            scope.setSaving = function () {
                if (scope.openSaving) {
                    scope.openSaving = false;
                } else {
                    scope.openSaving = true;
                }
            };
            resourceFactory.clientNotesResource.getAllNotes({clientId: routeParams.id}, function (data) {
                scope.clientNotes = data;
            });
            scope.getClientIdentityDocuments = function () {
         resourceFactory.clientResource.getAllClientDocuments({clientId: routeParams.id, anotherresource: 'identifiers'}, function (data) {

                    scope.identitydocuments = data;
                    for (var i = 0; i < scope.identitydocuments.length; i++) {
                        resourceFactory.clientIdentifierResource.get({clientIdentityId: scope.identitydocuments[i].id}, function (data) {
                            for (var j = 0; j < scope.identitydocuments.length; j++) {
                                if (data.length > 0 && scope.identitydocuments[j].id == data[0].parentEntityId) {
                                    for (var l in data) {

                                        var loandocs = {};
                                        loandocs = API_VERSION + '/' + data[l].parentEntityType + '/' + data[l].parentEntityId + '/documents/' + data[l].id + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
                                        data[l].docUrl = loandocs;
                                    }
                                    scope.identitydocuments[j].documents = data;
                                }
                            }
                        });
                    }
                });
            };

            resourceFactory.DataTablesResource.getAllDataTables({apptable: 'm_client'}, function (data) {
                scope.clientdatatables = data;
            });

            scope.dataTableChange = function (clientdatatable) {
           resourceFactory.DataTablesResource.getTableDetails({datatablename: clientdatatable.registeredTableName,
                    entityId: routeParams.id, genericResultSet: 'true'}, function (data) {

                    scope.datatabledetails = data;
                    scope.datatabledetails.isData = data.data.length > 0 ? true : false;
                    scope.datatabledetails.isMultirow = data.columnHeaders[0].columnName == "id" ? true : false;
                    scope.showDataTableAddButton = !scope.datatabledetails.isData || scope.datatabledetails.isMultirow;
                    scope.showDataTableEditButton = scope.datatabledetails.isData && !scope.datatabledetails.isMultirow;
                    scope.singleRow = [];
                    for (var i in data.columnHeaders) {
                        if (scope.datatabledetails.columnHeaders[i].columnCode) {
                            for (var j in scope.datatabledetails.columnHeaders[i].columnValues) {
                                for (var k in data.data) {
                                    if (data.data[k].row[i] == scope.datatabledetails.columnHeaders[i].columnValues[j].id) {
                                        data.data[k].row[i] = scope.datatabledetails.columnHeaders[i].columnValues[j].value;
                                    }
                                }
                            }
                        }
                    }
                    if (scope.datatabledetails.isData) {
                        for (var i in data.columnHeaders) {
                            if (!scope.datatabledetails.isMultirow) {
                                var row = {};
                                row.key = data.columnHeaders[i].columnName;
                                row.value = data.data[0].row[i];
                                scope.singleRow.push(row);
                            }
                        }
                    }
                });
            };

            scope.cancel = function () {
                if(routeParams.txnId!=null){
                    if(routeParams.type=='UNMP'){
                        location.path('/mpesa/'+'UNMP');
                    }
                    else {
                        location.path('/mpesa');
                    }
                }
                else {
                    location.path('/viewclient/' + scope.client.id);
                }};

            scope.viewstandinginstruction = function () {
                location.path('/liststandinginstructions/' + scope.client.officeId + '/' + scope.client.id);
            };
            scope.createstandinginstruction = function () {
                location.path('/createstandinginstruction/' + scope.client.officeId + '/' + scope.client.id + '/fromsavings');
            };
            scope.deleteAll = function (apptableName, entityId) {
                resourceFactory.DataTablesResource.delete({datatablename: apptableName, entityId: entityId, genericResultSet: 'true'}, {}, function (data) {
                    route.reload();
                });
            };

            scope.getClientDocuments = function () {
                resourceFactory.clientDocumentsResource.getAllClientDocuments({clientId: routeParams.id}, function (data) {
                    for (var l in data) {

                        var loandocs = {};
                        loandocs = API_VERSION + '/' + data[l].parentEntityType + '/' + data[l].parentEntityId + '/documents/' + data[l].id + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
                        data[l].docUrl = loandocs;
                    }
                    scope.clientdocuments = data;
                });
            };

            scope.deleteDocument = function (documentId, index) {
                resourceFactory.clientDocumentsResource.delete({clientId: routeParams.id, documentId: documentId}, '', function (data) {
                    scope.clientdocuments.splice(index, 1);
                });
            };

            scope.viewDataTable = function (registeredTableName, data) {
                if (scope.datatabledetails.isMultirow) {
                    location.path("/viewdatatableentry/" + registeredTableName + "/" + scope.client.id + "/" + data.row[0]);
                } else {
                    location.path("/viewsingledatatableentry/" + registeredTableName + "/" + scope.client.id);
                }
            };

            scope.downloadDocument = function (documentId) {
                resourceFactory.clientDocumentsResource.get({clientId: routeParams.id, documentId: documentId}, '', function (data) {
                    scope.clientdocuments.splice(index, 1);
                });
            };

            scope.isLoanNotClosed = function (loanaccount) {
                if (loanaccount.status.code === "loanStatusType.closed.written.off" ||
                    loanaccount.status.code === "loanStatusType.closed.obligations.met" ||
                    loanaccount.status.code === "loanStatusType.closed.reschedule.outstanding.amount" ||
                    loanaccount.status.code === "loanStatusType.withdrawn.by.client" ||
                    loanaccount.status.code === "loanStatusType.rejected") {
                    return false;
                } else {
                    return true;
                }
            };

            scope.isSavingNotClosed = function (savingaccount) {
                if (savingaccount.status.code === "savingsAccountStatusType.withdrawn.by.applicant" ||
                    savingaccount.status.code === "savingsAccountStatusType.closed" ||
                    savingaccount.status.code === "savingsAccountStatusType.pre.mature.closure" ||
                    savingaccount.status.code === "savingsAccountStatusType.rejected") {
                    return false;
                } else {
                    return true;
                }
            };

            scope.saveNote = function () {
    resourceFactory.clientResource.save({clientId: routeParams.id, anotherresource: 'notes'}, this.formData, function (data) {
                    var today = new Date();
                    temp = { id: data.resourceId, note: scope.formData.note, createdByUsername: "test", createdOn: today };
                    scope.clientNotes.push(temp);
                    scope.formData.note = "";
                    scope.predicate = '-id';
                });
            }

            scope.deleteClientIdentifierDocument = function (clientId, entityId, index) {
                resourceFactory.clientIdenfierResource.delete({clientId: clientId, id: entityId}, '', function (data) {
                    scope.identitydocuments.splice(index, 1);
                });
            };

            scope.downloadClientIdentifierDocument = function (identifierId, documentId) {
                console.log(identifierId, documentId);
            };
            // devcode: !production
            // *********************** InVenture controller ***********************

            scope.fetchInventureScore = function () {
                // dummy data for the graph - DEBUG purpose
                var inventureScore = getRandomInt(450, 800);
                var natAverage = getRandomInt(450, 800);
                var industryAverage = getRandomInt(450, 800);
                var inventureMinScore = 300;
                var inventureMaxScore = 850;

                // dummy data for inventure loan recommendation - DEBUG purpose
                scope.inventureAgricultureLimit = '21,000';
                scope.inventureFishermenLimit = '27,500';
                scope.inventureHousingLimit = '385,000';
                scope.inventureBusinessLimit = '10,000';

                // this part is used to generate data to see the look of the graph
                function getRandomInt(min, max) {
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                }

                // CHART1 - comparison chart control
                var comparisonData = [
                    {
                        key: "Score Comparison",
                        values: [
                            {
                                "label": "National Average",
                                "value": (natAverage)
                            },
                            {
                                "label": "Agriculture Average",
                                "value": (industryAverage)
                            },
                            {
                                "label": "This Client",
                                "value": (inventureScore)
                            }
                        ]
                    }
                ];

                // add the comparison chart to the viewclient.html
                nv.addGraph(function () {
                    var comparisonChart = nv.models.discreteBarChart()
                        .x(function (d) {
                            return d.label
                        })
                        .y(function (d) {
                            return d.value
                        })
                        .staggerLabels(true)
                        .tooltips(true)
                        .showValues(true);

                    // set all display value to integer
                    comparisonChart.yAxis.tickFormat(d3.format('d'));
                    comparisonChart.valueFormat(d3.format('d'));
                    comparisonChart.forceY([inventureMinScore, inventureMaxScore]);

                    d3.select('#inventureBarChart svg')
                        .datum(comparisonData)
                        .transition().duration(1500)
                        .call(comparisonChart);

                    nv.utils.windowResize(comparisonChart.update);
                    return comparisonChart;
                });

                // CHART2 - inventure score bullet chart control
                nv.addGraph(function () {
                    var bullet = nv.models.bulletChart()
                        .tooltips(false);

                    d3.select('#inventureBulletChart svg')
                        .datum(scoreData())
                        .transition().duration(1500)
                        .call(bullet);

                    nv.utils.windowResize(bullet.update);
                    return bullet;
                });

                function scoreData() {
                    return {
                        "title": "",
                        "ranges": [(inventureMinScore - 300), (inventureMaxScore - 300)],
                        "measures": [(inventureScore - 300)],
                        "markers": [(inventureScore - 300)]
                    };
                    // this will be used to display the score on the viewclient.html
                    scope.inventureScore = inventureScore;
                };
            };
                scope.showSignature = function () {
                    $modal.open({
                        templateUrl: 'clientSignature.html',
                        controller: ViewLargerClientSignature,
                        size: "lg"
                    });
                };

                scope.showWithoutSignature = function () {
                    $modal.open({
                        templateUrl: 'clientWithoutSignature.html',
                        controller: ViewClientWithoutSignature,
                        size: "lg"
                    });
                };

                scope.showPicture = function () {
                    $modal.open({
                        templateUrl: 'photo-dialog.html',
                        controller: ViewLargerPicCtrl,
                        size: "lg"
                    });
                };
                var ViewClientWithoutSignature = function ($scope, $modalInstance) {
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                };
                var ViewLargerClientSignature = function ($scope, $modalInstance) {
                    var loadSignature = function () {
                        http({
                            method: 'GET',
                            url: $rootScope.hostUrl + API_VERSION + '/clients/' + routeParams.id + '/documents'
                        }).then(function (docsData) {
                            var docId = -1;
                            for (var i = 0; i < docsData.data.length; ++i) {
                                if (docsData.data[i].name == 'clientSignature') {
                                    docId = docsData.data[i].id;
                                    scope.signature_url = $rootScope.hostUrl + API_VERSION + '/clients/' + routeParams.id + '/documents/' + docId + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
                                }
                            }
                            if (scope.signature_url != null) {
                                http({
                                    method: 'GET',
                                    url: $rootScope.hostUrl + API_VERSION + '/clients/' + routeParams.id + '/documents/' + docId + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier
                                }).then(function (docsData) {
                                    $scope.largeImage = scope.signature_url;
                                });
                            }
                        });
                    };
                    loadSignature();
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                };

                var ViewLargerPicCtrl = function ($scope, $modalInstance) {
                    var loadImage = function () {
                        if (scope.client.imagePresent) {
                            http({
                                method: 'GET',
                                url: $rootScope.hostUrl + API_VERSION + '/clients/' + routeParams.id + '/images?maxWidth=860'
                            }).then(function (imageData) {
                                $scope.largeImage = imageData.data;
                            });
                        }
                    };
                    loadImage();
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                };

            }
                        });


    mifosX.ng.application.controller('ClientPaymentsController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', '$http', '$modal', 'API_VERSION', '$rootScope', '$upload', 'dateFilter', '$sce','$location', mifosX.controllers.ClientPaymentsController]).run(function ($log) {
        $log.info("ClientPaymentsController initialized");

    });
}(mifosX.controllers || {}));