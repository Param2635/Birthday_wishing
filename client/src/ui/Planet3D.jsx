import React from "react";

export default function Planet3D({ className }) {
  return (
    <div className={className} aria-hidden="true">
      <div className="planet">
        <div className="planetGlow" />
        <div className="planetSurface" />
        <div className="planetShine" />
        <div className="ring ringBack" />
        <div className="ring ringFront" />
      </div>
    </div>
  );
}

