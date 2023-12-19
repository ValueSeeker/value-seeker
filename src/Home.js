import { useState } from "react";
import useFetch from "./useFetch";
import { Line } from "react-chartjs-2";
import {Chart as ChartJS} from 'chart.js/auto'
import formatNumber from "./Utils";


// var today = moment().format("YYYY-MM-DD");
// var start = (moment().unix()-2419200);
var today = new Date().toISOString().slice(0, 10);
var start = new Date();
start.setMonth(start.getMonth() - 1);
start = start.toISOString().slice(0, 10);

const avgRateOfTax = 0.21;

const costOfEquityDict = {
    "Low Risk":0.07,
    "Medium Risk":0.09,
    "High Risk":0.12
};
const costOfDebtDict = {
    "Low Risk":0.05,
    "Medium Risk":0.07,
    "High Risk":0.09
};


const options = {
    title: "Company Performance",
    curveType: "function",
    legend: { position: "bottom" },
};

const Home = () => {
    var api_key = "95cfa265578db4353a576698a3cd6fe2";
    // const [tempTicker, setTempTicker] = useState('');
    const [ticker, setTicker] = useState('');
    const [risk, setRisk] = useState('Low Risk');
    const [debtFin, setDebtFin] = useState(0.3);
    const [equityFin, setEquityFin] = useState(0.7);
    const [growthRet, setGrowthRet] = useState(1);
    const [earnRet, setEarnRet] = useState(0);
    const [name, setName] = useState('[Symbole]');
    const [price, setPrice] = useState('');
    const [exchange, setExchange] = useState('');
    const [percentageC, setPercentageC] = useState('');
    const [percentageCClass, setPercentageCClass] = useState('increasingperc');
    const [EPV, setEPV] = useState('');
    const [EP, setEP] = useState('');
    const [costOfEquity, setCostOfEquity] = useState('');
    const [costOfDebt, setCostOfDebt] = useState('');
    const [chartData, setChartData] = useState({})
    const [epvValue, setEpvValue] = useState(0);
    const [marketCap, setMarketCap] = useState(0);
    const [showInfo, setShowInfo] = useState(1);

    // const newArr = new Array(2);
    // const {data: price, error1, isPending1} = useFetch("https://financialmodelingprep.com/api/v3/quote-short/"+ticker+"?apikey="+api_key);
    const {data: info, error1, isPending1} = useFetch("https://financialmodelingprep.com/api/v3/quote/"+ticker+"?apikey="+api_key);
    const {data: historical, error2, isPending2} = useFetch("https://financialmodelingprep.com/api/v3/historical-price-full/"+ticker+"?from="+start+"&to="+today+"&apikey="+api_key);
    const {data: incomeStatement, error3, isPending3} = useFetch("https://financialmodelingprep.com/api/v3/income-statement/"+ticker+"?limit=5&apikey="+api_key);
    const {data: cashFlow, error4, isPending4} = useFetch("https://financialmodelingprep.com/api/v3/cash-flow-statement/"+ticker+"?limit=5&apikey="+api_key);
    const {data: balanceSheet, error5, isPending5} = useFetch("https://financialmodelingprep.com/api/v3/balance-sheet-statement/"+ticker+"?limit=5&apikey="+api_key);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isPending1|| isPending2 || ticker === "") {
            return;
        }

        console.log("Submitted")
        
        var retEarn = ((balanceSheet[0]["retainedEarnings"] - balanceSheet[1]["retainedEarnings"])/incomeStatement[0]["netIncome"]); // As a percentage
        setEarnRet(retEarn);

        if (Object.keys(info).length === 0) {
            setName("[Symbole Invalide]");
            setPrice("");
            setExchange("");
            setPercentageC("")
            return;
        }

        setName(info.at(0).name)
        setPrice("$"+info.at(0).price)
        setExchange(info.at(0).exchange)
        setPercentageC((info.at(0).changesPercentage>0) ? "+" : "" + info.at(0).changesPercentage+"%")
        if (info.at(0).changesPercentage<0) {
            setPercentageCClass('decreasingperc');
        }

        var yearsCount = 0;
        var avgRevenue = 0;
        var avgOperatingMargin = 0;

        for (let i=0;i<Object.keys(incomeStatement).length;i++) {
            yearsCount+=1;
            avgOperatingMargin += incomeStatement[i]["netIncome"] / incomeStatement[i]["revenue"];
            avgRevenue += incomeStatement[i]["revenue"];
        }

        avgRevenue/=yearsCount
        avgOperatingMargin/=yearsCount

        var estimatedEBIT = avgRevenue*avgOperatingMargin;
        // estimatedEBIT *= (1-avgRateOfTax); Don't take tax cuz its not EBIT anymore!
        var estimatedEBITDA = cashFlow[0]["depreciationAndAmortization"] + estimatedEBIT;
        estimatedEBITDA*=(1-(earnRet*growthRet));

        // console.log(costOfDebt[risk])
        var EPV = estimatedEBITDA / (costOfDebtDict[risk]*debtFin+costOfEquityDict[risk]*(1-debtFin));
        setEPV("$"+formatNumber(EPV));
        setEP("$"+formatNumber(estimatedEBITDA));
        setCostOfEquity(costOfEquityDict[risk]);
        setCostOfDebt(costOfDebtDict[risk]);
        setEquityFin(1-debtFin);

        setEpvValue(EPV)
        setMarketCap(info.at(0)['marketCap'])

        setChartData({
            labels: historical.historical.toReversed().map((data) => data.date),
            datasets: [
                {
                    label: "Price", 
                    data: historical.historical.toReversed().map((data) => data.close),
                }
            ],
            borderColor: percentageC.includes("+") ? "#61b0b7" : "#16558f",
            borderWidth: 2,
        })

        console.log(chartData)
    }

    function infoClick(e) {
        console.log("Clicked");
        setShowInfo(!showInfo);
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
                                placeholder="Symbole"
                                className="tickersearch"
                            />
                            <button className="searchbutton" >
                                <img className="searchimage" src={require('./search_blue.png')}></img>
                            </button>
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
                        <div className="chartBox">
                            {!chartData['labels'] ? <div/> : <Line className = "center" data={chartData} options={{
                                plugins: {
                                    legend: {
                                        display: false,
                                        labels: {

                                        }
                                    },
                                    tooltip: {
                                        enabled: false,
                                    }
                                },
                                scales: {
                                    x: {
                                        display: true,

                                    },
                                    y: {
                                        display: true
                                    }
                                },
                                elements: {
                                    point:{
                                        radius: 0
                                    }
                                },
                                // responsive: true,
                                // maintainAspectRatio: false,
                            }}></Line>}
                        </div>
                        
                    </div>
                </div>

                {
                    showInfo ? <div className="infobox">
                    <br/>
                    <div className="analysisheadingdiv">
                        <h1 className="analysisheading">Analyse</h1>
                    </div>
                    <br/>
                    <table>
                            <tr>
                                <td>
                                    <div className="spacing"></div>
                                </td>
                                <td>
                                    <div className="infoboxseperatorfirst">
                                        <form>
                                            <p className="settingslabel">Niveau de risque</p> 
                                            <select
                                                value={risk}
                                                className="settingsbox"
                                                onChange={(e) => setRisk(e.target.value)}>
                                                <option value="Low Risk" className="options">Faible risque</option>
                                                <option value="Medium Risk" className="options">Moyen risque</option>
                                                <option value="High Risk" className="options">Haute risque</option>
                                            </select>
                                            <br/>
                                            <br/>
                                            <p className="settingslabel">Financement dettes %
                                                <span className="tooltiptext">
                                                    % des capitaux provenant de dettes. L'autre % des capitaux proviennent de la vente d'actions. 
                                                    <br/><br/>Voir COE et COD.
                                                </span>
                                            </p>
                                            <input 
                                                type="text" 
                                                className="settingsbox" 
                                                required
                                                value={debtFin}
                                                onChange={(e) => setDebtFin(e.target.value)}
                                                autoComplete="off"
                                            />
                                            <br/>
                                            <br/>
                                            <p className="settingslabel">Croissance (%)
                                                <span className="tooltiptext">
                                                    % du revenu retenu (pas distribué aux actionnaires) réinvesti pour croisser l'entreprise.
                                                    <br/><br/>Il est normal pour une entreprise de réinvestir 100%
                                                </span>
                                            </p>
                                            <input 
                                                type="text" 
                                                className="settingsbox" 
                                                required
                                                value={growthRet}
                                                onChange={(e) => setGrowthRet(e.target.value)}
                                                autoComplete="off"
                                            />
                                        </form>
                                    </div>
                                </td>
                                <td><div className="infoboxseperatorlast">
                                    <p><span className="resultvalues">EPV: 
                                        <span className="tooltiptext">
                                            Capacité d'une entreprise à générer du revenu. 
                                        </span>
                                    </span>{EPV}</p>
                                    <br/>
                                    <p><span className="resultvalues">EP: 
                                    <span className="tooltiptext">
                                            Estimation des revenus avant intérêts, taxes, dépréciation et amortissement. 
                                        </span>
                                    </span>{EP}</p>
                                    <br/>
                                    <p><span className="resultvalues">COE: 
                                        <span className="tooltiptext">
                                            Taux d'intérêt lors de la vente d'actions pour amasser des fonds.
                                        </span>
                                    </span>{costOfEquity}</p>
                                    <br/>
                                    <p><span className="resultvalues">COD: 
                                        <span className="tooltiptext">
                                            Taux d'intérêt pour emprunter des capitaux (Prédéterminée).
                                        </span>
                                    </span>{costOfDebt}</p>
                                    <br/>
                                </div></td>
                            </tr>
                        </table>
                    <br/>

                    {
                        marketCap !== 0 && <div>
                            <p className="finalresults"><span className="epvvalue">{EPV}</span> = 
                                <div className="frac">
                                    <span>{EP}</span>
                                    <span class="symbol">/</span>
                                    <span class="bottom">({debtFin}×{costOfDebt})+({equityFin}×{costOfEquity})</span>
                                </div>
                            </p>
                            <br/>
                            <h2 className="analysisheading">Valuation</h2>
                            <br />
                            <div style={{width: (epvValue > marketCap) ? 275 : (epvValue/marketCap)*275,height:30,backgroundColor:"#0583d2",marginLeft:25,borderRadius:5, float:"left"}}>
                                <p className="barstext">EPV</p>
                            </div>
                            <p className="rightbartext">{EPV}</p>
                            <br></br>
                            <div style={{width: (epvValue < marketCap) ? 275 : (marketCap/epvValue)*275,height:30,backgroundColor:"#16558f",marginLeft:25,borderRadius:5, float:"left"}}>
                                <p className="barstext">Capitalisation Boursière</p>
                            </div>
                            <p className="rightbartext">{"$"+formatNumber(marketCap)}</p>
                            <br/>
                            {/* <br/> */}
                            <p style={{"fontWeight":600,}}>Conclusion: <span className="resultvalues">{(epvValue > marketCap) ? "Sous-évaluée" : "Sur-évaluée"}</span></p>
                        </div>
                    }

                    

                    <div className="infobuttondiv"> <button className="infobutton" onClick={infoClick}><i class="fa fa-info"></i></button> </div>                   
                
                </div> : <div className="infobox">
                    <div className="closebuttondiv">
                        <button className="closebutton" onClick={infoClick}><p>X</p></button>
                    </div>
                    <br/>
                    <div className="analysisheadingdiv">
                        <h1 className="analysisheading">Explication</h1>
                    </div>

                    <p className="explanationparagraph" align="left">
                        L'investissement de valeur consiste à acheter une entreprise à un prix inférieur à celui indiqué.
                        <br/><br/>
                        Pour calculer la valeur d'une entreprise (EPV), il faut appliquer les étapes suivantes:
                        <br/>
                        <p align="center">
                            EPV = <div className="frac">
                                <span>EP</span>
                                <span class="symbol">/</span>
                                <span class="bottom">R</span>
                            </div>
                        </p>
                        <br/><br/>
                        Où... <br/>
                        <ul>
                            <li><b>R</b> est le coût constant futur du capital en %, une moyenne. <br/></li>
                            <li><b>EP</b> est une estimation des revenus de l'entreprise, calculée en:
                                <ul>
                                    <li>Obtenant la marge opérationnelle moyenne des 5 à 10 dernières années.</li>
                                    <li>Multipliant cette marge par les ventes actuelles.</li>
                                    <li>Additionnant les coûts de dépréciation et d'amortissement.</li>
                                    <li>Multipliant le tout par le (% de revenu retenu × % croissance).</li>
                                </ul>
                            </li>
                        </ul>
                    </p>
                </div>
                }
                
                
                
            </div>
        </div>
     );
}
 
export default Home;