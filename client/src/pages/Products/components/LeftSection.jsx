import React from "react";
import assets from "@/assets";

function LeftSection({ productName, productDesription, tryDemo, learnMore, googlePlay, appStore }) {
  return (
    <div className="container left-section-container">
      <div className="row left-section-row align-items-center">
        <div className="col-12 col-md-6 left-section-image mb-4 mb-md-0 text-center text-md-start">
          <img 
            src={assets.appStore.leftCoin} 
            alt="Product Preview" 
            className="img-fluid"
            style={{ maxWidth: "100%" }}
          />
        </div>
        <div className="col-12 col-md-6 left-section-content px-3 px-md-4">
          <h1 className="mb-3 fs-2">{productName}</h1>
          <p className="mb-4">{productDesription}</p>
          
          <div className="action-links mb-4 d-flex flex-column flex-sm-row gap-3">
            <a href={tryDemo} className="text-decoration-none">Try Demo</a>
            <a href={learnMore} className="text-decoration-none">Learn More</a>
          </div>
          
          <div className="app-store-badges d-flex flex-column flex-sm-row gap-3 align-items-start">
            <a href={googlePlay} className="d-inline-block">
              <img 
                src={assets.googlePlay.badge} 
                alt="Get it on Google Play" 
                className="img-fluid"
                style={{ maxHeight: "50px", width: "auto" }}
              />
            </a>
            <a href={appStore} className="d-inline-block">
              <img 
                src={assets.appStore.badge} 
                alt="Download on the App Store" 
                className="img-fluid"
                style={{ maxHeight: "50px", width: "auto" }}
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeftSection;