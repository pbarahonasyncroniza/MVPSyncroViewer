import  { useContext, useEffect,useState } from "react";
import ViewerContext from './context';
import * as OBC from 'openbim-components';

const Dimensions = () => {
    
   
    const { viewer, viewerContainer} = useContext(ViewerContext);
    const [dimensions, setDimensions] = useState(null);

    useEffect(() => {
       

        const dims = new OBC.LengthMeasurement(viewer);
        viewer.tools.add("dimensions", dims);
        dims.enabled = true;
        dims.snapDistance = 1;
        setDimensions(dims);
        
        viewerContainer.ondblclick = () => dimensions.create();

        const mainToolbar = new OBC.Toolbar(viewer)
        mainToolbar.addChild(dimensions.uiElement.get("main"))
        viewer.ui.addToolbar(mainToolbar)


        return () => {
            viewer.tools.remove("dimensions");
          
        };
        
    }, [viewer]); 

    
}

export default Dimensions;
