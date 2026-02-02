var settings = {
  particles: {
    length: 10000,
    duration: 4,
    velocity: 80,
    effect: -1.3,
    size: 8,
  },
};

/* Polyfill */
(function () {
  var b = 0;
  var c = ["ms", "moz", "webkit", "o"];

  for (var a = 0; a < c.length && !window.requestAnimationFrame; ++a) {
    window.requestAnimationFrame = window[c[a] + "RequestAnimationFrame"];
    window.cancelAnimationFrame =
      window[c[a] + "CancelAnimationFrame"] ||
      window[c[a] + "CancelRequestAnimationFrame"];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (h) {
      var d = new Date().getTime();
      var f = Math.max(0, 16 - (d - b));

      var g = setTimeout(function () {
        h(d + f);
      }, f);

      b = d + f;
      return g;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (d) {
      clearTimeout(d);
    };
  }
})();

/* Point */
function Point(x, y) {
  this.x = x || 0;
  this.y = y || 0;
}

Point.prototype.clone = function () {
  return new Point(this.x, this.y);
};

Point.prototype.length = function (l) {
  if (!l) return Math.sqrt(this.x * this.x + this.y * this.y);

  this.normalize();
  this.x *= l;
  this.y *= l;
  return this;
};

Point.prototype.normalize = function () {
  var l = this.length();
  this.x /= l;
  this.y /= l;
  return this;
};

/* Particle */
function Particle() {
  this.position = new Point();
  this.velocity = new Point();
  this.acceleration = new Point();
  this.age = 0;
}

Particle.prototype.initialize = function (x, y, dx, dy) {
  this.position.x = x;
  this.position.y = y;

  this.velocity.x = dx;
  this.velocity.y = dy;

  this.acceleration.x = dx * settings.particles.effect;
  this.acceleration.y = dy * settings.particles.effect;

  this.age = 0;
};

Particle.prototype.update = function (dt) {
  this.position.x += this.velocity.x * dt;
  this.position.y += this.velocity.y * dt;

  this.velocity.x += this.acceleration.x * dt;
  this.velocity.y += this.acceleration.y * dt;

  this.age += dt;
};

Particle.prototype.draw = function (ctx, img) {
  function ease(t) {
    return --t * t * t + 1;
  }

  var size = img.width * ease(this.age / settings.particles.duration);

  ctx.globalAlpha = 1 - this.age / settings.particles.duration;

  ctx.drawImage(
    img,
    this.position.x - size / 2,
    this.position.y - size / 2,
    size,
    size
  );
};

/* Pool */
function ParticlePool(length) {
  this.particles = new Array(length);
  this.firstActive = 0;
  this.firstFree = 0;
  this.duration = settings.particles.duration;

  for (var i = 0; i < length; i++) {
    this.particles[i] = new Particle();
  }
}

ParticlePool.prototype.add = function (x, y, dx, dy) {
  this.particles[this.firstFree].initialize(x, y, dx, dy);

  this.firstFree++;

  if (this.firstFree === this.particles.length) this.firstFree = 0;

  if (this.firstActive === this.firstFree) this.firstActive++;

  if (this.firstActive === this.particles.length) this.firstActive = 0;
};

ParticlePool.prototype.update = function (dt) {
  var i;

  if (this.firstActive < this.firstFree) {
    for (i = this.firstActive; i < this.firstFree; i++) {
      this.particles[i].update(dt);
    }
  } else {
    for (i = this.firstActive; i < this.particles.length; i++) {
      this.particles[i].update(dt);
    }

    for (i = 0; i < this.firstFree; i++) {
      this.particles[i].update(dt);
    }
  }

  while (
    this.particles[this.firstActive].age >= this.duration &&
    this.firstActive !== this.firstFree
  ) {
    this.firstActive++;

    if (this.firstActive === this.particles.length) this.firstActive = 0;
  }
};

ParticlePool.prototype.draw = function (ctx, img) {
  var i;

  if (this.firstActive < this.firstFree) {
    for (i = this.firstActive; i < this.firstFree; i++) {
      this.particles[i].draw(ctx, img);
    }
  } else {
    for (i = this.firstActive; i < this.particles.length; i++) {
      this.particles[i].draw(ctx, img);
    }

    for (i = 0; i < this.firstFree; i++) {
      this.particles[i].draw(ctx, img);
    }
  }
};

/* Main */
(function () {
  var canvas = document.getElementById("pinkboard");
  var ctx = canvas.getContext("2d");

  var pool = new ParticlePool(settings.particles.length);
  var rate = settings.particles.length / settings.particles.duration;

  var time;

  function pointOnHeart(t) {
    return new Point(
      160 * Math.pow(Math.sin(t), 3),
      130 * Math.cos(t) -
        50 * Math.cos(2 * t) -
        20 * Math.cos(3 * t) -
        10 * Math.cos(4 * t) +
        25
    );
  }

  /* Create heart image */
  var image = (function () {
    var c = document.createElement("canvas");
    var ctx = c.getContext("2d");

    c.width = settings.particles.size;
    c.height = settings.particles.size;

    function to(t) {
      var p = pointOnHeart(t);

      p.x =
        settings.particles.size / 2 +
        (p.x * settings.particles.size) / 350;

      p.y =
        settings.particles.size / 2 -
        (p.y * settings.particles.size) / 350;

      return p;
    }

    ctx.beginPath();

    var t = -Math.PI;
    var p = to(t);

    ctx.moveTo(p.x, p.y);

    while (t < Math.PI) {
      t += 0.01;
      p = to(t);
      ctx.lineTo(p.x, p.y);
    }

    ctx.closePath();

    ctx.fillStyle = "#f50b02";
    ctx.fill();

    var img = new Image();
    img.src = c.toDataURL();

    return img;
  })();

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resize);

  function render() {
    requestAnimationFrame(render);

    var now = Date.now() / 1000;
    var dt = now - (time || now);

    time = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var count = rate * dt;

    for (var i = 0; i < count; i++) {
      var pos = pointOnHeart(Math.PI - 2 * Math.PI * Math.random());

      var dir = pos.clone().length(settings.particles.velocity);

      pool.add(
        canvas.width / 2 + pos.x,
        canvas.height / 2 - pos.y,
        dir.x,
        -dir.y
      );
    }

    pool.update(dt);
    pool.draw(ctx, image);
  }

  resize();
  render();
})();
