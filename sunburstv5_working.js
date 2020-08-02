function sunburstCreation()   {

var width = 600
var height = 600
var maxRadius = (Math.min(width, height) / 2) - 5

var formatNumber = d3.format(',d')

var xScale = d3.scaleLinear()
    .range([0, 2 * Math.PI])
    .clamp(true);

var yScale = d3.scaleSqrt()
    .range([maxRadius*.1, maxRadius]);

var color = d3.scaleOrdinal(d3.schemeCategory10);

var partition = d3.partition();

var arc = d3.arc()
    .startAngle(d => xScale(d.x0))
    .endAngle(d => xScale(d.x1))
    .innerRadius(d => Math.max(0, yScale(d.y0)))
    .outerRadius(d => Math.max(0, yScale(d.y1)));


var mid = d => {
    var path = d3.path();
    if  ((xScale(d.x0) + xScale(d.x1) - Math.PI )/ 2 > 0 &&  (xScale(d.x0) + xScale(d.x1) - Math.PI)/ 2 < Math.PI){
        path.arc(0, 0, Math.max(0, (yScale(d.y0) + yScale(d.y1)) / 2), xScale(d.x1) - Math.PI/2, xScale(d.x0) - Math.PI/2, true);
    }
    else{
        path.arc(0, 0, Math.max(0, (yScale(d.y0) + yScale(d.y1)) / 2), xScale(d.x0) - Math.PI/2, xScale(d.x1) - Math.PI/2, false);
    }
    return path.toString();
};


var svg = d3.select('body').append('svg')
    .style('width', '100vw')
    .style('height', '100vh')
    .attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`)
    .on('click', () => choose());


svg.append("g").append("rect").attr("x", 10)
                                                .attr("y", 10)
                                               .attr("width", 600)
                                               .attr("height",30)
                                               .style("fill", "red")
                                               .attr("transform",
                                                function(d){ return "translate(300,100)";});;

function choose(d = { x0: 0, x1: 1, y0: 0, y1: 1 }) {

        var tr = svg.transition()
            .duration(750)
            .tween('scale', () => {
                var x = d3.interpolate(xScale.domain(), [d.x0, d.x1]);
                var y = d3.interpolate(yScale.domain(), [d.y0, 1]);
                return t => { xScale.domain(x(t)); yScale.domain(y(t)); };
            });

        tr.selectAll('text').attrTween('display', d => () => d.data.name)
        //(d.data.name.length * 6 < (Math.max(0, (y(d.y0) + y(d.y1)) / 2)* (x(d.x1) - x(d.x0)))) ? null : 'none');

        tr.selectAll('path.main-arc').attrTween('d', d => () => arc(d));

        tr.selectAll('path.hidden-arc').attrTween('d', d => () => mid(d));
    }

function showDetail(d) {
      d3.event.stopPropagation();
      choose(d);
    }



        root = d3.hierarchy(d);
        root.sum(d => d.size);

        var pie = svg.selectAll('g.slice')
            .data(partition(root).descendants());

        pie.exit().remove();

        var fPie = pie.enter()
            .append('g').attr('class', 'slice')
            .on('click', showDetail);

        fPie.append('title').text(d => d.data.name + '\n' + formatNumber(d.value));

        fPie.append('path')
            .attr('class', 'main-arc')
            .style('fill', d => color((d.children ? d : d.parent).data.name))
            .attr('d', arc);

        fPie.append('path')
                .attr('class', 'hidden-arc')
                .attr('id', (_, i) => `hiddenArc${i}`)
                .attr('d', mid);

        fPie.append('text')
                .append('textPath')
                .attr('startOffset','50%')
                .attr('xlink:href', (_, i) => `#hiddenArc${i}` )
                .text(d => d.data.name)
                .style('fill', 'none')
                .style('stroke', '#FFFFFF');
    }


var mySunburstCreation = sunburstCreation();

function display(data) {

      mySunburstCreation('#sunb', data);
    }




// load data
d3.json
('tst_json_latest_cleaned_2.json').then(display);

/*
d3.json
('tst_json_latest_cleaned_2.json')
.then(function(root)
{
    root = d3.hierarchy(root);
    root.sum(d => d.size);

    var pie = svg.selectAll('g.slice')
        .data(partition(root).descendants());

    pie.exit().remove();

    var fPie = pie.enter()
        .append('g').attr('class', 'slice')
        .on('click', showDetail);

    fPie.append('title').text(d => d.data.name + '\n' + formatNumber(d.value));

    fPie.append('path')
        .attr('class', 'main-arc')
        .style('fill', d => color((d.children ? d : d.parent).data.name))
        .attr('d', arc);

    fPie.append('path')
            .attr('class', 'hidden-arc')
            .attr('id', (_, i) => `hiddenArc${i}`)
            .attr('d', mid);

    fPie.append('text')
            .append('textPath')
            .attr('startOffset','50%')
            .attr('xlink:href', (_, i) => `#hiddenArc${i}` )
            .text(d => d.data.name)
            .style('fill', 'none')
            .style('stroke', '#FFFFFF');
});
*/
