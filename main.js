import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import Stats from 'three/addons/libs/stats.module.js';

let targetColor = 0xff0000; // Target colour

let colors = [
  0x4b3adc,
  0xffed9e,
  0x009c61,
  0xc9f2eb,
  0xf5c200,
  0xf1dca2,
  0x03d693,
  0x3e9fd4,
  0xbfb6e2,
]

const scene   = new THREE.Scene();
const camera  = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
document.log  = [];

const skySphereTextures = [
  './textures/144_beech_forest.jpg',
  './textures/144_beech_forest_upside_down.jpg',
  './textures/338_knivsaasen.jpg',
  './textures/344_knivsaasen.jpg',
  './textures/534_alpine_meadow.jpg',
  './textures/920_african_savannah.jpg',
  './textures/1046_office.jpg',
  './textures/1047_lab.jpg'
];

let textureLoader = new THREE.TextureLoader();
let skySphereMesh = new THREE.Mesh(
  new THREE.SphereGeometry(20, 60, 60, 1.5)
);
  
scene.add(skySphereMesh);

document.loadNewSky = function (skySphereTextureIndex) {
  console.log("Loading sky sphere texture index " + skySphereTextureIndex + ": " + skySphereTextures[skySphereTextureIndex]);
  textureLoader.load(skySphereTextures[skySphereTextureIndex], (jpgTexture) => {
    skySphereMesh.material = new THREE.MeshBasicMaterial({
      map: jpgTexture,
      side: THREE.BackSide
    });
  });
}

var currentSkySphereIndex = 0;
// document.loadNewSky(currentSkySphereIndex);

const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.xr.enabled = true;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const diameter = 0.4;

// Sphere gemoetry
const sphere = new THREE.SphereGeometry(diameter / 1.6); 

// Tetrahedron geometry
const tetrahedron = new THREE.TetrahedronGeometry(diameter / 1.2);

// Cube geometry
const cube = new THREE.BoxGeometry(diameter, diameter, diameter);

const forms = [
  sphere,
  tetrahedron,
  cube
]

const objects = [];

function addObject() {
  let newObject = new THREE.Mesh(cube, new THREE.MeshStandardMaterial());
  newObject.position.z = 1500;
  newObject.material.color.set(colors[Math.floor(Math.random() * colors.length)]);
  objects.push(newObject);
  scene.add(newObject);
  updateScalar();
}

function removeObject() {
  if (objects.length > 1) {
    let objectIndex = objects.length - 1// Math.floor(Math.random() * objects.length);
    scene.remove(objects[objectIndex]);
    objects.splice(objectIndex, 1);

    updateScalar(true);
  }
}

function updateScalar(up = false) {
  if (up) {
    var scalar = Math.pow(objects.length, 0.04);
  } else {
    var scalar = 1 / Math.pow(objects.length, 0.04);
  }
  

  // console.log(objects.length);
  // console.log(scalar);

  forms.forEach(function(form) {
    form.scale(scalar, scalar, scalar);
  })

  // objects.forEach(function(object) {
  //   console.log(object)
  // })
}

// addObject();
// addObject();
// addObject();

// Add stats.js
let stats = new Stats();
stats.dom.style.width = '80px';
stats.dom.style.height = '48px';
document.body.appendChild( stats.dom );

// Lights
const lights = [];
lights[ 0 ] = new THREE.DirectionalLight( 0x8CA032, 2 );
lights[ 1 ] = new THREE.DirectionalLight( 0x504B1E, 9 );
lights[ 2 ] = new THREE.DirectionalLight( 0xffffff, 2 );
lights[ 3 ] = new THREE.DirectionalLight( 0xffffff, .5 );
lights[ 4 ] = new THREE.DirectionalLight( 0xffffff, .5 );
lights[ 5 ] = new THREE.DirectionalLight( 0x8CA0de, 3 );

lights[ 0 ].position.set( 0, 40, -10 );
lights[ 1 ].position.set( 0, - 100, -10 );
lights[ 2 ].position.set( 0, 0, 50 );
lights[ 3 ].position.set( 50, 0, -20 );
lights[ 4 ].position.set( -50, 0, -20 );
lights[ 5 ].position.set( 0, 200, 10 );

lights.forEach(function(light) {
  scene.add(light);
})

camera.position.y = 1.7;

document.body.appendChild( VRButton.createButton( renderer ) );

var lastSecond = 0;
var thisTrial = null;

