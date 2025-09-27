import React from "react";

function RightSection({ imageURL, productName, productDesription, learnMore }) {
  return (
    <div className="container right-section-container">
      <div className="row right-section-row">
        <div className="col-6 right-section-content">
          <h1>{productName}</h1>
          <p>{productDesription}</p>
          <div>
            <a href={learnMore} className="learn-more-link">
              Learn More
            </a>
          </div>
        </div>
        <div className="col-6 right-section-image">
          <img src={imageURL} alt={productName} />
        </div>
      </div>
    </div>
  );
}

export default RightSection;