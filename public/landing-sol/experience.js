(() => {
  const root = document.getElementById('experience');
  const artwork = document.getElementById('artwork');
  const canvas = document.getElementById('matter');
  const cursor = document.getElementById('cursor');
  const hold = document.getElementById('hold');
  const buttons = [...document.querySelectorAll('.element')];
  const modes = [
    { name:'oxygen', symbol:'O₂', title:'SPACE TO BREATHE', note:'The oxygen atmosphere.', word:'Breathe.', tint:[.62,.98,.9] },
    { name:'hydrogen', symbol:'H₂', title:'A QUIETER CURRENT', note:'The hydrogen atmosphere.', word:'Flow.', tint:[.3,.98,.69] },
    { name:'light', symbol:'hν', title:'FOLLOW THE WARMTH', note:'The red-light atmosphere.', word:'Radiate.', tint:[1,.38,.18] },
    { name:'field', symbol:'B', title:'FIND YOUR FREQUENCY', note:'The magnetic-field atmosphere.', word:'Resonate.', tint:[.69,.35,1] },
  ];
  let selected = 0, targetMode = 0, mode = 0, immersion = 0, pressed = false;
  let pointer = [.68,.48], smoothedPointer = [.68,.48], pulseAt = -20;
  const start = performance.now();
  let noteTimer;
  function selectElement(index) {
    selected = index;
    targetMode = index;
    pulseAt = (performance.now() - start) / 1000;
    const item = modes[index];
    document.body.dataset.element = item.name;
    buttons.forEach((button, i) => {button.classList.toggle('active', i === index);button.setAttribute('aria-pressed', String(i === index));});
    document.getElementById('markerIndex').textContent = `0${index + 1} — 04`;
    document.getElementById('markerSymbol').textContent = item.symbol;
    document.getElementById('markerName').textContent = item.name.toUpperCase();
    document.getElementById('immersiveWord').textContent = item.word;
    root.classList.add('changing');
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => {
      document.getElementById('noteTop').textContent = item.title;
      document.getElementById('noteBody').textContent = item.note;
      root.classList.remove('changing');
    }, 250);
  }
  buttons.forEach((button) => button.addEventListener('click', () => selectElement(Number(button.dataset.mode))));
  ['discover','invitation'].forEach(id => document.getElementById(id).addEventListener('click', () => selectElement((selected + 1) % 4)));
  document.getElementById('reset').addEventListener('click', () => selectElement(0));
  function setImmersion(value) { pressed = value; root.classList.toggle('immersive', value); cursor.classList.remove('visible'); }
  hold.addEventListener('pointerdown', event => {hold.setPointerCapture(event.pointerId);setImmersion(true);});
  hold.addEventListener('pointerup', () => setImmersion(false));
  hold.addEventListener('pointercancel', () => setImmersion(false));
  hold.addEventListener('keydown', event => {if(event.code === 'Space' || event.code === 'Enter'){event.preventDefault();setImmersion(true);}});
  hold.addEventListener('keyup', event => {if(event.code === 'Space' || event.code === 'Enter')setImmersion(false);});
  window.addEventListener('blur', () => setImmersion(false));
  window.addEventListener('pointermove', event => {
    pointer = [event.clientX / innerWidth, 1 - event.clientY / innerHeight];
    cursor.style.transform = `translate(${event.clientX}px,${event.clientY}px)`;
    cursor.classList.toggle('visible', !pressed && event.clientX > innerWidth * .53 && event.clientY > 130 && event.clientY < innerHeight * .74 && !event.target.closest('button'));
  });
  document.addEventListener('pointerleave', () => cursor.classList.remove('visible'));
  const gl = canvas.getContext('webgl', {alpha:false,antialias:false});
  if (!gl) return;
  const vertex = `attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
  const fragment = `precision highp float;
    varying vec2 uv; uniform sampler2D image; uniform vec2 resolution; uniform vec2 imageSize; uniform vec2 pointer;
    uniform float time; uniform float mode; uniform vec3 tint; uniform float immersion; uniform float pulseAt;
    void main(){
      float aspect=resolution.x/resolution.y;
      float imageAspect=imageSize.x/imageSize.y;
      vec2 cover=vec2(min(aspect/imageAspect,1.),min(imageAspect/aspect,1.));
      vec2 q=(uv-.5)*cover+.5;
      vec2 delta=uv-pointer;delta.x*=aspect;
      float dist=length(delta);
      float lens=exp(-dist*dist*13.);
      float breath=sin(time*.65)*.5+.5;
      float wave=sin(dist*26.-time*2.1)*lens;
      q+=vec2(sin(q.y*8.+time*.25),cos(q.x*9.+time*.3))*(.0013+immersion*.006);
      q+=normalize(delta+vec2(.0001))*wave*(.004+immersion*.012);
      float elapsed=time-pulseAt;
      float shock=sin((length((uv-vec2(.64,.48))*vec2(aspect,1.))-elapsed*.45)*34.)*exp(-elapsed*1.15);
      q+=vec2(shock*.008,shock*.003);
      q+=(uv-.5)*-.014*breath;
      vec3 base=texture2D(image,q).rgb;
      float aberration=.0005+lens*.0018+immersion*.003;
      base.r=texture2D(image,q+vec2(aberration,0.)).r;
      base.b=texture2D(image,q-vec2(aberration,0.)).b;
      float lum=dot(base,vec3(.2126,.7152,.0722));
      float grading=smoothstep(.1,1.5,mode)*.69;
      vec3 toned=mix(base,vec3(lum)*tint*1.65,grading);
      toned+=tint*lum*lens*(.075+immersion*.18);
      float bands=sin(q.y*45.+q.x*20.-time*.3)*.5+.5;
      toned+=tint*pow(lum,2.)*bands*.038*(1.+immersion*2.);
      float vignette=smoothstep(1.15,.2,length((uv-.5)*vec2(1.,.85)));
      toned*=.92+vignette*.12;
      gl_FragColor=vec4(toned,1.);
    }`;
  function shader(type, source) {
    const item=gl.createShader(type);gl.shaderSource(item,source);gl.compileShader(item);
    if (!gl.getShaderParameter(item,gl.COMPILE_STATUS)){console.error(gl.getShaderInfoLog(item));return null;}
    return item;
  }
  const program=gl.createProgram();
  const v=shader(gl.VERTEX_SHADER,vertex), f=shader(gl.FRAGMENT_SHADER,fragment);
  if(!v || !f)return;
  gl.attachShader(program,v);gl.attachShader(program,f);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)){console.error(gl.getProgramInfoLog(program));return;}
  gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const uniform={};['resolution','imageSize','pointer','time','mode','tint','immersion','pulseAt','image'].forEach(name => uniform[name]=gl.getUniformLocation(program,name));
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  const image=new Image();
  let currentTint=[...modes[0].tint];
  function resize(){const dpr=Math.min(devicePixelRatio,1.5);canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr;gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(uniform.resolution,canvas.width,canvas.height);}
  function render(now){
    mode+=(targetMode-mode)*.035;immersion+=((pressed?1:0)-immersion)*.035;
    smoothedPointer[0]+=(pointer[0]-smoothedPointer[0])*.035;smoothedPointer[1]+=(pointer[1]-smoothedPointer[1])*.035;
    currentTint=currentTint.map((channel,i)=>channel+(modes[selected].tint[i]-channel)*.035);
    gl.uniform1f(uniform.time,(now-start)/1000);gl.uniform1f(uniform.mode,mode);gl.uniform1f(uniform.immersion,immersion);gl.uniform1f(uniform.pulseAt,pulseAt);gl.uniform2f(uniform.pointer,...smoothedPointer);gl.uniform3f(uniform.tint,...currentTint);
    gl.drawArrays(gl.TRIANGLES,0,6);requestAnimationFrame(render);
  }
  image.onload=()=>{gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);gl.uniform2f(uniform.imageSize,image.width,image.height);gl.uniform1i(uniform.image,0);resize();artwork.classList.add('ready');requestAnimationFrame(render);};
  image.src='./human-element.png';window.addEventListener('resize',resize);
})();
