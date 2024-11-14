"use client";
import React, { useEffect, useRef, FC, useState, Component } from "react";
import { CSSProperties } from "react";

/** Propsの型定義 */
interface PropsType {
  style?: CSSProperties;
  color?: string;
}
interface CircleInfo {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  stroke?: string;
  stroke_width: number;
}
interface QCircleInfo {
  cx: number;
  cy: number;
  r: number;
  thetaStart: number;
  thetaEnd: number;
  fill: string;
}

interface LentiCircleInfo {
  cx: number;
  cy: number;
  r: number;
  colors: string[];
  stroke?: string;
  stroke_width: number;
}
interface LentiArrayInfo {
  x0: number;
  y0: number;
  sideN: number;
  tallN?: number;
  r: number;
  highlightId?: number;
  color2dAry: string[][];
}
const CircleSVG = (props: CircleInfo) => {
  return (
    <circle
      cx={props.cx}
      cy={props.cy}
      r={props.r}
      fill={props.fill}
      stroke={props.stroke ?? "none"}
      strokeWidth={props.stroke_width}
    />
  );
};

const QCircle = (props: QCircleInfo) => {
  var cx = props.cx;
  var cy = props.cy;
  var r = props.r;
  var color = props.fill;
  var startX = Math.round(r * Math.cos(props.thetaStart) + cx);
  var endX = Math.round(r * Math.cos(props.thetaEnd) + cx);
  var startY = Math.round(r * Math.sin(props.thetaStart) + cy);
  var endY = Math.round(r * Math.sin(props.thetaEnd) + cy);
  var dx = endX - startX;
  var dy = endY - startY;
  return (
    <path
      d={`M ${cx},${cy} L ${startX},${startY} a ${r} ${r} 0 0 1 ${dx} ${dy} z`}
      fill={color ?? "black"}
      stroke="none"
    />
  );
};
const LentiCircle = (props: LentiCircleInfo) => {
  var theta0 = -Math.PI / 4;
  var dTheta = (2 * Math.PI) / props.colors.length;
  return props.colors.map((color, index) => {
    if (index < props.colors.length - 1) {
      return (
        <QCircle
          key={`lenth${index}`}
          cx={props.cx}
          cy={props.cy}
          r={props.r}
          thetaStart={index * dTheta + theta0}
          thetaEnd={(index + 1) * dTheta + theta0}
          fill={color}
        />
      );
    } else {
      return (
        <>
          <QCircle
            key={`lenth${index}`}
            cx={props.cx}
            cy={props.cy}
            r={props.r}
            thetaStart={index * dTheta + theta0}
            thetaEnd={(index + 1) * dTheta + theta0}
            fill={color}
          />
          <CircleSVG
            key={`outline${index}`}
            cx={props.cx}
            cy={props.cy}
            r={props.r}
            fill="none"
            stroke={props.stroke ?? "red"}
            stroke_width={props.stroke_width}
          />
        </>
      );
    }
  });
};
const LentiArray = (props: LentiArrayInfo) => {
  return props.color2dAry.map((colors, index) => {
    var cx = 2 * (index % props.sideN) * props.r + props.r + props.x0;
    var cy =
      (2 * props.r * Math.floor(index / props.sideN) * Math.sqrt(3)) / 2 +
      props.y0;
    if (Math.floor(index / props.sideN) % 2 == 1) {
      cx += props.r;
    }
    return (
      <LentiCircle
        key={`lc${index}`}
        cx={cx}
        cy={cy}
        r={props.r}
        colors={colors}
        stroke="red"
        stroke_width={index == props.highlightId ? props.r / 10 : 0}
      />
    );
  });
};
export default function Home() {
  const [cid, setCid] = useState(0);
  const [sideN, setSideN] = useState(10);
  const [tallN, setTallN] = useState(10);
  var [color2dAry, setColor2dAry] = useState<string[][]>(
    Array(sideN * tallN).fill(["#000000", "#ff0000", "#00ff00", "#0000ff"])
  );
  const [radius, setRadius] = useState(30);
  useEffect(() => {
    setColor2dAry(
      Array(sideN * tallN).fill(["#000000", "#ff0000", "#00ff00", "#0000ff"])
    );
  }, [sideN, tallN]);
  const [c1, setC1] = useState("");
  const [c2, setC2] = useState("");
  const [c3, setC3] = useState("");
  const [c4, setC4] = useState("");
  const [text, setText] = useState(
    `${sideN},${tallN},${radius}\n${color2dAry
      .map((x) => x.join(","))
      .join("\n")}`
  );
  const [isEditMode, setEditMode] = useState(false);
  const [isMonoview, setMonoview] = useState(false);
  let editUI = isEditMode ? (
    <div>
      Width:
      <input
        type="number"
        min="1"
        value={sideN}
        onChange={(e) => {
          setSideN(Number(e.target.value));
        }}
        placeholder="CID"
      />
      Height:
      <input
        type="number"
        min="1"
        value={tallN}
        onChange={(e) => {
          setTallN(Number(e.target.value));
        }}
        placeholder="CID"
      />
      Radius:
      <input
        type="number"
        min="1"
        value={radius}
        onChange={(e) => {
          setRadius(Number(e.target.value));
        }}
        placeholder="CID"
      />
      <br></br>
      <input
        type="number"
        min="0"
        max={sideN * tallN - 1}
        value={cid}
        onChange={(e) => {
          setCid(Number(e.target.value));
          setC1(color2dAry[cid][0]);
          setC2(color2dAry[cid][1]);
          setC3(color2dAry[cid][2]);
          setC4(color2dAry[cid][3]);
        }}
        placeholder="CID"
      />
      <input
        type="text"
        value={c1}
        onChange={(event) => setC1(event.target.value)}
      ></input>
      <input
        type="text"
        value={c2}
        onChange={(event) => setC2(event.target.value)}
      ></input>
      <input
        type="text"
        value={c3}
        onChange={(event) => setC3(event.target.value)}
      ></input>
      <input
        type="text"
        value={c4}
        onChange={(event) => setC4(event.target.value)}
      ></input>
      <button
        onClick={function () {
          setColor2dAry(
            color2dAry.map((x, index) => (index == cid ? [c1, c2, c3, c4] : x))
          );
        }}
      >
        OK
      </button>
      <br></br>
    </div>
  ) : (
    <div></div>
  );
  return (
    <div>
      <input
        type="checkbox"
        checked={isEditMode}
        onChange={() => setEditMode(!isEditMode)}
      />
      Enable Edit UI
      {editUI}
      <input
        type="checkbox"
        checked={isMonoview}
        onChange={() => setMonoview(!isMonoview)}
      />
      Monoview
      <br></br>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
        }}
      />
      <button
        onClick={function () {
          var lines = text.split("\n");
          setSideN(Number(lines[0].split(",")[0]));
          setTallN(Number(lines[0].split(",")[1]));
          setRadius(Number(lines[0].split(",")[2]));
          let newColors;
          if (isMonoview) {
            newColors = lines.slice(1).map((line) => {
              var fields = line.split(",");
              return [fields[0], fields[0], fields[0], fields[0]];
            });
          } else {
            newColors = lines.slice(1).map((line) => {
              var fields = line.split(",");
              return fields;
            });
          }
          setColor2dAry(newColors);
        }}
      >
        ToSVG
      </button>
      {/*
      <button
        onClick={function () {
          setText(
            `${sideN},${tallN},${radius}\n${color2dAry
              .map((x) => x.join(","))
              .join("\n")}`
          );
        }}
      >
        FromSVG
      </button>
      */}
      <svg
        width="3000"
        height="3000"
        viewBox="0 0 3000 3000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <LentiArray
          x0={50}
          y0={50}
          sideN={sideN}
          r={radius}
          color2dAry={color2dAry}
          highlightId={isEditMode ? cid : undefined}
        />
      </svg>
    </div>
  );
}
