import { useState } from "react";

import { type UseSpine } from "@/hooks/use-spine";

import { Button } from "./ui/button";

export const SpineControlButtons = ({
  pixiData,
  children,
}: {
  pixiData: UseSpine;
  children?: React.ReactNode;
}) => {
  const { animationList, spineAnimation } = pixiData;
  const [playButtonText, setPlayButtonText] = useState(
    spineAnimation?.state.timeScale === 0 ? "Play" : "Pause"
  );
  const handleOnPlay = () => {
    if (spineAnimation) {
      spineAnimation.state.timeScale =
        spineAnimation.state.timeScale === 1 ? 0 : 1;
      setPlayButtonText(
        spineAnimation?.state.timeScale === 0 ? "Play" : "Pause"
      );
    }
  };
  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:gap-6">
      <Button
        disabled={!animationList}
        className="w-full"
        onClick={handleOnPlay}
      >
        {playButtonText}
      </Button>
      <Button
        disabled={!animationList}
        className="w-full"
        onClick={() => pixiData.setStartingPositionAndScale()}
        variant="outline"
      >
        Reset Position
      </Button>
      {children}
    </div>
  );
};
