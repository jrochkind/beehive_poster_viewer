/* All the javascript we need for the poster viewer in one file

  Sorry this file is a bit of a mess organizationally. 

*/

var poster = "mr-inside"
var lang = "en";


/* Used by actual on-screen annotorious make annotation stuff, which
   we're not really using at present */
function annotate() {
  var button = document.getElementById('map-annotate-button');
  button.style.color = '#777';

  anno.activateSelector(function() {
    // Reset button style
    button.style.color = '#fff';
  });
}

/* Just a demo, not really using */
function addHelloWorldPlugin() {

  annotorious.plugin.HelloWorldPlugin = function(opt_config_options) { }

  annotorious.plugin.HelloWorldPlugin.prototype.initPlugin = function(anno) {
    // Add initialization code here, if needed (or just skip this method if not)

      anno.addHandler('onMouseOverAnnotation', function(ann) {
        return true;
      });

  }

  annotorious.plugin.HelloWorldPlugin.prototype.onInitAnnotator = function(annotator) {
    // A Field can be an HTML string or a function(annotation) that returns a string
    annotator.popup.addField(function(annotation) { 
      return '<em>Hello World: ' + annotation.text.length + ' chars</em>'
    });
  }

  // Add the plugin like so
  anno.addPlugin('HelloWorldPlugin', {});
}

function setupOpenSeadragonViewer() {
  /* Save in global cause we're gonna need to refer to it and stuff 
     and we're too lazy to make a closure right now */
  window.openSeadragonViewer = OpenSeadragon({
    id: "openseadragon",
    //prefixUrl: "http://annotorious.github.io/js/openseadragon/images/",
    showNavigator: false,
    autoHideControls: false,
    prefixUrl: "/beehive/openseadragon/images/",
    //tileSources: "/beehive/MR_WholePoster_PrintRes/mr_zoom.dzi"
    tileSources:  "./tiles/mr-inside/mr-inside.dzi"
  });

  anno.makeAnnotatable(openSeadragonViewer);
}

function positionOverlayControls() {
  var controls = $("#overlayControls");
  var minimizedButton = $("#minimizedControls");
  var container = $("#openseadragon .openseadragon-container");


  container.append(controls);
  container.append(minimizedButton);

  // Add minimization behavior
  controls.on("click", ".controlsMinimize", function(event) {
    controls.slideUp('slow', function() {;
      // wait til animation is done
      minimizedButton.fadeIn();
    });
  });
  minimizedButton.on("click", ".controlsMaximize", function(event) {
    minimizedButton.fadeOut(function() {
      controls.slideDown('slow');
    });
  });

  function closeStoryList(func) {
    $("#storyList").slideUp('slow', function() {
      $(".scene-expander").removeClass("open");
      if (typeof func !== 'undefined') {
        func();
      }
    });
  }

  function openStoryList() {
    $(".controlsText").slideUp('slow', function() {
      $("#storyList").slideDown('slow', function() {
        $(".scene-expander").addClass("open");
      });
    });
  }

  // Story list expand/contract
  $("#overlayControls").on("click", ".scene-expander",function(event) {
    event.preventDefault();

    if ($(this).hasClass("open")) {
      closeStoryList();
    } else {
      openStoryList();
    }


  });

  // Story text close
  $("#overlayControls").on("click", ".close-story-link", function(event) {
    $(".controlsText").slideUp('slow');
  });

  // Click on story
  $("#storyList").on("click", ".story", function(event) {
    event.preventDefault();
    var story = $( $(this).data("beehive-story") );
    var region = $(story.find("region"));

    var rect = new OpenSeadragon.Rect(parseFloat(region.attr("x")),
        parseFloat(region.attr("y")),
        parseFloat(region.attr("width")),
        parseFloat(region.attr("height")));

    $("#storyLabel").text( story.find("label").text() );
    $("#storyText").html( story.find("html").text()  );

    closeStoryList(function() {
      openSeadragonViewer.viewport.fitBounds(rect);
      $(".controlsText").slideDown('slow');
    });
  });

}

/* Function to create a URL linking to current view, and to
   set current view from URL on load */
