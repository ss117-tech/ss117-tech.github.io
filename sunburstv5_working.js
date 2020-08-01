var width = 1024
var height = 768
var maxRadius = (Math.min(width, height) / 2) - 5

var formatNumber = d3.format(',d')

var x = d3.scaleLinear()
    .range([0, 2 * Math.PI])
    .clamp(true);

var y = d3.scaleSqrt()
    .range([maxRadius*.1, maxRadius]);

var color = d3.scaleOrdinal(d3.schemeCategory10);

var partition = d3.partition();

var arc = d3.arc()
    .startAngle(d => x(d.x0))
    .endAngle(d => x(d.x1))
    .innerRadius(d => Math.max(0, y(d.y0)))
    .outerRadius(d => Math.max(0, y(d.y1)));




var midLine = d => {
    var angles = [x(d.x0) - Math.PI/2, x(d.x1) - Math.PI/2];

    var middleAngle = (angles[1] + angles[0]) / 2;
    var invertDirection = middleAngle > 0 && middleAngle < Math.PI;
    if (invertDirection) { angles.reverse(); }

    var path = d3.path();
    path.arc(0, 0, Math.max(0, (y(d.y0) + y(d.y1)) / 2), angles[0], angles[1], invertDirection);
    return path.toString();
};

var putText = d => {

    return d.data.name.length * 6 < (Math.max(0, (y(d.y0) + y(d.y1)) / 2)* (x(d.x1) - x(d.x0)));
};

var svg = d3.select('body').append('svg')
    .style('width', '100vw')
    .style('height', '100vh')
    .attr('viewBox', `${-width / 2} ${-height / 2} ${width} ${height}`)
    .on('click', () => choose());

function choose(d = { x0: 0, x1: 1, y0: 0, y1: 1 }) {

        var tr = svg.transition()
            .duration(750)
            .tween('scale', () => {
                var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
                    yd = d3.interpolate(y.domain(), [d.y0, 1]);
                return t => { x.domain(xd(t)); y.domain(yd(t)); };
            });

        tr.selectAll('text').attrTween('display', d => () => (d.data.name.length * 6 < (Math.max(0, (y(d.y0) + y(d.y1)) / 2)* (x(d.x1) - x(d.x0)))) ? null : 'none');

        tr.selectAll('path.main-arc')
            .attrTween('d', d => () => arc(d));

        tr.selectAll('path.hidden-arc').attrTween('d', d => () => midLine(d));


    }

function showDetail(d) {
      d3.event.stopPropagation();
      choose(d);
    }

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

    fPie.append('text')
    .attr('display', d => (d.data.name.length * 6 < (Math.max(0, (y(d.y0) + y(d.y1)) / 2)* (x(d.x1) - x(d.x0)))) ? null : 'none')
    .text(d => d.data.name)
    .style('fill', 'none')
    .style('stroke', '#fff');



    /*fPie.append('path')
        .attr('class', 'hidden-arc')
        .attr('id', (_, i) => `hiddenArc${i}`)
        .attr('d', midLine);

    
    fPie.append('text')
        .attr('display', d => (d.data.name.length * 6 < (Math.max(0, (y(d.y0) + y(d.y1)) / 2)* (x(d.x1) - x(d.x0)))) ? null : 'none')
        .append('textPath')
        .attr('startOffset','50%')
        .attr('xlink:href', (_, i) => `#hiddenArc${i}` )
        .text(d => d.data.name)
        .style('fill', 'none')
        .style('stroke', '#fff')
        .style('stroke-width', 5)
        .style('stroke-linejoin', 'round');

    fPie.append('text')
        .attr('display', d => (d.data.name.length * 6 < (Math.max(0, (y(d.y0) + y(d.y1)) / 2)* (x(d.x1) - x(d.x0)))) ? null : 'none')
        .append('textPath')
        .attr('startOffset','50%')
        .attr('xlink:href', (_, i) => `#hiddenArc${i}` )
        .text(d => d.data.name);*/
});
