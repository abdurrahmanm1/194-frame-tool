let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let img = new Image();
let original = null;
let frame = document.getElementById("frame");
let dragging = false;
let scale = 1, dx = 0, dy = 0, startX, startY;

document.getElementById("upload").onchange = function(e) {
  let reader = new FileReader();
  reader.onload = function(event) {
    img.onload = function() {
      scale = 1; dx = 0; dy = 0;
      canvas.width = frame.width;
      canvas.height = frame.height;
      draw();
      original = ctx.getImageData(0, 0, canvas.width, canvas.height);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
};

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(dx, dy);
  ctx.scale(scale, scale);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  ctx.restore();
}

canvas.addEventListener("mousedown", startDrag);
canvas.addEventListener("mousemove", onDrag);
canvas.addEventListener("mouseup", () => dragging = false);
canvas.addEventListener("wheel", zoom);

canvas.addEventListener("touchstart", startTouch, { passive: false });
canvas.addEventListener("touchmove", onTouch, { passive: false });

function startDrag(e) {
  dragging = true;
  startX = e.offsetX - dx;
  startY = e.offsetY - dy;
}

function onDrag(e) {
  if (!dragging) return;
  dx = e.offsetX - startX;
  dy = e.offsetY - startY;
  draw();
}

function zoom(e) {
  e.preventDefault();
  scale += e.deltaY * -0.001;
  scale = Math.min(Math.max(0.2, scale), 3);
  draw();
}

let lastDist = 0;
function startTouch(e) {
  if (e.touches.length == 2) lastDist = getDist(e);
}

function onTouch(e) {
  if (e.touches.length == 2) {
    let newDist = getDist(e);
    scale *= newDist / lastDist;
    scale = Math.min(Math.max(0.2, scale), 3);
    lastDist = newDist;
    draw();
  } else if (e.touches.length == 1) {
    dx = e.touches[0].clientX - canvas.width / 2;
    dy = e.touches[0].clientY - canvas.height / 2;
    draw();
  }
}

function getDist(e) {
  let dx = e.touches[0].clientX - e.touches[1].clientX;
  let dy = e.touches[0].clientY - e.touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function resetImage() {
  dx = dy = 0; scale = 1;
  draw();
}

function toggleBeforeAfter() {
  if (original) {
    ctx.putImageData(original, 0, 0);
    setTimeout(draw, 1000);
  }
}

function downloadImage() {
  frame.style.opacity = 1;
  draw();
  setTimeout(() => {
    let link = document.createElement("a");
    link.download = "framed-photo.png";
    link.href = canvas.toDataURL();
    link.click();
    frame.style.opacity = 0.7;
  }, 100);
}

function shareWhatsApp() {
  alert("انسخ الصورة يدويًا وشاركها على واتساب");
}

function shareInstagram() {
  alert("انسخ الصورة يدويًا وشاركها على انستجرام");
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href);
  alert("تم نسخ الرابط");
}
