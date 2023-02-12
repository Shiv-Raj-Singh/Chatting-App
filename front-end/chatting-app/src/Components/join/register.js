import React, { useState } from 'react'
import './loginSignUp.css'
import {useNavigate} from "react-router-dom";
import axios from 'axios';
const dummyUser = {name : '' ,  phone : '' , email: '' , password : '' , cPassword:''}

const Register = () => {
    const [user, setUser] = useState(dummyUser);
    const Navigate = useNavigate()

    const clickHandler = ()=>{
        Navigate('/login')
    }

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
            const response = await axios.post("http://localhost:5000/register" , user)
            console.log(response);
            const data = await response.data
            console.log(response);
            data.status && clickHandler()
            data? alert("Submit-Successfully !") : alert(data.msg) 
            
        } catch (err) {
            setUser(dummyUser)
            err.response ? alert(err.response.data.message) :alert(err.message)
            console.log(err);
        }
    
    }

console.log(user);

    return (
        <>
            <div className="JoinPage">
          <div className="JoinContainer">
             <form className="container mt-5 customForm" id='customForm' onSubmit={handleSubmit}>
                    {/* <h1 className='hding'>Register Your Account </h1> */}
                    <p className='hding mb-4'>Register Your Account </p>
                    <div className="mb-3 ">
                        <input type="text" className="form-control"required placeholder='Enter Your Name' name="name" onChange={handleOnChange} id="exampleInputEmail1" aria-describedby="emailHelp"/>
                    </div>
                    <div className="mb-3 ">
                        <input type="tel" className="form-control"required placeholder='Enter Your Phone' name="phone" onChange={handleOnChange}id="exampleInputEmail1" aria-describedby="emailHelp"/>
                    </div>
                    <div className="mb-3 ">
                        <input type="email" className="form-control" required placeholder='Enter Your Email' name="email" onChange={handleOnChange}id="exampleInputEmail1" aria-describedby="emailHelp"/>
                    </div>
                    <div className="mb-3">
                        <input type="password" className="form-control" required placeholder='Enter Your Password' name="password" onChange={handleOnChange}  id="exampleInputPassword1" />
                    </div>
                    <div className="mb-3">
                        <input type="password" className="form-control" required placeholder='Confirm Your Password' 
                        name="cPassword" onChange={handleOnChange} id="exampleInputPassword1" />
                    </div>
                    <div className="mb-3 form-check">
                        <div className='d-flex justify-content-between'>
                            <div>
                            <input type="checkbox" className="form-check-input" required id="exampleCheck1" />
                        <label className="form-check-label checkme" for="exampleCheck1">Check me out</label>
                            </div>
                            <div>
                                <p onClick={clickHandler} className="pLink">Have an account? Login Here</p>
                            </div>
                        </div>          
                    </div>
                <button type="submit" className="btn btn-primary btn1" >Submit</button>
            </form>
            </div>
        
        </div>

        </>
                      );
}

export default Register
// export { user }
