const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');
const upload = document.getElementById('upload');
const resetBtn      = document.getElementById('resetBtn');
const beforeAfterBtn= document.getElementById('beforeAfterBtn');
const zoomInBtn     = document.getElementById('zoomInBtn');
const zoomOutBtn    = document.getElementById('zoomOutBtn');
const downloadBtn   = document.getElementById('downloadBtn');

let img = new Image();
let frameImg = new Image();
frameImg.src = 'frame.png';

let scale = 1, dx = 0, dy = 0;
let startX, startY, dragging = false;
let savedState = null;
let showingBefore = false;

// رسم الكانڤاس
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (img.src) {
    ctx.save();
    ctx.translate(dx, dy);
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  }
  // شفافية 70% أثناء التعديل
  ctx.globalAlpha = showingBefore ? 0 : 0.7;
  ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1;
}

// إعادة الوضع الافتراضي
function reset() {
  scale = 1; dx = dy = 0; showingBefore = false;
  draw();
}

// قبل / بعد
function toggleBeforeAfter() {
  showingBefore = !showingBefore;
  if (showingBefore && img.src) {
    // حفظ الصورة الأصلية
    savedState = ctx.getImageData(0,0,canvas.width,canvas.height);
    // رسم بس الصورة بدون فريم
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save();
    ctx.translate(dx, dy);
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    ctx.restore();
  } else {
    // إعادة الرسم مع الفريم
    draw();
  }
}

// تحميل الصورة كاملة الشفافية
function download() {
  // رسم الفريم بــ 100%
  ctx.globalAlpha = 1;
  ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
  // تحميل
  const link = document.createElement('a');
  link.download = 'framed-photo.png';
  link.href     = canvas.toDataURL();
  link.click();
  // ترجع للشكل السابق
  draw();
}

// سحب بالماوس
canvas.addEventListener('mousedown', e => {
  dragging = true;
  startX = e.offsetX - dx;
  startY = e.offsetY - dy;
});
canvas.addEventListener('mousemove', e => {
  if (!dragging) return;
  dx = e.offsetX - startX;
  dy = e.offsetY - startY;
  draw();
});
canvas.addEventListener('mouseup', () => dragging = false);
canvas.addEventListener('mouseleave', () => dragging = false);

// عجلة الماوس للزووم
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  const factor = e.deltaY < 0 ? 1.05 : 0.95;
  scale = Math.min(Math.max(scale * factor, 0.2), 5);
  draw();
});

// دعم اللمس (سحب + Pinch)
let lastDist = 0;
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  if (e.touches.length === 1) {
    dragging = true;
    startX = e.touches[0].clientX - dx;
    startY = e.touches[0].clientY - dy;
  } else if (e.touches.length === 2) {
    lastDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
  }
});
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  if (e.touches.length === 1 && dragging) {
    dx = e.touches[0].clientX - startX;
    dy = e.touches[0].clientY - startY;
    draw();
  } else if (e.touches.length === 2) {
    let newDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    scale = Math.min(Math.max(scale * (newDist / lastDist), 0.2), 5);
    lastDist = newDist;
    draw();
  }
});
canvas.addEventListener('touchend', e => {
  dragging = false;
  if (e.touches.length < 2) lastDist = 0;
});

// رفع الصورة
upload.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    img.onload = () => {
      reset();
      draw();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
};

// أزرار التحكم
document.getElementById('resetBtn').onclick      = reset;
document.getElementById('beforeAfterBtn').onclick = toggleBeforeAfter;
document.getElementById('zoomInBtn').onclick     = () => { scale = Math.min(scale * 1.2, 5); draw(); };
document.getElementById('zoomOutBtn').onclick    = () => { scale = Math.max(scale * 0.8, 0.2); draw(); };
downloadBtn.onclick                              = download;

// ضمّن الفريم بعد تحميله للكانڤاس أول مرة
frameImg.onload = () => draw();
