import React, {useEffect, useState,useRef} from "react"
import * as OBC from "openbim-components"
import * as THREE from "three"
import Stats from 'stats.js/src/Stats.js';


const FragmentsPlans = ()=> {

const [model, setModel] = useState()
const [plans, setPlans] = useState()
const modelRef = useRef
    useEffect(()=>{


        const container = document.getElementById('container');

        const components = new OBC.Components();
    
        components.scene = new OBC.SimpleScene(components);
        const renderer = new OBC.PostproductionRenderer(components, container);
        components.renderer = renderer;
    
        const camera = new OBC.OrthoPerspectiveCamera(components);
        components.camera = camera;
        components.camera.controls.setLookAt(12, 6, 8, 0, 0, -10);
    
        components.raycaster = new OBC.SimpleRaycaster(components);
    
        components.init();
    
        const {postproduction} = renderer;
        postproduction.enabled = true;
    
        const scene = components.scene.get();
    
        components.scene.setup();
    
        const grid = new OBC.SimpleGrid(components, new THREE.Color(0x666666));
        components.tools.add('grid', grid);
        const gridMesh = grid.get();
        postproduction._customEffects.excludedMeshes.push(gridMesh);
    
        
        

    
  async function LoadModel (){

        const culler = new OBC.ScreenCuller(components);
        container.addEventListener('mouseup', () => culler.needsUpdate = true);
        container.addEventListener('wheel', () => culler.needsUpdate = true);

        const fragments = new OBC.FragmentManager(components);
        const file = await fetch('model.frag');
        const data = await file.arrayBuffer();
        const buffer = new Uint8Array(data);
        const model = await fragments.load(buffer); 
        const properties = await fetch ('model.json')
        model.properties = await properties.json()


        for(const fragment of model.items) {
            culler.add(fragment.mesh);
        }
        culler.needsUpdate = true;
    


    
    const clipper = new OBC.EdgesClipper(components);
    const sectionMaterial = new THREE.LineBasicMaterial({color: 'black'});
    const fillMaterial = new THREE.MeshBasicMaterial({color: 'gray', side: 2});
    const fillOutline = new THREE.MeshBasicMaterial({color: 'black', side: 1, opacity: 0.5, transparent: true});

    clipper.styles.create("filled", new Set(), sectionMaterial, fillMaterial, fillOutline);
    clipper.styles.create("projected", new Set(), sectionMaterial);
    const styles = clipper.styles.get();



    postproduction.customEffects.outlineEnabled = true;
    const exploder = new OBC.FragmentExploder(components);


    const classifier = new OBC.FragmentClassifier(components);
    classifier.byEntity(model);
    classifier.byStorey(model);
    const found = classifier.find({entities: ["IFCWALLSTANDARDCASE", "IFCWALL"]});

    for (const fragID in found) {
        const {mesh} = fragments.list[fragID];
        styles.filled.fragments[fragID] = new Set(found[fragID]);
        styles.filled.meshes.add(mesh);
    }

    const meshes = [];
    for (const fragment of model.items) {
        const {mesh} = fragment;
        meshes.push(mesh);
        styles.projected.meshes.add(mesh);
    }

    const whiteColor = new THREE.Color("white");
    const whiteMaterial = new THREE.MeshBasicMaterial({color: whiteColor});
    const materialManager = new OBC.MaterialManager(components);
    materialManager.addMaterial("white", whiteMaterial);
    materialManager.addMeshes("white", meshes);

    const plans = new OBC.FragmentPlans(components);
    await plans.computeAllPlanViews(model);

    
    const hider = new OBC.FragmentHider(components);
    const highlighter = new OBC.FragmentHighlighter(components);


    const highlightMat =  new THREE.MeshBasicMaterial({
        depthTest: false,
        color: 0xBCF124,
        transparent: true,
        opacity: 0.3
    });

    highlighter.add("default", highlightMat);
    const canvas = renderer.get().domElement;
    canvas.addEventListener("click", () => highlighter.clear("default"))

    highlighter.update();


    plans.commands = {
        "Select": async (plan) => {
            const found = await classifier.find({storeys: [plan.name]});
            highlighter.highlightByID("default", found);
        },
        "Show": async (plan) => {
            const found = await classifier.find({storeys: [plan.name]});
            hider.set(true, found);
        },
        "Hide": async (plan) => {
            const found = await classifier.find({storeys: [plan.name]});
            hider.set(false, found);
        },
    }

    plans.updatePlansList();

    const mainToolbar = new OBC.Toolbar(components);
    mainToolbar.name = "Main Toolbar";
    components.ui.addToolbar(mainToolbar);
    mainToolbar.addChild(plans.uiElement.get('main')    

    
    
    );

    const toolbar = new OBC.Toolbar(components);
            toolbar.addChild(exploder.uiElement.get("main"));
            components.ui.addToolbar(toolbar);


            
    plans.onNavigated.add(() => {
        postproduction.customEffects.glossEnabled = false;
        materialManager.setBackgroundColor(whiteColor);
        materialManager.set(true, ["white"]);
        grid.visible = false;
    });

    plans.onExited.add(() => {
        postproduction.customEffects.glossEnabled = true;
        materialManager.resetBackgroundColor();
        materialManager.set(false, ["white"]);
        grid.visible = true;
    });


    // Set up stats
    const stats = new Stats();
    stats.showPanel(2);
    document.body.append(stats.dom);
    stats.dom.style.left = '0px';
    stats.dom.style.right = 'auto';

    components.renderer.onBeforeUpdate.add(() => stats.begin());
    components.renderer.onAfterUpdate.add(() => stats.end());













    // Mini Map
    const map = new OBC.MiniMap(components);
    components.ui.add(map.uiElement.get("canvas"));
    map.lockRotation = false;
    map.zoom = 0.2;

    // CubeMap
    const boxMaterial = new THREE.MeshStandardMaterial({ color: '#6528D7' });
  const boxGeometry = new THREE.BoxGeometry(3, 3, 3);
	const cube = new THREE.Mesh(boxGeometry, boxMaterial);
	cube.position.set(0, 1.5, 0);
	scene.add(cube);

	components.meshes.push(cube);

	const directionalLight = new THREE.DirectionalLight();
	directionalLight.position.set(5, 10, 3);
	directionalLight.intensity = 0.5;
	scene.add(directionalLight);

	const ambientLight = new THREE.AmbientLight();
	ambientLight.intensity = 0.5;
	scene.add(ambientLight);

	const navCube = new OBC.CubeMap(components);
	navCube.offset = 1;
	navCube.setPosition("bottom-left");

    camera.up






}
  


LoadModel()




},[model])


const viewerContainerStyle = {
        width: "100%",
        height: "1000px",
        position: "relative",
        gridArea: "viewer"
      }



    return(

        <div id="container" style={viewerContainerStyle}></div>


    )











}

export default FragmentsPlans;