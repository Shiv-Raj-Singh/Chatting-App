import { BrowserRouter as Router, Route , Routes } from "react-router-dom";
import './App.css';

import RegisterPage from "./pages/register";
import LoginPage from "./pages/login";
import Nopage from "./pages/Nopage";
import About from "./Components/About";
import ChatPage from "./pages/chatroom";


function App() {
  return (
    <Router>
      <Routes>
        <Route  index element={<RegisterPage/>}/>
        <Route  path="/login"  element={<LoginPage/>}/>
        <Route  path="/chat/:room"  element={<ChatPage/>}/>
        <Route  path="/About"  element={<About/>}/>
        <Route  path="*"  element={<Nopage/>}/>

    </Routes>
  </Router>

  );
}

export default App;


