const uploadInput = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('download');

let img = new Image();
let frame = new Image();
frame.src = 'frame.png'; // لازم تسمي ملف الفريم كده وتحطه مع باقي الملفات

let scale = 1;
let pos = { x: 0, y: 0 };
let drag = false;
let start = { x: 0, y: 0 };

uploadInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (evt) {
    img.src = evt.target.result;
    img.onload = () => {
      scale = 1;
      pos = { x: 0, y: 0 };
      draw(true); // ترسم بشفافية 50%
    };
  };
  reader.readAsDataURL(file);
});

canvas.addEventListener('mousedown', (e) => {
  drag = true;
  start = { x: e.offsetX - pos.x, y: e.offsetY - pos.y };
});

canvas.addEventListener('mouseup', () => drag = false);
canvas.addEventListener('mouseleave', () => drag = false);

canvas.addEventListener('mousemove', (e) => {
  if (!drag) return;
  pos = { x: e.offsetX - start.x, y: e.offsetY - start.y };
  draw(true);
});

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.05 : 0.05;
  scale = Math.max(0.2, Math.min(3, scale + delta));
  draw(true);
});

function draw(transparentFrame = false) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (img.src) {
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, pos.x, pos.y, w, h);
  }
  if (frame.complete) {
    ctx.globalAlpha = transparentFrame ? 0.5 : 1;
    ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
  }
}

downloadBtn.addEventListener('click', () => {
  draw(false); // خلي الفريم كامل الشفافية قبل التحميل
  const link = document.createElement('a');
  link.download = 'framed-image.png';
  link.href = canvas.toDataURL();
  link.click();
});