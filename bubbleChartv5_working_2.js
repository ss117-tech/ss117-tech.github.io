function bubbleChart() {
  var width = 1024;
  var height = 768;


  // location to centre the bubbles
  var centre = { x: width/2, y: height/2 };

  var countryCenters = {

    US: { x: width / 9, y: height / 2 },
    UK: { x: 2*width / 9, y: height / 2 },
    China: { x: 3 * width / 9, y: height / 2 },
    France: { x: 4 * width / 9, y: height / 2 },
    Spain:{ x:5 * width / 9, y: height / 2 },
    Germany:{ x:6 * width / 9, y: height / 2 },
    Italy:{ x:7 * width / 9, y: height / 2 },
    Others:{ x: 8 * width / 9, y: height / 2 }

  };

  // X locations of the year titles.
  var countryTitleX = {
    US: width / 9,
    UK: 2*width / 9,
    China: 3 * width / 9,
    France: 4 * width / 9,
    Spain: 5 * width / 9,
    Germany:6 * width / 9,
    Italy:7 * width / 9,
    Others: 8 * width / 9
  };

  // strength to apply to the position forces
  var forceStrength = 0.03;

  // these will be set in createNodes and chart functions
  var svg = null;
  var bubbles = null;
  var labels = null;
  var nodes = [];

  // charge is dependent on size of the bubble, so bigger towards the middle
  function charge(d) {
    return -Math.pow(d.radius, 2.0) * forceStrength;
  }

  // create a force simulation and add forces to it
  var simulation = d3.forceSimulation()
    .velocityDecay(0.2)
    .force('charge', d3.forceManyBody().strength(charge))
    .force('x', d3.forceX().strength(forceStrength).x(centre.x))
    .force('y', d3.forceY().strength(forceStrength).y(centre.y))
    .on('tick', ticked);


  // force simulation starts up automatically, which we don't want as there aren't any nodes yet
  simulation.stop();


  const fillColour = d3

  .scaleOrdinal(d3.schemeCategory10)
  .domain(['US','UK','China','France','Spain','Germany', 'Italy','Others']);


  function createNodes(rawData) {

    var maxAmount = d3.max(rawData, function (d) { return +d.flights; });


    var radiusScale = d3.scalePow()
      .exponent(0.5)
      .range([2, 85])
      .domain([0, maxAmount]);



    var myNodes = rawData.map(function (d) {
      return {
        id: d.id,
        radius: radiusScale(+d.flights/16),
        flights: +d.flights,
        city: d.city,
        country: d.country,
        x: Math.random() * 900,
        y: Math.random() * 800
      };
    });

    // sort them to prevent occlusion of smaller nodes.
    myNodes.sort(function (a, b) { return b.flights - a.flights; });

    return myNodes;
  }

  // main entry point to bubble chart, returned by parent closure
  // prepares rawData for visualisation and adds an svg element to the provided selector and starts the visualisation process
  var chart = function chart(selector, rawData) {
    // convert raw data into nodes data
    nodes = createNodes(rawData);

    // create svg element inside provided selector
    svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)

    // bind nodes data to circle elements

    //bubbles = svg.selectAll('.bubble')
    //  .data(nodes, function (d) { return d.id; });

    //var bubblesE = bubbles.enter().append('circle')
    //    .classed('bubble', true)
    //    .attr('r', 0)
    //    .attr('fill', function (d) { return fillColor(d.country); })
    //    .attr('stroke', function (d) { return d3.rgb(fillColor(d.country)).darker(); })
    //    .attr('stroke-width', 2)
    //    .on('mouseover', showDetail)
    //    .on('mouseout', hideDetail);

    //bubbles = bubbles.merge(bubblesE);

    //bubbles.transition()
    //  .duration(2000)
    //  .attr('r', function (d) { return d.radius; });

    elements = svg.selectAll('.bubble')
      //.data(nodes, d => d.country)
      .data(nodes, function (d) { return d.id; });
      //.enter()
      //.append('g')

      var tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('pointer-events', 'none')
        .style('width', 240)
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");




     var mouseover = function(d) {
            tooltip
                .style("opacity", 1)
                .style("visibility", "visible")
                .html
                //("The exact value of<br>this cell is 1 ")
                ('<span class="name">City: </span><span class="value">' +
                                d.city +
                                '</span><br/>' +
                                '<span class="name">Flights: </span><span class="value">$' +
                                d.flights +
                                '</span><br/>' +
                                '<span class="name">Country: </span><span class="value">' +
                                d.country +
                                '</span>')
                .style("left", (d3.event.pageX) + "px")
                         .style("top", (d3.event.pageY - 28) + "px");;

          d3.select(this)
                                  .style("stroke", "black")
                                  .style("opacity", 1)
          }

    var mousemove = function(d) {
          tooltip
            .html("The exact value of<br>this cell is: " + d.flights)
            .style("left", (d3.mouse(this)[0]+70) + "px")
            .style("top", (d3.mouse(this)[1]) + "px")
        }

    var mouseleave = function(d) {
          d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8)
          tooltip
              .style("opacity", 0)
        }

    bubbles = elements
      .enter()
      .append('circle')
      .classed('bubble', true)
      .attr('r', d => d.radius)
      .attr('fill', d => fillColour(d.country))
      .attr('stroke-width', 2)
      .on('mouseover',
      /*function(d) {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(
          /*'<a href= "http://google.com">' + // The first <a> tag
          formatTime(d.date) +
          "</a>" +                          // closing </a> tag
          "<br/>"  + d.close
           '<p>Check</p>'})*/mouseover)
      //.on("mousemove", mousemove)
      .on("mouseleave", mouseleave);




    //bubbles = elements.enter().append('circle')
    //    .classed('bubble', true)
    //    .attr('r', d => d.radius)
    //    .attr('fill', function (d) { return fillColor(d.country); });
        //.attr('stroke', function (d) { return d3.rgb(fillColor(d.country)).darker(); })
        //.attr('stroke-width', 2);
        //.on('mouseover', showDetail)
        //.on('mouseout', hideDetail);

    //var tooltip = floatingTooltip('gates_tooltip', 240);

    // labels
    //labels = elements
    //  .append('text')
    //  .attr('dy', '.3em')
    //  .style('text-anchor', 'middle')
    //  .style('font-size', 10)
    //  .text(d => d.country)

    // set simulation's nodes to our newly created nodes array
    // simulation starts running automatically once nodes are set
    simulation.nodes(nodes);
      //.on('tick', ticked)
      //.restart();

    groupBubbles();
  }


  // callback function called after every tick of the force simulation
  // here we do the actual repositioning of the circles based on current x and y value of their bound node data
  // x and y values are modified by the force simulation
  function ticked() {
    bubbles
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)

    //labels
    //  .attr('x', d => d.x)
    //  .attr('y', d => d.y)
  }

  function nodeCountryPos(d) {
    return countryCenters[d.country].x;
  }

  function groupBubbles() {
    hideCountryTitles();

    // @v4 Reset the 'x' force to draw the bubbles to the center.
    simulation.force('x', d3.forceX().strength(forceStrength).x(centre.x));

    // @v4 We can reset the alpha value and restart the simulation
    simulation.alpha(1).restart();
  }

  function hideCountryTitles() {
    svg.selectAll('.country').remove();
  }

  function splitBubbles() {
    showCountryTitles();

    // @v4 Reset the 'x' force to draw the bubbles to their year centers
    simulation.force('x', d3.forceX().strength(forceStrength).x(nodeCountryPos));

    // @v4 We can reset the alpha value and restart the simulation
    simulation.alpha(1).restart();
  }

  function showCountryTitles() {
    // Another way to do this would be to create
    // the year texts once and then just hide them.
    var countryData = d3.keys(countryTitleX);
    var country = svg.selectAll('.country')
      .data(countryData);

    country.enter().append('text')
      .attr('class', 'country')
      .attr('x', function (d) { return countryTitleX[d]; })
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
  }


  chart.toggleDisplay = function (displayName) {
    if (displayName === 'country') {
      splitBubbles();
    } else {
      groupBubbles();
    }
  };
  // return chart function from closure
  return chart;
}

// new bubble chart instance
var myBubbleChart = bubbleChart();

// function called once promise is resolved and data is loaded from csv
// calls bubble chart function to display inside #vis div
function display(data) {

  myBubbleChart('#vis', data);
}


function setupButtons() {
  d3.select('#toolbar')
    .selectAll('.button')
    .on('click', function () {
      // Remove active class from all buttons
      d3.selectAll('.button').classed('active', false);
      // Find the button just clicked
      var button = d3.select(this);

      // Set it as the active button
      button.classed('active', true);

      // Get the id of the button
      var buttonId = button.attr('id');

      // Toggle the bubble chart based on
      // the currently clicked button.

      myBubbleChart.toggleDisplay(buttonId);
    });
}


// load data
d3.csv('test4.csv').then(display);

setupButtons();
