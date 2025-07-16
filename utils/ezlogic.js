function generateEZTemplateAuton({ points, mirroredCorner }) {
  const codeLines = [
    "// EZ-Template Auton Path",
    "chassis.pid_odom_behavior_set(ez::shortest);",
    "chassis.slew_drive_constants_set(distance, limited_speed); // set the slew drive constants",
    "",
  ];

  if (mirroredCorner) {
    codeLines.push("odom_x_flip();");
    codeLines.push("");
  }

  points.forEach((point, i) => {
    const x = point.x?.toFixed(3) ?? 0;
    const y = point.y?.toFixed(3) ?? 0;
    const heading = point.heading ?? 0;
    const {
      "intake how many blocks?": intake = 0,
      "outtake how many blocks?": outtake = 0,
      "stop here for (ms)": wait = 0,
      slew = false,
      "toggle outtaking piston": piston,
      "dir get to this point?": direction = "fwd",
    } = point ?? {};

    if (i === 0) {
      codeLines.push("// starting pos:");
      codeLines.push(`chassis.odom_xyt_set(${x}, ${y}, ${heading});`);
      codeLines.push("");
    } else {
      codeLines.push(`// Move to point ${i + 1}`);
      codeLines.push(
        `chassis.pid_odom_set({ ${x}, ${y} }, ${direction}, ${heading}, ${slew});`
      );
    }

    if (wait > 0) codeLines.push(`// stop and wait here for ${wait} ms`);
    if (intake > 0) codeLines.push(`// intake ${intake} blocks`);
    if (outtake > 0) codeLines.push(`// outtake ${outtake} blocks`);
    if (piston !== undefined && piston !== null)
      codeLines.push(
        `// set the piston controlling outtake height to ${piston}`
      );

    codeLines.push("");
  });

  codeLines.push("chassis.pid_wait();");

  return codeLines.join("\n");
}

export { generateEZTemplateAuton };
