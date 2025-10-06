import React from "react";

function RightSection({ imageURL, productName, productDesription, learnMore }) {
  return (
    <div className="container right-section-container">
      <div className="row right-section-row align-items-center">
        <div className="col-12 col-md-6 right-section-content order-2 order-md-1 px-3 px-md-4">
          <h1 className="mb-3 fs-2">{productName}</h1>
          <p className="mb-4">{productDesription}</p>
          <div>
            <a href={learnMore} className="learn-more-link text-decoration-none d-inline-block">
              Learn More
            </a>
          </div>
        </div>
        <div className="col-12 col-md-6 right-section-image order-1 order-md-2 mb-4 mb-md-0 text-center text-md-start">
          <img 
            src={imageURL} 
            alt={productName} 
            className="img-fluid"
            style={{ maxWidth: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}

export default RightSection;