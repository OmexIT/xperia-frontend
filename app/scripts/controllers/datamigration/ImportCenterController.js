(function (module) {
    mifosX.controllers = _.extend(module, {
        ImportCenterController: function (scope, resourceFactory, location, http, dateFilter, API_VERSION, $upload, $rootScope) {
			

			scope.clientTypeOptions = [ {
				name : 'individual',
				index : 0
			}, {
				name : 'member of group',
				index : 1
			} ];

			scope.clientType = scope.clientTypeOptions[0];

			scope.formData = {};
			scope.getTemplateParameters = {};
			scope.getData = {};
			scope.response = {};

			scope.getCenterTemplate = function() {

				$docURL = $rootScope.hostUrl + API_VERSION + '/centers/import';
				
				http({
				    url: $docURL,
				    method: "GET",
				    data: {},
				    headers:{
				       'Content-type': 'application/json'
				    },
				    responseType: 'arraybuffer'
				}).success(function (data, status, headers, config) {
				    var blob = new Blob([data], {type: "application/vnd.ms-excel"});
				    var objectUrl = URL.createObjectURL(blob);
				    
				    var fileName = "Centers.xls";

				    var downloadLink = document.createElement("a");
				    downloadLink.href = objectUrl;
				    downloadLink.download = fileName;

				    document.body.appendChild(downloadLink);
				    downloadLink.click();
				    document.body.removeChild(downloadLink);
				    
				}).error(function (data, status, headers, config) {
				    //upload failed
				});
			};

			scope.onFileSelect = function($files) {
				scope.fileToUpload = $files[0];
			};

			scope.importCenters = function() {

				this.formData.clientType = scope.clientType.index;

				$upload.upload({
					url : $rootScope.hostUrl + API_VERSION + '/centers/import',
					data : scope.formData,
					file : scope.fileToUpload
				}).progress(function (evt) {
                    // get upload percentage
                    console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                }).success(function(data, status, headers, config) {
					
					var blob = new Blob([data], {type: "application/vnd.ms-excel"});
				    var objectUrl = URL.createObjectURL(blob);
				    
				    if(headers('Success')){
				    	
				    	scope.response = "Centers are sucessfully imported!";
				    	location.path('/centers');
				    	
				    }else{
				    	scope.response = "Centers import is failed!";
				    	var fileName = "Re-Upload.xls";				    	

					    var downloadLink = document.createElement("a");
					    downloadLink.href = objectUrl;
					    downloadLink.download = fileName;

					    document.body.appendChild(downloadLink);
					    downloadLink.click();
					    document.body.removeChild(downloadLink);
					    
				    }
				    //console.log(headers());
					
					// to fix IE not refreshing the model
					if (!scope.$$phase) {
						scope.$apply();
					}
				});
			};
        }
    });
    mifosX.ng.application.controller('ImportCenterController', ['$scope', 'ResourceFactory', '$location', '$http', 'dateFilter', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.ImportCenterController]).run(function ($log) {
        $log.info("ImportCenterController initialized");
    });
}(mifosX.controllers || {}));
