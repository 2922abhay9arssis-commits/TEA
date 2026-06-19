import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Username from "./pages/Username";
import Home from "./pages/Home";


function App(){

return(

<BrowserRouter>

<Routes>

<Route 
path="/"
element={<Login/>}
/>


<Route
path="/username"
element={<Username/>}
/>


<Route
path="/home"
element={<Home/>}
/>


</Routes>


</BrowserRouter>


)

}


export default App;