renderer.setAnimationLoop( function () {

  objects.forEach(function(object) {
    object.rotation.x += .01;
    object.rotation.y += .01;
  })

  stats.update();

// skySphereMesh.rotation.y += 0.01;
// camera.rotation.y += 0.01;

  renderer.render(scene, camera);
  
  // Update position of objects based on time
  let date = new Date();
  let s = date.getSeconds();
  let ms = date.getMilliseconds();

  let thisSecond = s;

  if (objects.length > 0) {
    // console.log(objects.length);

    // Save a bit of computation
    if (thisSecond != lastSecond) {

      if (s % 2 == 0) {
        // console.log("Change shape");
        objects[Math.floor(Math.random() * objects.length)].geometry = forms[Math.floor(Math.random() * forms.length)];
      } else {
        // console.log("Change colour")
        if (Math.random() < 0.4) { // With 40% chance, make one of the objects red
          objects[Math.floor(Math.random() * objects.length)].material.color.set(targetColor);
        } else { // Otherwise make one of the objects one of the distractor colours
          objects[Math.floor(Math.random() * objects.length)].material.color.set(colors[Math.floor(Math.random() * colors.length)]);
        }
      }

      lastSecond = thisSecond;

      const logData = {
        event: "trialStart",
        timeStamp: date.getTime(),
        objects: []
      };
      objects.forEach(function(object, index) {
        logData.objects.push({
          geometry: object.geometry.type,
          color: {
            r: object.material.color.r,
            g: object.material.color.g,
            b: object.material.color.b
          },
          isTargetColor: (object.material.color.r == 1 && object.material.color.g == 0 && object.material.color.b == 0),
          isTargetGeometry: (object.geometry.type == "SphereGeometry"),
          isTarget: (object.material.color.r == 1 && object.material.color.g == 0 && object.material.color.b == 0 && object.geometry.type == "SphereGeometry")
        });
      })

      document.log.push(logData);
      console.log(logData);
      thisTrial = logData;
    }

    objects.forEach(function(object, index) {
      object.position.x = returnPositionOnPath(((s + index * 6 / objects.length) % 60 % 6 * 1000 + ms) / 6000).x
      object.position.y = 1.7 + returnPositionOnPath(((s + index * 6 / objects.length) % 60 % 6 * 1000 + ms) / 3000).y * 0.5
      object.position.z = - 1.5
    })
  }
    

  //   if ((new Date().getSeconds() % 3) == 0) {
  //     objects[0].geometry = cube;
  //     objects[1].geometry = sphere;
  //     objects[2].geometry = tetrahedron;
  //     materials[0].color.set(new THREE.Color('#' + Math.floor(Math.random() * 16777215).toString(16)));
  //   } else if ((new Date().getSeconds() % 3) == 1) {
  //     objects[0].geometry = sphere;
  //     objects[1].geometry = tetrahedron;
  //     objects[2].geometry = cube;
  //     materials[1].color.set(new THREE.Color('#' + Math.floor(Math.random() * 16777215).toString(16)))
  // } else if ((new Date().getSeconds() % 3) == 2) {
  //     objects[0].geometry = tetrahedron;
  //     objects[1].geometry = cube;
  //     objects[2].geometry = sphere;
  //     materials[2].color.set(new THREE.Color('#' + Math.floor(Math.random() * 16777215).toString(16)))
  // }

  

  // objects[0].position.x = returnPositionOnPath((s % 6 * 1000 + ms) / 6000).x
  // objects[0].position.y = 1.7 + returnPositionOnPath((s % 3 * 1000 + ms) / 3000).y * 0.5

  // objects[1].position.x = returnPositionOnPath(((s + 2) % 60 % 6 * 1000 + ms) / 6000).x
  // objects[1].position.y = 1.7 + returnPositionOnPath(((s + 2) % 60 % 3 * 1000 + ms) / 3000).y * 0.5

  // objects[2].position.x = returnPositionOnPath(((s + 4) % 60 % 6 * 1000 + ms) / 6000).x
  // objects[2].position.y = 1.7 + returnPositionOnPath(((s + 4) % 60 % 3 * 1000 + ms) / 3000).y * 0.5
});

const session = renderer.xr.getSession();

renderer.xr.getController(0).addEventListener('connected', function() {
  console.log("Controller 1 connected");
})

renderer.xr.getController(1).addEventListener('connected', function() {
  console.log("Controller 2 connected");
})

