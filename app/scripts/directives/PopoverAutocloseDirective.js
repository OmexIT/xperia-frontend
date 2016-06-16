(function (module) {
    mifosX.directives = _.extend(module, {
        PopoverAutoclose: function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var timeoutHandle;

                    scope.$watch('tt_isOpen', function (isOpen) {
                        $timeout.cancel(timeoutHandle);

                        if (isOpen) {
                            timeoutHandle = $timeout(function () {
                                scope.tt_isOpen = false;
                            }, +attrs.PopoverAutoclose || 5000);
                        }
                    });
                }
            }

        }
    });
}(mifosX.directives || {}));

mifosX.ng.application.directive("popoverAutoclose", [mifosX.directives.PopoverAutoclose]).run(function ($log) {
    $log.info("PopoverAutoclose initialized");
});

