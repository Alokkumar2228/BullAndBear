import React from "react";
import assets from "@/assets";

function LeftSection({
  productName,
  productDesription,
  tryDemo,
  learnMore,
  googlePlay,
  appStore,
}) {
  return (
    <div className="container left-section-container">
      <div className="row left-section-row">
        <div className="col-6 left-section-image">
          <img src={assets.appStore.leftCoin} alt="Product Preview" />
        </div>
        <div className="col-6 left-section-content">
          <h1>{productName}</h1>
          <p>{productDesription}</p>
          
          <div className="action-links">
            <a href={tryDemo}>Try Demo</a>
            <a href={learnMore}>Learn More</a>
          </div>
          
          <div className="app-store-badges">
            <a href={googlePlay}>
              <img src={assets.googlePlay.badge} alt="Get it on Google Play" />
            </a>
            <a href={appStore}>
              <img src={assets.appStore.badge} alt="Download on the App Store" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeftSection;