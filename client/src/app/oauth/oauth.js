/**
 * Each section of the site has its own module. It probably also has
 * submodules, though this boilerplate is too simple to demonstrate it. Within
 * `src/app/oauth`, however, could exist several additional folders representing
 * additional modules that would then be listed as dependencies of this one.
 * For example, a `note` section could have the submodules `note.create`,
 * `note.delete`, `note.edit`, etc.
 *
 * Regardless, so long as dependencies are managed correctly, the build process
 * will automatically take take of the rest.
 *
 * The dependencies block here is also where component dependencies should be
 * specified, as shown below.
 */
angular.module( 'angularOAuth.oauth', [
    'ui.router'
])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
    .config(['$stateProvider', '$httpProvider', function config( $stateProvider, $httpProvider ) {
        $stateProvider.state( 'oauth', {
            url: '/oauth',
            views: {
                "main": {
                    controller: 'OauthCtrl',
                    templateUrl: 'oauth/oauth.tpl.html'
                }
            },
            data:{ pageTitle: 'Oauth' }
        });
        // intercept for tokens
        $httpProvider.responseInterceptors.push([
            '$rootScope', '$q', '$injector','$location',
            function ($rootScope, $q, $injector, $location) {
                return function(promise) {
                    return promise.then(function(response) {
                        return response; // no action, was successful
                    }, function (response) {
                        // if oauth gets a 401 or 403 try to get a token, maybe calling login
                        if ($location.path() === '/oauth' && (response.status===401 || response.status===403)) {
                            var deferred = $q.defer(); // defer until we while request a token
                            // try refreshing the token(cannot inject $http directly as will cause a circular ref)
                            $injector.get("$http")('https://accounts.google.com/o/oauth2/auth')
                                .then(refreshed(deferred, response), refreshFailed(deferred));
                            return deferred.promise;
                        }
                        return $q.reject(response); // not a recoverable error
                        // return response; // not our error
                    });
                };
                function refreshed(deferred, response) {
                    return function(loginResponse) {
                        if (loginResponse.data) {
                            // might have to parse the data
                            $rootScope.token = loginResponse.data; // we have a token - put on $rootScope
                            // retry the original request - transformRequest in .run() below will add the token
                            $injector.get("$http")(response.config).then(function(response) {
                                // we have a successful response - resolve it using deferred
                                deferred.resolve(response);
                            },function(response) {
                                deferred.reject(); // something went wrong with retry
                            });
                        } else {
                            deferred.reject(); // login.json didn't give us data
                        }
                    };
                }
                function refreshFailed(deferred) {
                    return function(response) {
                        deferred.reject(); // token retry failed, must login
                        $location.path('/oauthlogin');
                        return;
                    };
                }
            }]);
    }])

/**
 * And of course we define a controller for our route.
 */
    .controller( 'OauthCtrl', ['$scope', '$http', function OauthController( $scope, $http ) {
     $http.get('https://www.googleapis.com/plus/v1/people/me').success(function(result){
            $scope.result = result;
     }).error(function(result, status) {
         $scope.result = "Error["+status+"]: "+result;
     });
    }]);
