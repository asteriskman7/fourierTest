'use strict';

const app = {
  init: function() {
    app.canvas = document.getElementById('cmain');
    app.ctx = app.canvas.getContext('2d');
    app.angle = 0;

    //get points to display
    const points = app.genSquare(50, 200, 50);

    //take descrete fourier transform
    const dft = app.dft(points);

    app.units = dft;
    app.points = [];
    app.tick();
  },
  genSquare: function(amp, pointCount, period) {
    //generate points to show a square wave
    const points = [];
    for (let i = 0; i < pointCount; i++) {
      if ((i % period) >= period / 2) {
        points.push([i, amp]);
      } else {
        points.push([i, -amp]);
      }
    }
    return points;
  },
  dft: function(data) {
    let X = [];
    for (let k = 0; k < data.length; k++) {
      let Xr = 0;
      let Xi = 0;
      for (let n = 0; n < data.length; n++) {
        const [dr, di] = data[n];
        const angle = 2 * Math.PI * k * n / data.length;
        Xr += dr * Math.cos(angle) + di * Math.sin(angle);
        Xi += di * Math.cos(angle) - dr * Math.sin(angle);
      }

      const mag = Math.sqrt(Xr * Xr + Xi * Xi) / data.length;
      const phase = Math.atan2(Xi, Xr);
      X.push({mag, phase, freq: k});
    }
    //sort by magnitude of component so the display looks nicer
    X.sort( (a, b) => {
      return b.mag - a.mag;
    });

    return X;
  },
  update: function() {
    //must update angle with this step or aliasing will occur and drawing will be wrong
    app.angle += Math.PI * 2 / app.units.length;
  },
  draw: function() {
    const ctx = app.ctx;

    ctx.save();
    ctx.clearRect(0, 0, app.canvas.width, app.canvas.height);

    let cx = app.canvas.width * 0.5;
    let cy = app.canvas.height * 0.5;

    ctx.fillStyle = 'green';
    ctx.strokeStyle = 'red';

    //for each frequency from the dft
    app.units.forEach( (unit, i) => {
      //ignore the dc component.
      if (unit.freq === 0) {return;}

      //convert the frequency/magnitude/phase into a position relative to the previous cx,cy
      const angle = unit.freq * app.angle;
      const dx = unit.mag * Math.cos(angle + unit.phase);
      const dy = unit.mag * Math.sin(angle + unit.phase);

      //draw circle with radius equal to magnitude of component
      ctx.beginPath();
      ctx.arc(cx, cy, unit.mag, 0, Math.PI * 2);
      ctx.stroke();

      //draw circle at position on circle
      cx += dx;
      cy += dy;
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    //reset every time through the pattern
    if (app.points.length >= app.units.length) {
      app.points = [];
    }
    //save the point to draw
    app.points.push({x: cx, y: cy});

    //connect all previous points
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(app.points[0].x, app.points[0].y);
    for (let i = 1; i < app.points.length; i++) {
      ctx.lineTo(app.points[i].x, app.points[i].y);
    }
    ctx.stroke();

    ctx.restore();
  },
  tick: function() {
    app.update();
    app.draw();
    window.requestAnimationFrame(app.tick);
  }
};

app.init();
