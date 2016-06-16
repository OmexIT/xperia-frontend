(function (module) {
    mifosX.controllers = _.extend(module, {
        SmsCampaignController: function (scope, resourceFactory, location, $rootScope, $http, $log, localStorageService, $filter) {
            var smsPath = 'http://localhost:19886/sms';

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

            scope.smsStatusTypes = [
                {name: 'DELIVERED', value: 'Delivered'},
                {name: 'ACCEPTED', value: 'Accepted'},
                {name: 'PENDING', value: 'Pending'},
                {name: 'FAILED', value: 'Failed'}
            ];


            scope.offices = [];
            scope.clients = [];
            scope.smsTemplates = [];
            scope.submt = false;
            //scope.officeId1 = 1
            scope.formData = {};
            scope.smsLogsFilter = {};
            scope.formData.messageTemplate = '';
            scope.mobileNo = {};
            scope.selected = false;
            scope.client = [];
            scope.mobileNoForSending = '';
            scope.data = [];
            scope.additionalNumber = '';
            scope.MobileNumbers = '';
            scope.complete1 = false;
            scope.officeId1 = $rootScope.ofId;
            scope.send = true;
            scope.formData.startDate = new Date();
            scope.formData.endDate = new Date();
            scope.formData.schedule_once = true;
            scope.userId = localStorageService.getFromLocalStorage("userData").userId;
            scope.createNewCampaign = false;
            scope.isFiltered = false;

            scope.campaignsPerPage = 11;
            scope.totalCampaigns = 0;
            scope.filterText = "";

            scope.messagesPerPage = 10;
            scope.totalMessages = 0;

            scope.showCreateNewCampaign = function () {
                scope.createNewCampaign = true;
            };


            scope.myConfig = {
                options: {
                    allowMinute: false
                }
            };
            scope.formData.crontabExpression = '0 0 1 * *';

            scope.campaignTab = 1;

            scope.tab = 1;

            scope.selectCampaignTab = function (setTab) {
                scope.campaignTab = setTab;
            };

            scope.isCampaignSelected = function (checkTab) {
                return scope.campaignTab === checkTab;
            };

            scope.selectTab = function (setTab) {
                scope.tab = setTab;
            };

            scope.isSelected = function (checkTab) {
                return scope.tab === checkTab;
            };

            scope.campaigns = [];
            scope.getCampaignResultsPage = function (pageNumber) {
                var startPosition = (pageNumber - 1) * scope.campaignsPerPage;
                scope.campaigns = scope.actualCampaigns.slice(startPosition, startPosition + scope.campaignsPerPage);
            };

            scope.messages = [];
            scope.getMessagesResultsPage = function (pageNumber) {
                var startPosition = (pageNumber - 1) * scope.messagesPerPage;
                scope.messages = scope.actualMessages.slice(startPosition, startPosition + scope.messagesPerPage);
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

            scope.actualCampaigns = [];
            scope.fetchSMSCampaign = function () {

                $http({
                    method: 'GET',
                    url: smsPath + '/campaigns',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(function (response) {
                    scope.totalCampaigns = response.data.pageItemsCount;
                    scope.actualCampaigns = response.data.data;
                    scope.getCampaignResultsPage(1);
                    scope.isErr = false;
                }, function (response) {
                    scope.errorMessage = response.data.message;
                    scope.isErr = true;
                    // $log.error(response.data);
                });

            };

            scope.actualMessages = [];
            scope.fetchSMSLogs = function () {
                if (scope.smsLogsFilter.smsStatus &&
                    scope.smsLogsFilter.fromDate &&
                    scope.smsLogsFilter.toDate) {
                    $http({
                        method: 'GET',
                        url: smsPath + '/logs/messages?smsStatus=' + scope.smsLogsFilter.smsStatus.name +
                        '&fromDate=' + $filter('date')(scope.smsLogsFilter.fromDate, 'yyyy-MM-dd') +
                        '&toDate=' + $filter('date')(scope.smsLogsFilter.toDate, 'yyyy-MM-dd'),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }).then(function (response) {
                        scope.totalMessages = response.data.pageItemsCount;
                        scope.actualMessages = response.data.data;
                        scope.getMessagesResultsPage(1);
                        scope.isFiltered = true;
                        scope.isErr = false;
                    }, function (response) {
                        scope.errorMessage = response.data.message;
                        scope.isErr = true;
                        // $log.error(response.data);
                    });
                } else {
                    scope.errorMessage = 'Please select filter parameters to proceed';
                    scope.isErr = true;
                }

            };

            scope.addCampaignMessageVariable = function (variable) {
                scope.formData.messageTemplate = scope.formData.messageTemplate + '{{' + variable + '}}';
            };

            scope.createSMSCampaign = function () {
                var data = {
                    campaign_name: scope.formData.campaignName,
                    campaign_type: scope.formData.campaignType.id,
                    start_date: $filter('date')(scope.formData.startDate, 'dd-MM-yyyy'),
                    end_date: $filter('date')(scope.formData.endDate, 'dd-MM-yyyy'),
                    cron_expression: scope.formData.crontabExpression,
                    created_by: scope.userId,
                    schedule_once: scope.formData.schedule_once,
                    tenant_id: $rootScope.tenantIdentifier,
                    campaign_criteria: scope.formData.businessRule,
                    message_template: scope.formData.messageTemplate
                };
                $http({
                    method: 'POST',
                    url: smsPath + '/campaigns',
                    data: data,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(function (response) {
                    scope.pendingSMS = response.data.data;
                    scope.isErr = false;
                    scope.formData = {};
                    scope.createNewCampaign = false;
                }, function (response) {
                    scope.errorMessage = response.data.message;
                    scope.isErr = true;
                    // $log.error(response.data);
                });
            };

            scope.validateCampaignTabs = function () {
                var isValid = false;
                if (scope.tab == 1) {
                    if (scope.formData.campaignName &&
                        scope.formData.campaignType &&
                        scope.formData.businessRule) {
                        if (scope.formData.campaignType.id == 1) {
                            isValid = true;
                        } else if (scope.formData.campaignType.id == 2) {
                            if (scope.formData.crontabExpression) {
                                if (scope.formData.schedule_once) {
                                    isValid = true;
                                } else if (!scope.formData.schedule_once) {
                                    if (scope.formData.startDate &&
                                        scope.formData.endDate) {
                                        isValid = true;
                                    }
                                }
                            }
                        }
                    }
                } else if (scope.tab == 2) {
                    if (scope.formData.messageTemplate) {
                        isValid = true;
                    }
                } else if (scope.tab == 3) {
                    if (scope.formData.campaignName &&
                        scope.formData.campaignType &&
                        scope.formData.businessRule &&
                        scope.formData.messageTemplate) {
                        if (scope.formData.campaignType.id == 1) {
                            isValid = true;
                        } else if (scope.formData.campaignType.id == 2) {
                            if (scope.formData.crontabExpression) {
                                if (scope.formData.schedule_once) {
                                    isValid = true;
                                } else if (!scope.formData.schedule_once) {
                                    if (scope.formData.startDate &&
                                        scope.formData.endDate) {
                                        isValid = true;
                                    }
                                }
                            }
                        }
                    }
                }

                return isValid;
            };

        }


    });
    mifosX.ng.application.controller('SmsCampaignController', [
        '$scope',
        'ResourceFactory',
        '$location',
        '$rootScope',
        '$http',
        '$log',
        'localStorageService',
        '$filter',
        mifosX.controllers.SmsCampaignController]).run(function ($log) {
        $log.info("SmsCampaignController initialized");
    });
}(mifosX.controllers || {}));