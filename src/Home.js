import { useState } from "react";
import useFetch from "./useFetch";
import { Chart } from "react-google-charts";

// var today = moment().format("YYYY-MM-DD");
// var start = (moment().unix()-2419200);
var today = new Date().toISOString().slice(0, 10);
var start = new Date();
start.setMonth(start.getMonth() - 1);
start = start.toISOString().slice(0, 10);

export const options = {
    title: "Company Performance",
    curveType: "function",
    legend: { position: "bottom" },
};

const Home = () => {
    var api_key = "95cfa265578db4353a576698a3cd6fe2";
    const [ticker, setTicker] = useState('');
    const [risk, setRisk] = useState('Low Risk');
    const [name, setName] = useState('hello');
    const [price, setPrice] = useState('$');
    const [exchange, setExchange] = useState('NYSE?');
    const [percentageC, setPercentageC] = useState('+%');
    const [percentageCClass, setPercentageCClass] = useState('increasingperc');
    const historicalData = [];
    // const newArr = new Array(2);
    // const {data: price, error1, isPending1} = useFetch("https://financialmodelingprep.com/api/v3/quote-short/"+ticker+"?apikey="+api_key);
    const {data: info, error1, isPending1} = useFetch("https://financialmodelingprep.com/api/v3/quote/"+ticker+"?apikey="+api_key);
    const {data: historical, error2, isPending2} = useFetch("https://financialmodelingprep.com/api/v3/historical-price-full/"+ticker+"?from="+start+"&to="+today+"&apikey="+api_key);

    const handleSubmit = (e) => {
        if (isPending1|| isPending2 || ticker == "") {
            return;
        }

        e.preventDefault();

        console.log("Submitted")

        console.log(Object.keys(historical))
        console.log(historical.historical[0])

        historicalData.push(["Time", "Price"]);

        for (let i=0;i<31;i++) {
            let newArr = [];
            newArr[0] = historical.historical[0].date;
            newArr[1] = historical.historical[0].close;
            historicalData.push(newArr);
        }

        console.log(historicalData);

        setName(info.at(0).name)
        setPrice("$"+info.at(0).price)
        setExchange(info.at(0).exchange)
        setPercentageC((info.at(0).changesPercentage>0) ? "+" : "" + info.at(0).changesPercentage+"%")
        if (info.at(0).changesPercentage<0) {
            setPercentageCClass('decreasingperc');
        }
    }

    return ( 
        <div className="home">
            <div className="centerbox">
                <div className="searchbox">
                    <div className="displaypart">
                        <form onSubmit={handleSubmit}>
                            <input 
                                type="text"
                                required
                                value={ticker}
                                onChange={(e) => setTicker(e.target.value)}
                                placeholder="Enter Ticker"
                                className="tickersearch"
                                autoComplete="off"
                            />
                        </form>
                        <br/>
                        <h2 className="companyinfo">{name}</h2>
                        <p className="companyinfo">{exchange}</p>
                        <br/>
                        <table>
                            <tr>
                                <td><h3 className="companyinfoprice">{price}</h3></td>
                                <td><p className={percentageCClass}>{percentageC}</p></td>
                            </tr>
                        </table>
                        <br/>
                        <Chart
                            chartType="LineChart"
                            width="100%"
                            height="400px"
                            data={historicalData}
                            options={options}
                        />
                    </div>
                </div>
                <div className="infobox">
                    <br/>
                    <h1 className="analysisheading">Analysis</h1>
                    <br/>
                    <table>
                            <tr>
                                <td>
                                    <div className="spacing"></div>
                                </td>
                                <td>
                                    <div className="infoboxseperator">
                                        <form>
                                            <label>Risk Level</label>
                                            <select
                                                value={risk}
                                                className="settingsbox"
                                                onChange={(e) => setRisk(e.target.value)}>
                                                <option value="Low Risk" className="options">Low Risk</option>
                                                <option value="Medium Risk" className="options">Medium Risk</option>
                                                <option value="High Risk" className="options">High Risk</option>
                                            </select>
                                            <br/>
                                            <label>Debt Financing %</label>
                                        </form>
                                    </div>
                                </td>
                                <td><div className="infoboxseperator"><p>Analysis Result</p></div></td>
                            </tr>
                        </table>
                </div>
            </div>
        </div>
     );
}
 
export default Home;