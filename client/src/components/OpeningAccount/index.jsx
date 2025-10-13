import React from "react";

function OpenAccount() {
  return (
    <div className="container p-3 p-md-5 mb-3 mb-md-5">
      <div className="row text-center">
        <h1 className="mt-3 mt-md-5 mb-3 fs-2 fs-md-1 px-2">Open a Zerodha account</h1>
        <p className="mb-4 px-3 fs-6">
          Modern platforms and apps, ₹0 investments, and flat ₹20 intraday and
          F&O trades.
        </p>
        <div className="col-12">
          <button
            className="p-2 p-md-3 btn btn-primary fs-6 fs-md-5 mb-4 mb-md-5 mx-auto"
            style={{ width: "90%", maxWidth: "300px" }}
          >
            Sign up Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default OpenAccount;
