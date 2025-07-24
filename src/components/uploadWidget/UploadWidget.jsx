import { useEffect, useRef, useState } from "react";

function UploadWidget({ uwConfig, setState, single = false }) {
  const [loaded, setLoaded] = useState(false);
  const widgetRef = useRef(null);

  // Load Cloudinary script safely
  useEffect(() => {
    const checkAndCreateWidget = () => {
      if (window.cloudinary && !widgetRef.current) {
        widgetRef.current = window.cloudinary.createUploadWidget(
          uwConfig,
          (error, result) => {
            if (!error && result && result.event === "success") {
              if (single) {
                // Only one image allowed
                setState([result.info.secure_url]);
              } else {
                setState((prev) => [...prev, result.info.secure_url]);
              }
            }
          }
        );
        setLoaded(true); // ready to open
      } else if (!window.cloudinary) {
        // Retry every 200ms until window.cloudinary is available
        setTimeout(checkAndCreateWidget, 200);
      }
    };

    // Inject script only once
    if (!document.getElementById("cloudinary-script")) {
      const script = document.createElement("script");
      script.src = "https://upload-widget.cloudinary.com/global/all.js";
      script.id = "cloudinary-script";
      script.async = true;
      script.onload = checkAndCreateWidget;
      document.body.appendChild(script);
    } else {
      checkAndCreateWidget();
    }
  }, [uwConfig, setState]);

  return (
    <button
      className="cloudinary-button"
      aria-label="Upload"
      onClick={() => {
        if (widgetRef.current) {
          widgetRef.current.open();
        } else {
          console.warn("Cloudinary widget not ready yet.");
        }
      }}
    >
      Upload
    </button>
  );
}

export default UploadWidget;
