import React from "react";
//import "./App.css";
import "react-dates/initialize";
import { DateRangePicker } from "react-dates";
import "react-dates/lib/css/_datepicker.css";


class DateRange extends React.Component {
  state = {
    startDate: null,
    endDate: null,
    endDateFormatted: null,
    startDateFormatted: null,
  };
  hundleDateChange(startDate, endDate) {
    this.setState(() => ({
      endDate,
      startDate,
    }));
    if (startDate != null) {
      this.setState(() => ({
        startDateFormatted: startDate.format("D-MM-Y"),
      }));
    }
    if (endDate != null) {
      this.setState(() => ({
        endDateFormatted: endDate.format("D-MM-Y"),
      }));
    }
  }

  render() {
    return (
      <div >
        <h6 style={{ paddingBottom: "0%", color: "#065f65", fontWeight: "500" }}>Date Range</h6> 
      
        <DateRangePicker  small='true' noBorder="true" startDateAriaLabe="fff" keepOpenOnDateSelect="true" 
        
          startDate={this.state.startDate}
          startDateId="start_date_id"
          endDate={this.state.endDate}
          endDateId="end_date_id"
          onDatesChange={({ startDate, endDate }) =>
            this.hundleDateChange(startDate, endDate)
          }
          focusedInput={this.state.focusedInput}
          onFocusChange={(focusedInput) => this.setState({ focusedInput })}
        />
        <hr style={{ border: '0.5px solid #66b3a6', marginTop: "7%" }}></hr>
      </div>
    );
  }
}
export default DateRange;