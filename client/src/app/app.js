angular.module( 'angularOAuth', [
  'templates-app',
  'templates-common',
  'angularOAuth.about',
  'angularOAuth.basic',
  'angularOAuth.home',
  'angularOAuth.login',
  'angularOAuth.oauth',
  'angularOAuth.oauthLogin',
  'angularOAuth.token',
  'ui.router'
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider.otherwise( '/home' );
})

/**
 * If there is a defined auth token, add it to outgoing requests
 */
.run(['$rootScope', '$injector', function($rootScope,$injector) {
    $injector.get("$http").defaults.transformRequest = function(data, headersGetter) {
        if ($rootScope.token) {
            headersGetter()['Authorization'] = "Bearer "+$rootScope.token;
        }
        if (data) {
            return angular.toJson(data);
        }
        return data;
    };
}])

.controller( 'AppCtrl', function AppCtrl ( $scope, $location ) {
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        if ( angular.isDefined( toState.data.pageTitle ) ) {
            $scope.pageTitle = toState.data.pageTitle + ' | angular-oauth' ;
        }
    });
})

;
