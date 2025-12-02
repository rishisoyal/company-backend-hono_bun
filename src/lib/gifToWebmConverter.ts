import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

export async function gifToWebm(file: File): Promise<Uint8Array> {
  const ffmpeg = new FFmpeg();

  await ffmpeg.load(); // loads ffmpeg WASM runtime

  const inputName = file.name;
  const outputName = `${file.name.split(".")[0]}.webm`;

  // write incoming GIF to WASM fs
  await ffmpeg.writeFile(inputName, await fetchFile(file));

  // run conversion
  await ffmpeg.exec([
    "-i", inputName,
    "-c:v", "libvpx-vp9",
    "-b:v", "1M",
    outputName
  ]);

  // read output
  const data = await ffmpeg.readFile(outputName);
  return data as Uint8Array;
}
