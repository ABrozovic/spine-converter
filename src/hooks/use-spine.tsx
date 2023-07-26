/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useGesture } from "@use-gesture/react";
import {
  SpineDebugRenderer,
  type IAnimation,
  type ITimeline,
  type Spine,
} from "pixi-spine";
import * as PIXI from "pixi.js";

export type UseSpine = {
  init: (spine: Spine) => void;
  animationList: IAnimation<ITimeline>[] | undefined;
  playAnimation: (index: number) => void;
  setStartingPositionAndScale: () => void;
  toggleDebugMode: () => void;
  spineAnimation: Spine | null | undefined;
  position: PIXI.ObservablePoint<any> | undefined;
  scale: PIXI.ObservablePoint<any> | undefined;
  render: React.JSX.Element;
};
const useSpine = (): UseSpine => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [animationList, setAnimationList] = useState<
    IAnimation<ITimeline>[] | undefined
  >();
  const appRef = useRef<PIXI.Application | null>(null);
  const spineAnimationRef = useRef<Spine | undefined | null>();
  const spineAnimationOriginalHeight = useRef(0);
  const debugModeRef = useRef(false);
  const dragTarget = useRef<PIXI.DisplayObject | undefined | null>();

  const bindGestures = useGesture({
    onWheel: ({ _delta, wheeling }) => {
      wheeling && onWheel(_delta[1]);
    },
    onPinch: ({ offset: [d], lastOffset: [oldD], pinching }) => {
      const currentScale = spineAnimationRef.current?.scale.x ?? 0;
      const modifier = d < oldD ? 0.9 : 1.1;
      pinching && setAnimationScale(currentScale * modifier);
    },
    onDrag: ({ delta, dragging }) => {
      if (dragTarget.current) {
        dragTarget.current.position.set(
          dragTarget.current.position.x + delta[0],
          dragTarget.current.position.y + delta[1]
        );
      }
      if (!dragging) dragTarget.current = null;
    },
  });

  useLayoutEffect(() => {
    if (canvasRef.current) {
      const canvasParentElement = canvasRef.current.parentElement;

      if (!canvasParentElement) return;

      appRef.current = new PIXI.Application({
        height: canvasParentElement.clientHeight,
        width: canvasParentElement.clientWidth,
        view: canvasRef.current,
        resolution: window.devicePixelRatio,
      });

      const preventDefaultWheel = (wheel: WheelEvent) => wheel.preventDefault();
      canvasRef.current.addEventListener("wheel", preventDefaultWheel, {
        passive: false,
      });

      appRef.current.stage.interactive = true;
      appRef.current.stage.eventMode = "dynamic";
      appRef.current.stage.hitArea = appRef.current.screen;
    }
  }, []);

  const onWheel = (deltaY: number) => {
    const currentScale = spineAnimationRef.current?.scale.x ?? 0;
    const modifier = deltaY > 0 ? 0.7 : 1.7;
    setAnimationScale(currentScale * modifier);
  };

  const onPointerDown = () => {
    const stage = appRef.current?.stage;
    if (stage) {
      dragTarget.current = appRef.current?.stage.children[0];
    }
  };

  const removeCurrentAnimation = () => {
    if (!spineAnimationRef.current) return;
    appRef.current?.stage.removeChildren();
    spineAnimationRef.current = null;
  };
  const setAnimationScale = useCallback((scale: number, recursionStep = 0) => {
    const animationSpeed = 0.05;
    const spineAnimation = spineAnimationRef.current;

    if (spineAnimation) {
      const currentScale = spineAnimation.scale.x;
      const targetScale = scale;
      const deltaScale = (targetScale - currentScale) * animationSpeed;

      if (recursionStep >= 100) {
        console.warn(
          "Reached the maximum of scale recursion steps. Exiting the recursion."
        );
        return;
      }
      spineAnimation.scale.set(currentScale + deltaScale);

      if (Math.abs(deltaScale) > 0.01) {
        requestAnimationFrame(() =>
          setAnimationScale(scale, recursionStep + 1)
        );
      }
    }
  }, []);
  const setStartingPositionAndScale = useCallback(() => {
    if (!canvasRef.current || !spineAnimationRef.current) return;
    setAnimationPosition(
      Math.round(canvasRef.current.clientWidth * 0.5),
      canvasRef.current.offsetHeight
    );
    const canvasHeight =
      canvasRef?.current?.parentElement?.clientHeight ??
      spineAnimationOriginalHeight.current;
    const spineScale =
      (canvasHeight / spineAnimationOriginalHeight.current) * 0.7;
    setAnimationScale(spineScale);
  }, [setAnimationScale]);

  const init = useCallback(
    (spine: Spine) => {
      if (!canvasRef || !appRef.current) return;
      const setSpineInstance = (spine: Spine) => {
        appRef.current?.stage.addChild(spine);
        spine.eventMode = "dynamic";
        spine.interactive = true;
        spine.cursor = "pointer";
        spine.on("pointerdown", onPointerDown, spine);
      };

      removeCurrentAnimation();
      spineAnimationOriginalHeight.current = spine.getBounds().height;
      spineAnimationRef.current = spine;

      setStartingPositionAndScale();
      setAnimationList(spineAnimationRef.current?.spineData.animations);

      setSpineInstance(spine);
    },
    [setStartingPositionAndScale]
  );

  const setAnimationPosition = (x: number, y: number) => {
    spineAnimationRef.current?.position.set(x, y);
  };

  const toggleDebugMode = () => {
    if (!spineAnimationRef.current) return;
    debugModeRef.current = !debugModeRef.current;
    // @ts-expect-error "TODO: Check if there's a better approach"
    spineAnimationRef.current.debug = debugModeRef.current
      ? new SpineDebugRenderer()
      : null;
  };

  const playAnimation = (index: number) => {
    const animation = spineAnimationRef.current?.spineData.animations[index];
    if (!animation) return;
    spineAnimationRef.current?.state.setAnimation(0, animation.name, true);
  };

  const memoizedCanvas = React.useMemo(
    () => (
      <canvas
        {...bindGestures()}
        className="h-full w-full touch-none"
        ref={canvasRef}
      />
    ),
    [bindGestures]
  );

  return {
    init,
    animationList,
    playAnimation,
    setStartingPositionAndScale,
    toggleDebugMode,
    spineAnimation: spineAnimationRef.current,
    position: spineAnimationRef.current?.position,
    scale: spineAnimationRef.current?.scale,
    render: memoizedCanvas,
  };
};

export default useSpine;
