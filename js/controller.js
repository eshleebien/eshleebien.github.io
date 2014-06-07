
var TILE_SIZE = 256
  ,map,location;
function ContentController($scope,$http,$sce) {
  $scope.place = {"location":{"lng":"37.4218","lat":"-122.0840"}};

  $http({method: 'GET', url: 'http://54.214.176.172/police'})
  .success(function(data) {
    $scope.places = data;
  });

  $scope.selectPlace = function(place) {
    $scope.location = place;
    $scope.location.map = new google.maps.LatLng(place.location.lat,place.location.lng);

    setInterval(function() {
      $scope.initialize($scope.location)
    },120000);
    $scope.initialize($scope.location);
  }

  $scope.initialize = function(k) {
    var mapOptions = {
      zoom: 13,
      center: $scope.location.map
    };

    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    $scope.police = $scope.location.data;
    console.log($scope.police);

    $http({method: 'GET', url: 'http://54.214.176.172/police/messages'})
    .success(function(data) {
      $scope.users = data;

      $scope.users.push({ "name" : "rvbulalacao", "mobile_number" : "9163303420", 
                  "mobile_contacts" : [  "09163303420",  "09175247735" ], "email_contacts" : [  "" ], 
                  "severity" : true, "email_message" : "Patulong naman", 
                  "text_message" : "Help! Help!", "location" : { "lat" : "14.5859508", "lng" : "121.1203181" }, 
                  "timestamp" : "Sat Jun 07 2014 01:46:47 GMT+0000 (UTC)"});

      angular.forEach($scope.police,function(pol) {
        var pos = new google.maps.LatLng(pol.location.lat,pol.location.lng)
          , message = pol.precinct_name+"<br>"+
            "Contact numbers: "+JSON.stringify(pol.contact_number).replace(/"/g,"").replace(/\[|\]/g,"");

        pol.infoWindow = new google.maps.InfoWindow({
          content:message,
          maxWidth:250
        });

        pol.marker = new google.maps.Marker({
            position:pos,
            map:map,
            title:pol.precinct_name,
            icon: 'css/rsz_pnp-logo.png',
          });

        google.maps.event.addListener(pol.marker, 'click', function() {
          pol.infoWindow.open(map,pol.marker);
        });
      });

      angular.forEach($scope.users,function(user) {
        var pos = new google.maps.LatLng(user.location.lat,user.location.lng);
        var message = "Name: "+user.name+
                  "<br>Message: "+user.text_message+
                  "<br><i>"+humanized_time_span(user.timestamp+ 'UTC')+"</i>";

        user.infoWindow = new google.maps.InfoWindow({
          content:message,
          maxWidth:200
        });

        user.marker = new google.maps.Marker({
          position:pos,
          map:map,
          title:user.text_message,
        });
        google.maps.event.addListener(user.marker, 'click', function() {
          user.infoWindow.open(map,user.marker);
        });

      });
    });
  }
}