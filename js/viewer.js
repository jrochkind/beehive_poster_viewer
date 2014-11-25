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
  'full_screen_instruction': 'For the best view, try full-screen display.',
  'zoom_in': 'Zoom in',
  'zoom_out': 'Zoom out',
  'full_poster': 'Full poster',
  'full_screen': 'Toggle full screen',
  'share_link': 'Share link to the current view of the poster',
  'minimize': 'Hide the guide',
  'show_text_box': 'Show the guide'
};

i18n_data.es = {
  'next': 'Siguiente',
  'previous': 'Anterior',
  'scenes': 'Escenas'
};

// A span or other element with data-i18n-key="key"
// will have it's text content replaced by the value
// from i18n hashes above.
// data-i18n-title-key will have 'title' attribute
// replaced instead, for <a> mouseovers.

function applyI18nValues(lang) {
  $(document).find("[data-i18n-key]").each(function(i, el) {
    var key = el.attributes['data-i18n-key'].value;
    var value = i18n_data[lang][key];
    if (value) {
      $(el).text(  value  );
    }
  });

  $(document).find("[data-i18n-title-key]").each(function(i, el) {
    var key = el.attributes['data-i18n-title-key'].value;
    var value = i18n_data[lang][key];
    if (value) {
      $(el).attr('title',  value);
    }
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

// Hides or shows full-screen tip depending on current
// context -- show, only on the first scene, only if
// we're not in full-screen mode, and full-screen mode is
// possible.
//
// Pass in an 'li' for a scene, so we can determine
// if it's the first scene. 
function adjustTipVisibility(li) {
  // Show full screen instructions IFF it's the first element
  // and we can switch to full-screen view
  if (li.prev().size() == 0  && (OpenSeadragon.supportsFullScreen) && (! OpenSeadragon.isFullScreen())) {
    $("#fullScreenInstruction").show();
  } else {
    $("#fullScreenInstruction").hide();
  }
}

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

  // Should we make the full-screen tip visible? Make it so.
  adjustTipVisibility(li);

  // Load the story content
  $("#storyLabel").text( story.label );
  $("#storyText").html( story.html  );
  $(".controlsText").get(0).scrollTop = 0;
  $(".controlsText").slideDown('slow');

  closeStoryList(function() {
    withSlowOSDAnimation(function() {
      rect = adjustRectForPanel(rect);

      openSeadragonViewer.viewport.fitBounds(rect);
    });
  });
}

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
    //fullPageButton: 'fullPageBtn',
    minZoomImageRatio: 0.5
  });
}

