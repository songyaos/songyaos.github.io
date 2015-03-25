
<script>
d3.csv("life-expectancy-full.csv", function(csv) {

  var
  // The color scale
  scale = colorbrewer.YlOrRd[9].reverse().concat(colorbrewer.YlGn[9]),

  // The SVG container
  width  = 960,
  height = 550,
  chart  = d3.select("#chart")
             .append("svg")
               .attr("width",  width)
               .attr("height", height),

  // Extract years and compute min/max years
  years    = d3.keys(csv[0])
               .filter(function(d) { return d.match(/^\d/); })
               .map(   function(d) { return parseInt(d); }),
  min_year = d3.min(years),
  max_year = d3.max(years),

  // Starting year
  year     = top.location.search.replace(/\?/, "") || min_year,

  // Extract min/max values from the whole dataset
  values   = d3.merge(
               csv
                 .map(function(d) { return d3.entries(d).filter(function(d) { return d.key.match(/^\d/); }); })
                 .map(function(d) { return d.map(function(d) { return d.value; }); })
                 .map(function(d) { return d.map(function(d) { return parseFloat(d); }) })
                 .map(function(d) { return d.filter(function(d) { return !isNaN(d); }) })
             ),

  // Extract data for selected year
  // (Returns a hash in the form of { <COUNTRY ID> : <VALUE> } for selected year)
  data     = function() {
               return csv
                 .reduce( function(previous, current, index) {
                   previous[ current["Country Code"] ] = parseFloat(current[year]);
                   return previous;
                 }, {})
              },

  // Define color scale (bucketed, from dark reds to bright yellows)
  color    = function() {
               return d3.scale.quantile()
                 .domain([d3.min(values),d3.max(values)])
                 .range(scale)
              },

  // Projection
  p        = d3.geo.mercator()
                .translate([480, 300])
                .scale(970),
  path     = d3.geo.path().projection(p);

  // The map
  var countries = d3.select("g#countries").empty() ?
                    chart.append("g").attr("id", "countries") : d3.select("g#countries"),
      country   = countries
                    .selectAll("path")
                    .data(world_countries.features);
  country
   .enter()
    .append("path")
    .classed("country", true)
    .attr("id",    function(d,i) { return d.id; })
    .attr("title", function(d,i) { return d.properties.name; })
    .attr("d", path);

  // Tooltip
    var tooltip = d3.select("#chart")
                    .append("div")
                    .attr("class", "tooltip");

  // The legend
  var legend =  chart.append("g").attr("id", "legend");

  // Update the chart graphics based on new data for selected year
  var update = function() {
    // console.log("Selected year", year)

    // Continue cycle when hitting dataset boundaries
    if ( year < min_year ) year = max_year;
    if ( year > max_year ) year = min_year;

    // * Page
    // ** Update the year in the footer
    d3.select("h1 .year").text(year);

    // * Countries
    // ** Add colorization based on the color scale (animated)
    country
      .transition()
        .duration(250)
      .style("fill",  function(d) { return data()[d.id] ? color()(data()[d.id]) : null; });

    // ** Show/hide tooltip
    country
      .on("mousemove", function(d,i) {
        var mouse = d3.mouse(chart.node()).map( function(d) { return parseInt(d); } );

        tooltip
          .classed("hidden", false)
          .attr("style", "left:"+(mouse[0]+25)+"px;top:"+mouse[1]+"px")
          .html(d.properties.name+' <span class="sep">|</span> '+d3.round(data()[d.id], 1))
      })
      .on("mouseout",  function(d,i) {
        tooltip.classed("hidden", true)
      });

    // * Legend
    // ** Update swatches
    var swatch = legend.selectAll("rect").data( color().copy().quantiles() );
    swatch
     .enter()
      .append("rect")
      .attr("width",  18)
      .attr("height", 18)
      .attr("x", function(d,i) { return i*18; })
      .attr("y", height - 25);
    swatch
      .style("fill", function(d,i) { return color()(d); });

    // ** Update labels
    var label = legend.selectAll("text").data( color().copy().quantiles() );
    label
     .enter()
      .append("text")
      .classed("legend", true)
      .attr("x", function(d,i) { return 2 + i*18; })
      .attr("y", height - 29);
    label
      .text(function(d,i) { return d3.round(d); });

    return chart;
  };

  // Update the chart on first load
  update();

  // Interactivity: cycle through years by arrow keys
  d3.select(window).on("keydown", function() {
    switch (d3.event.keyCode) {
      case 37: year = parseInt(year)-1; update(); break;
      case 39: year = parseInt(year)+1; update(); break;
    }
  });

  // Hook up autoplay
  var playing = false,
      loop    = null;
  d3.select("#autoplay").on("click", function() {
    d3.event.preventDefault();
    if (playing) {
      playing = false;
      clearInterval(loop);
      return d3.select(d3.event.target).text("autoplay");
    } else {
      playing = true;
      loop    = setInterval( function() { year += 1; update(); }, 750 );
      return d3.select(d3.event.target).text("stop autoplay");
    }
  });

  return chart;
});

</script>