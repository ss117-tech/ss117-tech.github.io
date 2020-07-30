    //Initialize the variables
    var cleanedData= d3.csv("cleanedData.csv")
    var countriesJson=d3.json("countries.geo.json")

    // datasets having both therotes and the county information
    var dataSets={}



    function groupByAirline(data) {
      //Iterate over each route, producing a dictionary where the keys is are the ailines ids and the values are the information of the airline.
      let result = data.reduce((result, d) => {
        let currentData = result[d.AirlineID] || {
            "AirlineID": d.AirlineID,
            "AirlineName": d.AirlineName,
            "Count": 0
        }

        currentData.Count +=  1 //TODO: Increment the count (number of flightpaths) of ariline.

        result[d.AirlineID] = currentData //TODO: Save the updated information in the dictionary using the airline id as key.

        return result;
      }, {})

      //We use this to convert the dictionary produced by the code above, into a list, that will make it easier to create the visualization.
      result = Object.keys(result).map(key => result[key])
      result = result.sort((x,y) => d3.descending(x.Count, y.Count)) //TODO: Sort the data in descending order of count.

      return result
    }


    function drawAirlinesChart(airlines) {
        let config = getAirlinesChartConfig();
        let scales = getAirlinesChartScales(airlines, config);
        drawBarsAirlinesChart(airlines, scales, config);
        drawAxesAirlinesChart(airlines, scales, config);

    }

    function getAirlinesChartConfig() {
      let width = 350;
      let height = 400;
      let margin = {
        top: 10,
        bottom: 50,
        left: 130,
        right: 10
      }
      //The body is the are that will be occupied by the bars.
      let bodyHeight = height - margin.top - margin.bottom;
      let bodyWidth = width - margin.left - margin.right;//TODO: Compute the width of the body by subtracting the left and right margins from the width.

      //The container is the SVG where we will draw the chart. In our HTML is the svg ta with the id AirlinesChart
      let container = d3.select("#AirlinesChart"); //TODO: use d3.select to select the element with id AirlinesChart
      container
        .attr("width", width)
        .attr("height", height)
       //TODO: Set the height of the container

       return { width, height, margin, bodyHeight, bodyWidth, container }
    }

    function getAirlinesChartScales(airlines, config) {
        let { bodyWidth, bodyHeight } = config;
        let maximunCount = d3.max(airlines, d => d.Count)

        let xScale = d3.scaleLinear()
            .range([0, bodyWidth])
            .domain([0, maximunCount])

        let yScale = d3.scaleBand()
            .range([0, bodyHeight])
            .domain(airlines.map(a => a.AirlineName))
            .padding(0.2)

        return { xScale, yScale }
    }

    function drawBarsAirlinesChart(airlines, scales, config) {
      let {margin, container} = config; // this is equivalent to 'let margin = config.margin; let container = config.container'
      let {xScale, yScale} = scales
      let body = container.append("g")
          .style("transform",
            `translate(${margin.left}px,${margin.top}px)`
          )

      let bars = body.selectAll(".bar").data(airlines)
          //TODO: Use the .data method to bind the airlines to the bars (elements with class bar)


      //Adding a rect tag for each airline
      bars.enter().append("rect")
          .attr("height", yScale.bandwidth())
          .attr("y", (d) => yScale(d.AirlineName))
          .attr("width", (d) => xScale(d.Count))
          //TODO: set the width of the bar to be proportional to the airline count using the xScale
          .attr("fill", "#2a5599")
          .on("mouseenter", function(d) { // <- this is the new code
            drawRoutes(d.AirlineID)//TODO: call the drawRoutes function passing the AirlineID id 'd'
            d3.select(this)
              .attr("fill", "#992a5b")
             //TODO: change the fill color of the bar to "#992a5b" as a way to highlight the bar. Hint: use d3.select(this)
           })
           .on("mouseleave", function(d) { // <- this is the new code
             drawRoutes(null)
             d3.select(this)
               .attr("fill", "#2a559")
              //TODO: change the fill color of the bar to "#992a5b" as a way to highlight the bar. Hint: use d3.select(this)
            })
           //TODO: Add another listener, this time for mouseleave
           //TODO: In this listener, call drawRoutes(null), this will cause the function to remove all lines in the chart since there is no airline withe AirlineID == null.
           //TODO: change the fill color of the bar back to "#2a5599"

    }

    function drawAxesAirlinesChart(airlines, scales, config){
      let {xScale, yScale} = scales
      let {container, margin, height} = config;
      let axisX = d3.axisBottom(xScale)
                    .ticks(5)

      container.append("g")
        .style("transform",
            `translate(${margin.left}px,${height - margin.bottom}px)`
        )
        .call(axisX)

      let axisY = d3.axisLeft(yScale)
                        .ticks(5)
      //d3.axisLeft(yScale) //TODO: Create an axis on the left for the Y scale
      //TODO: Append a g tag to the container, translate it based on the margins and call the axisY axis to draw the left axis.
      container.append("g")
        .style("transform",
            `translate(${margin.left}px,${margin.top}px)`
        )
        .call(axisY)
    }

    function drawMap(geoJeon) {
        let config = getMapConfig();
        let projection = getMapProjection(config);
        drawBaseMap(config.container, geoJeon.features, projection)
    }


    function getMapConfig(){
      let width = 600;
      let height = 400;
      let container = d3.select("#map");//TODO: select the svg with id Map
     //TODO: set the width and height of the conatiner to be equal the width and height variables.
      container.attr("width", width).attr("height", height)
      return {width, height, container}
    }

    function getMapProjection(config) {
      let {width, height} = config;
      let projection = d3.geoMercator();//TODO: Create a projection of type Mercator.
      projection.scale(97).translate([width / 2, height / 2 + 20])
      dataSets.mapProjection = projection;
      return projection;
    }

    function drawBaseMap(container, countries, projection){
      let path = d3.geoPath().projection(projection) //TODO: create a geoPath generator and set its projection to be the projection passed as parameter.

      container.selectAll("path").data(countries)
      .enter().append("path")
      .attr("d",d => path(d)) //TODO: use the path generator to draw each country )
      .attr("stroke", "#ccc")
      .attr("fill", "#eee")
    }

    function drawAirports(airports) {
      let config = getMapConfig(); //get the config
      let projection = getMapProjection(config) //get the projection
      let container = config.container; //get the container

      let circles = container.selectAll("circle")
                          .data(airports)
                          .enter().append("circle")
                          .attr("r", 1)
                          .attr("cx", d => projection([d.Longitude, d.Latitude])[0])
                          .attr("cy", d => projection([d.Longitude, d.Latitude])[1])
                          .attr("fill", "#2a5599");
                          //TODO: bind the airports to the circles using the .data method.
                          //TODO: for each new airport (hint: .enter)
                          //      - Set the radius to 1
                          //      - set the x and y position of the circle using the projection to convert longitude and latitude to x and y porision.
                          //      - Set the fill color of the circle to  "#2a5599"
    }

    function groupByAirport(data) {
        //We use reduce to transform a list into a object where each key points to an aiport. This way makes it easy to check if is the first time we are seeing the airport.
        let result = data.reduce((result, d) => {
            //The || sign in the line below means that in case the first option is anything that Javascript consider false (this insclude undefined, null and 0), the second option will be used. Here if result[d.DestinationAirportID] is false, it means that this is the first time we are seeing the airport, so we will create a new one (second part after ||)

            let currentDest = result[d.DestinationAirportID] || {
                "AirportID": d.DestinationAirportID,
                "Airport": d.DestinationAirport,
                "Latitude": +d.DestinationLatitude,
                "Longitude": +d.DestinationLongitude,
                "City": d.DestinationCity,
                "Country": d.DestinationCountry,
                "Count": 0
            }
            currentDest.Count += 1
            result[d.DestinationAirportID] = currentDest

            //After doing for the destination airport, we also update the airport the airplane is departing from.
            let currentSource = result[d.SourceAirportID] || {
                "AirportID": d.SourceAirportID,
                "Airport": d.SourceAirport,
                "Latitude": +d.SourceLatitude,
                "Longitude": +d.SourceLongitude,
                "City": d.SourceCity,
                "Country": d.SourceCountry,
                "Count": 0
            }
            currentSource.Count += 1
            result[d.SourceAirportID] = currentSource

            return result
        }, {})

        //We map the keys to the actual ariorts, this is an way to transform the object we got in the previous step into a list.
        result = Object.keys(result).map(key => result[key])
        return result
    }

    function drawRoutes(airlineID) {
        let flightpaths = dataSets.flightpaths//TODO: get the flightpaths from dataSets
        let projection = dataSets.mapProjection//TODO: get the projection from the dataSets
        let container = d3.select('#Map')//TODO: select the svg with id "Map" (our map container)
        let selectedRoutes = flightpaths.filter(d => d.AirlineID === airlineID)//TODO: filter the flightpaths to keep only the flightpaths which AirlineID is equal to the parameter airlineID received by the function

        let bindedData = container.selectAll("line")
            .data(selectedRoutes, d => d.ID) //This seconf parameter tells D3 what to use to identify the flightpaths, this hepls D3 to correctly find which flightpaths have been added or removed.

        //TODO: Use the .enter selector to append a line for each new route.
        //TODO: for each line set the start of the line (x1 and y1) to be the position of the source airport (SourceLongitude and SourceLatitude) Hint: you can use projection to convert longitude and latitude to x and y.
        //TODO: for each line set the end of the line (x2 and y2) to be the position of the source airport (DestLongitude and DestLongitude)

        //TODO: set the color of the stroke of the line to "#992a2a"
        //TODO: set the opacity to 0.1

        //TODO: use exit function over bindedData to remove any flightpaths that does not satisfy the filter.

        bindedData.enter().append("line")
          .attr("x1", d => projection([d.SourceLongitude, d.SourceLatitude])[0])
          .attr("y1", d => projection([d.SourceLongitude, d.SourceLatitude])[1])
          .attr("x2", d => projection([d.DestinationLongitude, d.DestinationLatitude])[0])
          .attr("y2", d => projection([d.DestinationLongitude, d.DestinationLatitude])[1])
          .attr("stroke", "#992a2a")
          .attr("opacity", 0.1)

        bindedData.exit().remove()
    }



    function displayAll() {

      var flightpaths = dataSets.flightpaths

      var airlines = groupByAirline(dataSets.flightpaths); // Compute the number of flightpaths per airline.

      drawAirlinesChart(airlines) // Draw the Airlines Chart
      drawMap(dataSets.geo)

      let airports = groupByAirport(dataSets.flightpaths);
      drawAirports(airports)

      drawRoutes("24")
    }

    Promise.all([
        cleanedData,
        countriesJson,
    ]).then(datasets => {
        dataSets.flightpaths = datasets[0]; // Capture flightpaths/routes
        dataSets.geo = datasets[1]          //Capture country data from the JSON data
        return dataSets;
    }).then(displayAll);