function addPermalinkFunc() {
  function boundsToParams(bounds) {
    return "x=" + encodeURIComponent(bounds.x.toFixed(5)) + 
      "&y=" + encodeURIComponent(bounds.y.toFixed(5)) +
      "&w=" + encodeURIComponent(bounds.width.toFixed(5)) +
      "&h=" + encodeURIComponent(bounds.height.toFixed(5))
  }

/* Take an OpenSeadragon.Rect, add it into query params for a link.
     We keep 5 decimal places which is enough for an image 100,000 pixels
     high/wide, which should be plenty (coordinate are relative 0 -> 1 )*/
  function urlWithNewBounds(bounds) {
    var currentParams = paramsToHash(window.location.search);
    var url = window.location.href.split('?')[0];

    currentParams.x = bounds.x.toFixed(5);
    currentParams.y = bounds.y.toFixed(5);
    currentParams.w = bounds.width.toFixed(5);
    currentParams.h = bounds.height.toFixed(5);

    url += '?' + jQuery.param(currentParams);

    return url;
  }

  function paramsToHash(querystring) {
    // remove any preceding url and split
    querystring = querystring.substring(querystring.indexOf('?')+1).split('&');
    var params = {}, pair, d = decodeURIComponent;
    // march and parse
    for (var i = querystring.length - 1; i >= 0; i--) {
      pair = querystring[i].split('=');
      params[d(pair[0])] = d(pair[1]);
    }

    return params;
  };

  /* prepare the modal we'll display permalinks in */
  $("#linkModal").easyModal({
      overlayOpacity: 0.8
  });

  /* On load, do we have coordinates in a query string? If so, then zoom
     to specified coords */
 openSeadragonViewer.addHandler('open', function (event) {
    var params = paramsToHash(document.location.search);
    if ( ("x" in params ) && (params.x !== "") &&
         ("y" in params ) && (params.y !== "") &&
         ("w" in params ) && (params.w !== "") &&
         ("h" in params ) && (params.h !== "") ) {

      var rect = new OpenSeadragon.Rect(parseFloat(params.x),
        parseFloat(params.y),
        parseFloat(params.w),
        parseFloat(params.h));
      openSeadragonViewer.viewport.fitBounds(rect);
    }
  });


  $("#overlayControls").on("click", ".makePermaLink", function(event) {
    event.preventDefault();
    var bounds = openSeadragonViewer.viewport.getBounds();


    $("#linkModalUrlField").val( urlWithNewBounds(bounds) );
    $("#linkModal").trigger('openModal');
  });

}

function addStoryList() {
  /* fetch the xml of stories */
  var fetchUrl = "./narrative/" + poster + "/" + lang + ".xml";
  $.ajax({
    url: fetchUrl,
    success: function(xml) {
      var storyList = $("#storyList");

      $(xml).find('story').each(function(i, storyXml){
        var li = $("<li/>");
        var a  = $("<a href='#' class='story'/>").
          text($(storyXml).find("label").text()).
          data('beehive-story', storyXml);

        li.append(a).appendTo(storyList);
      });
    },
  });
  

}

  // Height limits on the story list we couldn't figure out
  // how to do with pure CSS, we'll use some JS that we run on
  // load and screen size change. 
  function storyListHeightLimit() {
    // Need to make sure it's a container that makes it onto
    // full screen mode. 
    var container = $("#openseadragon");
    var panel     = $("#overlayControls")

    var maxPanelHeight = container.height() - 
      parseInt($(panel).css('margin-top')) -
      8 // 8px bottom margin we want

    panel.css("max-height", maxPanelHeight);

    // The story list and and the story text area take
    // turns being on the screen once at a time, below
    // the header area. They each need a max height
    // such that they won't overflow the panel. 
    /*var headerHeight = panel.find(".controlsHeader").height();
    var sceneExpanderHeight = panel.find(".scene-expander").height();
    var maxLowerHeight = maxPanelHeight - headerHeight - sceneExpanderHeight;
    panel.find(".storyList, .controlsText").each(function(i, section) {
      $(section).css("max-height", maxLowerHeight);
    });*/
  }
  jQuery(document).ready(function($) {
    // Once on load
    storyListHeightLimit();

    // And again if window changes
    $( window ).resize(function(event) {
      storyListHeightLimit();
    });
  });



jQuery( document ).ready(function( $ ) {
  setupOpenSeadragonViewer();
  addHelloWorldPlugin();
  positionOverlayControls();
  addPermalinkFunc();
  addStoryList();
});