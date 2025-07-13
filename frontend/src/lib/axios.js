import axios from "axios"



const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/api/v1",
    withCredentials: true    //send cookies to server
})

export default axiosInstance

