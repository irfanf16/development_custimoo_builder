<template>
    <div class="kit-container">
        <div class="kit-scene" ref="scene">

        </div>
        <div class="kit-controls">
            <div class="edit-panel">
                <div class="tab">
                    <ul class="tabs">
                        <li class="tablinks active">
                            <button>Color</button>
                        </li>
                        <li class="tablinks">
                            <button>Collar</button>
                        </li>
                        <li class="tablinks">
                            <button>Name & Numbers</button>
                        </li>
                        <li class="tablinks">
                            <button>Logos</button>
                        </li>
                    </ul>
                </div>
                <div class="groups">
                    <p v-for="(group, key) in groups" :key="key">
                        {{group.name}}
                        <input @change="changeColor(key)" type="color" id="favcolor" name="favcolor" v-model="group.color">
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import $ from "jquery";
    import * as THREE from 'three'
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
    import {Component, Vue} from "vue-property-decorator";
    import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

    @Component<SceneObjLoader>({
        mounted() {
            const self = this;
            this.el = this.$refs.scene as Element;
            const aspect = this.el.clientWidth / this.el.clientHeight;
            this.camera = new THREE.PerspectiveCamera(2, aspect, 0.001, 2000);
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);

            const axesHelper = new THREE.AxesHelper(12)
            this.scene.add(axesHelper);

            this.scene.add(this.ambientLight);

            this.keyLight.position.set(-100, 0, 100);
            this.scene.add(this.keyLight);

            this.fillLight.position.set(100, 0, 100)
            this.scene.add(this.fillLight);

            this.backLight.position.set(100, 0, -100).normalize()
            this.scene.add(this.backLight);

            this.camera.position.z = 1

            this.el.appendChild(this.renderer.domElement);

            this.renderer.setSize(this.el.clientWidth, this.el.clientHeight)


            // this.renderer.setClearColor(new THREE.Color(0x000FF, 1.0));
            this.renderer.setClearColor( 0x000000, 0 ); // the default


            this.textureImage = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" width="2048px" height="2048px" viewBox="0 0 2048 2048" enable-background="new 0 0 2048 2048" xml:space="preserve"> <g id="Artwork"> <polygon id="left_arm" points="1549.837,1976.558 847.512,1976.558 838.333,1128.111 1198.004,1033.889 1557.676,1126.965 "/> <polygon id="Right_arm" points="1443.171,1022.889 740.845,1022.889 731.667,174.442 1091.338,80.22 1451.009,173.296 "/> <polygon id="Collar_1_" fill="#E6332A" points="2039.667,1073 1299.667,1067.667 1294.333,999.667 1441,859.667 2020.788,868.326 "/> <polygon id="Front" fill="#312783" points="818.778,2048 17.778,2048 17.778,1053.444 382.333,936.111 818.778,1053.444 "/> <path id="Back_1_" fill="#006633" d="M731.667,936.111H0V13.444h731.667V936.111z M2048,1385.889h-450.556v369.778H2048V1385.889z"/> </g> <g id="Layer_1"> <image overflow="visible" width="2048" height="2048" xlink:href="uvs.png"> </image> </g> </svg>';

            this.textureImageTag = document.createElement("img"); //initialization of image tag
            this.canvas = document.createElement("canvas"); //initialization of canvas tag
            this.canvas.width = 2048; // will be get by getBoundingClientRect() method on svg image tag
            this.canvas.height = 2048;

            // const textureLoader = new THREE.TextureLoader();
            // const normalMap = textureLoader.load( './assets/models/testJersey_N.jpg' );

            this.createElementFromHTML();

            this.gltfLoader.load('./assets/models/testJersey.gltf', (gltf) => {
            // this.gltfLoader.load('./assets/models/soccer_jersey_2k.gltf', (gltf) => {

                    gltf.scene.traverse((child: any) => {
                         if (child.isMesh) {
                             const box = new THREE.Box3().setFromObject( child );
                             box.getCenter( child.position ); // this re-sets the mesh position
                             child.position.multiplyScalar( 0 );

                             child.material.side = THREE.DoubleSide;

                             child.material.metalness = 0.99

                             self.baseModel = child;
                         }
                    })

                    this.gltfScene = gltf.scene

                    this.addTexture()

                    this.normalMapImage = './assets/models/testJersey_N.jpg';
                    this.addNormalMapImage();

                    this.aoMapImage = './assets/models/testJersey_AO.png';
                    this.addAoMapImage();

                    setTimeout(() => {
                        self.scene.add(this.gltfScene);
                    }, 200)

                    this.fitCameraToSelection()

                },
                (xhr) => {
                    console.log((xhr.loaded / xhr.total * 100) + '% loaded')
                },
                (error) => {
                    console.log(error);

            });

            window.onresize = function() {
                self.onWindowResize()
            };

            this.renderer.outputEncoding = THREE.sRGBEncoding;

            this.animate();

        }
    })

    export default class SceneObjLoader extends Vue {
        private el!: Element;
        private ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        private keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
        private fillLight = new THREE.DirectionalLight(0xffffff, 1.0);
        private backLight = new THREE.DirectionalLight(0xffffff, 1.0);

        private camera!: THREE.PerspectiveCamera;

        private scene: THREE.Scene = new THREE.Scene()

        private renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true}); //{ antialias: true, alpha: true }

        private controls!: OrbitControls;

        private gltfScene: THREE.Scenen;

        private gltfLoader: GLTFLoader = new GLTFLoader();

        private baseModel!: THREE.Mesh;

        private canvas!: HTMLCanvasElement

        private textureImageTag!: HTMLOrSVGImageElement

        private textureHtmlImageTag!: HTMLOrSVGImageElement

        private textureImage!: string

        private normalMapImage!: string

        private aoMapImage!: string

        private groups = []

        private fitCameraToSelection(fitOffset = 1.2 ) {

            const box = new THREE.Box3();

            box.expandByObject( this.baseModel );

            const size = box.getSize( new THREE.Vector3() );
            const center = box.getCenter( new THREE.Vector3() );

            const maxSize = Math.max( size.x, size.y, size.z );
            const fitHeightDistance = maxSize / ( 2 * Math.atan( Math.PI * this.camera.fov / 360 ) );
            const fitWidthDistance = fitHeightDistance / this.camera.aspect;
            const distance = fitOffset * Math.max( fitHeightDistance, fitWidthDistance );

            const direction = this.controls.target.clone()
                .sub( this.camera.position )
                .normalize()
                .multiplyScalar( distance );

            this.controls.maxDistance = distance * 10;
            this.controls.target.copy( center );

            this.camera.near = distance / 100;
            this.camera.far = distance * 100;
            this.camera.updateProjectionMatrix()

            this.camera.position.copy( this.controls.target ).sub(direction);

            this.controls.update();

        }

        private onWindowResize() {
            this.camera.aspect = this.el.clientWidth / this.el.clientHeight
            this.camera.updateProjectionMatrix()
            this.renderer.setSize(this.el.clientWidth, this.el.clientHeight)
        }

        private animate() {
            this.renderer.render(this.scene, this.camera);
            this.controls.update();
            requestAnimationFrame(this.animate);
        }

        private createElementFromHTML() {
            const div = document.createElement('div');
            div.innerHTML = this.textureImage;
            this.textureHtmlImageTag = div.firstChild;
            this.getSubGroups(this.textureHtmlImageTag, '');
        }

        private getSubGroups(imageTag, lastTag) {
            const self = this;
            if(lastTag){
                lastTag = lastTag + ' > '
            }
            $(imageTag).children().each((index, group) =>{
                if($(group).children().length > 0){
                    self.getSubGroups(group, lastTag +  '#'+group.id)
                }else{
                    if($(group).attr('fill') && $(group).attr('fill') != 'none'){
                        self.groups.push({
                            xPath : lastTag + '#'+group.id,
                            name: (lastTag + group.id).replace(/_/g, ' ').replace(/#/g, ' ').replace(' > ', ' ').trim(),
                            color: $(group).attr('fill'),
                        });
                    }
                }
            })

            return true;
        }

        private changeColor(key){
            const children = $(this.textureHtmlImageTag).find(this.groups[key]['xPath']);
            children.attr('fill', this.groups[key]['color']);
            this.textureImage = this.textureHtmlImageTag.outerHTML;
            this.addTexture()
        }

        private addTexture() {
            this.textureImageTag.setAttribute('src', "data:image/svg+xml;base64," + window.btoa(unescape(encodeURIComponent(this.textureImage))))

            const ctx = this.canvas.getContext("2d");

            this.textureImageTag.onload = () => {
                ctx.drawImage(this.textureImageTag, 0, 0);

                const texture = new THREE.Texture(this.canvas);
                texture.flipY = false
                this.baseModel.material.map = texture;
                this.baseModel.material.map.needsUpdate = true


            }
        }

        private addNormalMapImage() {
            const textureLoader = new THREE.TextureLoader();
            const normalMap = textureLoader.load( this.normalMapImage );

            normalMap.encoding = THREE.sRGBEncoding;
            normalMap.flipY = false
            this.baseModel.material.normalMap = normalMap;
            this.baseModel.material.normalMap.needsUpdate = true
        }

        private addAoMapImage() {
            const textureLoader = new THREE.TextureLoader();
            const aoMap = textureLoader.load( this.aoMapImage );

            aoMap.encoding = THREE.sRGBEncoding;
            aoMap.flipY = false
            this.baseModel.material.aoMap = aoMap;
            this.baseModel.material.aoMap.needsUpdate = true
        }
    }
