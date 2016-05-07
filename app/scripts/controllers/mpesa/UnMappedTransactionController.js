(function (module) {
    mifosX.controllers = _.extend(module, {
        UnMappedTransactionController: function (scope, resourceFactory, location,routeParams,dateFilter) {
           // if(routeParams.amount!=null&& routeParams.mpetxnsacode!=null){
                scope.clients = [];
                scope.searchText = "";
                scope.searchResults = [];
                scope.mpesaPayment=true;
                scope.mpesaAmount=routeParams.amount;
                scope.mpetxnsacode=routeParams.mpetxnsacode;
                scope.TxnDate=dateFilter(routeParams.txnDate, 'dd MMMM yyyy');
                scope.txnId=routeParams.txnId;
                scope.clientName=routeParams.clientName;
                scope.mobileNo=routeParams.mobileNo;
                var n=scope.mobileNo;
               scope.mobileNo= n.substring(3, n.length);
           // }

            scope.routeTo = function (id) {
                location.path('/clientpayments/' + id + '/' + scope.mpesaAmount + '/' + scope.mpetxnsacode + '/' + scope.TxnDate + '/' + scope.txnId+ '/' +'UNMP');
            };

            scope.return=function(){
                location.path('/mpesa/'+'UNMP');
            }
            scope.groupsPerPage = 15;
            scope.getResultsPage = function (pageNumber) {
                var items = resourceFactory.clientResource.getAllClients({
                    offset: ((pageNumber - 1) * scope.groupsPerPage),
                    limit: scope.groupsPerPage
                }, function (data) {
                    scope.clients = data.pageItems;
                });
            }
            scope.initPage = function () {
                var items = resourceFactory.clientResource.getAllClients({
                    offset: 0,
                    limit: scope.groupsPerPage
                }, function (data) {
                    scope.totalClients = data.totalFilteredRecords;
                    scope.clients = data.pageItems;
                });
            }
            scope.initPage();



            scope.search = function () {
                scope.clients = [];
                scope.searchResults = [];
                scope.filterText = "";
                if(!scope.searchText){
                    scope.initPage();
                } else {
                    resourceFactory.globalSearch.search({query: scope.searchText}, function (data) {
                        var arrayLength = data.length;
                        for (var i = 0; i < arrayLength; i++) {
                            var result = data[i];
                            var client = {};
                            client.status = {};
                            client.subStatus = {};
                            client.status.value = result.entityStatus.value;
                            client.status.code  = result.entityStatus.code;
                            if(result.entityType  == 'CLIENT'){
                                client.displayName = result.entityName;
                                client.accountNo = result.entityAccountNo;
                                client.id = result.entityId;
                                client.officeName = result.parentName;
                                client.externalId = result.entityExternalId;
                                client.nationalId = result.entityNationalId;
                                scope.clients.push(client);
                            }else if (result.entityType  == 'CLIENTIDENTIFIER'){
                                client.displayName = result.parentName;
                                client.id = result.parentId;
                                scope.clients.push(client);
                            }
                        }
                    });
                }
            }


        }
    });

            mifosX.ng.application.controller('UnMappedTransactionController', ['$scope', 'ResourceFactory', '$location','$routeParams','dateFilter', mifosX.controllers.UnMappedTransactionController]).run(function ($log) {
                $log.info("UnMappedTransactionController initialized");
            });
        }(mifosX.controllers || {}));
     