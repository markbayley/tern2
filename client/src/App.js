import React, { Fragment } from 'react';
import './App.css';
import './index.css';
import { CONFIG } from './config.js';
import { Map, Marker, Popup, Tooltip, TileLayer} from 'react-leaflet';
import L from 'leaflet';
//import  MarkerClusterGroup  from "react-leaflet-markercluster";
//import Wkt from 'wicket';
//import wkt_coords from 'wicket';
import 'bootstrap/dist/css/bootstrap.min.css';
//import { DateRangePicker } from 'react-date-range';
/*import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file*/
import TopBar from './TopBar'
import Footer from './Footer';
import { Accordion, Card, CardTitle, Container, Button, Col, Row, Form} from "react-bootstrap";
import SearchBar from './SearchBar'
import IconBar from './IconBar';
import MarkerClusterGroup from "react-leaflet-markercluster";
import Scroll from './Scroll';
import DateRange from './DateRange'

const base_image_url = 'https://swift.rc.nectar.org.au/v1/AUTH_05bca33fce34447ba7033b9305947f11/';

function SearchResults(props) {
  return (
    <Row >
          {Object.keys(props.value).map((index, value) => (
            <SearchResult
              value={props.value[index]}
              id={props.group + '=' + index}
              key={index + value}
              onClick={(i) => props.onClick(i)} />
          ))
          }
      </Row>
  );
}

function SearchResult(props) {
  const img_url = props.value.thumbnail_url;
  return (
    <Col xl={3} >
    <Card id={props.id} style={{marginTop: "5%"}}>
      <img src={img_url} style={{height: "210px"}}/>
      <Form className="center" style={{ paddingTop: "5px" }}>
                  {['radio'].map((type) => (
                    <div key={`inline-${type}`} className="mb-3">
                      <Form.Check type={type} id={`inline-${type}-1`} inline label="View" />
                      <Form.Check inline label="Select" type={type} id={`inline-${type}-2`} />
                      <Form.Check inline label="Download" type={type} id={`inline-${type}-3`} />
                    </div>
                  ))}
                </Form>
      <span className="center" ><Button variant="outline-info" style={{width: "100%"}} onClick={() => props.onClick(props.id)}>  <strong>Site:</strong> { props.value.site_id.value}  <strong>Image Type:</strong> { props.value.image_type.value} <br /> <strong>Image Count:</strong> { props.value.doc_count}  </Button></span>

   
   
    </Card>
    </Col>
  );
}

function ImageSearch(props) {
  return (
   <div>
        {Object.keys(props.value).map((key, indexer) => (
          <ImageFilterType 
            value={props.value[key]}
            header={key}
            key={key}
            onClick={(i) => props.onClick(i)} /> 
        ))}
  </div>
  );
}

function ImageFilterType(props) {
  return (
    <div style={{marginLeft: "4%"}} key="{key}">

<Accordion>
  <Card>
    <Accordion.Toggle as={Card.Header} eventKey="0"  style={{backgroundColor: "#fff", borderRight: "55px solid rgba(149, 219, 199, 0.5)"}} >
    
    <Button style={{width: "100%"}} variant="outline" onClick={() => props.onClick(props.header + '=')}>
          {props.header}</Button>
    </Accordion.Toggle>
    <Accordion.Collapse eventKey="0">
      <Card.Body>
      <ul>
        {Object.keys(props.value).map((key1) => (
          <ImageFilter
            value={props.value[key1]}
            key={props.header + '=' + props.value[key1].key}
            onClick={() => props.onClick(props.header + '=' + props.value[key1].key)} />
        ))}
      </ul>
      </Card.Body>
    </Accordion.Collapse>
  </Card>
</Accordion>
    </div>
  );
}

function ImageFilter(props) {
  return (
    <div>
      <div className="">
        <div key="{key}">
          <Button style={{width: "100%"}} variant="outline-secondary" onClick={props.onClick}>
            {props.value.label} ({props.value.doc_count})</Button>
        </div>
      </div>
    </div>
  );
}

