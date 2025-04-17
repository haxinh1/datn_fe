import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: "pusher",
  key: "6b2509032695e872d989",
  cluster: "ap1",
  forceTLS: true,
  encrypted: true,
  authEndpoint: "http://127.0.0.1:8000/broadcasting/auth",
  auth: {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('client_token'), 
    },
  },
  withCredentials: true
});

export default echo;
