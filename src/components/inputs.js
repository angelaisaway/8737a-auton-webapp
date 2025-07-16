function Inputs({
  rotation,
  setRotation,
  setPoints,
  offsets,
  handleOffsetChange,
  currentHeading,
  handleHeadingChange,
  currentDirection,
  handleDirectionChange,
  mirroredCorner,
  setMirroredCorner,
  field,
  setField,
}) {
  return (
    <div>
      {/* First line of buttons */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setField(field === "auton" ? "skills" : "auton")}
          style={{ backgroundColor: "rgb(4, 126, 12)", color: "white" }}
        >
          switch to {field === "auton" ? "skills" : "auton"} field
        </button>
        <button
          onClick={() => setRotation(0)}
          style={{
            backgroundColor: "rgb(247, 82, 70)",
            color: "white",
            marginLeft: "10px",
          }}
        >
          red alliance
        </button>
        <button
          onClick={() => setRotation(180)}
          style={{
            marginLeft: "10px",
            backgroundColor: "rgb(70, 123, 247)",
            color: "white",
          }}
        >
          blue alliance
        </button>
        <button onClick={() => setPoints([])} style={{ marginLeft: "10px" }}>
          clear points
        </button>
        <button
          onClick={() => setMirroredCorner((prev) => !prev)}
          style={{ marginLeft: "10px" }}
        >
          mirror auton for opposite corner
        </button>
      </div>

      {/* Second line of inputs for heading and direction */}
      <div style={{ marginBottom: "20px" }}>
        {["left", "right", "back", "front"].map((side) => (
          <label key={side} style={{ marginRight: "10px" }}>
            {side}:
            <input
              type="number"
              step="0.001"
              name={side}
              value={offsets[side]}
              onChange={handleOffsetChange}
              style={{ marginLeft: "4px" }}
            />
          </label>
        ))}
        <br />
        <label style={{ marginLeft: "0px", marginTop: "50px" }}>
          heading of last added point:
          <input
            type="number"
            name="heading"
            value={currentHeading}
            onChange={handleHeadingChange}
            style={{ marginLeft: "4px", width: "60px" }}
          />
        </label>
      </div>
    </div>
  );
}

export default Inputs;