function Favourite(props) {
  return (
    <li key="{index}"> <button
      onClick={props.onClick}>{props.value.user_id} {props.value.favourite_name} ({props.value.favourites_id})</button></li>
  );
}

function ImageMarkers(props) {
  console.log('hello');
  console.log(props.value);
  var popup = "";
  var tooltip = "";
  var id = props.location;
  var position = props.value.centre_point;
  console.log(id);
  console.log(position);
  for (var this_key in props.value.image_types) {
    console.log(this_key);
    for (var sub_key in props.value.image_types[this_key]) {
      var site_key = sub_key;
      console.log(Object.keys(props.value.image_types[this_key]).length)
      if (sub_key == "total" && Object.keys(props.value.image_types[this_key]).length == 1) {
        site_key = this_key;
      }
      popup += site_key + "(" + props.value.image_types[this_key][sub_key] + ") \r\n";
      tooltip += props.value.image_types[this_key] + " - " + this_key;
    }
    console.log(popup);
    console.log('this is the popup for ' + this_key);
  }

  return (
    /*Object.keys(props.value.image_types).map((index) => (
      <ImageMarker
        value={props.value.image_types[index]}
        type={index}
        site={props.value.supersite_node_code}
        position={props.value.centre_point}
        id={props.value.supersite_node_code + index}
        key={props.value.supersite_node_code + index} />
    //)) */
    <ImageMarker
      value={popup} 
      type={id}  
      site={id}
      position={position}
      id={id}
      key={id} />
  );
}

