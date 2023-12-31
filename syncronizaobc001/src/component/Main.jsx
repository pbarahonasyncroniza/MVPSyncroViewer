import React, { useContext, useEffect, useState } from 'react';
import * as THREE from 'three';
import * as OBC from 'openbim-components';
import {ViewerContext, DataProvider} from '../component/context';
import Dimensions from './Dimensions';


const Main = () => {
  const {
  dimensions,
  setDimensions
  
  } = useContext(ViewerContext);

 const [viewer, setViewer] = useState(null);
 const [viewerContainer, setViewerContainer] = useState(null);
  
  useEffect(async () => {
    // Initialize viewer
    const viewer = new OBC.Components();
    // console.log("viewerLog", viewer)

    // Set up scene
    const sceneComponent = new OBC.SimpleScene(viewer);
    viewer.scene = sceneComponent;
    const scene = sceneComponent.get();
    setupLights(scene);



    // Set up renderer
    const viewerContainer = document.getElementById('viewer-container');
    const rendererComponent = new OBC.PostproductionRenderer(viewer, viewerContainer);
    viewer.renderer = rendererComponent;

    // Setup camera
    const cameraComponent = new OBC.OrthoPerspectiveCamera(viewer);
    viewer.camera = cameraComponent;

    // Setup raycaster
    const raycasterComponent = new OBC.SimpleRaycaster(viewer);
    viewer.raycaster = raycasterComponent;

    // Initialize viewer
    viewer.init();
    rendererComponent.postproduction.enabled = true;

    // Add grid to scene
    new OBC.SimpleGrid(viewer, new THREE.Color(0x666666));

    // Loaad the IFc files
    const ifcLoader = new OBC.FragmentIfcLoader(viewer);
  
    
   // Properties

  const highlighter = new OBC.FragmentHighlighter(viewer)
  highlighter.setup();

  const propertiesProcessor = new OBC.IfcPropertiesProcessor(viewer)

  ifcLoader.onIfcLoaded.add(async(model)=>{
    propertiesProcessor.process(model)
    await highlighter.update()
    highlighter.events.select.onHighlight.add((selection)=>{
      const fragmentID = Object.keys(selection)[0]
      const exspressID = Number([...selection[fragmentID]][0])
      propertiesProcessor.renderProperties(model, exspressID)
    })

  })


  // Simple Clipper 

  const clipper = new OBC.SimpleClipper(viewer, OBC.SimplePlane);
  console.log("Clipping", clipper)
 
  viewer.tools.add("clipper", clipper);
  clipper.enabled = true
  

 


  // / Add toolbar and IFC loader
  
  const mainToolbar = new OBC.Toolbar(viewer);
  mainToolbar.addChild(
    ifcLoader.uiElement.get("main"),
    clipper.uiElement.get("main"),
    // dimensions.uiElement.get("main"),
    propertiesProcessor.uiElement.get("main"),
    
    );
    viewer.ui.addToolbar(mainToolbar);
    viewerContainer.ondblclick = () => clipper.create();

    // window.onkeydown = (event) => {
    //   if (event.code === 'Delete' || event.code === 'Backspace') {
    //   clipper.deleteAll();
    //   }
    //   }

    
    const dimensionsInstance = new OBC.LengthMeasurement(viewer);
    console.log("dimensionsInstance", dimensionsInstance)
    setDimensions(dimensionsInstance);
    viewer.tools.add("dimensions", dimensionsInstance);

    //_______________________________________________________
    // Floor Plans
    //_______________________________________________________

    
    












    


    

  }, []);


  // Function to setup lights
  const setupLights = (scene) => {
    const ambientLight = new THREE.AmbientLight(0xE6E7E4, 1);
    const directionalLight = new THREE.DirectionalLight(0xF9F9F9, 0.75);
    directionalLight.position.set(10, 50, 10);
    scene.add(ambientLight, directionalLight);
    scene.background = new THREE.Color("#202932");

    // Handlers
    
    



  };

  const handleDimensionOnClick = () => {
   
    dimensions.create();
  };


  return (
    <div>
      
      
    <div id="viewer-container"></div>

    <button onClick={handleDimensionOnClick}>
      Dimension
    </button>
    
    {/* <Dimensions/> */}
     
    </div>
  )
};

export default Main;
