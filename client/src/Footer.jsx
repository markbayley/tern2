import React from 'react'
import { Nav, Row } from 'react-bootstrap';

function Footer() {
    return (
        <div className="footer">
            <Row className="justify-content-center" activekey="/home" style={{ lineHeight: "15px", backgroundColor: "#003d4f", height: "35px" }}>
                <Nav.Item style={{ padding: "0 20px 0px 20px", fontSize: "14px" }}>
                    <Nav.Link style={{ color: "white" }} href="/home">Access Policy</Nav.Link>
                </Nav.Item>
                <Nav.Item style={{ padding: "0 20px 0 20px", fontSize: "14px" }}>
                    <Nav.Link style={{ color: "white" }} eventKey="link-1">Data Licensing</Nav.Link>
                </Nav.Item>
                <Nav.Item style={{ padding: "0 20px 0 20px", fontSize: "14px" }}>
                    <Nav.Link style={{ color: "white" }} eventKey="link-2">Copyright</Nav.Link>
                </Nav.Item>

            </Row>
        </div>
    )
}

export default Footer
