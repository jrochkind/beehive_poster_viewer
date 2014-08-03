/* All the javascript we need for the poster viewer in one file

  Sorry this file is a bit of a mess organizationally. 

*/



var beehive_poster;
var beehive_lang;


/* Internationalization (i18n) -- all little text from the UI are in two hashes,
   one english (en), one spanish (es). */
var i18n_data = {}

i18n_data.en = {
  'next': 'Next',
  'previous': 'Previous',
  'scenes': 'Scenes',
  // haven't actually done these yet
  'zoom_in': 'Zoom in',
  'zoom_out': 'Zoom out',
  'full_poster': 'Full poster',
  'full_screen': 'Toggle full screen',
  'share_link': 'Share link',
  'minimize': 'Minimize'
};

i18n_data.es = {
  'next': 'Siguiente',
  'previous': 'Anterior',
  'scenes': 'Escenas',
};

function applyI18nValues(lang) {
  var keys = ['next', 'previous', 'scenes']  
  jQuery.each(keys, function(i, key) {
    $(document).find("[data-i18n-key=" + key + "]").text(  i18n_data[lang][key]  );
  });
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
}

// Take poster and lang from query params &poster=&lang=
function setPosterAndLang() {
  var h = paramsToHash(window.location.search);
  beehive_poster = h.poster;
  beehive_lang   = (typeof h.lang === "undefined") ? 'en' : h.lang;
}




function setupOpenSeadragonViewer() {
  /* Save in global cause we're gonna need to refer to it and stuff 
     and we're too lazy to make a closure right now */

  //eg  "./tiles/mr-inside/mr-inside.dzi"
  var dziFile = "./tiles/" + beehive_poster + "/" + beehive_poster + ".dzi"

  window.openSeadragonViewer = OpenSeadragon({
    id: "openseadragon",
    //prefixUrl: "http://annotorious.github.io/js/openseadragon/images/",
    showNavigator: false,
    autoHideControls: false,
    prefixUrl: "./openseadragon-bin-1.1.1/images/",
    tileSources: dziFile,
    // We tell OSD to use our own nav buttons, easier than
    // trying to customize OSD's
    zoomInButton: 'zoomInBtn',
    zoomOutButton: 'zoomOutBtn',
    homeButton: 'fullPosterBtn',
    fullPageButton: 'fullPageBtn'
  });
}

function positionOverlayControls() {
  var controls = $("#overlayControls");
  var navControls = $("#navControls");
  var minimizedButton = $("#showControlsBtn");
  var container = $("#openseadragon .openseadragon-container");


  container.append(navControls);
  container.append(controls);

  // Add minimization behavior
  controls.on("click", ".controlsMinimize", function(event) {
    controls.slideUp('slow', function() {;
      // wait til animation is done
      minimizedButton.fadeIn();
    });
  });
  navControls.on("click", "#showControlsBtn", function(event) {
    minimizedButton.fadeOut(function() {
      controls.slideDown('slow');
    });
  });

  function closeStoryList(func) {
    if ($("#slideContainerOverlay").is(":visible")) {
      $("#slideContainerOverlay").fadeOut('slow');
    }

    $(".controls-story-list").slideUp('slow', function() {
      $(".scene-expander").removeClass("open");
      if (typeof func !== 'undefined') {
        func();
      }
      $("#sceneExpanderImg").attr("src", "./images/expand.png")
    });
  }

  function openStoryList() {
    $("#slideContainerOverlay").fadeIn('slow');

    //$(".controlsText").slideUp('slow', function() {
      $(".controls-story-list").slideDown('slow', function() {
        $(".scene-expander").addClass("open");
        $("#sceneExpanderImg").attr("src", "./images/collapse.png")
      });
    //});
  }

  // temporarily set OpenSeadragon animation params
  // to a very slow animate, then restore.
  function withSlowOSDAnimation(f) {
    var viewport = openSeadragonViewer.viewport;

    // save old ones
    var oldValues = {};
    oldValues.centerSpringXAnimationTime = viewport.centerSpringX.animationTime;
    oldValues.centerSpringYAnimationTime = viewport.centerSpringY.animationTime;
    oldValues.zoomSpringAnimationTime = viewport.zoomSpring.animationTime;

    // set our new ones
    viewport.centerSpringX.animationTime =
      viewport.centerSpringY.animationTime =
      viewport.zoomSpring.animationTime =
      6;

    // callback
    f()

    // restore values
    viewport.centerSpringX.animationTime = oldValues.centerSpringXAnimationTime;
    viewport.centerSpringY.animationTime = oldValues.centerSpringYAnimationTime;
    viewport.zoomSpring.animationTime = oldValues.zoomSpringAnimationTime;
  }

  /* Take an OpenSeadragon.Rect, and make it bigger zo we can zoom
     to it leaving room for the control panel too */
  function adjustRectForPanel(rect) {
    var newRect = jQuery.extend(true, {}, rect)

    var overlay = $("#overlayControls");
    var containerWidth = openSeadragonViewer.viewport.getContainerSize().x;
    var panelWidth = overlay.width() + 
      parseInt(overlay.css("margin-left")) +
      parseInt(overlay.css("margin-right"));

    var reservedPortion = panelWidth / containerWidth;

    // Not sure if this math is exactly right, I think we need
    // to math more. 
    var newWidth = rect.width / (1 - reservedPortion);
    newRect.x = rect.x - (newWidth - rect.width);
    newRect.width = newWidth;

    return newRect;
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


  // arg is the <li> element containing the .story link
  // with story data attached. 
  function loadStory(li) {
    var story = li.find(".story").data("beehive-story");

    if (typeof story === "undefined")
      return;


    var rect = new OpenSeadragon.Rect(parseFloat(story.region.x),
        parseFloat(story.region.y),
        parseFloat(story.region.width),
        parseFloat(story.region.height));

    // Save the li in data for next/prev
    $(".controlsText").data("beehive-story-li", li);

    // Show/hide next/prev buttons based on if
    // we got em
    $(".controls-text-nav-prev").css("visibility",  (li.prev().size() > 0) ? "visible" : "hidden"  );
    $(".controls-text-nav-next").css("visibility",  (li.next().size() > 0) ? "visible" : "hidden"  );

    // Load the story content
    $("#storyLabel").text( story.label );
    $("#storyText").html( story.html  );
    $(".controlsText").slideDown('slow');

    closeStoryList(function() {
      withSlowOSDAnimation(function() {
        rect = adjustRectForPanel(rect);

        openSeadragonViewer.viewport.fitBounds(rect);
      });
    });
  }

  // Click on story
  $("#storyList").on("click", ".story", function(event) {
    event.preventDefault();

    var li = $(this).closest("li")

    loadStory(li);
  });

  // Next/prev
  $(".controls-text-nav").on("click", ".controls-text-nav-prev", function(event) {
    var li = $(".controlsText").data("beehive-story-li");    
    loadStory(li.prev());
  });
  $(".controls-text-nav").on("click", ".controls-text-nav-next", function(event) {
    var li = $(".controlsText").data("beehive-story-li");

    var nextLi;
    if (typeof li == 'undefined') {
      //go with the first one
      nextLi = $("#storyList li").first();
    } else {
      nextLi = li.next();
    }

    loadStory(nextLi);
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


  /* prepare the modal we'll display permalinks in */
  $("#linkModal").easyModal({
      overlayOpacity: 0.65
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


  $("#navControls").on("click", "#makePermaLink", function(event) {
    event.preventDefault();
    var bounds = openSeadragonViewer.viewport.getBounds();


    $("#linkModalUrlField").val( urlWithNewBounds(bounds) );
    $("#linkModal").trigger('openModal');
  });

}

// We store the story data in XML becuase it's more convenient
// to edit by hand for the sort of data we have (really!), but
// json is easier to deal with in javascript, esp cross-browser. 
function storyXmlToJson(storyXml) {
  storyXml = $(storyXml);
  var json = {};

  json.label        = storyXml.find("label").text();

  // .html() on xml node doesn't work in safari, XMLSerializer
  // if it's raw text with no elements, wrap in a single <p> for
  // consistency. 
  var htmlElement   = storyXml.find("html").get(0);
  var serialized    = new XMLSerializer().serializeToString(htmlElement);
  if (htmlElement.childNodes.length === 1 && htmlElement.childNodes[0].nodeType === 3) {
    serialized = "<p>"+serialized+"</p>";
  }
  json.html         = serialized;

  var regionXml     = storyXml.find("region")
  json.region       = {};
  json.region.x     = regionXml.attr("x");
  json.region.y     = regionXml.attr("y");
  json.region.width = regionXml.attr("width");
  json.region.height = regionXml.attr("height");

  return json;
}

function loadPosterData() {
  /* fetch the xml of stories */
  var fetchUrl = "./narrative/" + beehive_poster + "/" + beehive_lang + ".xml";
  $.ajax({
    url: fetchUrl,
    success: function(xml) {
      xml = $(xml);

      // Load title
      var title = xml.find("data > title").text().trim();
      var title_link = xml.find("data > link").text().trim();
      $("#titleLink").attr("href", title_link).text(title);
      document.title = title;

      // Load scenes
      var storyList = $("#storyList");
      xml.find('story').each(function(i, storyXml){
        var li = $("<li/>");
        var a  = $("<a href='#' class='story'/>").
          text($(storyXml).find("label").text()).
          data('beehive-story', storyXmlToJson(storyXml));

        li.append(a).appendTo(storyList);
      });

      // Make the scene list visible only if we actually have
      // scenes
      if (storyList.find("li").size() > 0) {
        $(".controls-story-list-expander").show();
      }

      // Adjust heights after load
      storyListHeightLimit();

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
    var storyListBottom = 
      $(".controls-story-list-expander").position().top + 
      $(".controls-story-list-expander").outerHeight(true);
    // CSS max-heigh doesn't account for padding or borders, we need
    // to subtract extra to account, we just do a healthy extra amt. 
    var maxLowerHeight = maxPanelHeight - storyListBottom - 24;

    panel.find(".controls-story-list, .controlsText").each(function(i, section) {
      $(section).css("max-height", maxLowerHeight);
    });
  }
  jQuery(document).ready(function($) {


    // And again if window changes
    $( window ).resize(function(event) {
      storyListHeightLimit();
    });
  });

  // Add annotorious CSS and JS (which we currently only use for admin),
  // add our custom Annotorious plugin, and show the 'define region' button
  //
  // We're currently linking to annotorious/latest on github, for some reason
  // we had trouble using a local copy. 
  function addAdminHelperUI() {
    $("<link/>", {
      rel: "stylesheet",
      type: "text/css",
      href: "http://annotorious.github.io/latest/annotorious.css"
    }).appendTo("head");

    $.ajax({
      url: "http://annotorious.github.io/latest/annotorious.min.js",
      dataType: "script",
      success: function() {
        // Important to add the plugin BEFORE we make the OpenSeadragon viewer
        // annotatable
        addHelloWorldPlugin();

        anno.makeAnnotatable(openSeadragonViewer);

        $("#map-annotate-button").show();
      }
    });

  }
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
  }

  annotorious.plugin.HelloWorldPlugin.prototype.onInitAnnotator = function(annotator) {
    // A Field can be an HTML string or a function(annotation) that returns a string
    annotator.popup.addField(function(annotation) { 
      var geometry = annotation.shapes[0].geometry;

      return '<pre>' +
        '&lt;region\n' +
        '  x="' + geometry.x.toFixed(5) +  '"\n' +
        '  y="' + geometry.y.toFixed(5) +  '"\n' +
        '  width="' + geometry.width.toFixed(5) +  '"\n' +
        '  height="' + geometry.height.toFixed(5) +  '"\n' +
        '/&gt;' +
        '</pre>';
    });
  }

  // Add the plugin like so
  anno.addPlugin('HelloWorldPlugin', {});
}



setPosterAndLang();

if (paramsToHash(document.location.search).admin === "true") {
  addAdminHelperUI();
}

jQuery( document ).ready(function( $ ) {
  setupOpenSeadragonViewer();
  positionOverlayControls();
  addPermalinkFunc();
  loadPosterData();

  // Once on load
  storyListHeightLimit();

  applyI18nValues(beehive_lang);

  /* Crazy hack. We placed our controls inside the .openseadragon-container
     so they'd remain on screen in full screen mode. But OpenSeadragon is
     swallowing clicks -- it catches mousedown events and calls stopPropagation,
     which on firefox means a click event never fires at all for some reason,
     and our controls aren't clickable. On Chrome, the click still fires,
     but you can't drag to select text because of the swallowed mousedown.

     So crazy hack which seems to work. We catch mousedown on our controls,
     and stop propagation so OpenSeadragon never gets it. Click still seems
     to happen, mouse select text still seems to be allowed. */

  $("#overlayControls, #navControls, #minimizedControls").on("mousedown", function(e) {
    e.stopImmediatePropagation();
  });
  /*$("#overlayControls, #navControls, #minimizedControls").on("mouseup", function(e) {
    //e.target.click();
  });*/


});