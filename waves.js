
const drawSun = (svg, svgHeight, svgWidth) => {

    const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "textureGradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");

    // Add gradient stops
    gradient.append("stop")
        .attr("offset", "0%")
        .style("stop-color", "yellow");

    gradient.append("stop")
        .attr("offset", "100%")
        .style("stop-color", "orange");

    // Create a pattern with the gradient
    const pattern = svg.append("defs")
        .append("pattern")
        .attr("id", "texturedPattern")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("rect")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .attr("fill", "url(#textureGradient)");

    // Create filter for texture noise
    const filter = svg.append("defs")
        .append("filter")
        .attr("id", "textureNoiseFilter");

    filter.append("feTurbulence")
        .attr("type", "fractalNoise")
        .attr("baseFrequency", "19.5")
        .attr("numOctaves", "10")
        .attr("result", "turbulence");
    filter.append("feComposite")
        .attr("operator", "in")
        .attr("in", "turbulence")
        .attr("in2", "SourceAlpha")
        .attr("result", "composite");
    filter.append("feColorMatrix")
        .attr("in", "composite")
        .attr("type", "luminanceToAlpha");
    filter.append("feBlend")
        .attr("in", "SourceGraphic")
        .attr("in2", "composite")
        .attr("mode", "color-burn");

    // Apply the filter to the textured pattern
    pattern.attr("filter", "url(#textureNoiseFilter)");

    // Draw the sun (circle)
    const sunRadius = 120;

    // Draw tapered sun rays as rectangles
    const numRays = 44;
    const rayBaseWidth = 40; // Base width of the rays
    const rayTopWidth = 4;   // Top width of the rays
    const rayLength = 1900;    // Length of the rays

    let rayg = svg.append("g")
        // .attr('y', '30%')
        .attr('transform',`translate(${svgWidth*0.15}, -100) scale(1)`);


    rayg.append("circle")
        .attr('cx', '50%')
        .attr('cy', '50%')
        // .attr('transform',`translate(${svgWidth*0.35}, -${svgHeight*0.3})`)
        .attr('transform',`translate(0,-100)`)
        // .attr("cx", svgWidth / 2)
        // .attr("cy", svgHeight / 2 -100)
        .attr("r", sunRadius)
        // .attr("fill", "url(#texturedPattern)");
        .attr("fill", "url(#textureGradient)");

    function getTaperedRectanglePoints(x, y, baseWidth, topWidth, height, rotation) {
        const multiplier = 2; //1+ Math.random()*1.5;
        const halfBase = baseWidth / 2 * (multiplier);
        const halfTop = topWidth / 2 * (multiplier);

        const points = [
            [x - halfBase, y - height / 2],   // Bottom-left
            [x + halfBase, y - height / 2],   // Bottom-right
            [x + halfTop, y],    // Top-right
            [x - halfTop, y]     // Top-left
        ];

        // Rotate the points around the center
        const radians = (rotation * Math.PI) / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);

        return points.map(point => {
            const xRot = cos * (point[0] - x) - sin * (point[1] - y) + x;
            const yRot = sin * (point[0] - x) + cos * (point[1] - y) + y;
            return [xRot, yRot];
        });
    }

    for (let i = 0; i < numRays; i++) {
        const angle = (i / numRays) * 2 * Math.PI;

        const x = svgWidth / 2 + sunRadius * Math.cos(angle);
        const y = svgHeight / 2 + sunRadius * Math.sin(angle) - 100;

        const rotation = (i / numRays) * 360 + 90; // Adjust the rotation of the rays

        rayg.append("polygon")
            // .attr('fy', '30%')
            // .attr("class", "ray")
            .attr("points", getTaperedRectanglePoints(x, y, rayBaseWidth, rayTopWidth, rayLength, rotation))
            .attr("fill", "url(#textureGradient)")
        ;
            // .attr("fill", "url(#texturedPattern)");
    }
}
var color = d3.scaleSequential(d3.interpolateBlues),
    waves, x, y, r, data, boat;
var initTimer = d3.timer(animate);
draw();
addEventListener("resize", (event) => {
    initTimer.stop();
    initTimer = d3.timer(animate);
    draw();
});

