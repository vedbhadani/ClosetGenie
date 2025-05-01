import React from 'react'
import './Navbar.css'
import { NavLink,useNavigate } from 'react-router-dom';
import Logo from "../../images/logo.png";
function Navbar() {
  const navigate = useNavigate();
  return (
    <div className="font-sans" style={{padding:'0px 145.5px 0px 145px',fontFamily:''}}>
      <div className="hero font-sans" style={{display:'flex',alignItems:'center', justifyContent:'space-between', paddingTop:'6px'}}>
        <div className="name" style={{display:'flex',alignItems:'center',gap:'7px'}}>
            <img src={Logo} style={{height:'40px',width:'40px'}}/>
            <p style={{fontSize:'20px',fontWeight:'bold',color:'#0c4a6e',paddingTop:'13px'}}>ClosetGenie</p>
        </div>
        <div className="function" style={{display:'flex'}}>
            <NavLink className={(e)=>{return e.isActive?"blue": ""}} to="/">Home</NavLink>
            <NavLink className={(e)=>{return e.isActive?"blue": ""}} to='/wardrobe'>Wardrobe</NavLink>
            <NavLink className={(e)=>{return e.isActive?"blue": ""}} to='/outfit-generator'>Outfit Generator</NavLink>
            <NavLink className={(e)=>{return e.isActive?"blue": ""}} to ='/outfit-history'>Outfit History</NavLink>
            <button type="button" className="btn btn-primary" style={{padding:'7px 17px 7px 17px', fontSize:'16px',borderRadius:'20px',color:'#ffffff',border:'none'}}  onClick={() => navigate('/get-ai')}>Get AI Suggestion</button>
        </div>
      </div>
    </div>
  )
}

export default Navbar
