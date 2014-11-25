#!/usr/bin/env ruby

require 'nokogiri'
require 'debugger'

sourcepath = ARGV[0]
destpath   = ARGV[1]

sourcedoc = File.open(sourcepath) do |file|
  Nokogiri::XML(file)
end

regions = sourcedoc.xpath("//region")


dest = File.open(destpath).read

region_re = /\<region[^>]+\/>/m


unless dest.scan(region_re).size == regions.length
  puts "Region counts don't match. Source: #{regions.length}. Dest #{dest.scan(region_re).size}"
  exit
end

puts "Copying #{regions.length} regions from #{sourcepath} to #{destpath} ..."


newdoc = dest.gsub(region_re).with_index do |match, i|
  regions[i].to_xml
end

File.open(destpath, 'w') { |file| file.write newdoc }