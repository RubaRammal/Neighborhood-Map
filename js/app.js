 var map;

 var infoWindow;

 var markerIcon;
 var markerIconHover;
 var clickedMarker;

 var locations = [];
 var viewModel;

 var places = [];

 /**
  * Location object
  */
 var Location = function(name, marker) {
    this.name = ko.observable(name);
    this.marker = marker;
 };

 /**
  * @description Initializes the map and requests locations from Foursquare API
  * Code reference: Google Maps API documentation, https://developers.google.com/maps/documentation
  */
 function initMap() {

    markerIcon = makeMarkerIcon('red');
    markerIconHover = makeMarkerIcon('other');

    var mainLoc = {
        lat: 24.7113143,
        lng: 46.6722581
    };
    // Check if map is loaded succefully
    if (typeof google === 'object' && typeof google.maps === 'object') {
        map = new google.maps.Map(document.getElementById('map'), {
            center: mainLoc,
            zoom: 16
        });

        infoWindow = new google.maps.InfoWindow();
        // Get locations (coffee stores) from Foursquare API that are within 500 radius of the main location
        var url = 'https://api.foursquare.com/v2/venues/search?ll=' + mainLoc.lat + ',' + mainLoc.lng +
            '&query=coffee&radius=1000&client_id=PVARFLB4RALKAWI0SHBUSM3GPAHX3B02L3YGX0R3IOV2NCQO&client_secret=SY334RFX554W34D5S5CEX3YUR3VT1T2OSXAR5CDRVKW3CFAO&v=20170304';

        $.ajax({
            url: url,
            dataType: 'json',
            success: function(data) { // Request successful --> create location on map
                places = data;
                for (var i = 0; i < places.response.venues.length; i++) {
                    createLocation(places.response.venues[i]);
                }

                viewModel = new ViewModel(locations);
                ko.applyBindings(viewModel);
            },
            error: function(data) { // Request fail --> display error message
                $('.error-text').text('An error occured while loading the locations!');
                $('#error-block').show();
                setTimeout(function() {
                    $('.error-text').text('');
                    $('#error-block').hide();
                }, 5000);
            }
        });

    } else { // Error handling map load
        $('.error-text').text('An error occured while loading the map!');
        $('#error-block').show();
        setTimeout(function() {
            $('.error-text').text('');
            $('#error-block').hide();
        }, 5000);
    }

 }

 /**
  * @description Takes a venue and requests photos of that venue's id 
  * from the Foursquare API and adds it to the infoWindow 
  * Creates a marker for the venue and adds a click event 
  * to it that displays the infoWindow details
  * @param {venues []} venue
  */
 function createLocation(venue) {

    // Get venue photos from the venue id
    var url = 'https://api.foursquare.com/v2/venues/' + venue.id +
        '/photos?client_id=PVARFLB4RALKAWI0SHBUSM3GPAHX3B02L3YGX0R3IOV2NCQO&client_secret=SY334RFX554W34D5S5CEX3YUR3VT1T2OSXAR5CDRVKW3CFAO&v=20170304';
    var photos;
    var photo;

    $.ajax({
        url: url,
        dataType: 'json',
        success: function(data) { // Request succefull --> choose the index of one random photo from the photos array
            photos = data.response.photos.items;

            if (photos.length > 0) {
                var randomPhoto = Math.floor(Math.random() * ((photos.length - 1) - 0 + 1) + 0);
                photo = photos[randomPhoto].prefix + (photos[randomPhoto].width * 0.1) + 'x' +
                    (photos[randomPhoto].height * 0.1) + photos[randomPhoto].suffix;
            }
        },
        error: function(data) { // Request fail --> display error message
            $('.error-text').text('An error occured while loading location photos!');
            $('#error-block').show();
            setTimeout(function() {
                $('.error-text').text('');
                $('#error-block').hide();
            }, 5000);

        }
    });

    // Create marker
    var marker = new google.maps.Marker({
        map: map,
        position: venue.location,
        icon: markerIcon
    });

    // Push an instance of the Location object to the locations array
    locations.push(new Location(venue.name, marker));

    // Add click event listener to the marker
    // It appends the photo and name to the infoWindow and opens it
    // Code reference: Udacity videows
    google.maps.event.addListener(marker, 'click', function() {
        if (clickedMarker) {
            clickedMarker.setIcon(markerIcon);
        }

        marker.setIcon(markerIconHover);

        if (photo) infoWindow.setContent('<div>' + venue.name + '<br><img src="' + photo + '" onerror="this.onerror=null;this.src=\'images/notfound.png\'"></div>');
        else infoWindow.setContent('<div>' + venue.name + '</div>');
        infoWindow.open(map, this);
        clickedMarker = marker;
    });
 }

 /**
  * @description Creates a marker icon
  * @param {String} markerColor
  * @return {String} image
  * Code reference: Google Maps API documentation, https://developers.google.com/maps/documentation
  */
 function makeMarkerIcon(markerColor) {
    if (markerColor === 'red') {
        var image = {
            // url: 'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor + '|40|_|%E2%80%A2',
            url: 'https://i.imgur.com/70t6DzB.png',
            size: new google.maps.Size(21, 34),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(10, 34),
            scaledSize: new google.maps.Size(21, 34)
        };
    } else {
            var image = {
            // url: 'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor + '|40|_|%E2%80%A2',
            url: 'https://i.imgur.com/oP3rrMr.png',
            size: new google.maps.Size(21, 34),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(10, 34),
            scaledSize: new google.maps.Size(21, 34)
        };
    }
    return image;
 }

 /**
  * @description Handles map loading error
  */
 function mapError() {
    $('.error-text').text('An error occured while loading the map!');
    $('#error-block').show();
    setTimeout(function() {
        $('.error-text').text('');
        $('#error-block').hide();
    }, 5000);
 }

 /**
  * @description Handles displaying the locations in list view 
  * and filtering the locations based on the input from the 
  * text field and handles list item (location) clicks
  * @param {Location []} loc
  * Coded reference: TodoMVC, http://todomvc.com/
  */
 var ViewModel = function(loc) {
    var self = this;
    self.title = ko.observable('Café Locator');
    self.api = ko.observable('Foursquare API');
    self.places = ko.observableArray(loc);
    self.navVisible = ko.observable(false);
    // Toggle class to hide/show sidebar
    // Code reference: https://stackoverflow.com/questions/23385937/knockout-toggle-active-class-on-click
    self.toggleSidebar = function(data, event) {
        self.navVisible(!self.navVisible());
    };
    // Trigger marker click when a location is clicked
    self.placeClick = function(place) {
        google.maps.event.trigger(place.marker, 'click');
    };
    self.filterLoc = ko.observable('');
    // Filter locations
    // Code reference: https://stackoverflow.com/questions/32343306/live-table-search-in-knockout-calling-function-on-keyup
    self.filterLocations = ko.computed(function() {
        var filter = self.filterLoc().toLowerCase();
        var tempLocations;

        if (!filter) {
            ko.utils.arrayForEach(self.places(), function(temp) {
                temp.marker.setVisible(true); // if text field is clear --> show all markers
            });
            return self.places(); // return all locations
        } else {
            // filtered locations
            tempLocations = ko.utils.arrayFilter(self.places(), function(item) {
                item.marker.setVisible(false); // hide all markers
                return item.name().toLowerCase().indexOf(filter) !== -1;
            });
        }
        // show markers of filtered locations
        ko.utils.arrayForEach(tempLocations, function(temp) {
            temp.marker.setVisible(true);
        });
        return tempLocations; // return filtered locations
    });
 };