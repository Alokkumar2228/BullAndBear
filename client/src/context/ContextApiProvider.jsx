import {ContextApi} from "./ContextApi";
import axios from 'axios'
import { useState , useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {useSession } from "@clerk/clerk-react";
import { useUser } from "@clerk/clerk-react";
import {useAuth} from "@clerk/clerk-react";


export const ContextApiProvider =({children}) =>{



    const {user} = useUser();
    const {userId} = useAuth();

    console.log("Userid",userId);
    console.log("User",user); 
   

    const user_name = user?.primaryEmailAddress?.emailAddress.split("@")[0]; localStorage.setItem("user_name" , user_name);

    useEffect(()=>{
        if(user){
            const user_name = user?.primaryEmailAddress?.emailAddress.split("@")[0]; localStorage.setItem("user_name" , user_name);
            localStorage.setItem("user_name" ,user_name );
        }
    },[user]);

    
   

   

    // const navigate = useNavigate();

    const url = "http://localhost:8000";


    // const [isLogin, setIsLogin] = useState(true);
    //   const [formData, setFormData] = useState({
    //     username: '',
    //     email: '',
    //     password: '',
    //   });

    const [watchlist , setWatchList] = useState([]);
    // const [authToken , setAuthToken] = useState(localStorage.getItem("authToken") || null   );
    const [isLoading, setIsLoading] = useState(false);
    // const [user , setUser] = useState(localStorage.getItem("user") || null  );

    const fetchWatchList = async() =>{
        const response = await axios.get(`${url}/api/stocks`);
        // console.log(response.data);
        const modifyData = response.data.map((stock)=>{
            const isDown = stock.changePercent <= 0 ? true : false;
            return {...stock , isDown}
        })
        // console.log("modifydata.." ,modifyData);
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