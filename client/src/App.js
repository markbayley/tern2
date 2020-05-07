import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { CONFIG } from './config.js';

const base_image_url = 'https://swift.rc.nectar.org.au/v1/AUTH_05bca33fce34447ba7033b9305947f11/bioimages/';

function SearchResults(props) {
  return (
    <div>
      <div className="">
        <ul>
          {props.value.map((result, index) => (
            <SearchResult
              value={result}
              key={index} />
          ))
          }
        </ul>
      </div>
    </div>
  );

}
function SearchResult(props) {
  const img_url = base_image_url + props.value.top_tags_hits.hits.hits[0]._source.published_paths[3];
  return (
    <li id={props.key}>
      {props.value.top_tags_hits.hits.hits[0]._id}
      <img src={img_url} />
    </li>
  );

}


function ImageSearch(props) {
  return (
    <div>
      <div className="">
        {Object.keys(props.value).map((key) => (
          <div className="container">
            <span className="left">{key}</span>
            <ul>
              {Object.keys(props.value[key].buckets).map((key1) => (
                <ImageFilter
                  value={props.value[key].buckets[key1].key}
                  key={key1} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImageFilter(props) {
  return (
    <div>
      <div className="">
        <li key="{key}">{props.value}</li>
      </div>
    </div>
  );
}

function Favourite(props) {
  return (
    <li key="{index}">{props.value.user_id} {props.value.favourite_name}</li>
  );
}
class App extends Component {

  constructor() {
    super();
    this.state = {
      favourites: [],
      filters: {},
      hits: [],
      images: null,
      error: null,
      isLoading: true,
      search: {},
    };
  }

  fetchFavourites() {
    // Where we're fetching data from
    fetch(CONFIG.API_BASE_URL + 'favourites')
      // We get the API response and receive data in JSON format...
      .then(response => response.json())
      // ...then we update the users state
      .then(data =>
        this.setState({
          favourites: data,
          isLoading: false,
        })
      )
      // Catch any errors we hit and update the app
      .catch(error => this.setState({ error, isLoading: false }));
  }

  fetchSearch() {
    // Where we're fetching data from
    fetch(CONFIG.API_BASE_URL)
      // We get the API response and receive data in JSON format...
      .then(response => response.json())
      // ...then we update the users state
      .then(data =>
        this.setState({
          search: data,
          isLoading: false,
        })
      )
      // Catch any errors we hit and update the app
      .catch(error => this.setState({ error, isLoading: false }));
  }


  componentDidMount() {
    this.fetchFavourites()
    this.fetchSearch()
  }


  render() {
    const { isLoading, favourites, filters, search, hits, error } = this.state;
    const favs = favourites.map((favourite, index) => {
      return (
        <Favourite
          value={favourite}
          index={index} />
      );
    });

    var currentHits = [];

    Object.keys(search).forEach(filter => {
      if (filter == 'top_sites') {
        Object.keys(search[filter].buckets).forEach(entry => {
          if (!search[filter].buckets[entry].key.startsWith('.')) {
            currentHits.push(search[filter].buckets[entry]);
            //this.state.hits[] = search[filter].buckets[entry];
          }
        })
        //this.state.hits = search[filter];
      } else {
        filters[filter] = search[filter]
      }
    });
    this.state.hits = currentHits;

    return (
      <div>

        <h1>Favourites list</h1>
        <ul>
          {favs}
        </ul>
        <h1>Filter</h1>
        <div>
          <ImageSearch
            value={this.state.filters} />
        </div>
        <h1>Search</h1>
        <div>
          <SearchResults
            value={this.state.hits} />
        </div>
      </div>
    );
  }
}

export default App;