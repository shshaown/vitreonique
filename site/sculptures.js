import * as T from './three.module.js';
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
for(const host of document.querySelectorAll('[data-sculpture]')){
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(38,1,.1,50);camera.position.set(0,1,7);
 let renderer;try{renderer=new T.WebGLRenderer({antialias:true,alpha:true})}catch{host.classList.add('no-webgl');continue}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor(0,0);renderer.toneMapping=T.ACESFilmicToneMapping;host.prepend(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
 scene.add(new T.HemisphereLight(0xffffff,0x2c5b48,3));const key=new T.DirectionalLight(0xffffff,5);key.position.set(3,4,5);scene.add(key);const rim=new T.DirectionalLight(0x43ffc3,4);rim.position.set(-4,1,-2);scene.add(rim);
 const group=new T.Group();scene.add(group);const dark=new T.MeshStandardMaterial({color:0x173e31,metalness:.75,roughness:.24}),mint=new T.MeshStandardMaterial({color:0x67dcb1,metalness:.6,roughness:.22}),pearl=new T.MeshStandardMaterial({color:0xe4ece0,metalness:.35,roughness:.25});const parts=[];
 function add(geo,mat,pos=[0,0,0]){let m=new T.Mesh(geo,mat);m.position.set(...pos);group.add(m);parts.push(m);return m}
 const type=host.dataset.sculpture;
 if(type==='orbit'){
  add(new T.IcosahedronGeometry(.65,1),pearl);
  for(let i=0;i<3;i++){let ring=add(new T.TorusGeometry(1.15+i*.25,.035,12,100),i===1?mint:pearl);ring.rotation.set(i*.7,.5+i*.55,i*.3)}
  for(let i=0;i<7;i++){let a=i/7*Math.PI*2;add(new T.SphereGeometry(.09,16,12),mint,[Math.cos(a)*1.65,Math.sin(a)*1.65,0])}
 }else if(type==='stack'){
  for(let i=0;i<7;i++){let ring=add(new T.TorusGeometry(1-i*.045,.12,16,64),i%2?mint:pearl,[0,(i-3)*.3,0]);ring.rotation.x=Math.PI/2;ring.userData.level=i}
  add(new T.IcosahedronGeometry(.45,1),dark);
 }else{
  add(new T.IcosahedronGeometry(.85,0),dark);
  for(let i=0;i<18;i++){let phi=Math.acos(1-2*(i+.5)/18),theta=i*2.399;let v=new T.Vector3(Math.sin(phi)*Math.cos(theta),Math.cos(phi),Math.sin(phi)*Math.sin(theta));let m=add(new T.OctahedronGeometry(.27),i%3?pearl:mint,v.clone().multiplyScalar(1.5).toArray());m.userData.vector=v;}
 }
 let visible=false,px=0,py=0,last=0,time=0;const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){last=0;requestAnimationFrame(render)}},{rootMargin:'120px'});observer.observe(host);
 const resize=()=>{let w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()};new ResizeObserver(resize).observe(host);resize();
 host.addEventListener('pointermove',e=>{let r=host.getBoundingClientRect();px=(e.clientX-r.left)/r.width-.5;py=(e.clientY-r.top)/r.height-.5});host.addEventListener('pointerleave',()=>{px=py=0});
 function render(now){if(!visible)return;let dt=last?Math.min((now-last)/1000,.05):0;last=now;if(!reduce.matches)time+=dt;group.rotation.y=time*.19+px*.3;group.rotation.x=.2+py*.2;group.position.y=reduce.matches?0:Math.sin(time*.7)*.1;if(type==='stack')for(let m of parts)if(m.userData.level!==undefined)m.position.x=Math.sin(time*.8+m.userData.level*.5)*.16;if(type==='burst')for(let m of parts)if(m.userData.vector)m.position.copy(m.userData.vector).multiplyScalar(1.5+Math.sin(time*.7)*.15);camera.lookAt(0,0,0);renderer.render(scene,camera);requestAnimationFrame(render)}
}
