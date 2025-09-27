import {Navigate , useLocation} from 'react-router-dom';
import { Fragment} from 'react';
import { ContextApi } from "@/context/ContextApi"

import { useContext } from "react";

const RouteGuard = ({element})=>{


    const {sessionID} = useContext(ContextApi);
    const location  = useLocation();

    if(!sessionID && !location.pathname.includes('/auth')){
        return <Navigate to="/auth" />
    }

    if(sessionID && location.pathname.includes('/auth')){
        return <Navigate to="/dashboard" />
    }

    if (sessionID && (location.pathname.startsWith("/auth") || location.pathname === "/")) {
    return <Navigate to="/dashboard" />;
  }
    


    return (
        <Fragment>
            {element}
        </Fragment>
    )
}

export default RouteGuard;
