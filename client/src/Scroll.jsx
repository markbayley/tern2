import React from "react";

class ScrollButton extends React.Component {
  constructor() {
    super();

    this.state = {
      intervalId: 0,
    };
  }

  scrollStep() {
    if (window.pageYOffset === 0) {
      clearInterval(this.state.intervalId);
    }
    window.scroll(0, window.pageYOffset - this.props.scrollStepInPx);
  }

  scrollToTop() {
    let intervalId = setInterval(
      this.scrollStep.bind(this),
      this.props.delayInMs
    );
    this.setState({ intervalId: intervalId });
  }

  render() {
    return (
      <button
        title="Back to top"
        className="scroll"
        onClick={() => {
          this.scrollToTop();
        }}
      ></button>
    );
  }
}

class Scroll extends React.Component {
  render() {
    return (
      <div style={{ zIndex: 10 }}>
        <ScrollButton scrollStepInPx="3" delayInMs="1" />
      </div>
    );
  }
}

export default Scroll;
