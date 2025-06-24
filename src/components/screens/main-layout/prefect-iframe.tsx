import React from "react";
import Iframe from "react-iframe";

const PrefectIframe: React.FC = () => {
  return (
    <div style={{ width: "100%", height: "80vh" }}>
      <Iframe
        url="http://localhost:5001" // Cambia esta URL si tu Prefect UI está en otra dirección
        width="100%"
        height="100%"
        display="block"
        position="relative"
        allowFullScreen
        frameBorder={0}
        title="Prefect UI"
      />
    </div>
  );
};

export default PrefectIframe;
