import { useEffect, useState } from "react";

type OrientationType =
  | "portrait-primary"
  | "portrait-secondary"
  | "landscape-primary"
  | "landscape-secondary";

const useOrientation = (): OrientationType => {
  const [orientationType, setOrientationType] = useState<OrientationType>(
    () => {
      return window.screen.orientation.type;
    }
  );

  const updateOrientation = () => {
    setOrientationType(window.screen.orientation.type);
  };

  useEffect(() => {
    window.addEventListener("orientationchange", updateOrientation);
    return () =>
      window.removeEventListener("orientationchange", updateOrientation);
  }, []);

  return orientationType;
};

export default useOrientation;
