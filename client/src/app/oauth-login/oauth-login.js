/**
 * Each section of the site has its own module. It probably also has
 * submodules, though this boilerplate is too simple to demonstrate it. Within
 * `src/app/login`, however, could exist several additional folders representing
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
angular.module( 'angularOAuth.oauthLogin', [
  'ui.router'
])

/**
 * Each section or module of the site can also have its own routes. AngularJS
 * will handle ensuring they are all available at run-time, but splitting it
 * this way makes each module more "self-contained".
 */
.config(function config( $stateProvider ) {
  $stateProvider.state( 'oauthLogin', {
    url: '/oauthlogin',
    views: {
      "main": {
        controller: 'OAuthLoginCtrl',
        templateUrl: 'oauth-login/oauth-login.tpl.html'
      }
    },
    data:{ pageTitle: 'OAuth Login' }
  });
})

.config(function config( $stateProvider ) {
  $stateProvider.state( 'oauthCallback', {
    url: '/state={state}',
    views: {
      "main": {
        controller: 'OAuthCallbackCtrl',
        templateUrl: 'oauth-login/oauth-login.tpl.html'
      }
    },
    data:{ pageTitle: 'OAuth Callback' }
  });
})

/**
 * And of course we define a controller for our route.
 */
    .controller('OAuthLoginCtrl',
        ['$rootScope', '$scope', '$http', '$location', function
         OAuthLoginController( $rootScope, $scope, $http, $location ) {
             $scope.login = login;
             function login() {
                 var client_id="762246415522-0u9hj7p8fu0dp78m4d9ub39rtkprktnn.apps.googleusercontent.com";
                 var scope="profile";
                 var state=encodeURIComponent("oauth"); // next state NO '/'
                 var redirect_uri=encodeURIComponent("http://localhost:8888");
                 var response_type="token";
                 var url="https://accounts.google.com/o/oauth2/auth?" +
                         "scope="+scope +
                         "&state="+state+
                         "&client_id="+client_id +
                         "&redirect_uri="+redirect_uri +
                         "&response_type="+response_type;
                 window.location.replace(url);
             }
         }])


    .controller('OAuthCallbackCtrl',
        ['$rootScope', '$scope', '$http', '$location', 
         function OAuthLoginController( $rootScope, $scope, $http, $location ) {
             function validateToken(data) {
                 var client_id="762246415522-0u9hj7p8fu0dp78m4d9ub39rtkprktnn.apps.googleusercontent.com";
                 if (data.audience !== client_id) {return;}
                 $rootScope.token=token;
                 $location.url(state); // also clear the search
             }
             $location.search($location.path().substr(1)); // gross hack
             var state = '/' + ($location.search().state || 'home');
             if ($location.search().error) {return;}
             var token = $location.search().access_token;
             if (!token) {return;}
             var uri = 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token='+
                     encodeURIComponent(token);
             $http.get(uri).success(validateToken);
         }])

;
