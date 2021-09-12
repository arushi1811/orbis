import "./Login.css"
import logo from "../../assets/images/ORBIS.png"
import {Link, useHistory} from "react-router-dom"
import { useState } from "react"
import axios from 'axios'
const Login = ({setLoggedIn, setLogInEmail}) => {
    const history = useHistory()
    const [email, setEmail] = useState("")
    const [pswd, setPswd] = useState("")

    const submitHandler = async (e) => {
        e.preventDefault()
        const body = {
            "email": email,
            "password": pswd
        }
        const emailToStore = email
        setEmail("")
        setPswd("")
        await axios.post("http://localhost:8080/api/user/login", body)
            .then((res)=> {
                sessionStorage.setItem("token", res.data)
                setLoggedIn(true)
                setLogInEmail(emailToStore)
                history.push("/")
            })
            .catch((err)=> console.log(err))
    }

    return (
<<<<<<< HEAD
=======
      
 <div className = "loginWrapper">
           <div className = "login">
            <img src={logo} alt="logo" height="200px" width="200px"/>
            <h2>LOGIN</h2>
            <input type="text" name="email" placeholder="example@email.com" value={email} onChange={(e)=>setEmail(e.target.value)}/>
            <input type="password" name="password" placeholder="●●●●●●●●●●●●" value={pswd} onChange={(e)=>setPswd(e.target.value)}/>
            <button onClick={(e)=>submitHandler(e)}>Login</button>
            
            <div className="line"></div>

            <div className = "notLogin">
                <p>No account?</p>
                <Link to = "/signup">Sign Up</Link>
>>>>>>> 5bf672c434f0efa164e72f6fa2899da042a905fe

        <div className = "loginWrapper">
            <div className = "login">
                <h1>Orbis</h1>
                <h2>Enter motto here</h2>
                <input type="text" name="email" placeholder="example@email.com" value={email} onChange={(e)=>setEmail(e.target.value)}/>
                <input type="password" name="password" placeholder="●●●●●●●●●●●●" value={pswd} onChange={(e)=>setPswd(e.target.value)}/>
                <button onClick={(e)=>submitHandler(e)}>Login</button>

                <div className="line"></div>

                <div className = "notLogin">
                    <p>No account?</p>
                    <Link to = "/signup">Sign Up</Link>

                </div>
            </div>
        </div>

    )
}

export default Login
