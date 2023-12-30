import React from "react";

import { SocketProvider } from "./SocketContext";
import { BrowserRouter as Router, Route } from "react-router-dom";

const App = () => {
    <SocketProvider>
        <Router>
            <Route exact path="/" component={Home} />
        </Router>
    </SocketProvider>
}

export default App;