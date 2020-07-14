import React from 'react';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';

class BreadCrumb extends React.Component {
    render() {
        return (
    <div style={{ marginTop: "3px", marginBottom: "0px"}} >
      
      <Breadcrumb className="" > 
        <BreadcrumbItem><a  href="#"> Home</a></BreadcrumbItem>
        <BreadcrumbItem><a href="#"> Site</a></BreadcrumbItem>
        <BreadcrumbItem active> Image Type</BreadcrumbItem>
      </Breadcrumb>
    </div>
  );
}
}

export default BreadCrumb;