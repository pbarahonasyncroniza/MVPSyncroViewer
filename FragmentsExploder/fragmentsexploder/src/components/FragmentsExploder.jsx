import React, {useEffect, useState,useRef} from "react"
import * as OBC from "openbim-components"
import * as THREE from "three"
import Stats from 'stats.js/src/Stats.js';

const FragmentsExploder =()=>{

  useEffect(()=>{
    const container = document.getElementById('container');

	const components = new OBC.Components();

	components.scene = new OBC.SimpleScene(components);
	const renderer = new OBC.PostproductionRenderer(components, container);
	components.renderer = renderer;

	const camera = new OBC.SimpleCamera(components);
	components.camera = camera;
	camera.controls.setLookAt(10, 5, 10, -5, 0, -3);

	components.raycaster = new OBC.SimpleRaycaster(components);

	components.init();

    renderer.postproduction.enabled = true;
	const scene = components.scene.get();

	const directionalLight = new THREE.DirectionalLight();
	directionalLight.position.set(5, 10, 3);
	directionalLight.intensity = 0.5;
	scene.add(directionalLight);

	const ambientLight = new THREE.AmbientLight();
	ambientLight.intensity = 0.5;
	scene.add(ambientLight);

	const grid = new OBC.SimpleGrid(components, new THREE.Color(0x666666));
    const gridMesh = grid.get();
    const effects = renderer.postproduction.customEffects;
    effects.excludedMeshes.push(gridMesh);

    const fragments = new OBC.FragmentManager(components);

        async function LoadModel(){

            const file = await fetch("model.frag");
            const data = await file.arrayBuffer();
            const buffer = new Uint8Array(data);
            const model = await fragments.load(buffer);

            const classifier = new OBC.FragmentClassifier(components);

            const properties = await fetch("model.json");
            model.properties = await properties.json();

            classifier.byStorey(model);
            const exploder = new OBC.FragmentExploder(components);
            const culler = new OBC.ScreenCuller(components);

            container.addEventListener("mouseup", () => culler.needsUpdate = true);
            container.addEventListener("wheel", () => culler.needsUpdate = true);
        
            for(const fragment of model.items) {
              culler.add(fragment.mesh);
            }
        
            culler.needsUpdate = true;

            const toolbar = new OBC.Toolbar(components);
            toolbar.addChild(exploder.uiElement.get("main"));
            components.ui.addToolbar(toolbar);
        
            // Set up stats
            const stats = new Stats();
            stats.showPanel(2);
            document.body.append(stats.dom);
            stats.dom.style.left = '0px';
            stats.dom.style.right = 'auto';
        
            components.renderer.onBeforeUpdate.add(() => stats.begin());
            components.renderer.onAfterUpdate.add(() => stats.end());
        



  }
  LoadModel()

},[])
const viewerContainerStyle = {
    width: "100%",
    height: "1000px",
    position: "relative",
    gridArea: "viewer"
  }

return (
    <h1 id="container"style={viewerContainerStyle} > </h1>
)





}

export default FragmentsExploder;