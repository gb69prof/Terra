
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

function latLonToVector3(latDeg, lonDeg, radius=1){
  const lat = THREE.MathUtils.degToRad(latDeg);
  const lon = THREE.MathUtils.degToRad(lonDeg);
  const x = radius * Math.cos(lat) * Math.sin(lon);
  const y = radius * Math.sin(lat);
  const z = radius * Math.cos(lat) * Math.cos(lon);
  return new THREE.Vector3(x,y,z);
}

const canvas = document.getElementById('c');
const loadingEl = document.getElementById('loading');

const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45,1,0.1,100);
camera.position.set(0,0.2,3.2);

scene.add(new THREE.AmbientLight(0xffffff,0.6));
const dir = new THREE.DirectionalLight(0xffffff,1);
dir.position.set(5,2,5);
scene.add(dir);

const radius = 1;
const geometry = new THREE.SphereGeometry(radius,64,64);
const loader = new THREE.TextureLoader();
const tex = loader.load('./assets/earth_daymap_2k.jpg',()=>loadingEl.style.display='none');
tex.colorSpace = THREE.SRGBColorSpace;

const earth = new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({map:tex}));
scene.add(earth);

const controls = new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;
controls.enablePan=false;
controls.minDistance=1.6;
controls.maxDistance=6;

const PLACES=[
{name:'Foggia',lat:41.462,lon:15.544},
{name:'Roma',lat:41.9028,lon:12.4964},
{name:'Parigi',lat:48.8566,lon:2.3522},
{name:'New York',lat:40.7128,lon:-74.006},
{name:'Tokyo',lat:35.6762,lon:139.6503}
];

const list=document.getElementById('places');
PLACES.forEach(p=>{
  const li=document.createElement('li');
  li.className='place';
  li.textContent=p.name;
  li.onclick=()=>focusPlace(p);
  list.appendChild(li);
});

function focusPlace(p){
  const v=latLonToVector3(p.lat,p.lon,radius);
  const cam=v.clone().normalize().multiplyScalar(3);
  animateCameraTo(cam,v);
}

let anim=null;
function animateCameraTo(toPos,toTarget){
  if(anim) anim.cancelled=true;
  const fromPos=camera.position.clone();
  const fromTarget=controls.target.clone();
  const start=performance.now();
  anim={cancelled:false};

  function tick(now){
    if(anim.cancelled) return;
    const t=Math.min(1,(now-start)/900);
    camera.position.lerpVectors(fromPos,toPos,t);
    controls.target.lerpVectors(fromTarget,toTarget,t);
    controls.update();
    if(t<1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function resize(){
  const r=canvas.getBoundingClientRect();
  renderer.setSize(r.width,r.height,false);
  camera.aspect=r.width/r.height;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(canvas);
resize();

function loop(){
  controls.update();
  renderer.render(scene,camera);
  requestAnimationFrame(loop);
}
loop();
