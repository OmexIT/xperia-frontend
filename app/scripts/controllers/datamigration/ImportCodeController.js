(function (module) {
    mifosX.controllers = _.extend(module, {
        ImportCodeController: function (scope, resourceFactory, location, http, dateFilter, API_VERSION, $upload, $rootScope) {
			

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

			scope.getCodeTemplate = function() {

				$docURL = $rootScope.hostUrl + API_VERSION + '/codes/import';
				
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
				    
				    var fileName = "Code.xls";

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

			scope.importCodes = function() {

				this.formData.clientType = scope.clientType.index;

				$upload.upload({
					url : $rootScope.hostUrl + API_VERSION + '/codes/import',
					data : scope.formData,
					file : scope.fileToUpload
				}).progress(function (evt) {
                    // get upload percentage
                    console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                }).success(function(data, status, headers, config) {
					
					var blob = new Blob([data], {type: "application/vnd.ms-excel"});
				    var objectUrl = URL.createObjectURL(blob);
				    
				    if(headers('Success')){
				    	
				    	scope.response = "Codes are sucessfully imported!";
						location.path('/codes');
						
				    }else{
				    	scope.response = "Codes import is failed!";
				    	var fileName = "Re-Upload.xls";
						
						var downloadLink = document.createElement("a");
						downloadLink.href = objectUrl;
						downloadLink.download = fileName;

						document.body.appendChild(downloadLink);
						downloadLink.click();
						document.body.removeChild(downloadLink);
				    }
				    console.log(headers());

					// to fix IE not refreshing the model
					if (!scope.$$phase) {
						scope.$apply();
					}
				});
			};
			
			scope.getCodeValueTemplate = function() {

				$docURL = $rootScope.hostUrl + API_VERSION + '/codevalues/import';
				
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
				    
				    var fileName = "CodeValue.xls";

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

			scope.importCodeValues = function() {

				this.formData.clientType = scope.clientType.index;

				$upload.upload({
					url : $rootScope.hostUrl + API_VERSION + '/codevalues/import',
					data : scope.formData,
					file : scope.fileToUpload
				}).progress(function (evt) {
                    
                    console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                }).success(function(data, status, headers, config) {
					
					
					var blob = new Blob([data], {type: "application/vnd.ms-excel"});
				    var objectUrl = URL.createObjectURL(blob);
				    
				    if(headers('Success')){
				    	
				    	scope.response = "Code Values are sucessfully imported!";
						location.path('/codes');
						
				    }else{
				    	scope.response = "Code Values import is failed!";
				    	var fileName = "Re-Upload.xls";
						
						var downloadLink = document.createElement("a");
						downloadLink.href = objectUrl;
						downloadLink.download = fileName;

						document.body.appendChild(downloadLink);
						downloadLink.click();
						document.body.removeChild(downloadLink);
				    }
				    console.log(headers());
					
					// to fix IE not refreshing the model
					if (!scope.$$phase) {
						scope.$apply();
					}
					
				});
			};
        }
    });
    mifosX.ng.application.controller('ImportCodeController', ['$scope', 'ResourceFactory', '$location', '$http', 'dateFilter', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.ImportCodeController]).run(function ($log) {
        $log.info("ImportCodeController initialized");
    });
}(mifosX.controllers || {}));
