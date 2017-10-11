     var map;

     var infoWindow;

     var markerIcon;
     var markerIconHover;

     var locations = [];
     var viewModel;

     var result;


     function initMap() {

         markerIcon = makeMarkerIcon('b20000');
         markerIconHover = makeMarkerIcon('e6bab3');

         var mainLoc = {
             lat: 24.7113143,
             lng: 46.6722581
         };
         map = new google.maps.Map(document.getElementById('map'), {
             center: mainLoc,
             zoom: 16
         });

         infowindow = new google.maps.InfoWindow();
         var service = new google.maps.places.PlacesService(map);
         service.nearbySearch({
             location: mainLoc,
             radius: 1000,
             type: ['cafe']
         }, callback);
     }

     function callback(results, status) {

         result = results;
         if (status === google.maps.places.PlacesServiceStatus.OK) {
             for (var i = 0; i < results.length; i++) {
                 createLocation(results[i]);
             }
             viewModel = new ViewModel(locations);
             ko.applyBindings(viewModel);
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
         this.marker = marker;
     };

     var ViewModel = function(loc) {
         var self = this;
         self.places = ko.observableArray(loc);
         self.navVisible = ko.observable(false);
         self.toggleSidebar = function(data, event) {
             self.navVisible(!self.navVisible()); //toggle the navVisible value between true/false
         }
         self.placeClick = function(place) {
             google.maps.event.trigger(place.marker, 'click');
         }
         self.filterLoc = ko.observable('');
         self.filterLocations = ko.computed(function() {
             var filter = self.filterLoc().toLowerCase();
             var tempLocations;

             if (!filter) {
                 ko.utils.arrayForEach(self.places(), function(temp) {
                     temp.marker.setVisible(true);
                 });
                 return self.places();
             } else {
                 tempLocations = ko.utils.arrayFilter(self.places(), function(item) {
                     item.marker.setVisible(false);
                     return item.name().toLowerCase().indexOf(filter) !== -1;
                 });
             }
             ko.utils.arrayForEach(tempLocations, function(temp) {
                 temp.marker.setVisible(true);
             });
             return tempLocations;
         });
     };