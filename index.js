const App = () => {
    const [monthlyTemp, setMonthlyTemp] = React.useState([]);
    const [baseTemp, setBaseTemp] = React.useState([]);
    React.useEffect(() => {
      async function fetchData() {
        const response = await fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json');
        const data = await response.json();
        setMonthlyTemp(data.monthlyVariance);
        setBaseTemp(data.baseTemperature);
      }
      fetchData();
    }, []);
    return (
      <div>
        <RenderHeatMap data={monthlyTemp} baseTemperature={baseTemp} width={1200} height={600} />
      </div>
    )
    
  }
  
const RenderHeatMap = ({ data, baseTemperature, width, height }) => {
    React.useEffect(() => {
        createHeatMap();
    }, [data]);

    const createHeatMap = () => {
        const margin = { top: 50, right: 50, bottom: 50, left: 100 };
        
        const svg = d3.select('svg')
            .attr('width', width)
            .attr('height', height)
        const xScale = d3.scaleLinear()
            .domain([d3.min(data, (d) => d.year), d3.max(data, (d) => d.year) + 1])
            .range([margin.left, width - margin.right]);
        const xAxis = d3.axisBottom(xScale)
            .tickFormat(d3.format('d'))
        const yScale = d3.scaleTime()
            .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
            .range([margin.bottom, height - margin.top])
        const yAxis = d3.axisLeft(yScale)
            .tickFormat(d3.timeFormat('%B'))
        svg.append('g')
            .attr('transform', 'translate(0, ' + (height - margin.top) +')')
            .attr('id', 'x-axis')
            .call(xAxis)

        svg.append('g')
            .attr('transform', 'translate(' + margin.left + ', 0 )')
            .attr('id', 'y-axis')
            .call(yAxis)

        let tooltip = d3.select('#tooltip')
            .style('opacity', '0');
        
        svg.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'cell')
            .attr('fill', (d) => {
                if(d.variance <= -1) {
                    return '#1E90FF';
                } else if(d.variance <= 0) {
                    return '#87CEFA';
                } else if(d.variance <= 1) {
                    return '#FFA500';
                } else {
                    return '#DC143C';
                }
            })
            .attr('data-year', (d) => d.year)
            .attr('data-month', (d) => d.month - 1)
            .attr('data-temp', (d) => d.variance + baseTemperature)
            .attr('height', (height - margin.bottom - margin.top) / 12)
            .attr('y', (d) => yScale(new Date(0, d.month - 1, 0, 0, 0, 0, 0)))
            .attr('width', (d) => ((width - margin.left - margin.right) / (d3.max(data, (year) => year.year) - (d3.min(data, (year) => year.year)))))
            .attr('x', (d) => xScale(d.year))
            .on('mouseover', (event, d) => {
                const formatDecimal = d3.format('.1f');
                const rect = d3.select(event.target);
                const year = rect.attr('data-year');
                const month = rect.attr('data-month');
                const temp = rect.attr('data-temp');
                tooltip.transition().style('opacity', '1');
                tooltip.style('left', event.pageX + 10 + 'px')
                        .style('top', event.pageY - 28 + 'px');
                tooltip.html(year + ' - ' + d3.timeFormat('%B')(new Date(0, month, 0, 0, 0, 0, 0)) + '<br/>' + formatDecimal(temp) + '℃' + '<br/>' + d.variance + '℃')
                        .attr('data-year', year);
            })
            .on('mouseout', () => {
                tooltip.transition().style('opacity', '0');
            });
        svg.attr('id', 'legend')
            .selectAll('rect')
            .data([-1, 0, 1, 2])
            .enter()
            .append('rect')
            .attr('fill', (d) => {
                if (d <= -1) {
                  return '#1E90FF';
                } else if (d <= 0) {
                  return '#87CEFA';
                } else if (d <= 1) {
                  return '#FFA500';
                } else {
                  return '#DC143C';
                }
              })
            .attr('height', 20)
            .attr('width', 20)
            .attr('x', (d, i) => width - margin.right - 100 + (i * 20))
            .attr('y', 0)

        svg.append('g')
            .selectAll('text')
            .data([-1, 0, 1, 2])
            .enter()
            .append('text')
            .text((d) => d)
            .attr('x', (d, i) => width - margin.right - 100 + (i * 20) + 10)
            .attr('y', 32)
            .attr('fill', 'black')
            .attr('font-size', '12px')
            .attr('text-anchor', 'middle');

    }

    return (
        <div id="container">
            <h2 id="title">Monthly Global Land-Surface Temperature</h2>
            <h3 id="description">{data[0] ? data[0].year : ''} - {data[0] ? data[data.length - 1].year : ''}</h3>
            <div id="tooltip"></div>
            <svg width={width} height={height}/>
        </div>
    )
}
    
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
    