renderer.xr.getController(0).addEventListener('click', function() {
  console.log("Controller 1 clicked");
})

renderer.xr.getController(1).addEventListener('click', function() {
  console.log("Controller 2 clicked");
})

renderer.xr.getController(0).addEventListener('squeeze', function() {
  console.log("Controller 1 squeezed");

  // objects.forEach(function(object) {
  //   object.material.color.set(0xffffff);
  // })

  // console.log("Adding two moving objects");
  // addObject();
  // addObject();
})

renderer.xr.getController(1).addEventListener('squeeze', function() {
  console.log("Controller 2 squeezed");

  // objects.forEach(function(object) {
  //   object.geometry = forms[0];
  // })

  // console.log("Removing two moving objects");
  // removeObject();
  // removeObject();
})

renderer.xr.getController(0).addEventListener('select', function() {
  console.log("Controller 1 selected");

  // if (currentSkySphereIndex < skySphereTextures.length - 1) {
  //   currentSkySphereIndex ++;
  // } else {
  //   currentSkySphereIndex = 0;
  // }

  // loadNewSky(currentSkySphereIndex);
  const date = new Date();

  const logData = {
    event: "participantReaction",
    timeStamp: date.getTime(),
    rt: date.getTime() - thisTrial.timeStamp,
    correctResponse: false,
    objects: thisTrial.objects
  }

  thisTrial.objects.forEach(function(obj) {
    if (obj.isTarget) {
      logData.correctResponse = true;

    }
  });

  console.log(logData);
  document.log.push(logData);

  objects.forEach(function(obj) {
    obj.material.color.set(colors[Math.floor(Math.random() * colors.length)]);
  })
})

renderer.xr.getController(1).addEventListener('select', function() {
  console.log("Controller 2 selected");

  // if (currentSkySphereIndex > 0) {
  //   currentSkySphereIndex --;
  // } else {
  //   currentSkySphereIndex = skySphereTextures.length - 1;
  // }

  // loadNewSky(currentSkySphereIndex);
})

document.addObject = function() {
  console.log("Adding a moving object");
  addObject();
  // removeObject();
}

document.removeObject = function() {
  console.log("Romving a moving object");
  removeObject();
}

document.startExperiment = function() {
  console.log("Adding seven moving objects");

  addObject();
  addObject();
  addObject();
  addObject();
  addObject();
  addObject();
  addObject();
}


function returnPositionOnPath(relativePosition) {
    return {
        x: Math.cos(relativePosition * 360 * (Math.PI / 180)),
        y: Math.sin(relativePosition * 360 * (Math.PI / 180))
    }
}

// function animate() {
// 	requestAnimationFrame( animate );

//     cube.rotation.x += 0.01;
//     cube.rotation.y += 0.01;

// 	renderer.render( scene, camera );
// }


// Browser compatability check
if ( WebGL.isWebGLAvailable() ) {

	// Initiate function or other initializations here
	// animate();

} else {

	const warning = WebGL.getWebGLErrorMessage();
	document.getElementById( 'container' ).appendChild( warning );

}

// import { fetchProfile, MotionController } from '@webxr-input-profiles/motion-controllers'

// const uri = 'URI of folder with profiles and assets';
// const motionControllers = {};

// async function createMotionController(xrInputSource) {
//   const { profile, assetPath } = await fetchProfile(xrInputSource, uri);
//   const motionController = new MotionController(xrInputSource, profile, assetPath);
//   motionControllers[xrInputSource] = motionController;
//   addMotionControllerToScene(motionController);
// }

var textFile = null;
function makeTextFile () {
  var data = new Blob(document.log, {type: 'text/json'});

  // If we are replacing a previously generated file we need to
  // manually revoke the object URL to avoid memory leaks.
  if (textFile !== null) {
    window.URL.revokeObjectURL(textFile);
  }

  textFile = window.URL.createObjectURL(data);

  // returns a URL you can use as a href
  return textFile;
};

function downloadFile() {
  var link = document.createElement('a');
      link.setAttribute('download', 'info.txt');
      link.setAttribute('id', 'downloadLink');
      link.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(document.log));
      link.setAttribute("download", "data.json");
      link.style.display = "none";
  document.body.appendChild(link);
}

document.endExperiment = function() {
  // makeTextFile();
  downloadFile();

  var event = new MouseEvent('click');
  document.getElementById('downloadLink').dispatchEvent(event);
      // document.body.removeChild(link);
}