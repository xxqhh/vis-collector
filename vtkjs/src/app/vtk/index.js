import 'vtk.js/Sources/favicon';

import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkCalculator from 'vtk.js/Sources/Filters/General/Calculator';
import vtkConeSource from 'vtk.js/Sources/Filters/Sources/ConeSource';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import { AttributeTypes } from 'vtk.js/Sources/Common/DataModel/DataSetAttributes/Constants';
import { FieldDataTypes } from 'vtk.js/Sources/Common/DataModel/DataSet/Constants';
import vtkFullScreenRenderWindow from './VtkRender';


export const getActor = (gl) => {
    // ----------------------------------------------------------------------------
    // Example code
    // ----------------------------------------------------------------------------
    // create a filter on the fly, sort of cool, this is a random scalars
    // filter we create inline, for a simple cone you would not need
    // this
    // ----------------------------------------------------------------------------

    const coneSource = vtkConeSource.newInstance({height: 1.0});
    const filter = vtkCalculator.newInstance();

    filter.setInputConnection(coneSource.getOutputPort());
    filter.setFormula({
        getArrays: (inputDataSets) => ({
            input: [],
            output: [
                {
                    location: FieldDataTypes.CELL,
                    name: 'Random',
                    dataType: 'Float32Array',
                    attribute: AttributeTypes.SCALARS,
                },
            ],
        }),
        evaluate: (arraysIn, arraysOut) => {
            const [scalars] = arraysOut.map((d) => d.getData());
            for (let i = 0; i < scalars.length; i++) {
                scalars[i] = Math.random();
            }
        },
    });

    const mapper = vtkMapper.newInstance();
    mapper.setInputConnection(filter.getOutputPort());

    const actor = vtkActor.newInstance();
    actor.setMapper(mapper);

    return actor;
};

export const render = (gl, actor) => {

    // ----------------------------------------------------------------------------
    // Standard rendering code setup
    // ----------------------------------------------------------------------------


    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
        background: [0, 0, 0],
        myGL: gl
    });

    const renderer = fullScreenRenderer.getRenderer();
    const renderWindow = fullScreenRenderer.getRenderWindow();


    renderer.addActor(actor);
    // renderer.resetCamera();
    renderWindow.render();
}