function ImageMarker(props) {
  return (
 
    <Marker 
    icon={L.divIcon({
      html: ``,
      className: "custom-marker",
      iconSize: L.point(33, 33, true)
    })}

    key={props.id} 
      position={props.position}> <br />
      <Popup><strong>{props.type}</strong> <br /> {props.value}</Popup>
      <Tooltip>{props.type} <br /> {props.value} </Tooltip>
    </Marker>
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
      selectedFilter: {},
      aggregation: null,
      lat: -27.47,
      lng: 143.02,
      zoom: 5,
      maxZoom: 30,
      minZoom: 5
    };
  }

  /*handleSelect(ranges) {
    console.log(ranges);
    // {
    //   selection: {
    //     startDate: [native Date Object],
    //     endDate: [native Date Object],
    //   }
    // }
  }*/

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
    console.log('fetching');
    var search_url = CONFIG.API_BASE_URL + 'search?1=1';
    const selectedFilter = this.state.selectedFilter;
    for (const [key, value] of Object.entries(selectedFilter)) {
      search_url += '&' + key + '=' + value;
    }
    console.log(search_url);
    fetch(search_url)
      // We get the API response and receive data in JSON format...
      .then(response => response.json())
      // ...then we update the users state
      .then(data =>
        this.setState({
          search: data,
          hits: data['hits'],
          filters: data['aggregations'],
          isLoadingSearch: false,
          aggregation: data['aggregation']
        })
      )
      // Catch any errors we hit and update the app
      .catch(error => this.setState({ error, isLoading: false }));
  }


  componentDidMount() {
    //this.fetchFavourites()
    this.fetchSearch()
  }

  handleFilter(i) {
    const selectedFilter = this.state.selectedFilter;

    console.log(i);
    var arr = i.split('=');
    selectedFilter[arr[0]] = arr[1];
    if (arr[0] !== '_id') {
      selectedFilter['_id'] = "";
    }
    this.state.selectedFilter = selectedFilter;
    console.log(i);
    this.fetchSearch();
    console.log(this.state.isLoadingSearch);
    //console.log(args[0]);
    //alert(i);  //image_type=photopoint
  }

  handleFavourite(i) {
    const favourites = this.state.favourites;

    console.log(i);
    //console.log(args[0]);
    alert(i);  //image_type=photopoint
  }



  render() {
    const { favourites } = this.state;
    const favs = favourites.map((favourite, index) => {
      return (

        <Favourite
          value={favourite}
          index={index}
          key={'f' + index}
          onClick={() => this.handleFavourite(favourite.favourite_name)} />
      );
    });

    const position = [this.state.lat, this.state.lng];
    const selectionRange = {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    }

 
    return (
      <div  >

        <TopBar />
        <SearchBar />
       <IconBar />
     
        <Row className="content"   >
          <Col xl={2}  style={{marginRight: "-.7%", zIndex: "9"}}>
          { /*Filter SideBar*/}
          <ImageSearch
                    value={this.state.filters}
                    onClick={(i) => this.handleFilter(i)} />

<DateRange />
          </Col>
        
          { /*Leaflet Map */}
          <Col sm={12} md={12} lg={10} xl={10} style={{ height: "80vh", padding: "0% 0% 0% 0%", marginTop: "0%", marginBottom: "0%"}} >
            <div className="map-container" >
              <div className=" map-frame" >
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
                  integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
                  crossOrigin="" />
                 <div id="map-id">
                <Map className="markercluster-map" center={position} zoom={this.state.zoom} style={{ zIndex: "1" }}>
                  <TileLayer
                    attribution='&copy; <a href="http://a.tile.openstreetmap.fr/hot/${z}/${x}/${y}.png">OpenStreetMap</a> contributors'
                    url='https://{s}.tile.osm.org/{z}/{x}/{y}.png'
                  />

                 <TileLayer
                    attribution='&copy; <a href="http://a.tile.openstreetmap.fr/hot/${z}/${x}/${y}.png">OpenStreetMap</a> contributors'
                    url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                  />

                  <TileLayer  
                    attribution='&copy; <a href="http://a.tile.openstreetmap.fr/hot/${z}/${x}/${y}.png">OpenStreetMap</a> contributors'
                    url='https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png'
                  />

                  {/* Example Markers */}
                  <MarkerClusterGroup  >
                    <Marker position={[-27.8397, 143.0297]} />
                    <Marker position={[-28.2297, 143.0122]} />
                    <Marker position={[-27, 143.0901]} />
                    <Marker position={[-27.8397, 143.0297]} />
                    <Marker position={[-28.2297, 142.0122]} />
                    <Marker position={[-27, 143.0901]} />
                    <Marker position={[-27.8397, 143.0297]} />
                    <Marker position={[-28.2297, 143.0122]} />
                    <Marker position={[-27, 143.0901]} />
                    <Marker position={[-27.8397, 144.0297]} />
                    <Marker position={[-28.2297, 143.0122]} />
                    <Marker position={[-28, 143.0901]} />
                    <Marker position={[-27.8397, 143.0297]} />
                    <Marker position={[-28.2297, 143.0122]} />
                    <Marker position={[-26, 143.0901]} />
                    <Marker position={[-27.8397, 143.0297]} />
                    <Marker position={[-28.2297, 140.0122]} />
                    <Marker position={[-28, 143.0901]} />
                    <Marker position={[-27.8397, 142.0297]} />
                    <Marker position={[-28.2297, 143.0122]} />
                    <Marker position={[-27, 143.0901]} />
                    <Marker position={[-22.8397, 143.0297]} />
                    <Marker position={[-26.2297, 143.0122]} />
                    <Marker position={[-27, 143.0901]} />
                    <Marker position={[-27.8397, 143.0297]} />
                    <Marker position={[-28.2297, 143.0122]} />
                    <Marker position={[-27, 143.0901]} />
                    <Marker position={[-25.8397, 143.0297]} />
                    <Marker position={[-28.2297, 140.0122]} />
                    <Marker position={[-24, 143.0901]} />
                    <Marker position={[-27.8397, 143.0297]} />
                    <Marker position={[-28.2297, 143.0122]} />
                    <Marker position={[-24, 143.0901]} />
                    <Marker position={[-27.8397, 141.0297]} />
                    <Marker position={[-25.2297, 143.0122]} />
                    <Marker position={[-27, 143.0901]} />
                  </MarkerClusterGroup>

                  <MarkerClusterGroup>
                    <Marker position={[-29.8397, 140.0297]} />
                    <Marker position={[-28.2297, 142.0122]} />
                    <Marker position={[-29, 141.0901]} />
                    <Marker position={[-27.8397, 141.0297]} />
                    <Marker position={[-29.2297, 140.0122]} />
                    <Marker position={[-26, 141.0901]} />
                    <Marker position={[-30.8397, 142.0297]} />
                    <Marker position={[-29.2297, 140.0122]} />
                    <Marker position={[-28, 141.0901]} />
                    <Marker position={[-29.8397, 141.0297]} />
                    <Marker position={[-29.2297, 140.0122]} />
                    <Marker position={[-28, 141.0901]} />
                    <Marker position={[-29.8397, 139.0297]} />
                    <Marker position={[-29.2297, 142.0122]} />
                    <Marker position={[-27, 141.0901]} />
                    <Marker position={[-29.8397, 140.0297]} />
                    <Marker position={[-26.2297, 141.0122]} />
                    <Marker position={[-25, 141.0901]} />
                  </MarkerClusterGroup>

                  <MarkerClusterGroup>
                    <Marker position={[-20.8397, 140.0297]} />
                    <Marker position={[-27.2297, 140.0122]} />
                    <Marker position={[-28, 141.0901]} />
                    <Marker position={[-26.8397, 140.0297]} />
                    <Marker position={[-27.2297, 135.0122]} />
                    <Marker position={[-26, 131.0901]} />
                    <Marker position={[-20.8397, 140.0297]} />
                    <Marker position={[-27.2297, 140.0122]} />
                    <Marker position={[-28, 141.0901]} />
                    <Marker position={[-26.8397, 140.0297]} />
                    <Marker position={[-27.2297, 135.0122]} />
                    <Marker position={[-26, 131.0901]} />
                    <Marker position={[-20.8397, 140.0297]} />
                    <Marker position={[-27.2297, 140.0122]} />
                    <Marker position={[-28, 141.0901]} />
                    <Marker position={[-26.8397, 140.0297]} />
                    <Marker position={[-27.2297, 135.0122]} />
                    <Marker position={[-26, 131.0901]} />
                    <Marker position={[-20.8397, 140.0297]} />
                    <Marker position={[-27.2297, 140.0122]} />
                    <Marker position={[-28, 141.0901]} />
                    <Marker position={[-26.8397, 140.0297]} />
                    <Marker position={[-27.2297, 135.0122]} />
                    <Marker position={[-26, 131.0901]} />
                    <Marker position={[-20.8397, 140.0297]} />
                    <Marker position={[-27.2297, 140.0122]} />
                    <Marker position={[-28, 141.0901]} />
                    <Marker position={[-26.8397, 140.0297]} />
                    <Marker position={[-27.2297, 135.0122]} />
                    <Marker position={[-26, 131.0901]} />
                  </MarkerClusterGroup>
         
                  {/* API Markers */}
                  {Object.keys(this.state.hits).map((index) => (
                
                    <ImageMarkers
                      value={this.state.hits[index]}
                      location={index}
                      />
                  ))}
                  
                </Map>
                </div>
              </div>
              { /*End of Leaflet  Map */}

              <h5>Breadcrumb</h5>

              { /*Photo Gallery */}
                <SearchResults    
                value={this.state.hits}
                group={this.state.aggregation}
                onClick={(i) => this.handleFilter(i)} 
                />
            
                <div className="favs">
                  <h3>Favourites list</h3>
               
                  <ul>
                    {favs}
                  </ul>
                </div>
             
            </div>
          </ Col>
          
        </Row>
        <Scroll />
        <Footer />
      </div>
    );
  }
}

export default App;
