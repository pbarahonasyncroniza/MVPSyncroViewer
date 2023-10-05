import React from 'react'
import * as OBC from "openbim-components"
import * as THREE from "three"
import Stats from 'stats.js/src/Stats.js';
import * as dat from 'three/examples/jsm/libs/lil-gui.module.min';


export default () => {
  const [modelCount, setModelCount] = React.useState(0)
   

  React.useEffect(() => { 
    const components = new OBC.Components()
    
   
    const sceneComponent = new OBC.SimpleScene(components)
    components.scene = sceneComponent
    const scene = sceneComponent.get()
    const ambientLight = new THREE.AmbientLight(0xE6E7E4, 1)
    const directionalLight = new THREE.DirectionalLight(0xF9F9F9, 0.75)
    directionalLight.position.set(10, 50, 10)
    scene.add(ambientLight, directionalLight)
    scene.background = new THREE.Color("#202932")

    const container = document.getElementById("Container") as HTMLDivElement
    const rendererComponent = new OBC.PostproductionRenderer(components, container)
    components.renderer = rendererComponent

    const cameraComponent = new OBC.OrthoPerspectiveCamera(components)
    components.camera = cameraComponent

    const raycasterComponent = new OBC.SimpleRaycaster(components)
    components.raycaster = raycasterComponent

    components.init()
    cameraComponent.updateAspect()
    rendererComponent.postproduction.enabled = true

    new OBC.SimpleGrid(components, new THREE.Color(0x666666))

    const fragmentManager = new OBC.FragmentManager(components)
    console.log("fragmenstManager", fragmentManager)

    const ifcLoader = new OBC.FragmentIfcLoader(components)
    console.log("ifcLoader",ifcLoader)

    const highlighter = new OBC.FragmentHighlighter(components)
    highlighter.setup()

    const propertiesProcessor = new OBC.IfcPropertiesProcessor(components)
    highlighter.events.select.onClear.add(() => {
      propertiesProcessor.cleanPropertiesList()
    })

    const ifcLoaderProperties = ifcLoader.onIfcLoaded.add(model => {
      console.log ("hola", model)
      
    

    
      setModelCount(fragmentManager.groups.length)

      const propertiesPro = propertiesProcessor.process(model)
      console.log("propertiespro",propertiesPro)

      highlighter.events.select.onHighlight.add((selection) => {
        const fragmentID = Object.keys(selection)[0]
        console.log("fragmentID",fragmentID)
        const expressID = Number([...selection[fragmentID]][0])
        propertiesProcessor.renderProperties(model, expressID)
      })
      highlighter.update()
      console.log(ifcLoaderProperties)
    
    })


    async function LoadFragments() {

      const fragments = new OBC.FragmentManager(components);
      const file = await fetch("model.frag");
      const dataBlob = await file.arrayBuffer();
      const buffer = new Uint8Array(dataBlob);
      const model = await fragments.load(buffer);
      const properties = await fetch("model.json");
      model.properties = await properties.json();


      const hider = new OBC.FragmentHider(components);
      await hider.loadCached();

      const classifier = new OBC.FragmentClassifier(components);
      classifier.byStorey(model);
      classifier.byEntity(model);

      const classifications = classifier.get();

      const storeys = {};
      const storeyNames = Object.keys(classifications.storeys);
      for (const name of storeyNames) {
      storeys[name] = true;

      const classes = {};
      const classNames = Object.keys(classifications.entities);
      for (const name of classNames) {
          classes[name] = true;
      }

      const gui = new dat.GUI();

      const storeysGui = gui.addFolder("Storeys");
      for (const name in storeys) {
          storeysGui.add(storeys, name).onChange(async (visible) => {
              const found = await classifier.find({storeys: [name]});
              hider.set(visible, found);
          });
      }


      const entitiesGui = gui.addFolder("Classes");
      for (const name in classes) {
          entitiesGui.add(classes, name).onChange(async (visible) => {
              const found = await classifier.find({entities: [name]});
              hider.set(visible, found);
          });
      }

      const toolbar = new OBC.Toolbar(components);
      components.ui.addToolbar(toolbar);
      const hiderButton = hider.uiElement.get("main");
      toolbar.addChild(hiderButton);


      const stats = new Stats();
      stats.showPanel(2);
      document.body.append(stats.dom);
      stats.dom.style.left = '0px';
      const renderer = components.renderer;
      renderer.onBeforeUpdate.add(() => stats.begin());
      renderer.onAfterUpdate.add(() => stats.end());

}

  }

  LoadFragments()

    // Simple Clipper 

      const clippingPlane = new OBC.EdgesClipper(components);
      // console.log("Clipping", clippingPlane)
 
      components.tools.add("clipper", clippingPlane);
      clippingPlane.enabled = true
     
      

    // Dimension 
      const dimensions = new OBC.LengthMeasurement(components);
        components.tools.add("dimensions", dimensions);
        dimensions.enabled = false;
        dimensions.snapDistance = 1;



    // Toolbar

    

     const mainToolbar = new OBC.Toolbar(components)
      mainToolbar.addChild(
      ifcLoader.uiElement.get("main"),
      clippingPlane.uiElement.get("main"),
      dimensions.uiElement.get("main"),
      propertiesProcessor.uiElement.get("main"),
      
              
     
    )


    components.ui.addToolbar(mainToolbar)
    container.ondblclick = () => dimensions.create();
    container.ondblclick = () => clippingPlane.create();
    
    window.onkeydown = (e) => { 
      if(e.code === "delete" || e.code === "Backspace") {
      clippingPlane.deleteAll();
      dimensions.deleteAll()
      }
    }
    


  }, [])

  const viewerContainerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    position: "relative",
    gridArea: "viewer"
  }

  const titleStyle: React.CSSProperties = {
    position: "absolute",
    top: "15px",
    left: "15px"
  }

  return (
    <>
      <div id="Container" style={viewerContainerStyle}>
        <h3 style={titleStyle}>Models loaded: {modelCount}</h3>
      </div>
    </>
  )
}
