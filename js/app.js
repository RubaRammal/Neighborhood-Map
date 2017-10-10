     var map;

     var infoWindow;

     var markerIcon;
     var markerIconHover;

     var locations = [];



     function initMap() {

         markerIcon = makeMarkerIcon('b20000');
         markerIconHover = makeMarkerIcon('e6bab3');

         var KSU = {
             lat: 24.723915,
             lng: 46.638471
         };
         map = new google.maps.Map(document.getElementById('map'), {
             center: KSU,
             zoom: 14
         });

         infowindow = new google.maps.InfoWindow();
         var service = new google.maps.places.PlacesService(map);
         service.nearbySearch({
             location: KSU,
             radius: 1000,
             type: ['store']
         }, callback);
     }

     function callback(results, status) {

         result = results;
         if (status === google.maps.places.PlacesServiceStatus.OK) {
             for (var i = 0; i < results.length; i++) {
                 createLocation(results[i]);
             }
         } //TODO: handle error
     }

     function createLocation(place) {
         var placeLoc = place.geometry.location;
         var marker = new google.maps.Marker({
             map: map,
             position: place.geometry.location,
             icon: markerIcon
         });

         locations.push(new Location(place.name, marker));

         google.maps.event.addListener(marker, 'click', function() {
             marker.setIcon(markerIconHover);
             infowindow.setContent(place.name);
             infowindow.open(map, this);
         });
     }

     function makeMarkerIcon(markerColor) {
         var image = {
             url: 'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor + '|40|_|%E2%80%A2',
             size: new google.maps.Size(21, 34),
             origin: new google.maps.Point(0, 0),
             anchor: new google.maps.Point(10, 34),
             scaledSize: new google.maps.Size(21, 34)
         };
         return image;
     }


     // represent a single location item
     var Location = function(name, marker) {
         this.name = ko.observable(name);
         this.visible = ko.observable(false);
         this.marker = marker;
     };


     var ViewModel = function(loc) {

         var self = this;
         self.places = loc;
         self.navVisible = ko.observable(false);
         self.toggleSidebar = function(data, event) {
             self.navVisible(!self.navVisible()); //toggle the navVisible value between true/false
         }
     };


     var viewModel = new ViewModel(locations);

     ko.applyBindings(viewModel);