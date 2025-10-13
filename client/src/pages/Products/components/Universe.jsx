import React from "react";
import assets from "@/assets";


function Universe() {
  return (
    <div className="container mt-3 mt-md-5">
      <div className="row text-center">
        <h1 className="mb-3 px-2">The Bull&Bear Universe</h1>
        <p className="mb-4 px-3">
          Extend your trading and investment experience even further with our
          partner platforms
        </p>

        <div className="col-6 col-md-4 p-3 mt-3 mt-md-5">
          <img 
            src={assets.logos.smallcase} 
            className="img-fluid mb-2"
            alt="Partner platform"
            style={{ maxHeight: "80px", width: "auto" }}
          />
          <p className="text-small text-muted mb-0">Thematic investment platform</p>
        </div>
        <div className="col-6 col-md-4 p-3 mt-3 mt-md-5">
          <img 
            src={assets.logos.smallcase} 
            className="img-fluid mb-2"
            alt="Partner platform"
            style={{ maxHeight: "80px", width: "auto" }}
          />
          <p className="text-small text-muted mb-0">Thematic investment platform</p>
        </div>
        <div className="col-6 col-md-4 p-3 mt-3 mt-md-5">
          <img 
            src={assets.logos.smallcase} 
            className="img-fluid mb-2"
            alt="Partner platform"
            style={{ maxHeight: "80px", width: "auto" }}
          />
          <p className="text-small text-muted mb-0">Thematic investment platform</p>
        </div>
        <div className="col-6 col-md-4 p-3 mt-3 mt-md-5">
          <img 
            src={assets.logos.smallcase} 
            className="img-fluid mb-2"
            alt="Partner platform"
            style={{ maxHeight: "80px", width: "auto" }}
          />
          <p className="text-small text-muted mb-0">Thematic investment platform</p>
        </div>
        <div className="col-6 col-md-4 p-3 mt-3 mt-md-5">
          <img 
            src={assets.logos.smallcase} 
            className="img-fluid mb-2"
            alt="Partner platform"
            style={{ maxHeight: "80px", width: "auto" }}
          />
          <p className="text-small text-muted mb-0">Thematic investment platform</p>
        </div>
        <div className="col-6 col-md-4 p-3 mt-3 mt-md-5">
          <img 
            src={assets.logos.smallcase} 
            className="img-fluid mb-2"
            alt="Partner platform"
            style={{ maxHeight: "80px", width: "auto" }}
          />
          <p className="text-small text-muted mb-0">Thematic investment platform</p>
        </div>
        <div className="col-12 mt-4">
          <button
            className="p-2 p-md-3 btn btn-primary fs-6 fs-md-5 mb-5 mx-auto"
            style={{ width: "90%", maxWidth: "300px" }}
          >
            Signup Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default Universe;