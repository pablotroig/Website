d3.csv("iris.csv").then(function(data) {
    data.forEach(d => {
        d.PetalLength = +d.PetalLength;
    });


    const svg = d3.select("svg");
    const margin = {top: 20, right: 30, bottom: 40, left: 40};
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
        .domain(data.map(d => d.Species))
        .range([0, width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.PetalLength)])
        .range([height, 0]);

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(yScale));

    g.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height - 6)
        .text("Species");

    g.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", 6)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Petal Length");

    const rollupFunction = values => {
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const iqr = q3 - q1;
        return { q1, median, q3, iqr, lowerWhisker: q1 - 1.5 * iqr, upperWhisker: q3 + 1.5 * iqr };
    };

    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.Species);

    quartilesBySpecies.forEach((quartiles, species) => {
        const x = xScale(species);
        const boxWidth = xScale.bandwidth();

        const lowerWhisker = yScale(quartiles.lowerWhisker);
        const upperWhisker = yScale(quartiles.upperWhisker);
        const q1 = yScale(quartiles.q1);
        const q3 = yScale(quartiles.q3);
        const median = yScale(quartiles.median);

        g.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", lowerWhisker)
            .attr("y2", q1)
            .attr("stroke", "black");

        g.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", q3)
            .attr("y2", upperWhisker)
            .attr("stroke", "black");

        g.append("rect")
            .attr("x", x)
            .attr("y", q3)
            .attr("width", boxWidth)
            .attr("height", q1 - q3)
            .attr("fill", "lightgray");

        g.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", median)
            .attr("y2", median)
            .attr("stroke", "black");
    });
});
