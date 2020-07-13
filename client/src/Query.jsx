import React from 'react';
import axios from 'axios';

class Query extends React.Component {
  state = {
    query: '',
    data: {},
  }

  handleChange = val => this.setState({ query: val});

  search = () => {
    const { query } = this.state;
    axios.get(`https://bioimages-test.tern.org.au/api/v1.0/search?=${query}`)
      .then(res => this.setState({ data: res.data }));
     
    
  }

  render() {
    const { query, data } = this.state;
    return (
      <div style={{marginLeft: "10%", marginTop: "0%"}}>
          
  
        <input
          value={query}
          onChange={(e) => this.handleChange(e.target.value)}
          onKeyPress={event => {
                if (event.key === 'Enter') this.search();
                console.log(data)
              }
          }
        />
     
        { data && 
          <div>
            {Object.keys(data).map(
              (val, i) => <div key={i}>
                <div> {val} </div>: {JSON.stringify([data.hits.alic.download_url])}
                <img src={[data.hits.alic.download_url]} style={{width:"400px"}}/>
                </div>
              )}
             
          </div>
          
          
        }
       
      </div>
     
    )
  }
}

export default Query;