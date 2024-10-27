const irisData = d3.csv("iris.csv");

irisData.then(function(data) {
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    const width = 500, height = 400, margin = {top: 30, right: 30, bottom: 30, left: 30};
    const svgScatter = d3.select("#scatterplot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    const xScaleScatter = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalLength) - 0.5, d3.max(data, d => d.PetalLength) + 0.5])
        .range([0, width]);

    const yScaleScatter = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalWidth) - 0.5, d3.max(data, d => d.PetalWidth) + 0.5])
        .range([height, 0]);

    const colorScale = d3.scaleOrdinal()
        .domain(["Iris-setosa", "Iris-versicolor", "Iris-virginica"])
        .range(d3.schemeCategory10);

    svgScatter.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScaleScatter));

    svgScatter.append("g").call(d3.axisLeft(yScaleScatter));

    svgScatter.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => xScaleScatter(d.PetalLength))
        .attr("cy", d => yScaleScatter(d.PetalWidth))
        .attr("r", 5)
        .style("fill", d => colorScale(d.Species));

    svgScatter.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .style("text-anchor", "middle")
        .text("Petal Length");

    svgScatter.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left)
        .style("text-anchor", "middle")
        .text("Petal Width");

    const legend = svgScatter.selectAll(".legend")
        .data(colorScale.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

    legend.append("circle")
        .attr("cx", width - 10)
        .attr("r", 5)
        .style("fill", colorScale);

    legend.append("text")
        .attr("x", width - 20)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => d);
});

irisData.then(function(data) {
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
    });

    const width = 500, height = 400, margin = {top: 30, right: 30, bottom: 30, left: 40};
    const svgBoxplot = d3.select("#boxplot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    const xScaleBoxplot = d3.scaleBand()
        .domain(["Iris-setosa", "Iris-versicolor", "Iris-virginica"])
        .range([0, width])
        .padding(0.5);

    const yScaleBoxplot = d3.scaleLinear()
        .domain([d3.min(data, d => d.PetalLength) - 0.5, d3.max(data, d => d.PetalLength) + 0.5])
        .range([height, 0]);

    svgBoxplot.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScaleBoxplot));

    svgBoxplot.append("g").call(d3.axisLeft(yScaleBoxplot));

    svgBoxplot.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .style("text-anchor", "middle")
        .text("Species");

    svgBoxplot.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left)
        .style("text-anchor", "middle")
        .text("Petal Length");

    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.PetalLength).sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const iqr = q3 - q1;
        return {q1, median, q3, iqr};
    };

    // ### Part 2.2 Side-by-side boxplot (30 points)
    // Group data by species, calculating quartiles for each group
    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.Species);

    quartilesBySpecies.forEach((quartiles, species) => {
        // Define the x position and width for each box plot based on species
        const x = xScaleBoxplot(species);
        const boxWidth = xScaleBoxplot.bandwidth();

        svgBoxplot.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScaleBoxplot(quartiles.q1 - 1.5 * quartiles.iqr))
            .attr("y2", yScaleBoxplot(quartiles.q3 + 1.5 * quartiles.iqr))
            .attr("stroke", "black");

        svgBoxplot.append("rect")
            .attr("x", x)
            .attr("y", yScaleBoxplot(quartiles.q3))
            .attr("width", boxWidth)
            .attr("height", yScaleBoxplot(quartiles.q1) - yScaleBoxplot(quartiles.q3))
            .attr("fill", "lightblue")
            .attr("stroke", "black");

        svgBoxplot.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScaleBoxplot(quartiles.median))
            .attr("y2", yScaleBoxplot(quartiles.median))
            .attr("stroke", "black");
    });
});






