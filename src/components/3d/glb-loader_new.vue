<template>
  <div>
    <div class="row">
      <div class="col-md-8">
        <div id="glb-loader" ref="glb-container" width="400" height="400">
        </div>
      </div>
      <div class="col-md-2"></div>
      <div class="col-md-2">
        <div id="gui-controls-container" ref="gui-controls-container"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'dat.gui'
import { fabric } from 'fabric';
import Inspector from 'three-inspect'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';


@Component<GlbLoaderNew>({
  mounted() {
    const glb_container = this.$refs['glb-container'] as HTMLElement
    this.renderer.setClearColor(0x821d16);
    this.renderer.setSize(500, 500);
    glb_container.appendChild(this.renderer.domElement)
    this.init();
    this.showGui()
  },
})
export default class GlbLoaderNew extends Vue {
  public scene =  new THREE.Scene();
  public aspect = window.innerWidth / window.innerHeight
  public camera = new THREE.PerspectiveCamera(20, this.aspect, 0.1, 1000);
  public renderer = new THREE.WebGLRenderer({ 'alpha': !![], 'antialias': !![] });
  public loader = new GLTFLoader();
  public gui: GUI
  public ambientLight = new THREE.AmbientLight(0xffffff, 1.0)
  public keyLight = new THREE.DirectionalLight(0xffffff, 1.0)
  public fillLight = new THREE.DirectionalLight(0xffffff, 1.0)
  public backLight = new THREE.DirectionalLight(0xffffff, 1.0)
  public canvas  = new fabric.Canvas( "canvas" )
  public raycaster = new THREE.Raycaster()


  public init(): void {
    let self: Record<any, any>  = this
    this.scene.add(this.ambientLight)

    this.keyLight.position.set(-100, 0, 100)
    this.scene.add(this.keyLight)

    this.fillLight.position.set(100, 0, 100)
    this.scene.add(this.fillLight)

    this.backLight.position.set(100, 0, -100).normalize()
    this.scene.add(this.backLight)


    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 1, 0);
    this.scene.add(directionalLight);

    // Set camera position
    this.camera.position.z = 10;


    // Set renderer size and append to DOM
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    (document.getElementById('glb-loader') as HTMLElement).appendChild(this.renderer.domElement);
    const canvas = new fabric.Canvas('canvas')
    // Load GLB model
    this.loader.load('https://custimoo.s3.us-east-1.amazonaws.com/models/testJersey.gltf', async (gltf) => {
      await self.addMaterialToGltf(gltf)
      //await self.addTexture(gltf)
      this.addText(gltf)



          //texture1.anisotropy = self.renderer.capabilities.getMaxAnisotropy();
        this.scene.add(gltf.scene)
        this.renderScene();
      this.showAxisHelper()
    },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.error('error loading',error);
      },
    );

    // Add event listener to resize renderer with window
    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });
    new OrbitControls(this.camera, this.renderer.domElement)
  }

  public addMaterialToGltf(gltf: GLTF): void {
    // Traverse the scene graph to access the mesh objects
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Set the material for the mesh
        child.material = new THREE.MeshStandardMaterial({
           side: THREE.DoubleSide, metalness: 0.99, wireframe: false
        });
         child.material.metalness = 0.99
      }
    });
  }


  public async addTexture(gltf) {
    let self = this;
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load('https://custimoo.s3.us-east-1.amazonaws.com/threejs/Hummel_Jersey_v1/Textures/Hummel_Normal.png', function(texture) {
          // Set the texture as the material's map
          child.material.map = texture;
          // Update the material
          child.material.needsUpdate = true;
          console.log('textur', texture)
        });
      }
    });
  }

  public renderScene(): void {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.renderScene());
  }

  public showAxisHelper(): void {
    const axesHelper = new THREE.AxesHelper(5); // 5 is the size of the axes helper
    this.scene.add(axesHelper);
  }

  public showGui(): void {
    const gui = new GUI()
    const gui_container = this.$refs['gui-controls-container'] as HTMLElement
    gui_container.appendChild(gui.domElement)
    console.log('gui_container',gui_container)
    let renderer = {
      width: 0,
      height: 0,
      size: `${window.innerWidth} ${window.innerHeight}`
    }
    const renderer_folder = gui.addFolder('Renderer')
    renderer_folder.add(renderer, 'size').name('render size').listen()
    renderer_folder.add(renderer, 'width', 0, window.innerWidth).name('Width').onChange(this.handleRendererEvent('width') as any);
    renderer_folder.add(renderer, 'height', 0, window.innerWidth).name('Height').onChange(this.handleRendererEvent('height') as any);

    renderer_folder.__controllers.forEach((controller) => {
      if (controller.property == 'size') {
        (controller.domElement as HTMLInputElement).disabled = true;
      }
    })

    const camera_folder = gui.addFolder('Camera')

    const position_folder = camera_folder.addFolder('Position')
    position_folder.add(this.camera.position, 'x', 0, 10)
    position_folder.add(this.camera.position, 'y', 0, 10)
    position_folder.add(this.camera.position, 'z', 0, 10)
    position_folder.open()

    camera_folder.add(this.camera, 'fov', 1, 180).onChange(this.handleGuiCameraEvent('fov') as any)
    camera_folder.add(this.camera, 'aspect', 0.1, 10).onChange(this.handleGuiCameraEvent('aspect') as any)
    camera_folder.add(this.camera, 'near', 0.1, 10).onChange(this.handleGuiCameraEvent('near') as any)
    camera_folder.add(this.camera, 'far', 1, 1000, 5).onChange(this.handleGuiCameraEvent('far') as any)
    camera_folder.open()
  }

  public handleGuiCameraEvent(camera_property: string): CallableFunction {
    let self: any = this
    return function (value) {
      self.camera[camera_property] = value
      self.camera.updateProjectionMatrix()

    }
  }

  public handleRendererEvent(camera_property: string): CallableFunction {
    let self: any = this
    return function (value) {
      this.render.setSize('')

    }
  }

  public addText(gltf) {
    let self = this
    // Create a canvas element and set its size
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    // Create a Fabric.js canvas and add text with controls to it
    const fabricCanvas = new fabric.Canvas(canvas);
    const text = new fabric.IText('Hello, world!', {
      left: 50,
      top: 20,
      angle: 360,
      fontFamily: 'Arial',
      fontSize: 20,
      fill: 'white',
    });

    fabricCanvas.add(text);

    // Set Fabric.js object properties
    text.hasControls = true;
    text.hasBorders = true;
    text.lockUniScaling = true;
    text.lockRotation = true;

    // Render the Fabric.js canvas and convert it to a texture
    fabricCanvas.renderAll();
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()
    texture.needsUpdate = true;
    texture.flipY = false


    // Apply the texture to the GLTF model
    const material = new THREE.MeshBasicMaterial({ map: texture });

    console.log('nodes', gltf.scene.children)
    gltf.scene.traverse(function (node) {
      if (node.isMesh) {

        node.material = material;
        node.material.metalness = 0.99;

      }
    });
  }
}
</script>

<style lang="scss" scoped></style>
