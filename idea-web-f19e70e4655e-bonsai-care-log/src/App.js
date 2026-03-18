import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './components/Home';
import MyPlants from './components/MyPlants';
import AddPlant from './components/AddPlant';
import PlantTimeline from './components/PlantTimeline';
import CareReminders from './components/CareReminders';
import Community from './components/Community';

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/my-plants" component={MyPlants} />
        <Route exact path="/add-plant" component={AddPlant} />
        <Route path="/plant/:id" component={PlantTimeline} />
        <Route path="/care-reminders" component={CareReminders} />
        <Route path="/community" component={Community} />
      </Switch>
    </Router>
  );
}

export default App;
