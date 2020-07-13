import React, { Component } from "react";

class Legend extends Component {
  render() {
    return (
      <div className="index" style={{ backgroundColor: "white" }}>
        <img src="/img/LAI_circle.svg" width="35px" />Leaf Area Index <img style={{float: 'right'}} src="/img/LAI.svg" width="25px" /> <br />
        <img src="/img/Panorama_circle.svg" width="35px" />Panorama <img style={{float: 'right'}} src="/img/panoramic.svg" width="25px"/> <br />
        <img src="/img/Phenocam_circle.svg" width="35px" />Phenocam <img style={{float: 'right'}} src="/img/phenocam.svg" width="25px" /> <br />
        <img src="/img/photopoint_circle.svg" width="35px" />Photopoint <img style={{float: 'right'}} src="/img/photopoint.svg" width="25px" />
      </div>
    );
  }
}

export default Legend;
