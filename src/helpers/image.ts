export const resizeImg = async (file: Blob): Promise<Blob> => {
  const img = document.createElement('img');
  img.src = await new Promise<any>((resolve) => {
    const reader = new FileReader();
    reader.onload = (e: any) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
  await new Promise((resolve) => (img.onload = resolve));
  const canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');
  ctx?.drawImage(img, 0, 0);
  const MAX_WIDTH = 700;
  const MAX_HEIGHT = 700;
  let width = img.naturalWidth;
  let height = img.naturalHeight;
  if (width > height) {
    if (width > MAX_WIDTH) {
      height *= MAX_WIDTH / width;
      width = MAX_WIDTH;
    }
  } else {
    if (height > MAX_HEIGHT) {
      width *= MAX_HEIGHT / height;
      height = MAX_HEIGHT;
    }
  }
  canvas.width = width;
  canvas.height = height;
  ctx = canvas.getContext('2d');
  ctx?.drawImage(img, 0, 0, width, height);
  const result = await new Promise<Blob>((resolve) => {
    canvas.toBlob(resolve as BlobCallback, 'image/jpeg', 0.95);
  });
  return result;
};
