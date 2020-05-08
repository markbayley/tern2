import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { CONFIG } from './config.js';

const base_image_url = 'https://swift.rc.nectar.org.au/v1/AUTH_05bca33fce34447ba7033b9305947f11/';

function SearchResults(props) {
  return (
    <div>
      <div className="right">
        <ul>
          {Object.keys(props.value).map((index, value) => (
            <SearchResult
              value={props.value[index]}
              id={index}
              key={index + value} />
          ))
          }
        </ul>
      </div>
    </div>
  );

}
function SearchResult(props) {
  const img_url = base_image_url + props.value.published_root + '/' + props.value.thumbnail_path;
  return (
    <li id={props.id}>
      <img src={img_url} /><br />
      <span className="space-left">key:{props.id} - id:{props.value._id} - node:{props.value.metadata_doc.supersite_node_code} - img:{props.value.metadata_doc.image_type}</span>
    </li>
  );
}


function ImageSearch(props) {
  return (
    <div>
      <div className="">
        {Object.keys(props.value).map((key, indexer) => (
          <ImageFilterType
            value={props.value[key]}
            header={key}
            key={key}
            onClick={(i) => props.onClick(i)} />
        ))}
      </div>
    </div>
  );
}

function ImageFilterType(props) {
      return (
      <div className="container"  key="{key}">
        <span className="">{props.header}</span>
        <ul>
          {Object.keys(props.value).map((key1) => (
            <ImageFilter
              value={props.value[key1].key}
              key={props.header+ '--' +props.value[key1].key}
              onClick={() => props.onClick(props.header+ '--' +props.value[key1].key)} />
          ))}
        </ul>
      </div>
      );
}

function ImageFilter(props) {
  return (
    <div>
      <div className="">
        <li key="{key}">
          <a href="#" 
                onClick={props.onClick}>
                {props.value}</a>
                </li>
      </div>
    </div>
  );
}

function Favourite(props) {
  return (
    <li key="{index}">{props.value.user_id} {props.value.favourite_name}</li>
  );
}
class App extends React.Component {

  constructor() {
    super();
    this.state = {
      favourites: [],
      filters: {},
      hits: [],
      images: null,
      error: null,
      isLoading: true,
      isLoadingSearch: true,
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
          hits: data['hits'],
          filters: data['aggregations'],
          isLoadingSearch: false,
        })
      )
      // Catch any errors we hit and update the app
      .catch(error => this.setState({ error, isLoading: false }));
  }


  componentDidMount() {
    this.fetchFavourites()
    this.fetchSearch()
  }

  handleFilter(i) {
    const filter = this.state.filters;

    console.log(i.type);
    alert(i);  //image_type--photopoint
}


  render() {
    const { isLoading, favourites, filters, search, hits, error } = this.state;
    const favs = favourites.map((favourite, index) => {
      return (
        <Favourite
          value={favourite}
          index={index}
          key={'f'+index} />
      );
    });

    return (
      <div>

        <h3>Favourites list</h3>
        <ul>
          {favs}
        </ul>
        <div className="left">
        <h3>Filter</h3>
        <div>
          <ImageSearch
            value={this.state.filters}
            onClick={(i) => this.handleFilter(i)} />
        </div>
        </div>
        <div className="right">
        <h3>Search</h3>
        <div>
          <SearchResults
            value={this.state.hits} />
        </div>
        </div>
      </div>
    );
  }
}

export default App;