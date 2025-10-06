import React from "react";
import assets from "@/assets";
import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();

  return (
    <div className="container p-3 p-md-4 mb-5">
      <div className="row text-center">
        <img
          src={assets.hero.home}
          alt="Hero Image"
          className="mb-4 mb-md-5 img-fluid mx-auto"
          style={{
            maxHeight: "500px",
            maxWidth: "100%",
            width: "auto",
            height: "auto",
          }}
        />
        <h1 className="mt-3 mt-md-5 fs-1">Invest in everything</h1>
        <p className="px-3 fs-6">
          Online platform to invest in stocks, derivatives, mutual funds, and
          more
        </p>
        <button
          className="p-2 p-md-3 btn btn-primary fs-6 fs-md-5 mb-5 mx-auto text-center d-flex justify-content-center align-items-center"
          style={{ width: "90%", maxWidth: "300px" }}
          onClick={() => navigate("/auth")}
        >
          Signup Now
        </button>
      </div>
    </div>
  );
}

export default Hero;
