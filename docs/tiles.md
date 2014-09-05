To display a very large high-resolution image in a web browser, that'll be horribly slow, use too much network, and crash some people's computers.

Instead, we want to split up the image into multiple tiles at various zoom levels.

The [OpenSeadragon](https://github.com/openseadragon/openseadragon) JS viewer we use takes care of fetching and reassembling the right tiles needed for the view. 

The tiles are saved in a particular format called [Deep Zoom Image or DZI](http://msdn.microsoft.com/en-us/library/cc645077(v=vs.95).aspx). 

Converting the big image into DZI format is a bit tricky, because you need special software, and you need that software to actually do a good job without losing image fidelity. 

I used the [libvips software dzsave function](http://libvips.blogspot.com/2013/03/making-deepzoom-zoomify-and-google-maps.html) to convert to DZI. 

It was a bit tricky to get this installed on Mac OSX (and I woudln't even bother trying with Windows). Prob need to be a techy type to get this to work, but here's [some hints from the libvips documentation](http://www.vips.ecs.soton.ac.uk/index.php?title=Build_on_OS_X#Homebrew)

Once installed, here's the libvips command I used:

    vips dzsave "MR_image.tif" mr --suffix .jpg[Q=50]

The second argument `mr` is the name you want to give to the output DZI -- use the short identifier you've chosen for the poster at hand. Note the [Q=50] at the end, where we are choosing JPG quality level. 

`libvips dzsave` will output JPG -- you can choose the JPG quality level you want to output. With the Mesoamerica Resiste poster, it looked to us like quality 5 is the lowest you can go with no noticeable image degradation. Higher levels didn't seem to result in any better quality, although lower levels added artifacts. Note the [Q=50] on the end, where we choose JPG quality level (50 out of 100, same as 5 out of 10 in other software).

Also, note we begin with a TIFF file as input. you want to **begin with a TIFF file saved with an RGB colorspace profile**. You want to start with a TIFF, not a JPG, because a JPG has already lost some original image information, which can lead to poorer quality when libvips resizes for tiles. And, it looks like saving in the RGB colorspace helps avoid color shifts when libvips resizes for tiles too. 

## output of libvips dzsave, transfer to web server

In whatever directory you are in, you will get a .dzi file, and a directory of image tiles. Since in the above example we provided `mr` as the output name, you'll see an `mr.dzi` file, and a `mr_files` directory. 

We do not keep these files in git. You'll have to transfer them directory to the web server. On the web server, in the posterViewer directory, go inside the `tiles` directory. Since we chose `mr` as the unique name for this poster, make a subdirectory called `mr` in there. 

And transfer both the `mr.dzi` and `mr_files` direcotry (and all it's contents) *inside* of that `mr` directory. 

You can use whatever method you want to transfer these files but they are BIG. You won't make them any smaller by putting them in a .zip file, as jpg's are already compressed. 

On Mac OSX, I use the command line rsync command, which also let's us set bandwidth limit if we're on a shared connection. 

Let's say we already have an `mr` folder on our local computer, with the dzi and _files directory in it:

    rsync -rv mr beehiveweb@julia.mayfirst.org:beehivecollective.org/web/beehivecollective.org/posterViewer/tiles/

## image quality

Even using this process, I am still not entirely happy with the image quality. It's just fine when you are zoomed all the way in, but at zoomed out views using reduced/resized tiles, I am noticing some loss of fidelity and color shifting. It's not huge, and isn't neccesarily noticeable at first -- I think it's good enough for now, but I hope to keep working on it and make it even better. 

I am still not exactly sure what is causing this (but increasing the JPG quality level did *not* help), hope to invesitgate further. 