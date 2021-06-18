import React from 'react';
import * as d3 from 'd3';
import data from '../data.csv';

export class SyncMetricsChart extends React.Component {

    constructor(props) {
        super(props);
        this.state = { data: [], width: 0, height: 0, loading: true };
        this.chartRef = React.createRef();
        this.drawChart = this.drawChart.bind(this);
    }

    componentDidMount() {
        let width = this.getWidth();
        let height = this.getHeight();

        this.setState({ width: width, height: height });
        this.populateData();
    }

    getWidth() {
        return this.chartRef.current.clientWidth;
    }

    getHeight() {
        //return this.chartRef.current.clientHeight;
        return 400;
    }

    drawChart(data) {
        // set the dimensions used in the drawing
        let margin = {top: 15, right: 35, bottom: 25, left: 35},
            width = this.state.width - margin.left - margin.right,
            height = this.state.height - margin.top - margin.bottom;

        // slice the individual keys from the data
        let keys = data.columns.slice(1);

        // create a time parser to create a date object from the string
        let parseTime = d3.timeParse("%Y%m%d");
    
        // apply the date parser and update the date field to js date object
        data.forEach(function(d) {
            d.run = parseTime(d.run);
            return d;
        });

        // remap the data structure to work with the chart
        let metrics = keys.map((m) => {
            return {
                metric: m,
                values: data.map((d) => { return { date: d.run, value: +d[m]} })
            };
        });
    
        // get the instance of the chart and add size dimension to it
        let svg = d3.select(".chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // define the x axis scaler based on the date field
        let xScale = d3.scaleTime()
            .rangeRound([margin.left, width - margin.right])
            .domain(d3.extent(data, d => d.run))
    
        // define the y axis scaler
        let yScale = d3.scaleLinear()
            .rangeRound([height - margin.bottom, margin.top])
            .domain([
                d3.min(metrics, (d) => d3.min(d.values, (m) => m.value)),
                d3.max(metrics, (d) => d3.max(d.values, (m) => m.value))
            ]).nice();
    
        // define the ordinal which will pick the rbg color or the line
        let z = d3.scaleOrdinal(d3.schemeCategory10);
    
        // apply the x-axis to the svg
        svg.append("g")
            .attr("class","x-axis")
            .attr("transform", "translate(0," + (height - (margin.bottom)) + ")")
            .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%x")))
        .selectAll("text")
            .attr("y", 25)
            .attr("x", -35)
            .attr("dy", ".35em")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "start");

        // apply the y-axis to the svg
        svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", "translate(" + margin.left + ",0)")
            .transition()
			.duration(0)
			.call(d3.axisLeft(yScale).tickSize(-width + margin.right + margin.left));


        // define the line to be plotted    
        let line = d3.line()
            .x(d => xScale(d.date))
            .y(d => yScale(d.value));
    
        // draw the lines on the svg
        let metric = svg.selectAll(".metrics").data(metrics);
            metric.exit().remove();
    
            metric.enter().insert("g", ".focus").append("path")
                .attr("class", "line metrics")
                .style("stroke", d => z(d.metric))
                .style("stroke-linecap", "round")
                .merge(metric)
            .transition().duration(0)
                .attr("d", d => line(d.values));

    }

    render() {
        return (
            <div ref={this.chartRef} className="chart">
            </div>
        );
    }

    async populateData() { 
        d3.csv(data).then((d) => {
            this.setState({ data: d, loading: false}, () => {
                this.drawChart(d);
            });
        });

    }
}