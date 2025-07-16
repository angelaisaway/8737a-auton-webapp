//all styling that doesnt include calculations to save space in field.js
const styles = {
  container: {
    position: "relative",
    display: "inline-block",
    width: 600,
    height: 600,
    userSelect: "none",
  },

  pathlines: {
    width: 600,
    height: 600,
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
  },

  triangle: {
    position: "absolute",
    top: 2,
    left: "50%",
    transform: "translateX(-50%)",
    width: 0,
    height: 0,
    borderLeft: "6px solid transparent",
    borderRight: "6px solid transparent",
    borderBottom: "10px solid red",
  },

  ctxoptions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
    padding: "4px",
    color: "black",
  },
};

export default styles;
