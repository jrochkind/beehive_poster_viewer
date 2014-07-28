/* All the javascript we need for the poster viewer in one file */

function annotate() {
        var button = document.getElementById('map-annotate-button');
        button.style.color = '#777';

        anno.activateSelector(function() {
          // Reset button style
          button.style.color = '#fff';
        });
      }

      function init() {

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


        var viewer = OpenSeadragon({
          id: "openseadragon",
          //prefixUrl: "http://annotorious.github.io/js/openseadragon/images/",
          showNavigator: false,
          prefixUrl: "/beehive/openseadragon/images/",
          tileSources: "/beehive/MR_WholePoster_PrintRes/mr_zoom.dzi"

         
        });
        
        anno.makeAnnotatable(viewer);








      }



      jQuery( document ).ready(function( $ ) {
        init();
      });