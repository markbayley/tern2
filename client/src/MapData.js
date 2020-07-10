{
                
"use strict";

var MapBuilder = function($map, dataUrl){
  var Map = {
    $map: $map,
    map: null,
    cluster: null,
    $loadingMessage: $("<div class='data-loading'>").text("Loading map data"),
    
    addToPlanAvailable: function() {
      return false;
    },
    
    Tiles: {
      openStreets: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }),
      openStreetsHot: L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',{
        maxZoom: 18,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Tiles courtesy of <a href="http://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
      }),
      esriSatellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      })
    },
    
    // =========================================================================
    // Rendering the map 
    // =========================================================================
    
    renderMap: function(){
      Map.map = L.map(Map.$map, {
        zoomControl: false,
        fullscreenControl: true,
        fullscreenControlOptions: {
          position: "bottomright"
        },
        layers: [Map.Tiles.openStreetsHot]
      }).setView([-34.921619,138.599257], 13);
      
      // Custom position of zoom control (to match Google Maps)
      L.control.zoom({
        position:'bottomright'
      }).addTo(Map.map);
      
      // Add layer switcher 
      L.control.layers({
        "Map": Map.Tiles.openStreetsHot, 
        "Satellite": Map.Tiles.esriSatellite
      }).addTo(Map.map);
    },
    
    // =========================================================================
    // Feature properties and data wrangling 
    // =========================================================================
    
    // Get a list of idea properties from a feature
    getIdeasForFeature: function(feature) {
      return feature.properties && feature.properties.ideas || [];
    },
    
    // Build a popup with a list of ideas for each feature 
    buildPopupForFeature: function(feature, actions) {
      actions = actions || false;
      var output = "";
      var ideas = feature.properties.ideas;
      for(var i = 0; i < ideas.length; i++) {
        var idea = ideas[i];
        var title = idea.title;
        var imagePath = idea.imagePath;
        var path = idea.path;
        var sponsoredLabel = idea.sponsored === true ? "Sponsored Idea" : "Unsponsored Idea";
        output += "<div class='browse__map--infowindow--section'>";
        output += "  <div class='browse__map--infowindow--item'>";
        output += "    <div class='browse__map--infowindow--image'>";
        if(feature.properties.imageLoaded) {
          output += "<img src='" + imagePath + "'  />";
        } else {
          output += "<img data-src='" + imagePath + "'  />";
        }
        output += "    </div>";
        output += "    <div class='browse__map--infowindow--details compressed brand-links'>";
        output += "      <h6 class='heading-six'>" + title +  "</h6>";
        if(idea.description) {
          output += "    <p>" + idea.description + "</p>";
        }
        output += "      <p><strong>" + sponsoredLabel + "</strong></p>";
        output += "    </div>";
        output += "  </div>";
        if(actions && Maps.addToPlanAvailable()) {
          output += "  <div class='browse__map--infowindow--actions brand-links'>";
          output += "    <a href=''>Add to Plan</a>";
          output += "    <a href='" + path + "'>View</a>";
          output += "  </div>";
        }
        output += "</div>";
      }
      return output;
    },
    
    // =========================================================================
    // Loading GeoJSON
    // =========================================================================
    
    // Load the JSON data and populate the map
    loadData: function(){
      
      // TODO: Remove existing data when present 
      
      // Create the cluster group
      Map.cluster = L.markerClusterGroup({
        // disableClusteringAtZoom: 18,
        iconCreateFunction: function(cluster){
          // Custom cluster calculator to get the number of 
          // idea properties rather than number of markers 
          var childCount = 0;
          cluster.getAllChildMarkers().map(function(container) {
            childCount += Map.getIdeasForFeature(container.feature).length || 1;
          });
          // Build our cluster icon
          var c = ' marker-cluster-';
          if(childCount < 30) {
            c += 'small';
          } else if (childCount < 100) {
            c += 'medium';
          } else {
            c += 'large';
          }
          return new L.DivIcon({ 
            html: '<div><span>' + childCount + '</span></div>', 
            className: 'marker-cluster' + c,
            iconSize: new L.Point(52, 52)
          });
        }
      });
      
      // Load in the JSON data file
      $("body").append(Map.$loadingMessage);
      $.getJSON(dataUrl, function(dataset) {
        Map.$loadingMessage.remove();
        
        var numberedIcon = function(number){
          return new L.NumberedIcon({
            iconUrl: "https://fundmyneighbourhood.yoursay.sa.gov.au/assets/fmn/markers/multiple.svg",
            number: number,
            iconSize: [30, 55],
            iconAnchor: [15, 44],
            popupAnchor: [1, -24]
          });
        }
        
        var categoryIcon = function(iconPath) {
          return new L.Icon({
            iconUrl: "https://fundmyneighbourhood.yoursay.sa.gov.au/assets/fmn/markers/" + iconPath,
            iconSize: [30, 55],
            iconAnchor: [15, 44],
            popupAnchor: [1, -24]
          });
        }
        
        // Iterate over each feature
        var geoJsonLayer = L.geoJson(dataset, {
          pointToLayer: function(feature, latlng) {
            // Custom markers
            var icon = feature.properties.ideas.length > 1 ? numberedIcon(feature.properties.ideas.length) : categoryIcon(feature.properties.ideas[0].markerIcon);
            return L.marker(latlng, { icon: icon });
          },
          
          // Bind popups for each marker 
          onEachFeature: function(feature, layer){
            layer.bindPopup(Map.buildPopupForFeature(feature), {
              closeButton: false,
              className: ""
            });
          }
        });

        // Add cluster layer 
        Map.cluster.addLayer(geoJsonLayer, {
          chunkedLoading: true
        });

        // Add cluster layer to map and fit bounds
        Map.map.addLayer(Map.cluster).fitBounds(Map.cluster.getBounds());
        
      });
    },
    
    // =========================================================================
    // Run application 
    // =========================================================================
    
    init: function(){
      
      // Custom number icon extension for leaflet
      // https://gist.github.com/comp615/2288108
      L.NumberedIcon = L.Icon.extend({
        options: {
          number: ''
        },
        createIcon: function(){
          var div = document.createElement("div");
          var img = this._createImg(this.options['iconUrl']);
          var numdiv = document.createElement("div");
          numdiv.setAttribute("class", "number");
          numdiv.innerHTML = this.options["number"] || "";
          div.appendChild(img);
          div.appendChild(numdiv);
          this._setIconStyles(div, 'icon');
          return div;
        }
      });
      
      // Render map and load data
      Map.renderMap();
      Map.loadData();
      
      // Custom popup behaviour to fit the marker and the popup in the viewport 
      // Modified from: https://stackoverflow.com/questions/22538473/leaflet-center-popup-and-marker-to-the-map
      Map.map.on('popupopen', function(e){
        var maxHeight = Map.$map.offsetHeight - 100;
        // set max height
        e.popup._wrapper.style.height = "";
        if(e.popup._wrapper.offsetHeight > maxHeight) {
          e.popup._wrapper.style.height = maxHeight + "px";
        }
        // find the pixel location on the map where the popup anchor is
        var px = Map.map.project(e.popup._latlng);
        // find the height of the popup container, divide by 2, subtract from the Y axis of marker location
        px.y -= e.popup._container.clientHeight/2;
        // pan to new center
        Map.map.panTo(Map.map.unproject(px),{animate: true}); 
      });
    }
  };
  
  return Map;
}

var dataUrl = "https://gist.githubusercontent.com/dbaines/1f1e0eb0c79ccb34a60c5431d4090c59/raw/6b2293beae88664b357d2007e30a3571eea08769/map-data-large";
var $maps = $("[data-map-canvas]");
window.RenderedMaps = [];
$maps.each(function() {
  var mapObject = MapBuilder(this, dataUrl);
  mapObject.init();
  window.RenderedMaps.push(mapObject);
});
                
    
}




