const cloudinaryHost = "res.cloudinary.com";
const deliveryTransform = "f_auto,q_auto,c_limit,w_1600";
const existingTransformPattern =
  /^(?:a|ar|b|c|d|e|fl|g|h|l|o|q|r|t|u|w|x|y)_/;

export function optimizeCloudinaryImageUrl(imageUrl: string): string {
  let url: URL;

  try {
    url = new URL(imageUrl);
  } catch {
    return imageUrl;
  }

  if (url.hostname !== cloudinaryHost) {
    return imageUrl;
  }

  const pathParts = url.pathname.split("/");
  const uploadIndex = pathParts.indexOf("upload");

  if (uploadIndex < 0) {
    return imageUrl;
  }

  const nextPathPart = pathParts[uploadIndex + 1];
  if (nextPathPart && existingTransformPattern.test(nextPathPart)) {
    return imageUrl;
  }

  pathParts.splice(uploadIndex + 1, 0, deliveryTransform);
  url.pathname = pathParts.join("/");
  return url.toString();
}
