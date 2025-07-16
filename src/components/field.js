import React, { useState, useRef, useEffect } from "react";
import autonField from "../assets/jerryfield.png";
import skillsField from "../assets/skillspath.png";
import styles from "../utils/styling.js";

function Field({
  points,
  setPoints,
  rotation,
  offsets,
  scale,
  handleClick,
  handleMouseDown,
  handleDoubleClick,
  handleMouseMove,
  handleMouseUp,
  handleContextMenu,
  selectedPointIndex,
  mirroredCorner,
  field,
}) {
  const image = field === "skills" ? skillsField : autonField;
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const containerRef = useRef(null);
  const [menu, setMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    index: null,
  });
  const menuRef = useRef(null);
  const fieldSize = 600;
  const fieldCenterX = fieldSize / 2;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menu.visible &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setMenu({ visible: false, x: 0, y: 0, index: null });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menu.visible]);

  useEffect(() => {
    if (hoveredIndex !== null && hoveredIndex >= points.length) {
      setHoveredIndex(null);
    }
  }, [points, hoveredIndex]);

  const getDisplayPoint = (pt) => {
    const rawX = mirroredCorner ? 2 * fieldCenterX - pt.rawX : pt.rawX;
    const heading = mirroredCorner
      ? (360 - (pt.heading ?? 0)) % 360
      : pt.heading ?? 0;
    return { ...pt, rawX, heading };
  };

  return (
    <div
      ref={containerRef}
      style={styles.container}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="image"
    >
      <img
        src={image}
        alt="VEX Field"
        style={{
          width: fieldSize,
          height: fieldSize,
          transform: `rotate(${rotation}deg)`,
          transition: "transform 0.3s ease",
          pointerEvents: "none",
          userSelect: "none",
        }}
        draggable={false}
      />

      <svg style={styles.pathlines}>
        {points.map((p, i) => {
          if (i === 0) return null;
          const a = getDisplayPoint(points[i - 1]);
          const b = getDisplayPoint(p);
          return (
            <line
              key={i}
              x1={a.rawX}
              y1={a.rawY}
              x2={b.rawX}
              y2={b.rawY}
              stroke="black"
              strokeWidth="2"
            />
          );
        })}

        {hoveredIndex !== null &&
          points[hoveredIndex] &&
          (() => {
            const pt = getDisplayPoint(points[hoveredIndex]);
            const ang = (pt.heading ?? 0) + 90;
            const rad = (ang * Math.PI) / 180;
            const len = 300;
            const x2 = pt.rawX + len * Math.cos(rad);
            const y2 = pt.rawY - len * Math.sin(rad);
            return (
              <line
                key={`hover-heading`}
                x1={pt.rawX}
                y1={pt.rawY}
                x2={x2}
                y2={y2}
                stroke="rgba(255,0,0,0.6)"
                strokeWidth="2"
              />
            );
          })()}
      </svg>

      {points.map((pt, i) => {
        const dp = getDisplayPoint(pt);
        const boxW = (offsets.left + offsets.right) / scale;
        const boxH = (offsets.front + offsets.back) / scale;
        const top =
          pt.rawY - boxH / 2 + (offsets.front - offsets.back) / (2 * scale);
        const left =
          dp.rawX - boxW / 2 + (offsets.right - offsets.left) / (2 * scale);

        const handleWheel = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const delta = e.deltaY < 0 ? 1 : -1;
          const newHeading = ((pt.heading ?? 0) + delta + 360) % 360;
          const updatedPoints = [...points];
          updatedPoints[i] = { ...pt, heading: newHeading };
          setPoints(updatedPoints);
        };

        const onCtx = (e) => {
          e.preventDefault();
          handleContextMenu(e, i);
          setMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            index: i,
          });
        };

        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: "absolute",
                top,
                left,
                width: boxW,
                height: boxH,
                pointerEvents: "none",
                transform: `rotate(${-dp.heading}deg)`,
                transformOrigin: "center center",
                border: "2px solid blue",
                backgroundColor: "rgba(255,255,255,0.3)",
              }}
            >
              <div style={styles.triangle} />
            </div>

            <div
              onMouseDown={() => handleMouseDown(i)}
              onDoubleClick={() => handleDoubleClick(i)}
              onContextMenu={onCtx}
              onWheel={handleWheel}
              onMouseEnter={() => {
                setHoveredIndex(i);
                document.body.style.overflow = "hidden";
              }}
              onMouseLeave={() => {
                setHoveredIndex(null);
                document.body.style.overflow = "";
              }}
              style={{
                position: "absolute",
                top: pt.rawY - 5,
                left: dp.rawX - 5,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background:
                  selectedPointIndex === i && menu.visible ? "orange" : "red",
                cursor: "grab",
                zIndex: 2,
              }}
            />

            <div
              style={{
                position: "absolute",
                top: pt.rawY - 20,
                left: dp.rawX + 10,
                fontSize: 12,
                padding: "2px 4px",
                background: "black",
                borderRadius: 4,
                pointerEvents: "none",
                zIndex: 1,
                whiteSpace: "nowrap",
              }}
            >
              ({Math.round(pt.x)}, {Math.round(pt.y)}) @{" "}
              {Math.round(dp.heading)}°
            </div>
          </React.Fragment>
        );
      })}

      {menu.visible && points[menu.index] && (
        <div
          ref={menuRef}
          className="context-menu"
          style={{
            position: "fixed",
            top: menu.y,
            left: menu.x,
            zIndex: 100,
          }}
          onMouseLeave={() =>
            setMenu({ visible: false, x: 0, y: 0, index: null })
          }
          onClick={(e) => e.stopPropagation()}
        >
          <div style={styles.ctxoptions}>
            {[
              "intake how many blocks?",
              "outtake how many blocks?",
              "stop here for (ms)",
            ].map((key) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "left",
                  padding: "4px",
                }}
              >
                <label style={{ marginRight: "6px" }}>
                  {key.replace(/([A-Z])/g, " $1").toLowerCase()}:
                </label>
                <input
                  type="number"
                  value={points[menu.index]?.[key] ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    const newValue = val === "" ? "" : parseFloat(val);
                    const updated = [...points];
                    updated[menu.index] = {
                      ...updated[menu.index],
                      [key]: newValue,
                    };
                    setPoints(updated);
                  }}
                  style={{ width: "60px" }}
                />
              </div>
            ))}

            {[
              "toggle outtaking piston",
              "slew to the next point?",
              "dir get to this point?",
            ].map((key) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "left",
                  padding: "4px",
                }}
              >
                <label style={{ marginRight: "6px" }}>
                  {key.replace(/([A-Z])/g, " $1").toLowerCase()}:
                </label>
                {key === "slew to the next point?" ? (
                  <input
                    type="checkbox"
                    checked={!!points[menu.index]?.slew}
                    onChange={(e) => {
                      const updated = [...points];
                      updated[menu.index] = {
                        ...updated[menu.index],
                        slew: e.target.checked,
                      };
                      setPoints(updated);
                    }}
                  />
                ) : (
                  <select
                    value={points[menu.index]?.[key] ?? ""}
                    onChange={(e) => {
                      const updated = [...points];
                      updated[menu.index] = {
                        ...updated[menu.index],
                        [key]: e.target.value === "" ? null : e.target.value,
                      };
                      setPoints(updated);
                    }}
                  >
                    {key === "toggle outtaking piston" && (
                      <>
                        <option value="true">side (high)</option>
                        <option value="false">center (low)</option>
                      </>
                    )}
                    {key === "dir get to this point?" && (
                      <>
                        <option value="fwd">forward</option>
                        <option value="rev">backward</option>
                      </>
                    )}
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Field;
