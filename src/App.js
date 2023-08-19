import logo from './logo.svg';
import './App.css';
import Navbar from './Navbar';
import Home from './Home';
import { Route, Routes } from 'react-router-dom';



function App() {
  return (
    <>
    <Navbar></Navbar>
    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path="/:searchticker" element={<Home />}></Route>
    </Routes>
    </>
    
      
    
    // <div className="App">
    //   <Navbar/>
    //   <Home />
    // </div>
  );
}

export default App;
