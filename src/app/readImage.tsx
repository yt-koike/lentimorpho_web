"use client";

import { ChangeEvent, useState } from "react";
export default function ReadImage() {
  const [file, setFile] = useState<string>("");
  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    console.log(e.target.files);
    if (e.target.files != null) {
      setFile(URL.createObjectURL(e.target.files[0]));
    }
  }

  return (<div>
      <h2>Add Image:</h2>
      <input type="file" onChange={handleChange} />
      <img src={file} />
      </div>
  );
}
