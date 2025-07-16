import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import { generateEZTemplateAuton } from "./utils/ezlogic.js";
import Field from "./components/field.js";
import Inputs from "./components/inputs.js";
import CodeOutput from "./components/outputs.js";

const defaultActions = () => ({
  "intake how many blocks?": 0,
  "outtake how many blocks?": 0,
  "stop here for (ms)": 0,
  "toggle outtaking piston": null,
  slew: false,
  "dir get to this point?": "fwd",
});

function App() {
  const [field, setField] = useState("auton");
  const [rotation, setRotation] = useState(0);
  const [points, setPoints] = useState([]);
  const [offsets, setOffsets] = useState({
    left: "",
    right: "",
    back: "",
    front: "",
  });
  const [currentHeading, setCurrentHeading] = useState(0);
  const [currentDirection, setCurrentDirection] = useState(1);
  const [selectedPointIndex, setSelectedPointIndex] = useState(null);

  const draggingPointIndex = useRef(null);
  const isDragging = useRef(false);
  const wasDragging = useRef(false);

  const fieldSizeInches = 144;
  const fieldImagePixels = 600;
  const scale = fieldSizeInches / fieldImagePixels;

  const [mirroredCorner, setMirroredCorner] = useState(false);
  const [editCode, setEditCode] = useState("");

  const clickTimeout = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("points");
    if (stored) setPoints(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("points", JSON.stringify(points));
  }, [points]);

  const isRobotInBounds = (dx, dy) => {
    const robotLeft = dx - offsets.left;
    const robotRight = dx + offsets.right;
    const robotBack = -dy - offsets.back;
    const robotFront = -dy + offsets.front;
    return (
      robotLeft >= -72 &&
      robotRight <= 72 &&
      robotBack >= -72 &&
      robotFront <= 72
    );
  };

  const handleOffsetChange = (e) => {
    const { name, value } = e.target;
    setOffsets((prev) => ({
      ...prev,
      [name]: value === "" ? "" : parseFloat(value),
    }));
  };

  const handleMouseDown = (index) => {
    draggingPointIndex.current = index;
    isDragging.current = true;
    wasDragging.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || draggingPointIndex.current === null) return;
    wasDragging.current = true;

    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();

    let rawX = e.clientX - rect.left;
    let rawY = e.clientY - rect.top;

    rawX = Math.max(0, Math.min(rawX, rect.width));
    rawY = Math.max(0, Math.min(rawY, rect.height));

    const dx = (rawX - rect.width / 2) * scale;
    const dy = (rawY - rect.height / 2) * scale;

    if (!isRobotInBounds(dx, dy)) return;

    const updated = [...points];
    updated[draggingPointIndex.current] = {
      ...updated[draggingPointIndex.current],
      x: dx,
      y: -dy,
      rawX,
      rawY,
    };
    setPoints(updated);
  };

  const handleMouseUp = () => {
    draggingPointIndex.current = null;
    setTimeout(() => {
      isDragging.current = false;
      wasDragging.current = false;
    }, 10);
  };

  const handleDoubleClick = (index) => {
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
    }
    setPoints(points.filter((_, i) => i !== index));
  };

  const handleClick = (e) => {
    if (wasDragging.current || clickTimeout.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    clickTimeout.current = setTimeout(() => {
      clickTimeout.current = null;
      if (rawX < 0 || rawY < 0 || rawX > rect.width || rawY > rect.height)
        return;

      const dx = (rawX - rect.width / 2) * scale;
      const dy = (rawY - rect.height / 2) * scale;

      if (!isRobotInBounds(dx, dy)) return;

      setPoints([
        ...points,
        {
          x: dx,
          y: -dy,
          rawX,
          rawY,
          heading: currentHeading,
          direction: currentDirection,
          offsets,
          actions: defaultActions(),
        },
      ]);
    }, 200);
  };

  const handleHeadingChange = (e) => {
    const newHeading = parseFloat(e.target.value) || 0;
    setCurrentHeading(newHeading);

    if (points.length > 0) {
      const updated = [...points];
      updated[points.length - 1] = {
        ...updated[points.length - 1],
        heading: newHeading,
      };
      setPoints(updated);
    }
  };

  const handleDirectionChange = (e) => {
    const newDirection = e.target.value;
    setCurrentDirection(newDirection);

    if (points.length > 0) {
      const updated = [...points];
      updated[points.length - 1] = {
        ...updated[points.length - 1],
        direction: newDirection,
      };
      setPoints(updated);
    }
  };

  const handleContextMenu = (e, index) => {
    e.preventDefault();
    setSelectedPointIndex(index);
  };

  return (
    <div className="App" style={{ userSelect: "none" }}>
      <h1>vex auton tool</h1>
      <Inputs
        rotation={rotation}
        setRotation={setRotation}
        setPoints={setPoints}
        offsets={offsets}
        handleOffsetChange={handleOffsetChange}
        currentHeading={currentHeading}
        handleHeadingChange={handleHeadingChange}
        currentDirection={currentDirection}
        handleDirectionChange={handleDirectionChange}
        points={points}
        fieldImagePixels={fieldImagePixels}
        scale={scale}
        mirroredCorner={mirroredCorner}
        setMirroredCorner={setMirroredCorner}
        field={field}
        setField={setField}
      />
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "20px",
          maxWidth: "1100px",
          margin: "20px",
        }}
      >
        <Field
          points={points}
          setPoints={setPoints}
          rotation={rotation}
          offsets={offsets}
          scale={scale}
          handleClick={handleClick}
          handleMouseDown={handleMouseDown}
          handleDoubleClick={handleDoubleClick}
          handleMouseMove={handleMouseMove}
          handleMouseUp={handleMouseUp}
          handleContextMenu={handleContextMenu}
          selectedPointIndex={selectedPointIndex}
          mirroredCorner={mirroredCorner}
          field={field}
        />
        <CodeOutput
          code={generateEZTemplateAuton({ points, mirroredCorner })}
          editCode={editCode}
          setEditCode={setEditCode}
        />
      </div>
    </div>
  );
}

export default App;
// ...end of file...
