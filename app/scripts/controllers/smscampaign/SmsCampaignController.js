(function (module) {
    mifosX.controllers = _.extend(module, {
        SmsCampaignController: function (scope, resourceFactory, location, $rootScope) {
            scope.campaignTypes = [
                {id: 1, name: "Direct"},
                {id: 2, name: "Scheduled"}
            ];

            scope.businessRules = [
                {id: 1, name: "Active clients"},
                {id: 2, name: "Office Clients"},
                {id: 3, name: "Prospective Clients"},
                {id: 4, name: "Active Loan Clients"},
                {id: 5, name: "Loan in Arrears"},
                {id: 6, name: "Loan Payments Due"},
                {id: 7, name: "Happy Birthday"},
                {id: 8, name: "Loan Fully Repaid"},
                {id: 9, name: "Loan Outstanding After Final Installment Date"}];

            scope.offices = [];
            scope.clients = [];
            scope.smsTemplates = [];
            scope.submt = false;
            //scope.officeId1 = 1
            scope.formData = {};
            scope.mobileNo = {};
            scope.selected = false;
            scope.client = [];
            scope.mobileNoForSending = '';
            scope.data = [];
            scope.additionalNumber = '';
            scope.MobileNumbers = '';
            scope.complete1 = false;
            scope.p = {};
            scope.a = {};
            scope.officeId1 = $rootScope.ofId;
            scope.send = true;

            scope.tab = 1;

            scope.selectTab = function (setTab) {
                scope.tab = setTab;
            };

            scope.isSelected = function (checkTab) {
                return scope.tab === checkTab;
            };


            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
                // scope.formData = {
                //     officeId: scope.offices[0].id
                // }
            });

            resourceFactory.templateResource.get(function (data) {
                scope.smsTemplates = data;
            });

            scope.addClient = function () {
                for (var i in this.formData.id) {
                    for (var j in scope.clients) {
                        if (scope.clients[j].id == this.formData.id[i]) {
                            var temp = {};
                            temp.id = this.formData.id[i];
                            temp.mobileNo = scope.clients[j].mobileNo;
                            temp.displayName = scope.clients[j].displayName;
                            temp.externalId = scope.clients[j].externalId;
                            scope.client.push(temp);
                            scope.clients.splice(j, 1);
                        }

                    }
                }

                this.formData.id = this.formData.id - 1;
            };

            scope.removeClient = function () {

                for (var i in this.formData.client) {
                    for (var j in scope.client) {
                        if (scope.client[j].id == this.formData.client[i]) {

                            var temp = {};
                            temp.id = this.formData.client[i];
                            temp.displayName = scope.client[j].displayName;
                            temp.mobileNo = scope.client[j].mobileNo;
                            temp.externalId = scope.client[j].externalId;
                            scope.clients.push(temp);
                            scope.client.splice(j, 1);
                        }
                    }
                }
                this.formData.client = this.formData.client - 1;
            };

            scope.select = function () {
                scope.selected = false;
                scope.mobileNo = scope.formData.id;
                scope.formData.mobileNo = scope.mobileNo;

            }

            scope.selectAll = function () {
                scope.selected = false;
                //reduce the size of clients by 1;
                this.formData.clients = this.formData.clients - 1;
                for (var l in scope.clients) {

                    var temp = {};
                    temp.id = scope.clients[l].id;
                    temp.displayName = scope.clients[l].displayName;
                    temp.mobileNo = scope.clients[l].mobileNo;
                    temp.externalId = scope.clients[l].externalId;
                    scope.client.push(temp);
                }
                //scope.client= scope.mobileNo;
                scope.clients = [];

            }

            scope.clear = function () {
                for (var l in scope.client) {
                    var temp = {};
                    temp.id = scope.client[l].id;
                    temp.displayName = scope.client[l].displayName;
                    temp.mobileNo = scope.client[l].mobileNo;
                    temp.externalId = scope.client[l].externalId;
                    scope.clients.push(temp);
                }
                scope.client = [];
                scope.selected = false;
                scope.formData.mobileNo = " ";
                scope.formData.id = "";
                //reduce the size of selected client Array
                this.formData.client = this.formData.client - 1;

                //scope.clients=scope.formData.client;
            }
            scope.cancle = function () {
                //scope.selected=false;
                scope.formData.messageText = " ";
            }
            var param = {};
            scope.filterText = "";
            param.officeId = scope.officeId1;
            var items = resourceFactory.clientResource.getAllClients(param, function (data) {
                scope.totalClients = data.totalFilteredRecords;
                scope.clients = data.pageItems;

            });


            scope.fetchClientByOfficeId = function (officeId) {
                scope.officeId1 = officeId;
                var params = {};
                params.officeId = officeId;
                scope.formData.mobileNo = "";

                var items = resourceFactory.clientResource.getAllClients(params, function (data) {
                    scope.totalClients = data.totalFilteredRecords;
                    scope.clients = data.pageItems;

                });

                //scope.client = [];
            };

            scope.fetchPendingSMS=function () {

            };

            scope.search = function () {
                scope.clients = [];
                scope.searchResults = [];
                scope.filterText = "";

                resourceFactory.globalSearch.search({query: scope.searchText}, function (data) {
                    var arrayLength = data.length;
                    for (var i = 0; i < arrayLength; i++) {
                        var result = data[i];
                        var client = {};
                        client.status = {};
                        client.subStatus = {};
                        client.status.value = result.entityStatus.value;
                        client.status.code = result.entityStatus.code;
                        if (result.entityType == 'CLIENT') {
                            client.displayName = result.entityName;
                            client.accountNo = result.entityAccountNo;
                            client.id = result.entityId;
                            client.officeName = result.parentName;
                            client.externalId = result.entityExternalId;
                            //mobile no. newly added
                            client.mobileNo = result.entityMobileNo;
                            // alert(result.externalId);
                            scope.clients.push(client);
                        } else if (result.entityType == 'CLIENTIDENTIFIER') {
                            client.displayName = result.parentName;
                            client.id = result.parentId;
                            scope.clients.push(client);
                        }
                    }
                });

            }


            scope.sendMessage = function () {
                for (var i in scope.client) {
                    if (scope.client[i].mobileNo != null && scope.client[i].mobileNo != "") {
                        scope.mobileNoForSending = scope.mobileNoForSending + scope.client[i].mobileNo + "-" + scope.client[i].displayName + "-" + scope.client[i].id + ",";
                    }
                }
                if (angular.isUndefined(scope.formData.additionalNumber) || scope.formData.additionalNumber == "") {
                    scope.MobileNumbers = scope.mobileNoForSending.substring(0, scope.mobileNoForSending.length - 1);
                }
                else {
                    scope.MobileNumbers = scope.mobileNoForSending + scope.formData.additionalNumber;
                }
                var params = {};
                params.datatable = "OfficeDetails";
                params.apptableId = scope.formData.officeId;
                params.order = null;
                scope.t = "";

                resourceFactory.datatableResource.getsmsEnableOffice(params, function (data) {
                    if (data[0] != null) {
                        scope.p = data[0];
                    }
                    var isSendSms = scope.p.sms_enabled;
                    if (isSendSms == 'true') {
                        var messagejson = {};
                        messagejson.target = scope.MobileNumbers;
                        messagejson.type = "sms";
                        messagejson.entity_id = scope.formData.officeId;
                        messagejson.message = scope.formData.messageText;
                        resourceFactory.notificationResource.post(messagejson, function (data) {
                            //  var response=data.valueOf();
                            scope.complete1 = true;

                        });


                    } else {
                        scope.send = false;
                    }
                });

                scope.mobileNoForSending = '';


            }
        }


    });
    mifosX.ng.application.controller('SmsCampaignController', ['$scope', 'ResourceFactory', '$location', '$rootScope', mifosX.controllers.SmsCampaignController]).run(function ($log) {
        $log.info("SmsCampaignController initialized");
    });
}(mifosX.controllers || {}));