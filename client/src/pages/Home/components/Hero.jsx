import React from "react";
import assets from "@/assets";
import { useNavigate } from "react-router-dom";


function Hero() {

  const navigate = useNavigate();

  return (
    <div className="container p-4  mb-5">
      <div className="row text-center">
        <img
          src={assets.hero.home}
          alt="Hero Image"
          className="mb-5"
          height= "500px"
          width = "300px"
          
        />
        <h1 className="mt-5">Invest in everything</h1>
        <p>
          Online platform to invest in stocks, derivatives, mutual funds, and
          more
        </p>
        <button
          className="p-2 btn btn-primary fs-5 mb-5"
          style={{ width: "20%", margin: "0 auto" }}
          onClick={()=>navigate('/auth')}
        >
          Signup Now
        </button>
      </div>
    </div>
  );
}

export default Hero;
