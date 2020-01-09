// -------------Airlines Routes - Part 2 - Dealing with Data -------------
let store = {};
// function loadData() {
//   let promise = d3.csv('./route.csv'); //TODO 1: Add the code to load the CSV file named "routes.csv" | 1 Line
//   return promise.then(routes => {
//     if(routes.length != 0 && routes){
//       store.routes = routes; //TODO 2: Save the routes into our store variable;
//       return store;
//     }else{
//       console.log("load data error");
//     }
//   });
// }

function groupByAirline(data) {
  //Iterate over each route, producing a dictionary where the keys is are the ailines ids and the values are the information of the airline.
  let result = data.reduce((result, d) => {
    let currentData = result[d.AirlineID] || {
      AirlineID: d.AirlineID,
      AirlineName: d.AirlineName,
      Count: 0
    };

    currentData.Count += 1; //TODO: Increment the count (number of routes) of ariline.

    result[d.AirlineID] = currentData; //TODO: Save the updated information in the dictionary using the airline id as key.

    return result;
  }, {});

  //We use this to convert the dictionary produced by the code above, into a list, that will make it easier to create the visualization.
  result = Object.keys(result).map(key => result[key]);
  result = result.sort(function(x, y) {
    return d3.descending(x.Count, y.Count);
  }); //TODO: Sort the data in descending order of count.

  return result;
}

// function showData() {
//   //Get the routes from our store variable

//   let routes = store.routes;
//   // Compute the number of routes per airline.
//   let airlines = groupByAirline(store.routes);
//   console.log('airlines', airlines);
//   drawAirlinesChart(airlines);
// }

loadData().then(showData);

// -------------编程作业: Airlines Routes - Part 3 - Airlines Bar Chart  -------------

function getAirlinesChartConfig() {
  let width = 350;
  let height = 400;
  let margin = {
    top: 10,
    bottom: 50,
    left: 130,
    right: 10
  };
  //The body is the are that will be occupied by the bars.
  let bodyHeight = height - margin.top - margin.bottom;
  //TODO: Compute the width of the body by subtracting the left and right margins from the width.
  let bodyWidth = width - margin.right - margin.left;

  //The container is the SVG where we will draw the chart. In our HTML is the svg ta with the id AirlinesChart
  let container = d3.select('#AirlinesChart'); //TODO: use d3.select to select the element with id AirlinesChart
  container.attr('width', width).attr('height', height);
  //TODO: Set the height of the container

  return { width, height, margin, bodyHeight, bodyWidth, container };
}

function getAirlinesChartScales(airlines, config) {
  let { bodyWidth, bodyHeight } = config;
  let maximunCount = d3.max(airlines.map(d => d.Count)); //TODO: Use d3.max to get the highest Count value we have on the airlines list.
  let xScale = d3
    .scaleLinear()
    .range([0, bodyWidth])
    .domain([0, maximunCount]);
  //TODO: Set the range to go from 0 to the width of the body
  //TODO: Set the domain to go from 0 to the maximun value fount for the field 'Count'

  let yScale = d3
    .scaleBand()
    .range([0, bodyHeight])
    .domain(airlines.map(a => a.AirlineName)) //The domain is the list of ailines names
    .padding(0.2);

  return { xScale, yScale };
}

function drawBarsAirlinesChart(airlines, scales, config) {
  let { margin, container } = config; // this is equivalent to 'let margin = config.margin; let container = config.container'
  let { xScale, yScale } = scales;
  let body = container
    .append('g')
    .style('transform', `translate(${margin.left}px,${margin.top}px)`);

  let bars = body.selectAll('.bar').data(airlines);
  //TODO: Use the .data method to bind the airlines to the bars (elements with class bar)

  //Adding a rect tag for each airline
  bars
    .enter()
    .append('rect')
    .attr('height', yScale.bandwidth())
    .attr('y', d => yScale(d.AirlineName))
    .attr('width', d => xScale(d.Count))
    //TODO: set the width of the bar to be proportional to the airline count using the xScale
    .attr('fill', '#2a5599');
}

function drawAxesAirlinesChart(airlines, scales, config) {
  let { xScale, yScale } = scales;
  let { container, margin, height } = config;
  let axisX = d3.axisBottom(xScale).ticks(5);

  container
    .append('g')
    .style(
      'transform',
      `translate(${margin.left}px,${height - margin.bottom}px)`
    )
    .call(axisX);

  let axisY = d3.axisLeft(yScale); //TODO: Create an axis on the left for the Y scale
  container
    .append('g')
    .style('transform', `translate(${margin.left}px,${margin.top}px`)
    .call(axisY);
  //TODO: Append a g tag to the container, translate it based on the margins and call the axisY axis to draw the left axis.
}

function drawAirlinesChart(airlines) {
  let config = getAirlinesChartConfig();
  let scales = getAirlinesChartScales(airlines, config);
  drawBarsAirlinesChart(airlines, scales, config);
  drawAxesAirlinesChart(airlines, scales, config);
}

//-------------编程作业: Airlines Routes - Part 4 - Adding Base Map-------------

function loadData() {
  return Promise.all([
    d3.csv('./route.csv'),
    d3.json('./countries.geo.json')
  ]).then(datasets => {
    store.routes = datasets[0];
    store.geoJSON = datasets[1];
    return store;
  });
}

//  Map Config
function getMapConfig() {
  let width = 600;
  let height = 400;
  let container = d3.select('#Map'); //TODO: select the svg with id Map
  container
    .attr('width', width)
    .attr('height', height)
    .call(d3.zoom(), function() {
      d3.select(this).attr('transform', d3.event.transform);
    }); //TODO: set the width and height of the conatiner to be equal the width and height variables.

  return { width, height, container };
}

//  Projection
function getMapProjection(config) {
  let {width, height} = config;
  let projection =  d3.geoMercator()//TODO: Create a projection of type Mercator.
  projection.scale(97)
            .translate([width / 2, height / 2 + 20])
            
  store.mapProjection = projection;
  return projection;
}

//  Drawing The Map
function drawBaseMap(container, countries, projection){
    let path = d3.geoPath()
    .projection(projection)//TODO: create a geoPath generator and set its projection to be the projection passed as parameter.
  
  container.selectAll("path").data(countries)
      .enter().append("path")
      .attr("d",d => path(d))//TODO: use the path generator to draw each country )
      .attr("stroke", "#ccc")
      .attr("fill", "#eee")
}

//  Calling The Functions
function drawMap(geoJeon) {
  let config = getMapConfig();
  let projection = getMapProjection(config)
  drawBaseMap(config.container, geoJeon.features, projection)
}

function showData() {
  //Get the routes from our store variable
  let routes = store.routes
  // Compute the number of routes per airline.
  let airlines = groupByAirline(store.routes);
  console.log(airlines)
  drawAirlinesChart(airlines)
  drawMap(store.geoJSON) //Using the data saved on loadData
}