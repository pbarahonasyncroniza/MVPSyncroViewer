import React, {useEffect, useState,useRef} from "react"
import * as OBC from "openbim-components"
import * as THREE from "three"
import Stats from 'stats.js/src/Stats.js';
import * as webifc from "web-ifc"


const FragnentsTree =()=> {
  useEffect(()=>{

      const container = document.getElementById("container");

      const components = new OBC.Components()

      components.scene = new OBC.SimpleScene(components);
      components.renderer = new OBC.PostproductionRenderer(components, container);
      components.camera = new OBC.SimpleCamera(components);
      components.raycaster = new OBC.SimpleRaycaster(components);
  
      components.init();
  
      components.renderer.postproduction.enabled = true;
  
      const scene = components.scene.get();
  
      components.camera.controls.setLookAt(10, 10, 10, 0, 0, 0);



  
      const directionalLight = new THREE.DirectionalLight();
      directionalLight.position.set(5, 10, 3);
      directionalLight.intensity = 0.5;
      scene.add(directionalLight);
  
      const ambientLight = new THREE.AmbientLight();
      ambientLight.intensity = 0.5;
      scene.add(ambientLight);
  
      const grid = new OBC.SimpleGrid(components, new THREE.Color(0x666666));
      components.renderer.postproduction.customEffects.excludedMeshes.push(grid.get());

      
      
      async function LoadFragments (){

        const fragments = new OBC.FragmentManager(components);
        const file = await fetch("model.frag");
        const data = await file.arrayBuffer();
        const buffer = new Uint8Array(data);
        const model = await fragments.load(buffer);
        
        const highlighter = new OBC.FragmentHighlighter(components, fragments);
        highlighter.setup();

        components.renderer.postproduction.customEffects.outlineEnabled = true;
        highlighter.outlinesEnabled = true;
    
        highlighter.update();

        const classifier = new OBC.FragmentClassifier(components);

        const properties = await fetch("model.json");
        model.properties = await properties.json();

        classifier.byStorey(model);
        classifier.byEntity(model);

        const modelTree = new OBC.FragmentTree(components);
        await modelTree.init();


        modelTree.update(['storeys', 'entities']);




        modelTree.onSelected.add((filter) => {
            highlighter.highlightByID('select', filter, true, true);
        });
    
        modelTree.onHovered.add((filter) => {
            highlighter.highlightByID('hover', filter);
        });
    
        const toolbar = new OBC.Toolbar(components);
        toolbar.addChild(modelTree.uiElement.get("main"));
        components.ui.addToolbar(toolbar);
    

        const stats = new Stats();
        stats.showPanel(2);
        document.body.append(stats.dom);
        stats.dom.style.left = '0px';
        const renderer = components.renderer;
        renderer.onBeforeUpdate.add(() => stats.begin());
        renderer.onAfterUpdate.add(() => stats.end());
    


      }

      LoadFragments ()
        



    },[])


    const viewerContainerStyle = {
        width: "100%",
        height: "1000px",
        position: "relative",
        gridArea: "viewer"
      }


return (
    <h1 id="container" style={viewerContainerStyle}></h1>
)


}

export default FragnentsTree