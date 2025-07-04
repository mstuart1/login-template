import axios from "axios";

console.log('requesting at server', import.meta.env.VITE_APP_SERVER_URL)

const BASE_URL = import.meta.env.VITE_APP_SERVER_URL;

export default axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-type": "application/json",
  },
});


