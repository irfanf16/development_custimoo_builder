<template>
  <div>
    <div class="TabbedPanel" id="sidebar">
      <input type="text" class="form-control" v-model="text" style="margin :1% 0 6% 0" @input="addTextsToCanvas">
    </div>


    <img src="https://custimoo.s3.us-east-1.amazonaws.com/threejs/logo.png" crossOrigin="Anonymous" id="images" width="30"
      style="position:absolute;left:0;top:0;display:none">

    <div id="renderer">
    </div>
    <div id="canvas_container">
      <canvas id="cnvs" height="8192" width="8192"></canvas>
    </div>


    <!-- <div id="svg_container">
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px"
        width="8192px" height="8192px" viewBox="0 0 8192 8192" enable-background="new 0 0 8192 8192" xml:space="preserve">
        <g id="Artwork">
          <polygon id="left_arm"
            points="1549.837,1976.558 847.512,1976.558 838.333,1128.111 1198.004,1033.889 1557.676,1126.965 " />
          <polygon id="Right_arm"
            points="1443.171,1022.889 740.845,1022.889 731.667,174.442 1091.338,80.22 1451.009,173.296 " />
          <polygon id="Collar_1_" fill="#E6332A"
            points="2039.667,1073 1299.667,1067.667 1294.333,999.667 1441,859.667 2020.788,868.326 " />
          <polygon id="Front" fill="#312783"
            points="818.778,8192 17.778,8192 17.778,1053.444 382.333,936.111 818.778,1053.444 " />
          <path id="Back_1_" fill="#006633"
            d="M731.667,936.111H0V13.444h731.667V936.111z M8192,1385.889h-450.556v369.778H8192V1385.889z" />
        </g>

        <g id="Layer_1"></g>
      </svg>
    </div> -->
    <image_uploader @image_uploaded="addUploadedImageToCanvas" @image_deleted="deleteImageFromCanvas" :added_images='added_images'/>
    <br>
    <button v-on:click="downloadCanvas()">
  Download Canvas
  </button>
  </div>
</template>
<script>
import { fabric } from "fabric";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { getDeviceInfo } from "@/helpers/Helpers";
import { GUI } from 'dat.gui'
import image_uploader from "./image_uploader.vue"
import Stats from 'stats.js'
const pica = require('pica')();


// give each image a unique id
let id = 0;

