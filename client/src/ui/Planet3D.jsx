import React from "react";

export default function Planet3D({ className, active = false, onClick }) {
  return (
    <div
      className={`${className} ${active ? "planetActive" : ""}`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={active ? "Close solar system" : "Open solar system"}
    >
      {!active ? (
        <div className="planet">
          <div className="planetGlow" />
          <div className="planetSurface" />
          <div className="planetShine" />
          <div className="ring ringBack" />
          <div className="ring ringFront" />
        </div>
      ) : (
        <div className="solarSystem">
          <div className="sun" />
          <div className="orbit orbit1">
            <div className="planet mercury" />
          </div>
          <div className="orbit orbit2">
            <div className="planet venus" />
          </div>
          <div className="orbit orbit3">
            <div className="planet earth" />
          </div>
          <div className="orbit orbit4">
            <div className="planet mars" />
          </div>
          <div className="orbit orbit5">
            <div className="planet jupiter" />
          </div>
        </div>
      )}
    </div>
  );
}

