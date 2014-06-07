
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

function bound(value, opt_min, opt_max) {
  if (opt_min != null) value = Math.max(value, opt_min);
  if (opt_max != null) value = Math.min(value, opt_max);
  return value;
}

function degreesToRadians(deg) {
  return deg * (Math.PI / 180);
}

function radiansToDegrees(rad) {
  return rad / (Math.PI / 180);
}

/** @constructor */
function MercatorProjection() {
  this.pixelOrigin_ = new google.maps.Point(TILE_SIZE / 2,
      TILE_SIZE / 2);
  this.pixelsPerLonDegree_ = TILE_SIZE / 360;
  this.pixelsPerLonRadian_ = TILE_SIZE / (2 * Math.PI);
}

MercatorProjection.prototype.fromLatLngToPoint = function(latLng,
    opt_point) {
  var me = this;
  var point = opt_point || new google.maps.Point(0, 0);
  var origin = me.pixelOrigin_;

  point.x = origin.x + latLng.lng() * me.pixelsPerLonDegree_;

  // Truncating to 0.9999 effectively limits latitude to 89.189. This is
  // about a third of a tile past the edge of the world tile.
  var siny = bound(Math.sin(degreesToRadians(latLng.lat())), -0.9999,
      0.9999);
  point.y = origin.y + 0.5 * Math.log((1 + siny) / (1 - siny)) *
      -me.pixelsPerLonRadian_;
  return point;
};

MercatorProjection.prototype.fromPointToLatLng = function(point) {
  var me = this;
  var origin = me.pixelOrigin_;
  var lng = (point.x - origin.x) / me.pixelsPerLonDegree_;
  var latRadians = (point.y - origin.y) / -me.pixelsPerLonRadian_;
  var lat = radiansToDegrees(2 * Math.atan(Math.exp(latRadians)) -
      Math.PI / 2);
  return new google.maps.LatLng(lat, lng);
};