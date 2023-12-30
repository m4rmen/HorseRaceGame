import React from "react";
import Home from "./components/Home";
import Host from "./components/Host";
import Join from "./components/Join";
import WaitingRoom from "./components/WaitingRoom";


import { SocketProvider } from "./SocketContext";
import { BrowserRouter as Router, Route } from "react-router-dom";

const App = () => {
    <SocketProvider>
        <Router>
            <Route exact path="/" component={Home} />
            <Route exact path="/host" component={Host} />
            <Route exact path="/join" component={Join} />
            <Route exact path="/waitingroom" component={WaitingRoom} />
        </Router>
    </SocketProvider>
}

export default App;