function addControls() {
  var controls = $("#overlayControls");
  var navControls = $("#navControls");
  var minimizedButton = $("#showControlsBtn");
  var container = $("#openseadragon .openseadragon-container");


  //container.append(navControls);
  //container.append(controls);

  // Custom behavior for fullScreen, we want to full screen entire
  // body so our custom controls will still be there. 
  //  We do lose OSD's fullscreen-related events this way. We're still
  // using some lower-level OSD events to deal with fullscreen switch. 
  // (Skipping OSD's _fullPage_ mode was crucial, to leave our controls
  // on-screen)
  //
  // We can also catch a click on our full screen instructions.
  $("body").on("click", "#fullPageBtn, #fullScreenInstruction", function(event) {
    event.preventDefault();

    if (OpenSeadragon.isFullScreen()) {
      OpenSeadragon.exitFullScreen();
    } else {
      OpenSeadragon.requestFullScreen( document.body );
    }

    // After switching full screen, re-adjust whether full-screen
    // tip is visible.
    adjustTipVisibility($(".controlsText").data("beehive-story-li"));

  });
  // But the hide the button entirely if OSD thinks we can't do full screen. 
  if ((!OpenSeadragon.supportsFullScreen) && (! OpenSeadragon.isFullScreen())) {
    $("#fullPageBtn").css("visibility", "hidden");
  }


  // Add minimization behavior
  controls.on("click", ".controlsMinimize", function(event) {
    event.preventDefault();

    controls.slideUp('slow', function() {;
      // wait til animation is done
      minimizedButton.fadeIn();
    });
  });
  navControls.on("click", "#showControlsBtn", function(event) {
    event.preventDefault();


    minimizedButton.fadeOut(function() {
      storyListHeightLimit();

      controls.slideDown('slow', function() {
        // Some issue in Safari (including iOS) is making
        // the control panel lose it's proper max height,
        // and worse the controlsText area strangely appearing
        // as visibility:hidden (even though it's not marked so)
        // on maximization. 
        //
        // We recalculate the max height after sliding down, 
        // and also need to hide and then quickly fade in (just `show`
        // didn't work!) to make things properly visible and sized
        // in safari after slideDown. (If we just used show instead
        // of slideDown it doesn't seem to trigger the Safari issue,
        // but we like slideDown)
        storyListHeightLimit();

        if ($(".controlsText").is(":visible")) {
          $(".controlsText").hide();
          $(".controlsText").fadeIn(1);
        }
      });



    });
  });


  // Story list expand/contract
  $("#overlayControls").on("click", ".scene-expander",function(event) {
    event.preventDefault();

    if ($(this).hasClass("open")) {
      closeStoryList();
    } else {
      openStoryList();
    }
  });


  // Click on story
  $("#storyList").on("click", ".story", function(event) {
    event.preventDefault();

    var li = $(this).closest("li")

    loadStory(li);
  });

  // Next/prev
  $(".controls-text-nav").on("click", ".controls-text-nav-prev", function(event) {
    event.preventDefault();

    var li = $(".controlsText").data("beehive-story-li");    
    loadStory(li.prev());
  });
  $(".controls-text-nav").on("click", ".controls-text-nav-next", function(event) {
    event.preventDefault();

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
    var url = window.location.href.split('#')[0];
    var hashParams = {};

    hashParams.x = bounds.x.toFixed(5);
    hashParams.y = bounds.y.toFixed(5);
    hashParams.w = bounds.width.toFixed(5);
    hashParams.h = bounds.height.toFixed(5);

    url += '#' + jQuery.param(hashParams);

    return url;
  }

  /* prepare the modal we'll display permalinks in */
  $("#linkModal").easyModal({
      overlayOpacity: 0.65
  });

  /* load data from the narrative file */
  var ajaxLoad = loadPosterData();
  // And go to first story, or specified bounds -- but only after OSD finishes
  // loading AND our ajax loadPosterData is done!
  openSeadragonViewer.addHandler('open', function (event) {
    // always: poster.xml load may not have worked, we still
    // wanna set our view of the tiles. 
    ajaxLoad.always(function() {
      gotoInitialView();
    });
  });


  $("#navControls").on("click", "#makePermaLink", function(event) {
    event.preventDefault();
    var bounds = openSeadragonViewer.viewport.getBounds();


    $("#linkModalUrlField").val( urlWithNewBounds(bounds) );
    $("#linkModal").trigger('openModal');
  });

}

function storyToFragmentUrl(storyJson) {
  var label = storyJson.label;
  if ((typeof label === "undefined") || label.length === 0) {
    return;
  } else {
    return window.location.href.split('#')[0] + "#s=" + encodeURIComponent(label);
  }
}

// We store the story data in XML becuase it's more convenient
// to edit by hand for the sort of data we have (really!), but
// json is easier to deal with in javascript, esp cross-browser. 
function storyXmlToJson(storyXml) {
  storyXml = $(storyXml);
  var json = {};

  json.label        = storyXml.find("label").text();

  // .html() on xml node doesn't work in safari, use XMLSerializer.
  // If it's raw text with no elements, wrap in a single <p> for
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

// Go to a view specified in URL, or else open first scene
function gotoInitialView() {
  var params = paramsToHash(document.location.hash.replace(/^\#/, ''));
  if ( ("x" in params ) && (params.x !== "") &&
       ("y" in params ) && (params.y !== "") &&
       ("w" in params ) && (params.w !== "") &&
       ("h" in params ) && (params.h !== "") ) {

    var rect = new OpenSeadragon.Rect(parseFloat(params.x),
      parseFloat(params.y),
      parseFloat(params.w),
      parseFloat(params.h));
    openSeadragonViewer.viewport.fitBounds(rect);
  } else if ("s" in params) {
    // find the scene with matching title to our 's' 
    var destLi = $("#storyList li").filter(function(i, li) {
      var story = $(li).find(".story").data("beehive-story");
      return story.label == params.s;
    }).first();
    if (destLi) {
      loadStory(destLi);
    }
  } else {
    // Load the first story
    var li = $("#storyList li:first");
    if (li.size() > 0) {
      loadStory(li);
    }
  }
}

// Loads the poster data, returns the AJAX object, so it can be used as a JQuery
// promise. 
function loadPosterData() {
  /* fetch the xml of stories */
  var fetchUrl = "./narrative/" + beehive_poster + "/" + beehive_lang + ".xml";
  var ajax = $.ajax({
    url: fetchUrl,
    dataType: "xml",
    success: function(xml) {
      xml = $(xml);

      var title_text = xml.find("data > title").text().trim();
      var title_link = xml.find("data > link").text().trim();

      document.title = title_text;
      // for the header, replace newlines with <br>s to preserve

      $("#titleLink").attr("href", title_link).html(title_text.replace(/[\n\r]+/, "<br>"));

      // Load scenes
      var storyList = $("#storyList");
      xml.find('story').each(function(i, storyXml){
        var storyJson = storyXmlToJson(storyXml);
        var li        = $("<li/>");
        var a  = $("<a href='#' class='story'/>").
          attr('href', storyToFragmentUrl(storyJson)).
          text($(storyXml).find("label").text()).
          data('beehive-story', storyJson);

        li.append(a).appendTo(storyList);
      });

      // Make the scene list visible only if we actually have
      // scenes
      if (storyList.find("li").size() > 0) {
        $(".controls-story-list-expander").show();
      }

      // Adjust heights after load
      storyListHeightLimit();
    }
  });

  return ajax;
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
      panel.position().top -
      parseInt(panel.css('margin-top')) -
      20; // 20px bottom margin we want

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
        addShowRegionPlugin();

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

/* In admin mode, we use annotorious, and change it's display
   to give us the coordinates in a form we can just paste into
   a narrative.xml file */
function addShowRegionPlugin() {

  annotorious.plugin.ShowRegionPlugin = function(opt_config_options) { }

  annotorious.plugin.ShowRegionPlugin.prototype.initPlugin = function(anno) {
    // Add initialization code here, if needed (or just skip this method if not)
  }

  annotorious.plugin.ShowRegionPlugin.prototype.onInitAnnotator = function(annotator) {
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
  anno.addPlugin('ShowRegionPlugin', {});
}



setPosterAndLang();

if (paramsToHash(document.location.search).admin === "true") {
  addAdminHelperUI();
}

jQuery( document ).ready(function( $ ) {
  setupOpenSeadragonViewer();
  addControls();
  addPermalinkFunc();

  // Once on load
  storyListHeightLimit();

  applyI18nValues(beehive_lang);


});