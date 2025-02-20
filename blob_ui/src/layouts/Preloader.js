import React, { useEffect } from "react";
import newLogo from "assets/images/blobasse.png";
import efreiLogo from "assets/images/shapes/efrei.svg"; // Adjust the path if needed
import './Preloader.css'; // Ensure this CSS file is created/updated as shown below

const Preloader = ({ setLoading }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelector('.preloader-container').style.opacity = '0'; // Fade out effect
      setTimeout(() => {
        setLoading(false);
      }, 1000); // Wait for the fade-out effect to complete
    }, 3000); // Duration for the preloader

    return () => clearTimeout(timer);
  }, [setLoading]);

  return (
    <div className="preloader-container">
      <div className="preloader-logo">
        <img src={newLogo} alt="Logo" />
      </div>
      <div className="preloader-name">BLOB IA</div>
      <div className="powered-by">
        <span>Powered by</span>
        <img src={efreiLogo} alt="Efrei Logo" className="efrei-logo"/>
      </div>
    </div>
  );
};

export default Preloader;