</script>

<style scoped>
    .kit-container{
        display: inline-flex;
        width: 100%;
        height: 100%;
        max-height: 720px;
    }
    .kit-scene {
        width: 70%;
        height: 100%;
        background: url('/img/bg.jpg') no-repeat center center;
        background-size: 100%;
    }
    .kit-controls{
        width: 30%;
        height: 100%;
    }
    .edit-panel{
        width: 96%;
        height: 96%;
        margin: 2% 2% 2% 2%;
        background: #999999;
        color: #fff;
        border-radius: 4px;
    }
    .groups{
        margin: 10px 2px 2px 15px;
    }
    /* Style the tab */
    .tab {
        overflow: hidden;
        border: 1px solid #999999;
    }

    /* Style the buttons inside the tab */
    .tab button {
        background-color: inherit;
        float: left;
        border: none;
        outline: none;
        cursor: pointer;
        padding: 14px 16px;
        transition: 0.3s;
        font-size: 17px;
    }

    /* Change background color of buttons on hover */
    .tab button:hover {
        background-color: #ddd;
    }

    /* Create an active/current tablink class */
    .tab .active {
        border: 1px solid #006666;
        background: #006666;
    }
    ul.tabs {
        display: flex;
        list-style-type: none;
        margin: 0;
        padding: 0;
    }
</style>