function draw(type, r) {
    const svgWidth = window.innerWidth;
    const svgHeight = window.innerHeight
    var div = d3.select( '#waves' ),
        width = svgWidth,
        height = svgHeight
    x = d3.scaleLinear().range([0, width]);
    y = d3.scaleLinear().range([height, 0]);

    data = [0.8, 0.7, 0.6, 0.4, 0.2, 0.1, 0.05].map(function (d, i) {
            var w = wave()
                .radius((0.02*(i+1)*width/1.5)*Math.random()+i)
                .waveLength(0.09*(Math.random()+1)*(i+1))
                .y(d);
            w.area.x(function (dd) {
                return x(dd.x) + dd.dx;
            }).y1(function (dd) {
                return y(dd.y) - dd.dy;
            }).y0(function () {
                return y(0);
            });
            return w;
        });

    div.select('.paper').remove();

    var paper = div
        .append('svg')
        .classed('paper', true)
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', '0 0 ' + width + ' ' + height)
        .style('stroke-width', 0.5);

    behindSun(paper)
        .append('circle')
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr("r", Math.max(width, height))
        .style('fill', 'url(#sun)')

    drawSun(paper, svgHeight, svgWidth);

    waves = paper
        .append('g')
        .classed('waves', true)
        .selectAll('path')
        .data(data)
        .enter()
        .append('path')
        .style('stroke', 'none')
        .each(function (d) {
            d3.select(this).attr('d', d.context(null)).style('fill', color(d.y()));
            // d3.select(this).attr('d', d.context(null));
        });

    boat = paper.append('text')
        .text("⛵")
        .style('text-anchor', 'middle')
        .style('alignment-baseline', 'middle')
        .style("font-size", "60px");
    moveBoat();
    // var dataURL = svg.node().toDataURL();
    // const bgElement = d3.selectAll( '.bg' )
    // bgElement.style( 'background-image', 'url(' + dataURL + ')' );
}

function animate () {
    waves.each(function (d) {
        d3.select(this)
            .attr('d', d.tick());
    });
    moveBoat();
}

function moveBoat() {
    var d = data[1].point(20);
    boat.attr("transform", "translate(" + (x(d.x) + d.dx) + ", " + (y(d.y) - d.dy) + ")");
}

function behindSun (paper) {
    paper
        .append('defs')
        .append('radialGradient')
        .attr('id', 'sun')
        .attr('cx', '70%')
        .attr('cy', '30%')
        .attr('fx', '70%')
        .attr('fy', '30%')
        .selectAll('stop')
        .data([
            {color: "#FFF170FF", offset: '20%'},
            {color: '#70FFD9FF', offset: '50%'}
        ])
        .enter()
        .append('stop')
        .attr('offset', function (d) {
            return d.offset;
        })
        .attr('stop-color', function (d) {
            return d.color;
        });
    return paper;
}

function wave() {
    var radius = 0.1,       // intensity of wave
        waveLength = 1,     // wave length
        y = 0,
        area = d3.area().curve(d3.curveNatural),
        extent = [0, 1],
        pi = Math.PI,
        cos = Math.cos,
        sin = Math.sin,
        N = 8,
        speed = 0.025*((Math.random()+0.2)),
        time = 0;

    function wave (d) {
        return area(wave.points(d));
    }

    wave.area = area;

    wave.tick = function () {
        time += 1;
        return wave;
    };

    wave.context = function (_) {
        if (!arguments.length) return area.context();
        area.context(_);
        return wave;
    };

    wave.extent = function (_) {
        if (!arguments.length) return extent;
        extent = _;
        return wave;
    };

    wave.N = function (_) {
        if (!arguments.length) return N;
        N = +_;
        return wave;
    };

    wave.waveLength = function (_) {
        if (!arguments.length) return waveLength;
        waveLength = _;
        return wave;
    };

    wave.y = function (_) {
        if (!arguments.length) return y;
        y = _;
        return wave;
    };

    wave.radius = function (_) {
        if (!arguments.length) return radius;
        radius = _;
        return wave;
    };

    wave.speed = function (_) {
        if (!arguments.length) return speed;
        speed = _;
        return wave;
    };

    wave.points = function () {
        var w = extent[1] - extent[0] + 2*waveLength,
            dx = waveLength/N,
            Nx = Math.round(w/dx) + 1;

        return d3.range(Nx).map(point);
    };

    wave.point = point;

    function point (i) {
        var da = 2*pi/N,
            dx = waveLength/N,
            x0 = extent[0] - waveLength,
            a = i*da - time*speed*pi;

        return {
            x: x0 + i * dx,
            y: y,
            angle: a,
            radius: radius*(Math.random()/2),
            dx: radius * cos(a),
            dy: radius * sin(a)
        };
    }

    return wave;
}
