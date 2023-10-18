import React, {useEffect, useState,useRef} from "react"
import * as OBC from "openbim-components"
import * as THREE from "three"
import Stats from 'stats.js/src/Stats.js';
import * as dat from 'three/examples/jsm/libs/lil-gui.module.min';
import Main from "../components/Main"


const FragmentHider =(props)=> {
const {components, model} = props

useEffect (()=>{

    async function LoadFragments() {

        


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
        propsProcessor.uiElement.get("main")
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




})









}

export default FragmentHider;