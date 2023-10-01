import React, {createContext, useState} from 'react';
import * as OBC from 'openbim-components';

export const ViewerContext = createContext();


export const DataProvider = ({children}) => {
    const viewer = new OBC.Components();
    const viewerContainer = document.getElementById('viewer-container');
    const [dimensions, setDimensions] = useState(null);
return (

<ViewerContext.Provider 
value={{viewer, 
        viewerContainer, 
        dimensions, 
        setDimensions
    }}>
    {children}
</ViewerContext.Provider>

)




}


export default ViewerContext;
