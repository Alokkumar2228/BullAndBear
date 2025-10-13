import {ContextApi} from "./ContextApi";
import axios from 'axios'
import { useState , useEffect } from "react";
import { useUser } from "@clerk/clerk-react";


export const ContextApiProvider =({children}) =>{



    const {user} = useUser();
   
   
   

    const user_name = user?.primaryEmailAddress?.emailAddress.split("@")[0]; localStorage.setItem("user_name" , user_name);

    useEffect(()=>{
        if(user){
            const user_name = user?.primaryEmailAddress?.emailAddress.split("@")[0]; localStorage.setItem("user_name" , user_name);
            localStorage.setItem("user_name" ,user_name );
        }
    },[user]);


    const BASE_URL = import.meta.env.VITE_BASE_URL

    const [watchlist , setWatchList] = useState([]);
    
    const [isLoading, setIsLoading] = useState(false);
    

    const fetchWatchList = async() =>{
        const response = await axios.get(`${BASE_URL}/api/stocks`);
     
        const modifyData = response.data.map((stock)=>{
            const isDown = stock.changePercent <= 0 ? true : false;
            return {...stock , isDown}
        })
        
        setWatchList(modifyData);
    }

    
    useEffect(()=>{
        fetchWatchList();
    },[])



    return(
        <ContextApi.Provider value={{
            watchlist ,
                isLoading,
                 setIsLoading,
                  
        }}>
            {children}
        </ContextApi.Provider>
    )
}