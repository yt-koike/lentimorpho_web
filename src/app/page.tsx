"use client";
import React, { useEffect, useState } from "react";
import { SketchPicker } from "react-color";

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
  monoviewId?: number;
}
interface LentiArrayInfo {
  x0: number;
  y0: number;
  sideN: number;
  tallN?: number;
  monoviewId?: number;
  r: number;
  highlightId?: number;
  color2dAry: string[][];
}
function changeColor(
  relativeX: number,
  relativeY: number,
  color2dAry: string[][],
  setColor2dAry: React.Dispatch<React.SetStateAction<string[][]>>,
  color: string,
  imgId: number,
  r: number,
  sideN: number
) {
  const x0 = 0;
  const y0 = 0;
  const rowIdx = Math.floor((relativeY - y0) / (r * Math.sqrt(3)));
  const colIdx =
    rowIdx % 2 == 0
      ? Math.floor((relativeX - x0) / (r * 2))
      : Math.floor((relativeX - x0 - r) / (r * 2));
  const cid = sideN * rowIdx + colIdx;
  setColor2dAry(
    color2dAry.map((colors, index) => {
      if (index != cid) {
        return colors;
      }
      const c = colors.concat();
      c[imgId] = color;
      return c;
    })
  );
}

function downloadSvgAsSvg() {
  // https://qiita.com/yo16/items/014fffcf89a80fc2392a
  // svg要素を取得
  const svgNode = document.getElementById("svg");
  if (svgNode == null) return;
  const svgText = new XMLSerializer().serializeToString(svgNode);
  const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  // a要素を作ってダウンロード
  const a = document.createElement("a");
  a.href = svgUrl;
  a.download = `Lenticular.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(svgUrl);
}

function changeColorTouch(
  e: React.TouchEvent<SVGSVGElement>,
  color2dAry: string[][],
  setColor2dAry: React.Dispatch<React.SetStateAction<string[][]>>,
  color: string,
  imgId: number,
  r: number,
  sideN: number
) {
  const svgCanvas = document.getElementById("svg");
  const x =
    e.touches[0].clientX - (svgCanvas?.getBoundingClientRect().left ?? 0);
  const y =
    e.touches[0].clientY - (svgCanvas?.getBoundingClientRect().top ?? 0);
  changeColor(x, y, color2dAry, setColor2dAry, color, imgId, r, sideN);
}
function changeColorClick(
  e: React.MouseEvent<SVGSVGElement, MouseEvent>,
  color2dAry: string[][],
  setColor2dAry: React.Dispatch<React.SetStateAction<string[][]>>,
  color: string,
  imgId: number,
  r: number,
  sideN: number
) {
  const svgCanvas = document.getElementById("svg");
  const x = e.clientX - (svgCanvas?.getBoundingClientRect().left ?? 0);
  const y = e.clientY - (svgCanvas?.getBoundingClientRect().top ?? 0);
  changeColor(x, y, color2dAry, setColor2dAry, color, imgId, r, sideN);
}
const QCircle = (props: QCircleInfo) => {
  const cx = props.cx;
  const cy = props.cy;
  const r = props.r;
  const color = props.fill;
  const startX = Math.round(r * Math.cos(props.thetaStart) + cx);
  const endX = Math.round(r * Math.cos(props.thetaEnd) + cx);
  const startY = Math.round(r * Math.sin(props.thetaStart) + cy);
  const endY = Math.round(r * Math.sin(props.thetaEnd) + cy);
  const dx = endX - startX;
  const dy = endY - startY;
  return (
    <path
      d={`M ${cx},${cy} L ${startX},${startY} a ${r} ${r} 0 0 1 ${dx} ${dy} z`}
      fill={color ?? "black"}
      stroke="none"
    />
  );
};
const LentiCircle = (props: LentiCircleInfo) => {
  const theta0 = -Math.PI / 4;
  const colors =
    props.monoviewId == null
      ? props.colors
      : [
          props.colors[props.monoviewId],
          props.colors[props.monoviewId],
          props.colors[props.monoviewId],
          props.colors[props.monoviewId],
        ];
  const dTheta = (2 * Math.PI) / colors.length;
  return colors.map((color, index) => (
    <QCircle
      key={`${props.cx}${props.cy}lenti${index}`}
      cx={props.cx}
      cy={props.cy}
      r={props.r}
      thetaStart={index * dTheta + theta0}
      thetaEnd={(index + 1) * dTheta + theta0}
      fill={color}
    />
  ));
};
const LentiArray = (props: LentiArrayInfo) => {
  return props.color2dAry.map((colors, index) => {
    let cx = 2 * (index % props.sideN) * props.r + (props.r + props.x0);
    const cy =
      (2 * props.r * Math.floor(index / props.sideN) * Math.sqrt(3)) / 2 +
      (props.r + props.y0);
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
        monoviewId={props.monoviewId}
      />
    );
  });
};

export default function Home() {
  const [cid, setCid] = useState(0);
  const [sideN, setSideN] = useState(5);
  const [tallN, setTallN] = useState(5);
  const [svgWidth, setSvgWidth] = useState(500);
  const [svgHeight, setSvgHeight] = useState(500);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isTouchDown, setIsTouchDown] = useState(false);
  const [selectedColorHex, setSelectedColorHex] = useState("");
  const [color2dAry, setColor2dAry] = useState<string[][]>(
    Array(sideN * tallN).fill(["#000000", "#ff0000", "#00ff00", "#0000ff"])
  );
  const [ip, setIp] = useState("");
  const [operation, setOperation] = useState("");
  const [radius, setRadius] = useState(30);

  useEffect(() => {
    setText(
      `${sideN},${tallN},${radius}\n${color2dAry
        .map((x) => x.join(","))
        .join("\n")}`
    );
  }, [sideN, tallN, radius, color2dAry]);
  const [c1, setC1] = useState("");
  const [c2, setC2] = useState("");
  const [c3, setC3] = useState("");
  const [c4, setC4] = useState("");
  const [text, setText] = useState(
    `${sideN},${tallN},${radius}\n${color2dAry
      .map((x) => x.join(","))
      .join("\n")}`
  );
  const [isShowEditUI, setEditMode] = useState(false);
  const [isPenOn, setIsPenOn] = useState(false);
  const [isPumpOn, setIsPumpOn] = useState(false);
  const [isMonoview, setMonoview] = useState(false);
  const [monoviewId, setMonoviewId] = useState(0);
  const editUI = isShowEditUI ? (
    <div>
      Width:
      <input
        type="number"
        min="1"
        value={svgWidth}
        onChange={(e) => {
          setSvgWidth(Number(e.target.value));
        }}
      />
      Height:
      <input
        type="number"
        min="1"
        value={svgHeight}
        onChange={(e) => {
          setSvgHeight(Number(e.target.value));
        }}
      />
      <br></br>
      SideN:
      <input
        type="number"
        min="1"
        value={sideN}
        onChange={(e) => {
          setSideN(Number(e.target.value));
        }}
        placeholder="CID"
      />
      TallN:
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
      <SketchPicker
        color={selectedColorHex}
        onChange={(color: { hex: React.SetStateAction<string> }) =>
          setSelectedColorHex(color.hex)
        }
      />
      <button
        onClick={function () {
          setColor2dAry(
            color2dAry.map((x) => {
              const colors = x;
              colors[monoviewId] = selectedColorHex;
              return colors;
            })
          );
        }}
      >
        Fill
      </button>
    </div>
  ) : (
    <div></div>
  );
  useEffect(() => {
    if (isShowEditUI) {
      setIsPenOn(true);
    }
  }, [isShowEditUI]);

  const UI = (
    <div id="UIs" style={{ overflow: "hidden" }}>
      <div id="editui" style={{ float: "left" }}>
        <button onClick={() => setEditMode(!isShowEditUI)}>
          <div style={{ width: "50px", height: "50px" }}>
            <img
              src="./spanner-wrench-svgrepo-com.svg"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            ></img>
          </div>
        </button>
        {editUI}
      </div>

      <div style={{ float: "left" }}>
        <button onClick={() => setIsPenOn(!isPenOn)}>
          <div style={{ width: "50px", height: "50px" }}>
            {isPenOn ? (
              <img
                src="./1021031_pen_icon.png"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              ></img>
            ) : (
              <></>
            )}
          </div>
        </button>
      </div>
      <div style={{ float: "left" }}>
        <button onClick={() => downloadSvgAsSvg()}>
          <div style={{ width: "50px", height: "50px" }}>
            <img
              src="./downloads.png"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            ></img>
          </div>
        </button>
      </div>
      <div style={{ float: "left" }}>
        <button onClick={() => setIsPumpOn(!isPumpOn)}>
          <div style={{ width: "50px", height: "50px" }}>Pump</div>
        </button>
        {isPumpOn ? (
          <ul style={{ flex: "wrap", float: "right", listStyle: "none" }}>
            <li>
              {" "}
              <input
                type="text"
                placeholder="IP address"
                onChange={(e) => setIp(e.target.value)}
                value={ip}
              ></input>
            </li>
            <li>
              <input
                type="text"
                placeholder="Operation"
                onChange={(e) => setOperation(e.target.value)}
                value={operation}
              ></input>
            </li>
            <li>
              <button
                onClick={() =>
                  fetch(`http://${ip}/${operation}`, {
                    method: "GET",
                  })
                }
              >
                Send http://{ip}/{operation}
              </button>
            </li>
          </ul>
        ) : (
          <></>
        )}
      </div>
      <div style={{ float: "left" }}>
        <button onClick={() => setMonoview(!isMonoview)}>
          {" "}
          <div style={{ width: "50px", height: "50px" }}>
            {isMonoview ? "To Multi" : "To Mono"}
          </div>
        </button>
        {isMonoview ? (
          <input
            type="number"
            min="0"
            max="3"
            value={monoviewId}
            onChange={(e) => {
              setMonoviewId(Number(e.target.value));
            }}
          />
        ) : (
          <></>
        )}
      </div>
      <textarea
        value={text}
        style={{ float: "left" }}
        onChange={(e) => {
          setText(e.target.value);
        }}
      />
      <button
        onClick={function () {
          const lines = text.split("\n");
          const newSideN = Number(lines[0].split(",")[0]);
          const newTallN = Number(lines[0].split(",")[1]);
          const newColors = lines.slice(1).map((line) => {
            const fields = line.split(",");
            return fields;
          });
          setColor2dAry(newColors);
          setSideN(newSideN);
          setTallN(newTallN);
          setRadius(Number(lines[0].split(",")[2]));
          setSvgWidth(newSideN * radius * 2 + radius);
          setSvgHeight(newTallN * radius * 2);
          setColor2dAry(newColors);
        }}
      >
        ToSVG
      </button>
    </div>
  );

  return (
    <div>
      <title>Lenticular Web</title>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
      ></meta>
      {UI}
      <div>
        <svg
          id="svg"
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          onTouchStart={(e) => {
            setIsTouchDown(true);
            if (isPenOn) {
              changeColorTouch(
                e,
                color2dAry,
                setColor2dAry,
                selectedColorHex,
                monoviewId,
                radius,
                sideN
              );
            }
          }}
          onTouchEnd={() => setIsTouchDown(false)}
          onMouseUp={() => setIsMouseDown(false)}
          onMouseDown={(e) => {
            setIsMouseDown(true);
            if (isPenOn) {
              changeColorClick(
                e,
                color2dAry,
                setColor2dAry,
                selectedColorHex,
                monoviewId,
                radius,
                sideN
              );
            }
          }}
          onMouseMove={(e) => {
            e.preventDefault();
            if (isMouseDown && isPenOn) {
              changeColorClick(
                e,
                color2dAry,
                setColor2dAry,
                selectedColorHex,
                monoviewId,
                radius,
                sideN
              );
            }
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            if (isTouchDown && isPenOn) {
              changeColorTouch(
                e,
                color2dAry,
                setColor2dAry,
                selectedColorHex,
                monoviewId,
                radius,
                sideN
              );
            }
          }}
        >
          <LentiArray
            x0={0}
            y0={0}
            sideN={sideN}
            r={radius}
            color2dAry={color2dAry}
            //highlightId={isEditMode ? cid : undefined}
            monoviewId={isMonoview ? monoviewId : undefined}
          />
        </svg>
      </div>
    </div>
  );
}
