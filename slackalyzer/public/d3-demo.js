// Generate a Bates distribution of 10 random variables.
// var values = d3.range(1000).map(d3.random.bates(2))
//               .sort();


var startTime = new Date('8/1/2014').valueOf(),
    endTime = new Date('11/1/2015').valueOf();
// var timeScale = //d3.scale.linear()
//                 d3.time.scale()
//                 .domain([values[0],values[values.length-1]])
//                 .range([startTime,endTime]);
// var times = values.map(timeScale);

var times = timestamps.map(function(str){return str * 1000})
              .filter(function(time){
                return time>=startTime;
              });

var margin = {top: 10, right: 10, bottom: 50, left: 30},
    width = 960 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

var x = //d3.scale.linear()
    d3.time.scale()
    .domain([startTime,endTime])
    //.domain([0, 1])
    .range([0, width]);

//Generate a histogram using twenty uniformly-spaced bins.
var data = d3.layout.histogram()
    .bins(x.ticks(d3.time.days))
    //.bins(x.ticks(1000))
    (times);
    //(values);

/* Stacking hackery...
var allTimes = [times,times];

var data = d3.layout.stack()
      (allTimes)
*/

var y = d3.scale.linear()
    .domain([0, d3.max(data, function(d) { return d.y; })])
    .range([height, 0]);

var formatDate = d3.time.format("%m/%d/%y");
// function formatDate(unix) {
//   //console.log(unix.constructor);
//   //var d = new Date(unix);
//   return unix.toLocaleDateString();
// }

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(4);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    //.ticks(d3.time.months)
    .ticks(d3.time.weeks)
    .tickFormat(formatDate)
    //.tickSize(1)
    //.tickPadding(4);

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
   .append("g")
     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var bar = svg.selectAll(".bar")
    .data(data)
  .enter().append("g")
    .attr("class", "bar")
    .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

bar.append("rect")
    .attr("x", 1)
    .attr("width", //Math.max(x(data[0].dx) - 1,1)
          4
          //timeScale((data[0].dx))
        )
    .attr("height", function(d) { return height - y(d.y); });


// A formatter for counts.
//var formatCount = d3.format(",.0f");

// bar.append("text")
//     .attr("dy", ".75em")
//     .attr("y", 6)
//     .attr("x", x(data[0].dx) / 2)
//     .attr("text-anchor", "middle")
//     .text(function(d) { return formatCount(d.y); });

svg.append("g")
    .attr("class","y axis")
    .call(yAxis);

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", function(d) {
            return "rotate(-40)"
          })
