import React, { useState } from 'react'
import './loginSignUp.css'
import {useNavigate} from "react-router-dom";
import axios from 'axios';

const dummyUser = { phone : '' , password:'' , room : ''}

const Login = () => {
    const Navigate = useNavigate()

    const clickHandler = (data)=>{
        console.log(data);
        Navigate(`/chat/${user.room}` , {state : {...data , room : user.room}}  )
    }
    const [user, setUser] = useState(dummyUser);

    const handleOnChange = (e)=>{
        console.log(e);
        setUser({
            ...user , 
            [e.target.name] : e.target.value
        })
    }

    const handleSubmit = async  (e)=>{
        e.preventDefault()
        try {
            console.log(user);
            const response = await axios.post("http://localhost:5000/login" , user)
            const data = await response.data
            console.log(data);
            data.status && clickHandler(data.data)
            data.status ? alert(data.message) : alert(data.message) 
            
        } catch (err) {
            err.response ? alert(err.response.data.message) :alert(err.message)
        }
    }


    return (
        <div className="JoinPage">
          <div className="JoinContainer">
             <form className="container mt-5 customForm" onSubmit={handleSubmit} method={"POST"} >

                    <p className='hding'>Login Your Account </p>
            
                    <div className="mb-3 ">
                        <input type="tel" name="phone" onChange={handleOnChange}  className="input form-control mt-3" placeholder='Enter Your Phone' required id="exampleInputEmail1" aria-describedby="emailHelp"/>
                    </div>
                    <div className="mb-3">
                        <input type="password" name="password" onChange={handleOnChange}  className="input form-control mt-4" required placeholder='Enter Your Password' id="exampleInputPassword1" />
                    </div>
                                            
                            <select className="form-select mt-4 input" required name='room' aria-label="Default select example" onChange={handleOnChange}>
                                <option selected>Choose Your Fav Chat Room </option>
                                <option value='study'>Study</option>
                                <option value="Medical">Medical</option>
                                <option value='Sports'>Sports</option>
                                <option value='Coding'>Software</option>
                                <option value='music'>music</option>
                                <option value='movies'>movies</option>
                                <option value={3}>others</option>
                            </select>
                    <div className="mb-3 form-check">
                        <div className='d-flex justify-content-between'>
                            <div>
                            <input type="checkbox" className="form-check-input mx-1 mt-3" id="exampleCheck1" />
                        <label className="form-check-label checkme mt-3" required for="exampleCheck1">Check me out</label>
                            </div>
                            <div>
                            <p onClick={()=>Navigate('/')} className="mt-2 pLink">Haven't Account Register Here</p>
                            </div>
                        </div>
    
                    </div>
                <button type="submit" className="btn btn-primary btn1">Submit</button>
            </form>
            </div>
        
        </div>
              );
}

export default Login
// export { user }
