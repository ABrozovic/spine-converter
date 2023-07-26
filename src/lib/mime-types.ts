import { z } from "zod";

const mediaDataUrlSchema = z.string().refine(
  (dataUrl) => {
    return /^data:(.+);base64/.test(dataUrl);
  },
  {
    message: "Invalid image data URL",
  }
);

export function extractMediaType(data: string | null): string {
  const regexResult = mediaDataUrlSchema.parse(data);
  return regexResult[1] ?? "";
}
export type CommonMimeType = keyof typeof commonMimeTypes;
export const fetchType = (url: string): string | undefined => {
  const match = /\.([a-z0-9]+)$/i.exec(url);
  const extension = match ? `.${match[1] ?? ""}` : "";
  if (extension) {
    return fetchTypeByExtension(extension);
  }
  return undefined;
};

export const commonMimeTypes = {
  "application/atom+xml": {
    extensions: [".atom"],
  },
  "application/java-archive": {
    extensions: [".jar", ".war", ".ear"],
  },
  "application/javascript": {
    extensions: [".js"],
  },
  "application/json": {
    extensions: [".json"],
  },
  "application/mac-binhex40": {
    extensions: [".hqx"],
  },
  "application/msword": {
    extensions: [".doc"],
  },
  "application/octet-stream": {
    extensions: [
      ".bin",
      ".exe",
      ".dll",
      ".deb",
      ".dmg",
      ".iso",
      ".img",
      ".msi",
      ".msp",
      ".msm",
    ],
  },
  "application/pdf": {
    extensions: [".pdf"],
  },
  "application/postscript": {
    extensions: [".ps", ".eps", ".ai"],
  },
  "application/rss+xml": {
    extensions: [".rss"],
  },
  "application/rtf": {
    extensions: [".rtf"],
  },
  "application/vnd.apple.mpegurl": {
    extensions: [".m3u8"],
  },
  "application/vnd.google-earth.kml+xml": {
    extensions: [".kml"],
  },
  "application/vnd.google-earth.kmz": {
    extensions: [".kmz"],
  },
  "application/vnd.ms-excel": {
    extensions: [".xls"],
  },
  "application/vnd.ms-fontobject": {
    extensions: [".eot"],
  },
  "application/vnd.ms-powerpoint": {
    extensions: [".ppt"],
  },
  "application/vnd.oasis.opendocument.graphics": {
    extensions: [".odg"],
  },
  "application/vnd.oasis.opendocument.presentation": {
    extensions: [".odp"],
  },
  "application/vnd.oasis.opendocument.spreadsheet": {
    extensions: [".ods"],
  },
  "application/vnd.oasis.opendocument.text": {
    extensions: [".odt"],
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    extensions: [".pptx"],
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    extensions: [".xlsx"],
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    extensions: [".docx"],
  },
  "application/vnd.wap.wmlc": {
    extensions: [".wmlc"],
  },
  "application/wasm": {
    extensions: [".wasm"],
  },
  "application/x-7z-compressed": {
    extensions: [".7z"],
  },
  "application/x-cocoa": {
    extensions: [".cco"],
  },
  "application/x-java-archive-diff": {
    extensions: [".jardiff"],
  },
  "application/x-java-jnlp-file": {
    extensions: [".jnlp"],
  },
  "application/x-makeself": {
    extensions: [".run"],
  },
  "application/x-perl": {
    extensions: [".pl", ".pm"],
  },
  "application/x-pilot": {
    extensions: [".prc", ".pdb"],
  },
  "application/x-rar-compressed": {
    extensions: [".rar"],
  },
  "application/x-redhat-package-manager": {
    extensions: [".rpm"],
  },
  "application/x-sea": {
    extensions: [".sea"],
  },
  "application/x-shockwave-flash": {
    extensions: [".swf"],
  },
  "application/x-stuffit": {
    extensions: [".sit"],
  },
  "application/x-tcl": {
    extensions: [".tcl", ".tk"],
  },
  "application/x-x509-ca-cert": {
    extensions: [".der", ".pem", ".crt"],
  },
  "application/x-xpinstall": {
    extensions: [".xpi"],
  },
  "application/xhtml+xml": {
    extensions: [".xhtml"],
  },
  "application/xspf+xml": {
    extensions: [".xspf"],
  },
  "application/zip": {
    extensions: [".zip"],
  },
  "audio/midi": {
    extensions: [".mid", ".midi", ".kar"],
  },
  "audio/mpeg": {
    extensions: [".mp3"],
  },
  "audio/ogg": {
    extensions: [".ogg"],
  },
  "audio/x-m4a": {
    extensions: [".m4a"],
  },
  "audio/x-realaudio": {
    extensions: [".ra"],
  },
  "font/woff": {
    extensions: [".woff"],
  },
  "font/woff2": {
    extensions: [".woff2"],
  },
  "image/avif": {
    extensions: [".avif"],
  },
  "image/gif": {
    extensions: [".gif"],
  },
  "image/jpeg": {
    extensions: [".jpeg", ".jpg"],
  },
  "image/png": {
    extensions: [".png"],
  },
  "image/svg+xml": {
    extensions: [".svg", ".svgz"],
  },
  "image/tiff": {
    extensions: [".tif", ".tiff"],
  },
  "image/vnd.wap.wbmp": {
    extensions: [".wbmp"],
  },
  "image/webp": {
    extensions: [".webp"],
  },
  "image/x-icon": {
    extensions: [".ico"],
  },
  "image/x-jng": {
    extensions: [".jng"],
  },
  "image/x-ms-bmp": {
    extensions: [".bmp"],
  },
  "text/css": {
    extensions: [".css"],
  },
  "text/html": {
    extensions: [".html", ".htm", ".shtml"],
  },
  "text/mathml": {
    extensions: [".mml"],
  },
  "text/plain": {
    extensions: [".txt"],
  },
  "text/vnd.sun.j2me.app-descriptor": {
    extensions: [".jad"],
  },
  "text/vnd.wap.wml": {
    extensions: [".wml"],
  },
  "text/x-component": {
    extensions: [".htc"],
  },
  "text/xml": {
    extensions: [".xml"],
  },
  "video/3gpp": {
    extensions: [".3gpp", ".3gp"],
  },
  "video/mp2t": {
    extensions: [".ts"],
  },
  "video/mp4": {
    extensions: [".mp4"],
  },
  "video/mpeg": {
    extensions: [".mpeg", ".mpg"],
  },
  "video/quicktime": {
    extensions: [".mov"],
  },
  "video/webm": {
    extensions: [".webm"],
  },
  "video/x-flv": {
    extensions: [".flv"],
  },
  "video/x-m4v": {
    extensions: [".m4v"],
  },
  "video/x-mng": {
    extensions: [".mng"],
  },
  "video/x-ms-asf": {
    extensions: [".asx", ".asf"],
  },
  "video/x-ms-wmv": {
    extensions: [".wmv"],
  },
  "video/x-msvideo": {
    extensions: [".avi"],
  },
};
function fetchTypeByExtension(extension: string): string | undefined {
  for (const [type, data] of Object.entries(commonMimeTypes)) {
    if (data.extensions.includes(extension)) {
      return type;
    }
  }
  return undefined;
}

export function buildAcceptedObjects(
  acceptedMimeTypes: string[]
): Record<string, string[]> {
  const acceptedObjects: Record<string, string[]> = {};
  const mimeTypes = commonMimeTypes as Record<string, { extensions: string[] }>;
  for (const mimeType of acceptedMimeTypes) {
    const extensions = mimeTypes[mimeType]?.extensions || [];
    acceptedObjects[mimeType] = extensions;
  }

  return acceptedObjects;
}
