import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { CONFIG } from './config.js';

class App extends Component {
  constructor() {
    super();
    this.state = {
        favourites: []
    };
  }

  componentDidMount() {
    fetch(CONFIG.API_BASE_URL)
        .then(results => results.json())
        .then(favourites => this.setState({favourites: favourites}));
  }

  render() {
    const favourites = this.state.favourites.map((favourite, index) => <li key={index}>{favourite.user_id} {favourite.favourite_name}</li>);

    return (
      <div>
          <h1>Favourites list</h1>
          <ul>
            {favourites}
          </ul>
      </div>
    );
  }
}

export default App;