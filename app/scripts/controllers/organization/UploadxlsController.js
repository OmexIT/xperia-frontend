(function (module) {
    mifosX.controllers = _.extend(module, {

        UploadxlsController: function (scope, location, http, API_VERSION, $upload, $rootScope, resourceFactory) {
            scope.offices = [];
            scope.submt = 0;

            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
                scope.formData = {
                    officeId: scope.offices[0].id
                }
            });
            scope.onFileSelect = function ($files) {
                scope.file = $files[0];
            };


            scope.submit = function () {

                var i = 0;
                $upload.upload({
                    url: $rootScope.hostUrl + API_VERSION + '/uploadxls/',
                    data: scope.formData,
                    file: scope.file

                }).success(function (data) {
                    // to fix IE not refreshing the model
                    i = 1;
                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                    scope.submt = 1;
                    location.path('/uploadxls/');
                })

                if(i==0){
                    scope.submt = 2;
                }
               // alert('response is :', +$rootScope.successfulResponses);
            };

        }

    });

    mifosX.ng.application.controller('UploadxlsController', ['$scope','$location','$http','API_VERSION','$upload','$rootScope', 'ResourceFactory' ,mifosX.controllers.UploadxlsController]).run(function ($log) {

        $log.info("UploadxlsController initialized");
    });
}(mifosX.controllers || {}));

