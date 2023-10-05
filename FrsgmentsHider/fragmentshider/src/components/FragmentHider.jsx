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

        // const fragments = new OBC.FragmentManager(components);
        // const file = await fetch("model.frag");
        // const dataBlob = await file.arrayBuffer();
        // const buffer = new Uint8Array(dataBlob);
        // const model = await fragments.load(buffer);
        // const properties = await fetch("model.json");
        // model.properties = await properties.json();
        // const highlighter = new OBC.FragmentHighlighter(components, fragments);
        // highlighter.setup();


        // components.renderer.postproduction.customEffects.outlineEnabled = true;
        // highlighter.outlinesEnabled = true;

        // const propsProcessor = new OBC.IfcPropertiesProcessor(components)
        // propsProcessor.uiElement.get("propertiesWindow").visible = true

        // propsProcessor.process(model);

        // const highlighterEvents = highlighter.events;
        // highlighterEvents.select.onClear.add(() => {
        // propsProcessor.cleanPropertiesList();
        // });
        // highlighterEvents.select.onHighlight.add(
        // (selection) => {
        // const fragmentID = Object.keys(selection)[0];
        // const expressID = Number([...selection[fragmentID]][0]);
        // let model
        // for (const group of fragments.groups) {
        // const fragmentFound = Object.values(group.keyFragments).find(id => id === fragmentID)
        // if (fragmentFound) model = group;
        // }
        // propsProcessor.renderProperties(model, expressID);
        // }
        // );



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