export default {
  name: "Scene-3d",
  data() {
    return {
      fabric_canvas_resolution: 8192,
      containerWidth: 512,
      containerHeight: 512,
      canvas: '',
      camera: '',
      renderer: new THREE.WebGLRenderer({ 'alpha': false, 'antialias': true }),
      container: '',
      scene: new THREE.Scene(),
      texture: '',
      cube: '',
      controls: '',
      raycaster: new THREE.Raycaster(),
      //svgEl: '',
      onClickPosition: new THREE.Vector2(),
      isMobile: ![],
      mouse: new THREE.Vector2(),
      text: '',
      device_info: getDeviceInfo(),
      first_spotlight: new THREE.SpotLight(0xFF5733, 1),
      second_spotlight: new THREE.SpotLight(0xFF5733, 1),
      tshirt: null,
      uploaded_image: null,
      stats: new Stats(),
      added_images: [],
      last_known_image_pos: null
    }
  },
  async mounted() {
    //this.svgEl = document.getElementById('svg_container').getElementsByTagName('svg')[0]
    this.addSceneRendererContainer();
    this.init();

    this.animate();
    this.svgloads()
    this.addGetPointerToFabricPrototype();
    
    this.stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.dom)
    
    // this.showGui()
  },
  components: {
    image_uploader  
  },
  methods: {
    downloadCanvas(){

      var svg = this.canvas.toSVG();
      download("canvas.svg", svg)

      function download(filename, text) {
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    }


      

    },
    addSceneRendererContainer() {
      if (window.innerWidth < 600) {
        this.containerWidth = window.innerWidth
        //this.containerHeight = this.containerWidth;
        // document.getElementById('sidebar').style.height = window.innerHeight - this.containerHeight + 'px';
        // document.getElementById('sidebar').style.top = `${this.containerHeight}px`;
      } else {
        this.containerWidth = 512;
        //this.containerHeight = window.innerHeight;
        document.getElementById('sidebar').style.width = window.innerWidth - this.containerWidth + 'px';
      }
      this.container = document.getElementById("renderer")
      this.canvas = new fabric.Canvas("cnvs");
      this.canvas.enableGLFiltering = false;


      
    },
    init() {
      let self = this;
      this.camera = new THREE.PerspectiveCamera(35, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
      this.camera.position.set(0, 0.5, 12.5);


      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.3;
      this.renderer.setSize(this.containerWidth, this.containerHeight);
      this.renderer.setPixelRatio(window.devicePixelRatio);

      this.camera.updateProjectionMatrix();
      this.container.appendChild(this.renderer.domElement);

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.minDistance = -500;
      this.controls.maxDistance = 500;
      this.controls.target.set(0, 0, 0);
      this.controls.update();

      this.scene.background = new THREE.Color(0xD94525);

      var canvas = document.getElementById('cnvs');
      this.texture = new THREE.CanvasTexture(canvas);
      this.texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
      directionalLight.position.set(0, 20, 50);
      this.scene.add(directionalLight);

      // const helper = new THREE.DirectionalLightHelper( directionalLight, 5 );
      // this.scene.add( helper );

      const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.7);
      directionalLight2.position.set(0, 20, -50);
      this.scene.add(directionalLight2);

      // const helper2 = new THREE.DirectionalLightHelper( directionalLight2, 5 );
      // this.scene.add( helper2 );


      const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.7);
      directionalLight3.position.set(-20, 20, 0);
      this.scene.add(directionalLight3);

      // const helper3 = new THREE.DirectionalLightHelper( directionalLight3, 5 );
      // this.scene.add( helper3 );


      const directionalLight4 = new THREE.DirectionalLight(0xffffff, 0.7);
      directionalLight4.position.set(20, 20, 0);
      this.scene.add(directionalLight4);

      // const helper4 = new THREE.DirectionalLightHelper( directionalLight4, 5 );
      // this.scene.add( helper4 );

      // const ambientLight = new THREE.AmbientLight( 0x404040 );
      // this.scene.add(ambientLight);


      // const dracoLoader = new DRACOLoader();
      // dracoLoader.setDecoderPath('https://unpkg.com/browse/three@0.1nfnv gncgncbg48.0/examples/jsm/libs/draco/');
      const gltfLoader = new GLTFLoader();
      //gltfLoader.setDRACOA``````Loader(dracoLoader);
      gltfLoader.load('https://custimoo.s3.us-east-1.amazonaws.com/threejs/Hummel_Jersey_v1/Textures/Jensen-LS.glb',
        (gltf) => {
          const yeni = gltf.scene.children[0];
          self.tshirt = yeni;
          self.scene.add(yeni);
          yeni.material = new THREE.MeshPhongMaterial({ 'map': self.texture  });
          yeni.material.shininess = 10;
          yeni.material.needsUpdate = true;


          this.canvas.on("after:render", function() {
            self.tshirt.material.map.needsUpdate = true;
            self.tshirt.material.needsUpdate = true;
          });

          if (yeni.material.normalMap) return;
          // add normal map to the material
          const textureLoader = new THREE.TextureLoader();
          const normalMap = textureLoader.load('https://custimoo.s3.us-east-1.amazonaws.com/threejs/Hummel_Jersey_v1/Textures/Hummel_Normal.png');
          normalMap.flipY = false;
          yeni.material.normalMap = normalMap;

          yeni.material.side = THREE.DoubleSide;
          yeni.material.metalness = 0.99;
          self.renderScene();


          yeni.material.map.needsUpdate = true;
          yeni.material.needsUpdate = true;
          self.renderScene();







        })



        window.addEventListener( 'resize', onWindowResize, false );

        function onWindowResize(){
          console.log("resize")

            self.camera.aspect = self.container.clientWidth / self.container.clientHeight;
            self.camera.updateProjectionMatrix();

            self.renderer.setSize( self.containerWidth, self.containerHeight );

        }

    },


    async svgloads() {
      let self = this;
      fabric.loadSVGFromURL('https://custimoo.s3.us-east-1.amazonaws.com/threejs/Hummel_Jersey_v1/Textures/Test_svg_rectang.svg', function (svg_items, svg_options) {
        var svg_element = fabric.util.groupSVGElements(svg_items, {
          'selectable': false,
          'flipY': true,
          'crossOrigin': 'anonymous',
        });
        //to avoid any blurry texture we need to render the fabric canvas at full svg resolution
        console.log("svg_element.width", svg_element.width, "svg_element.height", svg_element.height)
        // self.canvas.setHeight(svg_element.height);
        // self.canvas.setWidth(svg_element.width);
        //set the position of the svg elements
        console.log("svg_element.width", svg_element.width, "svg_element.height", svg_element.height)
        svg_element.scaleToWidth(self.canvas.width).set({
          'left': 0x0,
          'top': 0x0

        }).setCoords();

        svg_element.scaleToHeight(self.canvas.height);

        self.canvas.add(svg_element).renderAll();
        svg_element.sendBackwards();


        // var svgElement = self.canvas.getObjects()
        setTimeout(() => {
          const tempArr = svg_element.getObjects();
          
          
          tempArr[5].set({fill: "blue"});
          tempArr.forEach(function(item, i){

            console.log("Id: " + item.id + " is index " + i)
            i++;
          });
          
          /*find(function(obj) {
           console.log(obj.id);
            return obj.id === 'base_00000060750089207902151140000005550991670928999830_';
          });
          */

          self.canvas.renderAll();
          console.log('rendered')
          self.addTextsToCanvas();
          self.addImageToCanvas();
        }, 3000)


      });




    },
    addTextsToCanvas(text2 = null) {
        const textNew = this.text ? this.text : 'Andrew';
      let text = new fabric.IText(textNew, {
        'selectable': true,
        'fontSize': 40,
        'textAlign': 'center',
        'fontWeight': 'bold',
        'left': 4400,
        'top': 5200,
        'angle': 180,
        'flipX': true,
        'cornerSize': 15,
        'shadow': 'blue',
        'fill': '#FFFFFF'
      });
      this.canvas.add(text);
      this.canvas.renderAll();

      // let text1 = new fabric.IText('FabricJs', {
      //   'fontSize': 16,
      //   'textAlign': 'center',
      //   'fontWeight': 'bold',
      //   'left': 120,
      //   'top': 200,
      //   'angle': 180,
      //   'flipX': !![],
      //   'cornerSize': 15,
      //   'originX': 'center',
      //   'originY': 'center',
      //   'shadow': 'blue',
      //   'fill': '#000'
      // });
      //this.canvas.add(text1);
    
    },
    async addUploadedImageToCanvas(image, image_name){
      console.log("addUploadedImagToCanvas", image )




      function getDimensions(image){
        return new Promise((resolve, reject)=>{

            var img = new Image();
            img.src = image;
            img.onload = () => {
                resolve({image: img, width: img.width, height: img.height})
            }
        })
      }


      async function resize_large_image()
      {
        //image max WIDTH AND HEIGHT
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1800;
        var result = await getDimensions(image);
        const width = result.width;
        const height = result.height;
        //console.log("width", width, "height", height)
        const memoryImg = result.image;

        if(width > MAX_WIDTH || height > MAX_HEIGHT)
        {
          // resize keeping aspect ratio
          var ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);

          const newWidth = width*ratio;
          const newHeight = height*ratio;

          const resultCanvas = document.createElement("canvas");
          resultCanvas.width = newWidth;
          resultCanvas.height = newHeight;

          var result = await pica.resize(memoryImg, resultCanvas)
          console.log('resize done!', result)
          const dataURL = result.toDataURL();
          return dataURL;
        }
        else 
        {
          return image;
        }
        

      };

      const resized_image = await resize_large_image();


      let image_output;
        let imageinstance = new fabric.Image.fromURL(resized_image, output => {
            output.set({
              angle: 180,
              left: 4900,
              top: 5700,
              opacity: 1,
              cornerSize: 15,
              crossOrigin: 'Anonymous',
              selectable: true,
              flipX: true,
          })
          output.objectCaching = false;

          

          // output.filters.push( new fabric.Image.filters.Resize( { resizeType: 'sliceHack', scaleX: 1, scaleY: 1 } ));
          // output.applyFilters();

          this.canvas.add(output);
          this.added_images.push({id: id++, image: output, src: image_name});
          //output.scaleToHeight(2000, false);
          
          this.canvas.renderAll();
        },{ crossOrigin: 'Anonymous' });
      


    },
    deleteImageFromCanvas(image)
    {
        console.log("deleteImageFromCanvas", image);
        this.canvas.remove(image.image);
        this.added_images = this.added_images.filter((i) => i !== image)
    },
    addImageToCanvas() {
        let imgElement = document.getElementById("images");
        let imageinstance = new fabric.Image(imgElement, {
        angle: 180,
        left: 4200,
        top: 4800,
        opacity: 1,
        cornerSize: 15,
        crossOrigin: 'Anonymous',
        selectable: true,
        flipX: true,
      });
      imageinstance.scaleToWidth(100, false);
      this.canvas.add(imageinstance);
      this.added_images.push({id: id++, image: imageinstance, src: imgElement.src});
      this.canvas.renderAll();

    },
    animate() {
      this.stats.begin()
      requestAnimationFrame(this.animate);
      this.texture.needsUpdate = true;
      this.controls.update();
      this.renderScene();
      this.stats.end()
    },
    renderScene() {
      this.renderer.render(this.scene, this.camera);
    },


    addGetPointerToFabricPrototype() {
      let self = this;
      /*******
       * Listeners event
       */

      
      fabric.Canvas.prototype.getPointer = function (e, ignoreZoom) {
        if (this._absolutePointer && !ignoreZoom) {
          self.controls.enabled = ![];
          return this._absolutePointer;
        }
        if (this._pointer && ignoreZoom) {
          if (self.controls.enabled === false) {
            self.controls.enabled = !![];
          }
          return this._pointer;
        }
        var simEvt;
        if (e.touches != undefined) {
          simEvt = new MouseEvent({
            'touchstart': 'mousedown',
            'touchmove': 'mousemove',
            'touchend': 'mouseup'
          }[e.type], {
            bubbles: true,
                cancelable: true,
                view: window,
                detail: 1,
                screenX: Math.round(e.changedTouches[0].screenX),
                screenY: Math.round(e.changedTouches[0].screenY),
                clientX: Math.round(e.changedTouches[0].clientX),
                clientY: Math.round(e.changedTouches[0].clientY),
                ctrlKey: false,
                altKey: false,
                shiftKey: false,
                metaKey: false,
                button: 0,
                relatedTarget: null
          });

          var pointer = fabric.util.getPointer(simEvt),
                upperCanvasEl = this.upperCanvasEl,
                bounds = upperCanvasEl.getBoundingClientRect(),
                boundsWidth = bounds.width || 0,
                boundsHeight = bounds.height || 0,
                cssScale;
        } else {
          var pointer = fabric.util.getPointer(e),
                upperCanvasEl = this.upperCanvasEl,
                bounds = upperCanvasEl.getBoundingClientRect(),
                boundsWidth = bounds.width || 0,
                boundsHeight = bounds.height || 0,
                cssScale;
        }

        if (!boundsWidth || !boundsHeight) {
          if ('top' in bounds && 'bottom' in bounds) {
            boundsHeight = Math.abs(bounds.top - bounds.bottom);
          }
          if ('right' in bounds && 'left' in bounds) {
            boundsWidth = Math.abs(bounds.right - bounds.left);
          }
        }
        this.calcOffset();
        pointer.x = pointer.x - this._offset.left;
        pointer.y = pointer.y - this._offset.top;
        /* BEGIN PATCH CODE */
        if (e.target !== this.upperCanvasEl) {
          var positionOnScene;
          if (self.isMobile == true) {
            positionOnScene = getPositionOnSceneTouch(self.container, e);
            if (positionOnScene) {
              pointer.x = positionOnScene.x;
              pointer.y = positionOnScene.y;
            }
          } else {
            positionOnScene = getPositionOnScene(self.container, e);
            if (positionOnScene) {
              pointer.x = positionOnScene.x;
              pointer.y = positionOnScene.y;
            }
          }
        }
        /* END PATCH CODE */
        if (!ignoreZoom) {
          pointer = this.restorePointerVpt(pointer);
        }

        if (boundsWidth === 0 || boundsHeight === 0) {
          cssScale = { width: 1, height: 1 };
        }
        else {
          cssScale = {
            width: upperCanvasEl.width / boundsWidth,
            height: upperCanvasEl.height / boundsHeight
          };
        }

        return {
          x: pointer.x * cssScale.width,
          y: pointer.y * cssScale.height
        };
      };



      //container.addEventListener('mousedown', onMouseEvt, ![]),
      self.container.addEventListener('mousedown', onMouseEvt, false);
      if (self.device_info.is_mobile) {
        self.isMobile = true;
        self.container.addEventListener("touchstart", onTouch, false);
      }

      self.canvas.on('mouse:down', function (event) {
        const x = event.e.clientX - self.canvas._offset.left;
        const y = event.e.clientY - self.canvas._offset.top;
        console.log(`X: ${x}, Y: ${y}`);
      });


      //fixing bug when object is dropped outside of 3d model
      self.canvas.on({
        'object:moving': function(evt) {
          var array = getMousePosition(self.container, evt.e.clientX, evt.e.clientY);
          self.onClickPosition.fromArray(array);
          var intersects = getIntersects(self.onClickPosition, self.scene.children);
          if(intersects.length === 0)
          {
            //return to the last known position
            var active_object = self.canvas.getActiveObject();
            active_object.left = self.last_known_image_pos.left;
            active_object.top = self.last_known_image_pos.top;
            active_object.setCoords();
          }
          else
          {
            self.last_known_image_pos = {left: evt.target.left, top: evt.target.top};
          }

        }
      });


      /**
       * Event handlers
       */
      function onTouch(evt) {
        evt.preventDefault();
        const positionOnScene = getPositionOnSceneTouch(self.container, evt);
        if (positionOnScene) {
          //const canvasRect = self.canvas._offset;
          const simEvt = new MouseEvent(evt.type, {
            clientX: positionOnScene.x,
            clientY: positionOnScene.y,
          });
          self.canvas.upperCanvasEl.dispatchEvent(simEvt);
        }
      }

      function getPositionOnSceneTouch(sceneContainer, evt) {
        var array = getMousePosition(sceneContainer, evt.changedTouches[0].clientX, evt.changedTouches[0].clientY);
        self.onClickPosition.fromArray(array);
        var intersects = getIntersects(self.onClickPosition, self.scene.children);
        if (intersects.length > 0 && intersects[0].uv) {
          var uv = intersects[0].uv;
          intersects[0].object.material.map.transformUv(uv);
          var circle = new fabric.Circle({
            radius: 3,
            left: getRealPosition("x", uv.x),
            top: getRealPosition("y", uv.y),
            fill: "white",
          });
          return {
            x: getRealPosition("x", uv.x),
            y: getRealPosition("y", uv.y),
          };
        } else {
          self.controls.enabled = !![];
        }
        return null;
      }

      function onMouseEvt(evt) {
        evt.preventDefault();
        const positionOnScene = getPositionOnScene(self.container, evt)
        if (positionOnScene) {
          //const canvasRect = self.canvas._offset;
          const simEvt = new MouseEvent(evt.type, {
            clientX: positionOnScene.x,
            clientY: positionOnScene.y
          });
          self.canvas.upperCanvasEl.dispatchEvent(simEvt);
        }
      }

      /**
       * Three.js Helper functions
       */
      function getPositionOnScene(sceneContainer, evt) {
        var array = getMousePosition(self.container, evt.clientX, evt.clientY);
        self.onClickPosition.fromArray(array);
        var intersects = getIntersects(self.onClickPosition, self.scene.children);
        if (intersects.length > 0 && intersects[0].uv) {
          var uv = intersects[0].uv;
          intersects[0].object.material.map.transformUv(uv);
          return {
            x: getRealPosition('x', uv.x),
            y: getRealPosition('y', uv.y)
          }
        } else {
          self.controls.enabled = !![];
        }
        return null
      }

      function getRealPosition(axis, value) {
        let CORRECTION_VALUE = axis === "x" ? 4.5 : 5.5;
        // Value * number(should be equal to canvas width)
        return Math.round(value * self.fabric_canvas_resolution) - CORRECTION_VALUE;
      }

      var getMousePosition = function (dom, x, y) {
        var rect = dom.getBoundingClientRect();
        return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];
      };

      var getIntersects = function (point, objects) {
        self.mouse.set(point.x * 2 - 1, -(point.y * 2) + 1);
        self.raycaster.setFromCamera(self.mouse, self.camera);
        return self.raycaster.intersectObjects(objects);
      };
    },
    showGui() {
      const gui = new GUI()
      const lights = gui.addFolder('Lights')

      const spotLight = lights.addFolder('Sport Light')
      spotLight.add('')
      cubeFolder.add(cube.rotation, 'x', 0, Math.PI * 2)
      cubeFolder.add(cube.rotation, 'y', 0, Math.PI * 2)
      cubeFolder.add(cube.rotation, 'z', 0, Math.PI * 2)
      cubeFolder.open()
      const cameraFolder = gui.addFolder('Camera')
      cameraFolder.add(camera.position, 'z', 0, 10)
      cameraFolder.open()
    }


  }
};
</script>
<style scoped>
body {
  margin: 0px;
  overflow: hidden;

}

#viewport {

  margin: 0px;
  overflow: hidden;
  background-repeat: no-repeat;
  background-position: center center;
  background-color: black
}

.ui-popup-container,
.ui-popup {
  height: 98%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.bastu {
  font-size: 19px;
  padding: 3px;
  border: 2px solid blue;
  border-radius: 3px;
}

.btnurun {
  cursor: pointer;
  border: 2px solid teal;
  display: inline-block;
  vertical-align: middle;
}



#renderer {
  position: relative;
  display: inline-block;
  width: 512px;
  height: 512px;
  z-index: 1;

}
#canvas_container {
  display: none;
  width: 8192px;
  height: 8192px;
  user-select: none;
  position: relative;
}

svg {
  display: none;
}
#svg_container{
  display: none;
}
html, body {margin: 0; height: 100%; padding: 0; overflow: hidden}

</style>
