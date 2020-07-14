import React from "react";
import { Row } from "react-bootstrap";

function IconBar() {
  return (
    <div>
      <Row
        style={{ position: "absolute", left: "13.7%", top: "50%", zIndex: 10 }}
      >
        <img src="img/icons/Location.svg" alt="location" height="40px" />
      </Row>

      <Row
        style={{ position: "absolute", left: "13.7%", top: "24%", zIndex: 10 }}
      >
        <img src="img/icons/camera1.svg" alt="location" height="40px" />
      </Row>

      <Row
        style={{ position: "absolute", left: "13.7%", top: "66%", zIndex: 10 }}
      >
        <img src="img/icons/calendar.svg" alt="location" height="40px" />
      </Row>

      <Row
        style={{ position: "absolute", left: "13.7%", top: "41%", zIndex: 10 }}
      >
        <img src="img/icons/frequency.svg" alt="location" height="40px" />
      </Row>
    </div>
  );
}

export default IconBar;
