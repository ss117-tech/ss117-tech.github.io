    //Initialize the variables
    var cleanedData= d3.csv("cleanedData.csv")
    var countriesJson=d3.json("countries.geo.json")

    var width =  900;
    var height = 600;

    var margin = {
      top: 10,
      bottom: 50,
      left: 130,
      right: 10
    }
    var bodyHeight = height - margin.top - margin.bottom;
    var bodyWidth = width - margin.left - margin.right;

    // datasets having both therotes and the county information
    var dataSets={}




    function airlineGrouping(data) {

      var airlineDict = data.reduce((airlineDict, d) => {

        //Get present values of the the airline.
        let present = airlineDict[d.AirlineID] || {"AirlineID": d.AirlineID,"AirlineName": d.AirlineName,"numberOfFlights": 0}

        present.numberOfFlights +=  1 //Increment the count by 1.

        airlineDict[d.AirlineID] = present //TODO: Save the updated information in the dictionary using the airline id as key.

        return airlineDict;
      }, {})


      airlineKeys = Object.keys(airlineDict) // Get the keys
      airlineDict = airlineKeys.map(key => airlineDict[key])
      airlineDict = airlineDict.sort((x,y) => d3.descending(x.numberOfFlights, y.numberOfFlights))      //Sort in descending order of number of flights.

      return airlineDict
    }




    function displayFlightPaths(airlineID) {
        let flightpaths = dataSets.flightpaths//TODO: get the flightpaths from dataSets
        let projection = dataSets.mapProjection//TODO: get the projection from the dataSets
        let container = d3.select('#Map')//TODO: select the svg with id "Map" (our map container)
        let selectedRoutes = flightpaths.filter(d => d.AirlineID === airlineID)//TODO: filter the flightpaths to keep only the flightpaths which AirlineID is equal to the parameter airlineID received by the function

        let bindedData = container.selectAll("line")
            .data(selectedRoutes, d => d.ID) //This seconf parameter tells D3 what to use to identify the flightpaths, this hepls D3 to correctly find which flightpaths have been added or removed.

          container.selectAll("line")
                .data(selectedRoutes, d => d.ID).enter().append("line")
          .attr("x1", d => projection([d.SourceLongitude, d.SourceLatitude])[0])
          .attr("y1", d => projection([d.SourceLongitude, d.SourceLatitude])[1])
          .attr("x2", d => projection([d.DestinationLongitude, d.DestinationLatitude])[0])
          .attr("y2", d => projection([d.DestinationLongitude, d.DestinationLatitude])[1])
          .attr("stroke", "#992a2a")
          .attr("opacity", 0.1)

        bindedData.exit().remove()
    }



    function displayBars(airlinesData) {
      //let {margin, container} = config; // this is equivalent to 'let margin = config.margin; let container = config.container'


      var container = d3.select("#AirlinesChart"); //TODO: use d3.select to select the element with id AirlinesChart
      container
        .attr("width", width)
        .attr("height", height)


      var xScale = d3.scaleLinear()
            .range([0, bodyWidth])
            .domain([0, d3.max(airlinesData, d => d.numberOfFlights)])

      var yScale = d3.scaleBand()
            .range([0, bodyHeight])
            .domain(airlinesData.map(a => a.AirlineName))
            .padding(0.2)

     var xAxis = d3.axisBottom(xScale).ticks(5)
     var yAxis = d3.axisLeft(yScale).ticks(5)

      //Adding a rect tag for each airline
      container.append("g")
          .style("transform",
            `translate(${margin.left}px,${margin.top}px)`
          )
          .selectAll(".bar").data(airlinesData)
          .enter()
          .append("rect")
          .attr("height", yScale.bandwidth())
          .attr("y", (d) => yScale(d.AirlineName))
          .attr("width", (d) => xScale(d.numberOfFlights))
          //TODO: set the width of the bar to be proportional to the airline count using the xScale
          .attr("fill", "#2a5599")
          .on("mouseenter", function(d) { // <- this is the new code
            displayFlightPaths(d.AirlineID)//TODO: call the displayFlightPaths function passing the AirlineID id 'd'
            d3.select(this)
              .attr("fill", "#992a5b")
             //TODO: change the fill color of the bar to "#992a5b" as a way to highlight the bar. Hint: use d3.select(this)
           })
           .on("mouseleave", function(d) { // <- this is the new code
             displayFlightPaths(null)
             d3.select(this)
               .attr("fill", "#2a5599")
              //TODO: change the fill color of the bar to "#992a5b" as a way to highlight the bar. Hint: use d3.select(this)
            })
           //TODO: Add another listener, this time for mouseleave
           //TODO: In this listener, call displayFlightPaths(null), this will cause the function to remove all lines in the chart since there is no airline withe AirlineID == null.
           //TODO: change the fill color of the bar back to "#2a5599"


       container.append("g")
             .style("transform",
                 `translate(${margin.left}px,${height - margin.bottom}px)`
             )
             .call(xAxis)

           //d3.axisLeft(yScale) //TODO: Create an axis on the left for the Y scale
           //TODO: Append a g tag to the container, translate it based on the margins and call the axisY axis to draw the left axis.
       container.append("g")
             .style("transform",
                 `translate(${margin.left}px,${margin.top}px)`
             )
             .call(yAxis)
    }





    function displayMap(countries){

      let container = d3.select("#map");//TODO: select the svg with id Map
     //TODO: set the width and height of the conatiner to be equal the width and height variables.
      container.attr("width", width).attr("height", height)

      let projection = d3.geoMercator();//TODO: Create a projection of type Mercator.
      projection.scale(97).translate([width / 2, height / 2 + 20])
      dataSets.mapProjection = projection;

      let path = d3.geoPath().projection(projection) //TODO: create a geoPath generator and set its projection to be the projection passed as parameter.

      container.selectAll("path").data(countries.features)
      .enter().append("path")
      .attr("d",d => path(d)) //TODO: use the path generator to draw each country )
      .attr("stroke", "#ccc")
      .attr("fill", "#eee")
    }

    function displayAirports(airports) {
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
    }

    function airportGrouping(data) {
        //We use reduce to transform a list into a object where each key points to an aiport. This way makes it easy to check if is the first time we are seeing the airport.
        let airlineDict = data.reduce((airlineDict, d) => {
            //The || sign in the line below means that in case the first option is anything that Javascript consider false (this insclude undefined, null and 0), the second option will be used. Here if airlineDict[d.DestinationAirportID] is false, it means that this is the first time we are seeing the airport, so we will create a new one (second part after ||)

            let currentDest = airlineDict[d.DestinationAirportID] || {
                "AirportID": d.DestinationAirportID,
                "Airport": d.DestinationAirport,
                "Latitude": +d.DestinationLatitude,
                "Longitude": +d.DestinationLongitude,
                "City": d.DestinationCity,
                "Country": d.DestinationCountry,
                "Count": 0
            }
            currentDest.numberOfFlights += 1
            airlineDict[d.DestinationAirportID] = currentDest

            //After doing for the destination airport, we also update the airport the airplane is departing from.
            let currentSource = airlineDict[d.SourceAirportID] || {
                "AirportID": d.SourceAirportID,
                "Airport": d.SourceAirport,
                "Latitude": +d.SourceLatitude,
                "Longitude": +d.SourceLongitude,
                "City": d.SourceCity,
                "Country": d.SourceCountry,
                "Count": 0
            }
            currentSource.numberOfFlights += 1
            airlineDict[d.SourceAirportID] = currentSource

            return airlineDict
        }, {})

        //We map the keys to the actual ariorts, this is an way to transform the object we got in the previous step into a list.
        airlineDict = Object.keys(airlineDict).map(key => airlineDict[key])
        return airlineDict
    }




    function displayAll() {

      //var flightpaths = dataSets.flightpaths

      //var airlines = airlineGrouping(dataSets.flightpaths); // Grouping flightpaths by airlines.

      displayBars(airlineGrouping(dataSets.flightpaths)) // Draw the Airlines Chart after grouping flightpaths by airlines.
      displayMap(dataSets.geo)

      displayAirports(airportGrouping(dataSets.flightpaths))

      displayFlightPaths("24")
    }

    Promise.all([
        cleanedData,
        countriesJson,
    ]).then(datasets => {
        dataSets.flightpaths = datasets[0]; // Capture flightpaths/routes
        dataSets.geo = datasets[1]          //Capture country data from the JSON data
        return dataSets;
    }).then(displayAll);
