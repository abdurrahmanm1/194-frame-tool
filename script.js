const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const upload = document.getElementById("upload");
const downloadBtn = document.getElementById("download");

const frame = new Image();
frame.src = "frame.png"; // لازم ترفع الصورة باسم ده

let img = new Image();
let scale = 1, offsetX = 0, offsetY = 0;
let dragging = false, lastX = 0, lastY = 0;
let pinchStartDistance = 0, pinchStartScale = 1;

upload.addEventListener("change", (e) => {
  const reader = new FileReader();
  reader.onload = () => {
    img.onload = () => {
      resetTransform();
      draw();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(e.target.files[0]);
});

canvas.addEventListener("mousedown", (e) => {
  dragging = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
});

canvas.addEventListener("mouseup", () => (dragging = false));
canvas.addEventListener("mouseleave", () => (dragging = false));

canvas.addEventListener("mousemove", (e) => {
  if (!dragging) return;
  offsetX += (e.offsetX - lastX);
  offsetY += (e.offsetY - lastY);
  lastX = e.offsetX;
  lastY = e.offsetY;
  draw();
});

canvas.addEventListener("wheel", (e) => {
  const delta = -e.deltaY * 0.001;
  scale += delta;
  scale = Math.max(0.2, Math.min(scale, 5));
  draw();
});

// 🌟 دعم اللمس للموبايلات
canvas.addEventListener("touchstart", (e) => {
  if (e.touches.length === 1) {
    dragging = true;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
  } else if (e.touches.length === 2) {
    pinchStartDistance = getDistance(e.touches);
    pinchStartScale = scale;
  }
});

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (e.touches.length === 1 && dragging) {
    const dx = e.touches[0].clientX - lastX;
    const dy = e.touches[0].clientY - lastY;
    offsetX += dx;
    offsetY += dy;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
    draw();
  } else if (e.touches.length === 2) {
    const newDistance = getDistance(e.touches);
    const scaleFactor = newDistance / pinchStartDistance;
    scale = Math.max(0.2, Math.min(pinchStartScale * scaleFactor, 5));
    draw();
  }
}, { passive: false });

canvas.addEventListener("touchend", () => {
  dragging = false;
});

function getDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

downloadBtn.addEventListener("click", () => {
  draw(true);
  const link = document.createElement("a");
  link.download = "framed.png";
  link.href = canvas.toDataURL();
  link.click();
  draw(false);
});

function draw(finalDownload = false) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (img.src) {
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  }
  if (frame.complete) {
    if (finalDownload) {
      ctx.globalAlpha = 1;
    } else {
      ctx.globalAlpha = 0.5;
    }
    ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
  }
}

function resetTransform() {
  scale = 1;
  offsetX = 0;
  offsetY = 0;
}
