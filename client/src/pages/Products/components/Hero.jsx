import React from "react";

function Hero() {
  return (
    <div className="container border-bottom mb-4 mb-md-5">
      <div className="text-center mt-3 mt-md-5 p-2 p-md-3">
        <h1 className="mb-2 mb-md-3">Technology</h1>
        <h3 className="text-muted mt-2 mt-md-3 fs-5 fs-md-4 px-2">
          Sleek, modern and intuitive trading platforms
        </h3>
        <p className="mt-3 mb-4 mb-md-5">
          Check out our{" "}
          <a href="" style={{ textDecoration: "none" }}>
            investment offerings{" "}
            <i className="fa fa-long-arrow-right" aria-hidden="true"></i>
          </a>
        </p>
      </div>
    </div>
  );
}

export default Hero;