(function (module) {
    mifosX.controllers = _.extend(module, {
        ImportClientController: function (scope, resourceFactory, location, http, dateFilter, API_VERSION, $upload, $rootScope) {
			

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

			scope.apiEndPoint = [ $rootScope.hostUrl + API_VERSION + '/clients/import/', 
				$rootScope.hostUrl + API_VERSION + '/clientsofgroup/import/' ];
			scope.tenantIdentifier = '?tenantIdentifier='
					+ $rootScope.tenantIdentifier;

			scope.getClientTemplate = function() {

				if( scope.clientType == scope.clientTypeOptions[0] )
					$docURL = scope.apiEndPoint[0];
				else
					$docURL = scope.apiEndPoint[1];
					
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
				    
					if( scope.clientType == scope.clientTypeOptions[0] )
						var fileName = "Client.xls";
					else
						var fileName = "Client-MemberOfGroup.xls";
				    
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

			scope.importClients = function() {

				this.formData.clientType = scope.clientType.index;

				$upload.upload({
					url : $rootScope.hostUrl + API_VERSION + '/clients/import',
					data : scope.formData,
					file : scope.fileToUpload
				}).progress(function (evt) {
                    // get upload percentage
                    console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                }).success(function(data, status, headers, config) {
										
					var blob = new Blob([data], {type: "application/vnd.ms-excel"});
				    var objectUrl = URL.createObjectURL(blob);
				    
				    if(headers('Success')){
				    	
				    	scope.response = "Clients are sucessfully imported!";
				    	location.path('/clients');
				    }else{
				    	scope.response = "Client import is failed!";
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
    mifosX.ng.application.controller('ImportClientController', ['$scope', 'ResourceFactory', '$location', '$http', 'dateFilter', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.ImportClientController]).run(function ($log) {
        $log.info("ImportClientController initialized");
    });
}(mifosX.controllers || {}));
