import React from 'react'
import Logo from '@/images/logo.png';

export default function Footer() {
  return (
    <div>
      <div className="main" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'80px 118px 0px 118px'}}>
        <div className="cont" style={{display:'flex',flexDirection:'column'}}>
          <div className="name" style={{display:'flex',alignItems:'center',gap:'7px'}}>
                <img src={Logo} style={{height:'40px',width:'40px'}}/>
                <p style={{fontSize:'20px',fontWeight:'bold',color:'#0c4a6e',paddingTop:'13px'}}>ClosetGenie</p>
          </div>
          <p>Smart Wardrobe & Outfit Planner</p>
        </div>
        <div className="foot" style={{display:'flex'}}>
          <div className="container1" style={{paddingRight:'40px'}}>
              <p style={{fontWeight:'bold',color:'#262626',fontSize:'16px'}}>Navigation</p>
              <p style={{color:'#525252',fontSize:'16px',lineHeight:'13px'}}>Home</p>
              <p style={{color:'#525252',fontSize:'16px',lineHeight:'13px'}}>Wardrobe</p>
              <p style={{color:'#525252',fontSize:'16px',lineHeight:'13px'}}>Outfit Generator</p>
              <p style={{color:'#525252',fontSize:'16px',lineHeight:'13px'}}>Outfit History</p>
          </div>
          <div className="container2">
              <p style={{fontWeight:'bold',color:'#262626',fontSize:'16px'}}>Legal</p>
              <p style={{color:'#525252',fontSize:'16px',lineHeight:'13px'}}>Privacy Policy</p>
              <p style={{color:'#525252',fontSize:'16px',lineHeight:'13px'}}>Terms of Service</p>
          </div>
        </div>
      </div>
      <hr style={{margin:'0px 118px 0px 118px'}}></hr>
      <div className="footer" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'20px 118px 0px 118px',marginBottom:'20px'}}>
        <p>© 2025 ClosetGenie. All rights reserved.</p>
        <div className="footImg" style={{gap:'10px'}}>
          <i class="bi bi-instagram" style={{paddingRight:'10px',fontSize:'23px'}}></i>
          <i class="bi bi-linkedin" style={{paddingRight:'10px',fontSize:'23px'}}></i>
          <i class="bi bi-github" style={{paddingRight:'10px',fontSize:'23px'}}></i>
        </div>
      </div>
    </div>
  )
}
